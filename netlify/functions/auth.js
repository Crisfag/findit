// netlify/functions/auth.js
// Gestion auth + profil utilisateur via Supabase

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase non configuré' }) };
  }

  const body = JSON.parse(event.body || '{}');
  const { action, email, password, token, data } = body;

  const supaFetch = (path, opts = {}) => fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': token ? `Bearer ${token}` : `Bearer ${SUPABASE_KEY}`,
      ...(opts.headers || {})
    }
  }).then(r => r.json());

  try {
    // ── INSCRIPTION
    if (action === 'signup') {
      const res = await supaFetch('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, data: { full_name: data?.name || '' } })
      });
      if (res.error) throw new Error(res.error.message);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: res.user, session: res.session }) };
    }

    // ── CONNEXION
    if (action === 'login') {
      const res = await supaFetch('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.error) throw new Error(res.error.message);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: res.user, session: res }) };
    }

    // ── DÉCONNEXION
    if (action === 'logout') {
      await supaFetch('/auth/v1/logout', { method: 'POST' });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ── PROFIL
    if (action === 'get_profile') {
      const user = await supaFetch('/auth/v1/user');
      if (user.error) throw new Error(user.error.message);

      // Récupère historique + favoris
      const [history, favs] = await Promise.all([
        supaFetch(`/rest/v1/search_history?user_id=eq.${user.id}&order=created_at.desc&limit=20`),
        supaFetch(`/rest/v1/favorites?user_id=eq.${user.id}&order=created_at.desc&limit=50`)
      ]);

      return { statusCode: 200, headers, body: JSON.stringify({
        success: true, user,
        history: Array.isArray(history) ? history : [],
        favorites: Array.isArray(favs) ? favs : []
      })};
    }

    // ── SAUVEGARDER RECHERCHE
    if (action === 'save_search') {
      const user = await supaFetch('/auth/v1/user');
      if (user.error) throw new Error(user.error.message);

      await supaFetch('/rest/v1/search_history', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          user_id: user.id,
          query: data.query,
          category: data.category || 'all',
          results_count: data.results_count || 0,
          enhanced_query: data.enhanced_query || ''
        })
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ── TOGGLE FAVORI
    if (action === 'toggle_favorite') {
      const user = await supaFetch('/auth/v1/user');
      if (user.error) throw new Error(user.error.message);

      // Vérifie si déjà en favori
      const existing = await supaFetch(
        `/rest/v1/favorites?user_id=eq.${user.id}&product_id=eq.${data.product_id}`
      );

      if (Array.isArray(existing) && existing.length > 0) {
        // Supprime
        await supaFetch(`/rest/v1/favorites?user_id=eq.${user.id}&product_id=eq.${data.product_id}`, {
          method: 'DELETE'
        });
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'removed' }) };
      } else {
        // Ajoute
        await supaFetch('/rest/v1/favorites', {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: user.id,
            product_id: data.product_id,
            title: data.title,
            price: data.price,
            store: data.store,
            store_link: data.store_link,
            img: data.img,
            match: data.match
          })
        });
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'added' }) };
      }
    }

    // ── MISE À JOUR PROFIL
    if (action === 'update_profile') {
      const res = await supaFetch('/auth/v1/user', {
        method: 'PUT',
        body: JSON.stringify({ data: { full_name: data.name, avatar_url: data.avatar_url } })
      });
      if (res.error) throw new Error(res.error.message);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: res }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Action inconnue' }) };

  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: err.message }) };
  }
};
