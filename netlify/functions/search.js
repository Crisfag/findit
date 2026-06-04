exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const params = event.queryStringParameters || {};
    const query = params.q || '';
    const category = params.category || '';
    const minPrice = params.min_price || '';
    const maxPrice = params.max_price || '';
    const country = params.country || 'be';
    const lang = params.lang || 'fr';

    if (!query) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Paramètre q requis' }) };
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Clé API SerpApi non configurée' }) };
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // ── 1. Appel Google Shopping
    const searchParams = new URLSearchParams({
      engine: 'google_shopping',
      q: query,
      api_key: apiKey,
      gl: country,
      hl: lang,
      num: '20',
    });

    const serpRes = await fetch(`https://serpapi.com/search.json?${searchParams.toString()}`);
    const serpData = await serpRes.json();

    if (serpData.error) throw new Error(serpData.error);

    const rawResults = serpData.shopping_results || [];

    // ── 2. Score de ressemblance intelligent via Claude
    let scoredResults = rawResults;

    if (anthropicKey && rawResults.length > 0) {
      try {
        // On demande à Claude de scorer chaque résultat par rapport à la requête
        const productList = rawResults.slice(0, 15).map((item, i) => ({
          index: i,
          title: item.title || '',
          snippet: item.snippet || '',
          extensions: (item.extensions || []).join(', '),
        }));

        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages: [{
              role: 'user',
              content: `Tu es un expert en matching de produits pour une application de shopping.

L'utilisateur recherche : "${query}"

Voici les résultats Google Shopping trouvés. Pour chacun, attribue un score de ressemblance RÉALISTE de 0 à 100 basé sur :
- La correspondance avec TOUS les termes de la recherche (couleur, style, matière, coupe, motif…)
- Si un terme clé de la recherche est absent du titre/description, le score doit être bas (ex: si "rayures ethniques" est absent → max 40%)
- Sois strict : 95%+ = correspondance quasi-parfaite sur tous les critères
- 70-90% = correspond à la plupart des critères
- 40-70% = correspond partiellement
- Moins de 40% = peu de rapport

Produits :
${productList.map(p => `[${p.index}] "${p.title}" | ${p.snippet} | ${p.extensions}`).join('\n')}

Réponds UNIQUEMENT en JSON valide :
{"scores": [{"index": 0, "score": 85, "reason": "correspond à..."}, ...]}`
            }]
          })
        });

        const claudeData = await claudeRes.json();
        const rawText = claudeData.content?.[0]?.text || '';
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Applique les scores Claude aux résultats
        const scoreMap = {};
        (parsed.scores || []).forEach(s => { scoreMap[s.index] = s; });

        scoredResults = rawResults.map((item, i) => ({
          ...item,
          _matchScore: scoreMap[i]?.score ?? Math.max(70 - i * 3, 40),
          _matchReason: scoreMap[i]?.reason ?? '',
        }));

      } catch (scoreErr) {
        console.error('Scoring error:', scoreErr);
        // Fallback : score basé sur la position mais plus conservateur
        scoredResults = rawResults.map((item, i) => ({
          ...item,
          _matchScore: Math.max(75 - i * 4, 40),
          _matchReason: '',
        }));
      }
    } else {
      // Pas de clé Anthropic → score conservateur basé sur position
      scoredResults = rawResults.map((item, i) => ({
        ...item,
        _matchScore: Math.max(75 - i * 4, 40),
        _matchReason: '',
      }));
    }

    // ── 3. Formate les résultats finaux
    const results = scoredResults.map((item, index) => ({
      id: item.product_id || `item_${index}`,
      title: item.title || 'Produit sans titre',
      desc: item.snippet || item.description || 'Description non disponible.',
      price: item.price ? item.price.replace(/[^0-9.,]/g, '').replace(',', '.') : '—',
      priceRaw: item.extracted_price || 0,
      currency: '€',
      oldPrice: item.old_price ? item.old_price.replace(/[^0-9.,]/g, '') : null,
      match: item._matchScore,
      matchReason: item._matchReason,
      stars: item.rating || null,
      reviews: item.reviews || null,
      store: item.source || 'Boutique en ligne',
      storeLink: item.link || '#',
      delivery: item.delivery || 'Délai non précisé',
      img: item.thumbnail || null,
      position: item.position || index + 1,
      badge: item.badge || null,
      extensions: item.extensions || [],
    }));

    // Trie par score de ressemblance décroissant
    results.sort((a, b) => b.match - a.match);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results,
        totalResults: results.length,
        searchInfo: { query, country, totalShown: results.length },
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
