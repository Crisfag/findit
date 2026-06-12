export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, category, min_price, max_price, country = 'be', lang = 'fr', visual_criteria } = req.query || {};
  if (!q) return res.status(400).json({ error: 'Paramètre q requis' });

  const serpKey = process.env.SERPAPI_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!serpKey) return res.status(500).json({ error: 'Clé SerpApi manquante' });

  try {
    // ÉTAPE 1 — Enrichissement de la requête
    let enhancedQuery = q;
    let visualCriteria = [];
    const isImageSearch = visual_criteria && visual_criteria.length > 2;

    if (isImageSearch) {
      // ── Recherche par image : les critères visuels viennent de Claude Vision, plus précis
      // On n'appelle PAS Haiku pour re-générer des critères (ils seraient moins bons)
      try {
        visualCriteria = JSON.parse(visual_criteria);
      } catch(e) { visualCriteria = []; }
      // Enrichit juste la requête texte si besoin
      enhancedQuery = q;
      console.log('[Image Search] Critères visuels Vision:', visualCriteria.length, 'critères');
    } else if (anthropicKey) {
      // ── Recherche texte classique : Haiku génère les critères visuels
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

    // ÉTAPE 2 — Multi-sources : Google Shopping + Amazon + eBay (en parallèle)
    const domainMap = {
      be: { amazon: 'amazon.fr', ebay: 'ebay.fr' },
      fr: { amazon: 'amazon.fr', ebay: 'ebay.fr' },
      de: { amazon: 'amazon.de', ebay: 'ebay.de' },
      nl: { amazon: 'nl.amazon.com', ebay: 'ebay.nl' },
      uk: { amazon: 'amazon.co.uk', ebay: 'ebay.co.uk' },
      us: { amazon: 'amazon.com', ebay: 'ebay.com' },
    };
    const domains = domainMap[country] || domainMap.us;

    // ── Google Shopping
    const fetchGoogleShopping = async () => {
      try {
        const sp = new URLSearchParams({ engine:'google_shopping', q:enhancedQuery, api_key:serpKey, gl:country, hl:lang, num:'30' });
        const r = await fetch(`https://serpapi.com/search.json?${sp}`);
        const d = await r.json();
        if (d.error) { console.log('GoogleShopping error:', d.error); return []; }
        return (d.shopping_results || []).map(item => ({
          title: item.title,
          price: item.price,
          extracted_price: item.extracted_price,
          old_price: item.old_price,
          thumbnail: item.thumbnail,
          source: item.source || 'Boutique en ligne',
          link: item.link,
          product_link: item.product_link,
          rating: item.rating,
          reviews: item.reviews,
          delivery: item.delivery,
          snippet: item.snippet,
          extensions: item.extensions || [],
          product_id: item.product_id,
          badge: item.badge,
        }));
      } catch(e) { console.log('GoogleShopping fetch error:', e.message); return []; }
    };

    // ── Amazon
    const fetchAmazon = async () => {
      try {
        const sp = new URLSearchParams({ engine:'amazon', k:enhancedQuery, api_key:serpKey, amazon_domain:domains.amazon });
        const r = await fetch(`https://serpapi.com/search.json?${sp}`);
        const d = await r.json();
        if (d.error) { console.log('Amazon error:', d.error); return []; }
        return (d.organic_results || []).slice(0,15).map(item => {
          const priceVal = item.extracted_price ?? item.price?.extracted_value ?? item.price?.value ?? null;
          const priceStr = item.price?.raw || (priceVal != null ? `${priceVal} €` : null);
          return {
            title: item.title,
            price: priceStr,
            extracted_price: priceVal,
            thumbnail: item.thumbnail,
            source: `Amazon ${domains.amazon.replace('amazon.','').toUpperCase()}`,
            link: item.link,
            product_link: item.link,
            rating: item.rating,
            reviews: item.reviews,
            delivery: item.is_prime ? '🚀 Livraison Prime' : null,
            snippet: '',
            extensions: item.is_prime ? ['Prime'] : [],
            product_id: item.asin,
            badge: item.is_prime ? 'Prime' : null,
          };
        });
      } catch(e) { console.log('Amazon fetch error:', e.message); return []; }
    };

    // ── eBay
    const fetchEbay = async () => {
      try {
        const sp = new URLSearchParams({ engine:'ebay', _nkw:enhancedQuery, api_key:serpKey, ebay_domain:domains.ebay });
        const r = await fetch(`https://serpapi.com/search.json?${sp}`);
        const d = await r.json();
        if (d.error) { console.log('eBay error:', d.error); return []; }
        return (d.organic_results || []).slice(0,15).map(item => {
          const priceVal = item.price?.extracted ?? item.price?.from?.extracted ?? null;
          const priceStr = item.price?.raw || item.price?.from?.raw || null;
          return {
            title: item.title,
            price: priceStr,
            extracted_price: priceVal,
            thumbnail: item.thumbnail,
            source: `eBay${item.condition ? ' · ' + item.condition : ''}`,
            link: item.link,
            product_link: item.link,
            rating: null,
            reviews: item.reviews || null,
            delivery: item.shipping?.raw || (item.shipping_cost === 0 ? 'Livraison gratuite' : null),
            snippet: (item.subtitles || []).join(' · '),
            extensions: item.condition ? [item.condition] : [],
            product_id: item.epid,
            badge: item.condition === 'Brand New' ? 'Neuf' : null,
          };
        });
      } catch(e) { console.log('eBay fetch error:', e.message); return []; }
    };

    // ── Shein via Google Shopping (requête dédiée)
    const fetchShein = async () => {
      try {
        const sp = new URLSearchParams({ engine:'google_shopping', q: enhancedQuery + ' site:shein.com OR shein', api_key:serpKey, gl:country, hl:lang, num:'10' });
        const r = await fetch(`https://serpapi.com/search.json?${sp}`);
        const d = await r.json();
        return (d.shopping_results || [])
          .filter(item => item.source && item.source.toLowerCase().includes('shein'))
          .slice(0,8)
          .map(item => ({
            title: item.title, price: item.price, extracted_price: item.extracted_price,
            old_price: item.old_price, thumbnail: item.thumbnail,
            source: 'Shein', link: item.link, product_link: item.product_link,
            rating: item.rating, reviews: item.reviews, delivery: item.delivery,
            snippet: item.snippet || '', extensions: item.extensions || [],
            product_id: item.product_id, badge: item.badge,
          }));
      } catch(e) { return []; }
    };

    const [googleResults, amazonResults, ebayResults, sheinResults] = await Promise.all([
      fetchGoogleShopping(),
      fetchAmazon(),
      fetchEbay(),
      fetchShein(),
    ]);

    if (googleResults.length === 0 && amazonResults.length === 0 && ebayResults.length === 0) {
      throw new Error('Aucun résultat trouvé sur les sources disponibles');
    }

    // Fusionne en intercalant les sources pour une diversité équitable
    const rawResults = [];
    const maxLen = Math.max(googleResults.length, amazonResults.length, ebayResults.length);
    for (let i = 0; i < maxLen; i++) {
      if (googleResults[i]) rawResults.push(googleResults[i]);
      if (amazonResults[i]) rawResults.push(amazonResults[i]);
      if (ebayResults[i]) rawResults.push(ebayResults[i]);
      if (sheinResults[i]) rawResults.push(sheinResults[i]);
    }

    // ÉTAPE 3 — Scoring Claude
    let scoredResults = rawResults;
    if (anthropicKey && rawResults.length > 0) {
      try {
        const productList = rawResults.slice(0,30).map((item,i) => ({ index:i, title:item.title||'', snippet:item.snippet||'', extensions:(item.extensions||[]).join(', ') }));
        const isImgSearch = isImageSearch;
          const scoreInstruction = isImgSearch
            ? `RECHERCHE PAR IMAGE. Les critères visuels suivants ont été détectés par Claude Vision et sont TRÈS PRÉCIS. Score chaque produit (0-99) en vérifiant STRICTEMENT la correspondance visuelle.
RÈGLES STRICTES :
- Si la couleur détectée ne correspond pas → score max 40
- Si la matière/texture ne correspond pas → score max 50
- Si la forme/silhouette ne correspond pas → score max 45
- Si plusieurs critères majeurs manquent → score max 30
- Score 85+ uniquement si couleur + matière + forme correspondent tous
Critères visuels exacts de l'image : ${visualCriteria.join(' | ')}`
            : `Recherche: "${q}". Critères: ${visualCriteria.join(', ')}. Score chaque produit (0-99). RÈGLE: si critère majeur absent → max 45%.`;

          const scoreRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 1024,
            messages: [{ role: 'user', content: `${scoreInstruction}\nRéponds JSON: {"scores":[{"index":0,"score":85,"reason":"..."}]}\n${productList.map(p=>`[${p.index}] "${p.title}" | ${p.snippet}`).join('\n')}` }]
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
