
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
 
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };
 
  try {
    const params = event.queryStringParameters || {};
    const query = params.q || '';
    const category = params.category || '';
    const minPrice = params.min_price || '';
    const maxPrice = params.max_price || '';
    const country = params.country || 'be';
    const lang = params.lang || 'fr';
 
    if (!query) return { statusCode:400, headers, body:JSON.stringify({ error:'Paramètre q requis' }) };
 
    const serpKey = process.env.SERPAPI_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
 
    if (!serpKey) return { statusCode:500, headers, body:JSON.stringify({ error:'Clé SerpApi manquante' }) };
 
    // ══════════════════════════════════════════════════════
    // ÉTAPE 1 — Claude décompose la requête en mots-clés
    //           ultra-précis pour Google Shopping
    // ══════════════════════════════════════════════════════
    let enhancedQuery = query;
    let visualCriteria = [];
 
    if (anthropicKey) {
      try {
        const enhanceRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            messages: [{
              role: 'user',
              content: `Tu es un expert en recherche de produits fashion et shopping.
 
L'utilisateur recherche : "${query}"
 
Ta mission :
1. Génère une requête Google Shopping optimisée et ultra-précise qui capture TOUS les détails visuels (couleur, motif, coupe, longueur, matière, style, occasion…)
2. Liste les critères visuels essentiels à vérifier dans les résultats
 
Réponds UNIQUEMENT en JSON :
{
  "enhancedQuery": "requête Google Shopping optimisée avec tous les détails visuels importants",
  "alternativeQueries": ["variante 1", "variante 2"],
  "visualCriteria": ["critère visuel 1", "critère visuel 2", "critère visuel 3"],
  "mustHave": ["élément absolument requis 1", "élément absolument requis 2"],
  "mustNotHave": ["élément à exclure 1"]
}`
            }]
          })
        });
 
        const enhanceData = await enhanceRes.json();
        const rawText = enhanceData.content?.[0]?.text || '';
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
 
        enhancedQuery = parsed.enhancedQuery || query;
        visualCriteria = parsed.visualCriteria || [];
 
        // Stocke pour le scoring
        event._mustHave = parsed.mustHave || [];
        event._mustNotHave = parsed.mustNotHave || [];
        event._altQueries = parsed.alternativeQueries || [];
 
      } catch (e) {
        console.error('Query enhancement error:', e);
        enhancedQuery = query;
      }
    }
 
    // ══════════════════════════════════════════════════════
    // ÉTAPE 2 — Google Shopping avec requête améliorée
    //           + requêtes alternatives en parallèle
    // ══════════════════════════════════════════════════════
    const makeShoppingCall = async (q) => {
      const sp = new URLSearchParams({
        engine: 'google_shopping',
        q, api_key: serpKey,
        gl: country, hl: lang, num: '20',
      });
      if (minPrice) sp.append('tbs', `mr:1,price:1,ppr_min:${minPrice}`);
      if (maxPrice && Number(maxPrice) < 2000) sp.append('price_max', maxPrice);
      const res = await fetch(`https://serpapi.com/search.json?${sp.toString()}`);
      const data = await res.json();
      return data.shopping_results || [];
    };
 
    // Appel principal + 1 alternative si disponible
    const altQuery = (event._altQueries || [])[0];
    const [mainResults, altResults] = await Promise.all([
      makeShoppingCall(enhancedQuery),
      altQuery ? makeShoppingCall(altQuery) : Promise.resolve([]),
    ]);
 
    // Fusionne et déduplique par product_id
    const seen = new Set();
    const allRaw = [...mainResults, ...altResults].filter(item => {
      const key = item.product_id || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20);
 
    // ══════════════════════════════════════════════════════
    // ÉTAPE 3 — Claude score chaque résultat :
    //           a) analyse textuelle (titre + extensions)
    //           b) analyse visuelle (thumbnail URL → Claude Vision)
    // ══════════════════════════════════════════════════════
    let scoredResults = allRaw;
 
    if (anthropicKey && allRaw.length > 0) {
      try {
        // Prépare les données textuelles ET visuelles
        const productList = allRaw.slice(0, 15).map((item, i) => ({
          index: i,
          title: item.title || '',
          snippet: item.snippet || '',
          extensions: (item.extensions || []).join(', '),
          thumbnail: item.thumbnail || null,
        }));
 
        // Construit le contenu multimodal pour Claude
        // Pour chaque produit avec thumbnail, on inclut l'image
        const contentBlocks = [];
 
        contentBlocks.push({
          type: 'text',
          text: `Tu es un expert en matching visuel de produits pour une app de shopping.
 
Recherche originale de l'utilisateur : "${query}"
Critères visuels essentiels : ${visualCriteria.join(', ') || 'non spécifiés'}
Éléments OBLIGATOIRES : ${(event._mustHave || []).join(', ') || 'voir la recherche'}
Éléments À EXCLURE : ${(event._mustNotHave || []).join(', ') || 'aucun'}
 
Voici les produits à évaluer (titre + description) :
${productList.map(p => `[${p.index}] "${p.title}" | ${p.snippet} | ${p.extensions}`).join('\n')}
 
Pour chaque produit, attribue un score de ressemblance STRICTEMENT RÉALISTE :
- 90-99% : TOUS les critères visuels correspondent parfaitement
- 75-89% : La plupart des critères correspondent  
- 50-74% : Correspondance partielle (manque 1-2 critères importants)
- 20-49% : Peu de rapport avec la recherche
- 0-19% : Totalement différent
 
RÈGLE STRICTE : Si un élément OBLIGATOIRE est absent → score max 45%
Si un élément À EXCLURE est présent → score max 30%
 
Réponds UNIQUEMENT en JSON :
{"scores": [{"index": 0, "score": 87, "reason": "explication courte en français (max 8 mots)"}]}`
        });
 
        // Ajoute jusqu'à 6 images pour l'analyse visuelle
        const itemsWithImages = productList.filter(p => p.thumbnail).slice(0, 6);
        if (itemsWithImages.length > 0) {
          contentBlocks.push({
            type: 'text',
            text: `\nAnalyse aussi visuellement ces ${itemsWithImages.length} images de produits (dans l'ordre : ${itemsWithImages.map(p => `[${p.index}]`).join(', ')}) et ajuste les scores en conséquence :`
          });
 
          for (const item of itemsWithImages) {
            try {
              // Fetch l'image et la convertit en base64
              const imgRes = await fetch(item.thumbnail, { signal: AbortSignal.timeout(3000) });
              if (imgRes.ok) {
                const buffer = await imgRes.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                contentBlocks.push({
                  type: 'image',
                  source: { type: 'base64', media_type: contentType, data: base64 }
                });
              }
            } catch (imgErr) {
              // Image non chargeable, on skip
            }
          }
        }
 
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5',
            max_tokens: 1024,
            messages: [{ role: 'user', content: contentBlocks }]
          })
        });
 
        const claudeData = await claudeRes.json();
        const rawText = claudeData.content?.[0]?.text || '';
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
 
        const scoreMap = {};
        (parsed.scores || []).forEach(s => { scoreMap[s.index] = s; });
 
        scoredResults = allRaw.map((item, i) => ({
          ...item,
          _matchScore: scoreMap[i]?.score ?? Math.max(60 - i * 3, 25),
          _matchReason: scoreMap[i]?.reason ?? '',
        }));
 
      } catch (scoreErr) {
        console.error('Visual scoring error:', scoreErr);
        scoredResults = allRaw.map((item, i) => ({
          ...item,
          _matchScore: Math.max(70 - i * 4, 30),
          _matchReason: '',
        }));
      }
    }
 
    // ══════════════════════════════════════════════════════
    // ÉTAPE 4 — Formate, trie et retourne
    // ══════════════════════════════════════════════════════
    const results = scoredResults
      .map((item, index) => ({
        id: item.product_id || `item_${index}`,
        title: item.title || 'Produit sans titre',
        desc: (item.snippet || item.description || (item.extensions||[]).join(' · ') || '').trim() || item.title || 'Description non disponible.',
        price: item.price ? item.price.replace(/[^0-9.,]/g, '').replace(',', '.') : '—',
        priceRaw: item.extracted_price || 0,
        currency: '€',
        oldPrice: item.old_price ? item.old_price.replace(/[^0-9.,]/g, '') : null,
        match: item._matchScore,
        matchReason: item._matchReason,
        stars: item.rating || null,
        reviews: item.reviews || null,
        store: item.source || 'Boutique en ligne',
        storeLink: item.link && item.link.startsWith('http') ? item.link : null,
        delivery: item.delivery || 'Délai non précisé',
        img: item.thumbnail || null,
        badge: item.badge || null,
        extensions: item.extensions || [],
        enhancedQuery,
        visualCriteria,
      }))
      .sort((a, b) => b.match - a.match);
 
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results,
        totalResults: results.length,
        searchInfo: {
          originalQuery: query,
          enhancedQuery,
          visualCriteria,
          country,
        },
      })
    };
 
  } catch (err) {
    console.error('Search error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur: ' + err.message })
    };
  }
};
