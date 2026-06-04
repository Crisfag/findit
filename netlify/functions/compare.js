// netlify/functions/compare.js
// Cherche le même produit chez plusieurs marchands et compare les prix

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const { q, country = 'be' } = event.queryStringParameters || {};
  if (!q) return { statusCode: 400, headers, body: JSON.stringify({ error: 'q requis' }) };

  const serpKey = process.env.SERPAPI_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!serpKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'SerpApi manquant' }) };

  try {
    // Lance 3 recherches en parallèle : prix normal, prix bas, prix neuf
    const searches = [
      { label: 'Tous prix', q: q },
      { label: 'Moins cher', q: `${q} pas cher promotion` },
      { label: 'Premium', q: `${q} premium qualité` },
    ];

    const allResults = await Promise.all(searches.map(async s => {
      const params = new URLSearchParams({
        engine: 'google_shopping',
        q: s.q,
        api_key: serpKey,
        gl: country,
        hl: 'fr',
        num: '10',
      });
      const res = await fetch(`https://serpapi.com/search.json?${params}`);
      const data = await res.json();
      return (data.shopping_results || []).slice(0, 8).map(item => ({
        title: item.title,
        price: item.price,
        priceRaw: item.extracted_price || 0,
        store: item.source,
        storeLink: item.product_link || item.link || null,
        img: item.thumbnail,
        rating: item.rating,
        reviews: item.reviews,
        delivery: item.delivery,
        badge: item.badge,
        label: s.label,
      }));
    }));

    // Fusionne et déduplique par store
    const seen = new Set();
    const merged = allResults.flat().filter(item => {
      const key = `${item.store}_${item.priceRaw}`;
      if (seen.has(key) || !item.priceRaw) return false;
      seen.add(key);
      return true;
    });

    // Trie par prix
    merged.sort((a, b) => a.priceRaw - b.priceRaw);

    // Stats de comparaison
    const prices = merged.map(r => r.priceRaw).filter(p => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a,b)=>a+b,0) / prices.length;

    // Claude analyse les meilleurs deals si dispo
    let analysis = null;
    if (anthropicKey && merged.length > 0) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            messages: [{
              role: 'user',
              content: `Analyse ces prix pour "${q}" et donne une recommandation d'achat en 2 phrases max. Prix trouvés: ${merged.slice(0,5).map(r=>`${r.store}: ${r.price}`).join(', ')}. Réponds en JSON: {"recommendation": "...", "bestDeal": "nom du magasin", "tip": "conseil court"}`
            }]
          })
        });
        const d = await res.json();
        const txt = d.content?.[0]?.text || '';
        analysis = JSON.parse(txt.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
      } catch(e) { /* silently fail */ }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results: merged,
        stats: {
          count: merged.length,
          minPrice: minPrice.toFixed(2),
          maxPrice: maxPrice.toFixed(2),
          avgPrice: avgPrice.toFixed(2),
          savings: (maxPrice - minPrice).toFixed(2),
          savingsPct: Math.round((1 - minPrice/maxPrice) * 100),
        },
        analysis,
      })
    };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
