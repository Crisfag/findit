export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).json({ error: 'Supabase non configuré' });

  const { action, email, password, token, data } = req.body || {};

  const supaFetch = (path, opts = {}) => fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type':'application/json', 'apikey':SUPABASE_KEY, 'Authorization': token ? `Bearer ${token}` : `Bearer ${SUPABASE_KEY}`, ...(opts.headers||{}) }
  }).then(r => r.json());

  try {
    if (action === 'signup') {
      const r = await supaFetch('/auth/v1/signup', { method:'POST', body:JSON.stringify({ email, password, data:{ full_name: data?.name||'' } }) });
      if (r.error) throw new Error(r.error.message);
      return res.status(200).json({ success:true, user:r.user, session:r.session });
    }
    if (action === 'login') {
      const r = await supaFetch('/auth/v1/token?grant_type=password', { method:'POST', body:JSON.stringify({ email, password }) });
      if (r.error) throw new Error(r.error.message);
      return res.status(200).json({ success:true, user:r.user, session:r });
    }
    if (action === 'logout') {
      await supaFetch('/auth/v1/logout', { method:'POST' });
      return res.status(200).json({ success:true });
    }
    if (action === 'get_profile') {
      const user = await supaFetch('/auth/v1/user');
      if (user.error) throw new Error(user.error.message);
      const [history, favs] = await Promise.all([
        supaFetch(`/rest/v1/search_history?user_id=eq.${user.id}&order=created_at.desc&limit=20`),
        supaFetch(`/rest/v1/favorites?user_id=eq.${user.id}&order=created_at.desc&limit=50`)
      ]);
      return res.status(200).json({ success:true, user, history:Array.isArray(history)?history:[], favorites:Array.isArray(favs)?favs:[] });
    }
    if (action === 'save_search') {
      const user = await supaFetch('/auth/v1/user');
      if (user.error) throw new Error(user.error.message);
      await supaFetch('/rest/v1/search_history', { method:'POST', headers:{'Prefer':'return=minimal'}, body:JSON.stringify({ user_id:user.id, query:data.query, category:data.category||'all', results_count:data.results_count||0, enhanced_query:data.enhanced_query||'' }) });
      return res.status(200).json({ success:true });
    }
    if (action === 'toggle_favorite') {
      const user = await supaFetch('/auth/v1/user');
      if (user.error) throw new Error(user.error.message);
      const existing = await supaFetch(`/rest/v1/favorites?user_id=eq.${user.id}&product_id=eq.${data.product_id}`);
      if (Array.isArray(existing) && existing.length > 0) {
        await supaFetch(`/rest/v1/favorites?user_id=eq.${user.id}&product_id=eq.${data.product_id}`, { method:'DELETE' });
        return res.status(200).json({ success:true, action:'removed' });
      } else {
        await supaFetch('/rest/v1/favorites', { method:'POST', headers:{'Prefer':'return=minimal'}, body:JSON.stringify({ user_id:user.id, product_id:data.product_id, title:data.title, price:data.price, store:data.store, store_link:data.store_link, img:data.img, match:data.match }) });
        return res.status(200).json({ success:true, action:'added' });
      }
    }
    return res.status(400).json({ error:'Action inconnue' });
  } catch(err) {
    return res.status(400).json({ error: err.message });
  }
}
