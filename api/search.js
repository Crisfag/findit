export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, country = 'be' } = req.query || {};
  if (!q) return res.status(400).json({ error: 'q requis' });

  const serpKey = process.env.SERPAPI_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!serpKey) return res.status(500).json({ error: 'SerpApi manquant' });

  try {
    const makeCall = async (query) => {
      const sp = new URLSearchParams({ engine:'google_shopping', q:query, api_key:serpKey, gl:country, hl:'fr', num:'10' });
      const r = await fetch(`https://serpapi.com/search.json?${sp}`);
      const d = await r.json();
      return d.shopping_results || [];
    };

    const [main, alt1, alt2] = await Promise.all([
      makeCall(q),
      makeCall(`${q} pas cher promo`),
      makeCall(`${q} premium qualité`),
    ]);

    const seen = new Set();
    const merged = [...main, ...alt1, ...alt2].filter(item => {
      const key = `${item.source}_${item.extracted_price}`;
      if (seen.has(key) || !item.extracted_price) return false;
      seen.add(key); return true;
    }).slice(0,20).sort((a,b) => (a.extracted_price||0)-(b.extracted_price||0));

    const prices = merged.map(r => r.extracted_price||0).filter(p=>p>0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a,b)=>a+b,0)/prices.length;

    let analysis = null;
    if (anthropicKey && merged.length > 0) {
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST',
          headers:{ 'Content-Type':'application/json','x-api-key':anthropicKey,'anthropic-version':'2023-06-01' },
          body:JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:300, messages:[{ role:'user', content:`Analyse ces prix pour "${q}": ${merged.slice(0,5).map(r=>`${r.source}: ${r.price}`).join(', ')}. Réponds JSON: {"recommendation":"...","bestDeal":"magasin","tip":"conseil court"}` }] })
        });
        const d = await r.json();
        analysis = JSON.parse((d.content?.[0]?.text||'{}').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
      } catch(e) {}
    }

    const results = merged.map((item,i) => ({
      title: item.title, price: item.price, priceRaw: item.extracted_price||0,
      store: item.source, storeLink: item.product_link||item.link||null,
      img: item.thumbnail, rating: item.rating, reviews: item.reviews, delivery: item.delivery
    }));

    return res.status(200).json({ results, stats:{ count:results.length, minPrice:minPrice.toFixed(2), maxPrice:maxPrice.toFixed(2), avgPrice:avgPrice.toFixed(2), savings:(maxPrice-minPrice).toFixed(2), savingsPct:Math.round((1-minPrice/maxPrice)*100) }, analysis });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
