// netlify/functions/search.js
// Cette fonction tourne côté serveur — la clé API n'est jamais exposée au navigateur

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Preflight
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
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Paramètre q requis' })
      };
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Clé API non configurée' })
      };
    }

    // Construction de la requête Google Shopping via SerpApi
    const searchParams = new URLSearchParams({
      engine: 'google_shopping',
      q: category && category !== 'all' ? `${query} ${category}` : query,
      api_key: apiKey,
      gl: country,       // Géolocalisation (be = Belgique)
      hl: lang,          // Langue
      num: '20',         // Nombre de résultats
    });

    if (minPrice) searchParams.append('tbs', `mr:1,price:1,ppr_min:${minPrice}`);
    if (maxPrice) searchParams.append('price_max', maxPrice);

    const url = `https://serpapi.com/search.json?${searchParams.toString()}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: data.error })
      };
    }

    // Transformation des résultats SerpApi → format Find It
    const results = (data.shopping_results || []).map((item, index) => {
      // Calcul du score de correspondance basé sur la position et les données
      const baseMatch = Math.max(99 - (index * 3), 60);
      const hasRating = item.rating ? 2 : 0;
      const hasReviews = item.reviews ? 2 : 0;
      const matchScore = Math.min(baseMatch + hasRating + hasReviews, 99);

      return {
        id: item.product_id || `item_${index}`,
        title: item.title || 'Produit sans titre',
        desc: item.snippet || item.description || 'Description non disponible.',
        price: item.price ? item.price.replace(/[^0-9.,]/g, '').replace(',', '.') : '—',
        priceRaw: item.extracted_price || 0,
        currency: '€',
        oldPrice: item.old_price ? item.old_price.replace(/[^0-9.,]/g, '') : null,
        match: matchScore,
        stars: item.rating || null,
        reviews: item.reviews || null,
        store: item.source || 'Boutique en ligne',
        storeLink: item.link || '#',
        delivery: item.delivery || 'Délai non précisé',
        img: item.thumbnail || null,
        position: item.position || index + 1,
        badge: item.badge || null,
        extensions: item.extensions || [],
      };
    });

    // Résultats organiques complémentaires si Shopping insuffisant
    const organicResults = (data.organic_results || []).slice(0, 5).map((item, index) => ({
      id: `organic_${index}`,
      title: item.title || 'Résultat web',
      desc: item.snippet || '',
      price: null,
      match: Math.max(75 - (index * 5), 50),
      stars: null,
      reviews: null,
      store: item.displayed_link || item.source || 'Web',
      storeLink: item.link || '#',
      delivery: null,
      img: item.thumbnail || null,
      isOrganic: true,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results,
        organicResults: results.length < 5 ? organicResults : [],
        totalResults: results.length,
        searchInfo: {
          query: query,
          country: country,
          totalShown: results.length,
        },
        searchMetadata: data.search_metadata || {},
      })
    };

  } catch (err) {
    console.error('Search function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur: ' + err.message })
    };
  }
};
