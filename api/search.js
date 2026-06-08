export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, category, min_price, max_price, country = 'be', lang = 'fr' } = req.query || {};
  if (!q) return res.status(400).json({ error: 'Paramètre q requis' });

  const serpKey = process.env.SERPAPI_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!serpKey) return res.status(500).json({ error: 'Clé SerpApi manquante' });

  try {
    // ÉTAPE 1 — Claude enrichit la requête
    let enhancedQuery = q;
    let visualCriteria = [];

    if (anthropicKey) {
      try {
        const enhRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 512,
            messages: [{ role: 'user', content: `Tu es un expert shopping. Pour la recherche "${q}", génère une requête Google Shopping optimisée et les critères visuels clés. Réponds UNIQUEMENT en JSON: {"enhancedQuery": "...", "visualCriteria": ["..."], "mustHave": ["..."], "mustNotHave": [...], "alternativeQueries": ["..."]}` }]
          })
        });
        const d = await enhRes.json();
        const parsed = JSON.parse((d.content?.[0]?.text || '{}').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
        enhancedQuery = parsed.enhancedQuery || q;
        visualCriteria = parsed.visualCriteria || [];
      } catch(e) { enhancedQuery = q; }
    }

    // ÉTAPE 2 — Google Shopping
    const sp = new URLSearchParams({ engine:'google_shopping', q:enhancedQuery, api_key:serpKey, gl:country, hl:lang, num:'20' });
    const serpRes = await fetch(`https://serpapi.com/search.json?${sp}`);
    const serpData = await serpRes.json();
    if (serpData.error) throw new Error(serpData.error);
    const rawResults = serpData.shopping_results || [];

    // ÉTAPE 3 — Scoring Claude
    let scoredResults = rawResults;
    if (anthropicKey && rawResults.length > 0) {
      try {
        const productList = rawResults.slice(0,15).map((item,i) => ({ index:i, title:item.title||'', snippet:item.snippet||'', extensions:(item.extensions||[]).join(', ') }));
        const scoreRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 1024,
            messages: [{ role: 'user', content: `Recherche: "${q}". Critères: ${visualCriteria.join(', ')}. Score chaque produit (0-99). RÈGLE: si critère majeur absent → max 45%. Réponds JSON: {"scores":[{"index":0,"score":85,"reason":"..."}]}\n${productList.map(p=>`[${p.index}] "${p.title}" | ${p.snippet}`).join('\n')}` }]
          })
        });
        const sd = await scoreRes.json();
        const sp2 = JSON.parse((sd.content?.[0]?.text||'{}').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
        const scoreMap = {};
        (sp2.scores||[]).forEach(s => { scoreMap[s.index] = s; });
        scoredResults = rawResults.map((item,i) => ({ ...item, _score: scoreMap[i]?.score ?? Math.max(70-i*4,30), _reason: scoreMap[i]?.reason || '' }));
      } catch(e) {
        console.log('Scoring error:', e.message);
        scoredResults = rawResults.map((item,i) => ({ ...item, _score: Math.max(85-i*3,40), _reason:'' }));
      }
    }

    const results = scoredResults.map((item,i) => ({
      id: item.product_id || `item_${i}`,
      title: item.title || 'Produit sans titre',
      desc: (item.snippet||item.description||(item.extensions||[]).join(' · ')||'').trim() || item.title || 'Description non disponible.',
      price: item.price ? item.price.replace(/[^0-9.,]/g,'').replace(',','.') : '—',
      priceRaw: item.extracted_price || 0,
      oldPrice: item.old_price ? item.old_price.replace(/[^0-9.,]/g,'') : null,
      match: (item._score !== undefined && item._score !== null && item._score > 0) ? item._score : Math.max(85-i*3,40),
      matchReason: item._reason || '',
      stars: item.rating || null,
      reviews: item.reviews || null,
      store: item.source || 'Boutique en ligne',
      storeLink: item.product_link || (item.link && item.link.startsWith('http') ? item.link : null) || ('https://www.google.com/search?q=' + encodeURIComponent((item.title||'') + ' acheter') + '&tbm=shop'),
      delivery: item.delivery || 'Délai non précisé',
      img: item.thumbnail || null,
      badge: item.badge || null,
      extensions: item.extensions || [],
      enhancedQuery,
      visualCriteria,
    })).sort((a,b) => b.match - a.match);

    return res.status(200).json({ results, totalResults: results.length, searchInfo: { originalQuery:q, enhancedQuery, visualCriteria } });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
