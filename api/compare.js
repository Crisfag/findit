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

  const domainMap = {
    be: { amazon: 'amazon.fr', ebay: 'ebay.fr' },
    fr: { amazon: 'amazon.fr', ebay: 'ebay.fr' },
    de: { amazon: 'amazon.de', ebay: 'ebay.de' },
    nl: { amazon: 'nl.amazon.com', ebay: 'ebay.nl' },
    uk: { amazon: 'amazon.co.uk', ebay: 'ebay.co.uk' },
    us: { amazon: 'amazon.com', ebay: 'ebay.com' },
  };
  const domains = domainMap[country] || domainMap.us;

  try {
    // ── Google Shopping
    const fetchGoogle = async () => {
      try {
        const sp = new URLSearchParams({ engine:'google_shopping', q, api_key:serpKey, gl:country, hl:'fr', num:'12' });
        const r = await fetch(`https://serpapi.com/search.json?${sp}`);
        const d = await r.json();
        return (d.shopping_results || []).map(item => ({
          title: item.title, price: item.price, extracted_price: item.extracted_price,
          thumbnail: item.thumbnail, source: item.source || 'Boutique en ligne',
          link: item.product_link || item.link, rating: item.rating, reviews: item.reviews, delivery: item.delivery
        }));
      } catch(e) { return []; }
    };

    // ── Amazon
    const fetchAmazon = async () => {
      try {
        const sp = new URLSearchParams({ engine:'amazon', k:q, api_key:serpKey, amazon_domain:domains.amazon });
        const r = await fetch(`https://serpapi.com/search.json?${sp}`);
        const d = await r.json();
        return (d.organic_results || []).slice(0,10).map(item => {
          const priceVal = item.extracted_price ?? item.price?.extracted_value ?? item.price?.value ?? null;
          const priceStr = item.price?.raw || (priceVal != null ? `${priceVal} €` : null);
          return {
            title: item.title, price: priceStr, extracted_price: priceVal,
            thumbnail: item.thumbnail, source: `Amazon ${domains.amazon.replace('amazon.','').toUpperCase()}`,
            link: item.link, rating: item.rating, reviews: item.reviews,
            delivery: item.is_prime ? '🚀 Livraison Prime' : null
          };
        });
      } catch(e) { return []; }
    };

    // ── eBay
    const fetchEbay = async () => {
      try {
        const sp = new URLSearchParams({ engine:'ebay', _nkw:q, api_key:serpKey, ebay_domain:domains.ebay });
        const r = await fetch(`https://serpapi.com/search.json?${sp}`);
        const d = await r.json();
        return (d.organic_results || []).slice(0,10).map(item => {
          const priceVal = item.price?.extracted ?? item.price?.from?.extracted ?? null;
          const priceStr = item.price?.raw || item.price?.from?.raw || null;
          return {
            title: item.title, price: priceStr, extracted_price: priceVal,
            thumbnail: item.thumbnail, source: `eBay${item.condition ? ' · ' + item.condition : ''}`,
            link: item.link, rating: null, reviews: item.reviews || null,
            delivery: item.shipping?.raw || null
          };
        });
      } catch(e) { return []; }
    };

    const [google, amazon, ebay] = await Promise.all([fetchGoogle(), fetchAmazon(), fetchEbay()]);

    const seen = new Set();
    const merged = [...google, ...amazon, ...ebay].filter(item => {
      const key = `${item.source}_${item.extracted_price}`;
      if (seen.has(key) || !item.extracted_price) return false;
      seen.add(key); return true;
    }).slice(0,24).sort((a,b) => (a.extracted_price||0)-(b.extracted_price||0));

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
          body:JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:300, messages:[{ role:'user', content:`Analyse ces prix pour "${q}" (sources: Google Shopping, Amazon, eBay): ${merged.slice(0,6).map(r=>`${r.source}: ${r.price}`).join(', ')}. Réponds JSON: {"recommendation":"...","bestDeal":"magasin","tip":"conseil court"}` }] })
        });
        const d = await r.json();
        analysis = JSON.parse((d.content?.[0]?.text||'{}').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
      } catch(e) {}
    }

    const results = merged.map((item,i) => ({
      title: item.title, price: item.price, priceRaw: item.extracted_price||0,
      store: item.source, storeLink: item.link||null,
      img: item.thumbnail, rating: item.rating, reviews: item.reviews, delivery: item.delivery
    }));

    return res.status(200).json({
      results,
      stats:{ count:results.length, minPrice:minPrice.toFixed(2), maxPrice:maxPrice.toFixed(2), avgPrice:avgPrice.toFixed(2), savings:(maxPrice-minPrice).toFixed(2), savingsPct:Math.round((1-minPrice/maxPrice)*100) },
      analysis,
      sourcesUsed: { google: google.length, amazon: amazon.length, ebay: ebay.length }
    });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
