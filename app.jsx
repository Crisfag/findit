// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:'all',     label:'Tout',         icon:'🔍' },
  { id:'fashion', label:'Vêtements',    icon:'👗' },
  { id:'tools',   label:'Bricolage',    icon:'🔧' },
  { id:'deco',    label:'Décoration',   icon:'🏠' },
  { id:'games',   label:'Jeux',         icon:'🎮' },
  { id:'books',   label:'Livres',       icon:'📚' },
  { id:'garden',  label:'Jardin',       icon:'🌿' },
  { id:'pets',    label:'Animaux',      icon:'🐾' },
  { id:'kids',    label:'Enfants',      icon:'🧸' },
  { id:'sports',  label:'Sport',        icon:'⚽' },
  { id:'beauty',  label:'Beauté',       icon:'💄' },
  { id:'electro', label:'Électronique', icon:'📱' },
];

const CAT_LABELS = {
  fashion:'vêtements mode', tools:'outils bricolage', deco:'décoration intérieur',
  games:'jeux jouets', books:'livres', garden:'jardin plantes',
  pets:'animaux accessoires', kids:'enfants bébés', sports:'sport',
  beauty:'beauté cosmétiques', electro:'électronique high-tech'
};

const COLORS = [
  {id:'black',hex:'#1a1a1a'},{id:'white',hex:'#f5f5f5'},{id:'red',hex:'#e74c3c'},
  {id:'blue',hex:'#3498db'},{id:'green',hex:'#2ecc71'},{id:'yellow',hex:'#f1c40f'},
  {id:'brown',hex:'#795548'},{id:'gray',hex:'#9e9e9e'},{id:'pink',hex:'#e91e63'},
  {id:'orange',hex:'#ff5722'},
];
const SIZES = ['XS','S','M','L','XL','XXL','Unique'];
const MATERIALS = ['Coton','Cuir','Lin','Bois','Métal','Plastique','Verre','Céramique'];
const DELIVERY_OPTS = ['24h','48h','3-5 jours','1 semaine'];

const HISTORY_ITEMS = [
  {id:1,query:'Veste en cuir noir',date:"Aujourd'hui",emoji:'👗'},
  {id:2,query:'Canapé velours vert',date:'Hier',emoji:'🏠'},
  {id:3,query:'Nike Air Max 270',date:'Il y a 3 jours',emoji:'👟'},
  {id:4,query:'LEGO Technic McLaren',date:'Il y a 5 jours',emoji:'🎮'},
  {id:5,query:'Monstera Deliciosa',date:'Il y a 1 semaine',emoji:'🌿'},
];
const NEW_ARRIVALS = [
  {id:1,name:'Hoodie oversize lavande',price:'49.99',match:94,emoji:'👕'},
  {id:2,name:'Lampe LED arc design',price:'89.00',match:91,emoji:'💡'},
  {id:3,name:'Puzzle 1000p Van Gogh',price:'24.90',match:88,emoji:'🧩'},
  {id:4,name:'Sac à dos cuir vintage',price:'79.99',match:85,emoji:'🎒'},
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const { useState, useEffect, useRef, useCallback } = React;

// ─── Hook i18n ─────────────────────────────────────────────────────────────
function useTranslation() {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('findit_lang');
    if (saved && TRANSLATIONS[saved]) return saved;
    const nav = (navigator.language || 'fr').split('-')[0].toLowerCase();
    return TRANSLATIONS[nav] ? nav : 'fr';
  });
  const setLang = (l) => { localStorage.setItem('findit_lang', l); setLangState(l); };
  const t = (key, ...args) => getTranslation(lang, key, ...args);
  return { t, lang, setLang, LANGUAGES };
}

// ─── AUTH HELPERS ────────────────────────────────────────────
async function authCall(action, payload = {}) {
  const session = JSON.parse(localStorage.getItem('findit_session') || 'null');
  const res = await fetch('/.netlify/functions/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, token: session?.access_token, ...payload })
  });
  return res.json();
}

function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('findit_session') || 'null'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.access_token) {
      authCall('get_profile').then(data => {
        if (data.success) setUser(data.user);
        else { localStorage.removeItem('findit_session'); setSession(null); }
      });
    }
  }, []);

  async function login(email, password) {
    setLoading(true);
    const data = await authCall('login', { email, password });
    setLoading(false);
    if (data.error) throw new Error(data.error);
    localStorage.setItem('findit_session', JSON.stringify(data.session));
    setSession(data.session);
    setUser(data.user);
    return data;
  }

  async function signup(email, password, name) {
    setLoading(true);
    const data = await authCall('signup', { email, password, data: { name } });
    setLoading(false);
    if (data.error) throw new Error(data.error);
    return data;
  }

  async function logout() {
    await authCall('logout');
    localStorage.removeItem('findit_session');
    setSession(null); setUser(null);
  }

  async function loginWithProvider(provider) {
    const SUPABASE_URL = window._SUPABASE_URL || '';
    // Redirige vers Supabase OAuth
    const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUrl}`;
  }

  // Gère le retour OAuth (token dans l'URL hash)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const sessionData = {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        expires_in: params.get('expires_in'),
      };
      localStorage.setItem('findit_session', JSON.stringify(sessionData));
      setSession(sessionData);
      // Nettoie l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Charge le profil
      authCall('get_profile').then(data => {
        if (data.success) setUser(data.user);
      });
    }
  }, []);

  return { user, session, loading, login, signup, logout, loginWithProvider, isLoggedIn: !!session?.access_token };
}



function getMatchClass(pct) {
  if (pct >= 90) return 'match-badge high';
  if (pct >= 75) return 'match-badge mid';
  return 'match-badge';
}

function SvgIcon({ d, size=18 }) {
  return React.createElement('svg', {
    viewBox:'0 0 24 24', width:size, height:size,
    fill:'none', stroke:'currentColor', strokeWidth:1.8,
    strokeLinecap:'round', strokeLinejoin:'round'
  }, React.createElement('path', { d }));
}

function HeartIcon({ filled }) {
  return React.createElement('svg', {
    style:{ fill:filled?'#FF4B2B':'none', stroke:filled?'#FF4B2B':'currentColor', strokeWidth:1.8, width:15, height:15 }
  }, React.createElement('path', {
    d:'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
  }));
}

function Stars({ count, max=5, size=13 }) {
  if (!count) return null;
  return React.createElement('div', { className:'result-stars' },
    Array.from({length:max}).map((_,i) =>
      React.createElement('svg', { key:i, viewBox:'0 0 24 24',
        style:{ width:size, height:size, fill:i<Math.round(count)?'#F39C12':'#333', stroke:'none' }
      }, React.createElement('path', { d:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }))
    ),
    React.createElement('span', null, count)
  );
}

function Toast({ toasts }) {
  return React.createElement('div', { className:'toast-wrap' },
    toasts.map(t => React.createElement('div', { key:t.id, className:`toast ${t.type||''}` },
      t.type==='success' ? React.createElement(SvgIcon,{d:'M20 6L9 17l-5-5'}) : null,
      t.msg
    ))
  );
}

// ─── LOGO ────────────────────────────────────────────────────────────────────
function Logo() {
  return React.createElement('a', { href:'#', className:'logo' },
    React.createElement('div', { className:'logo-icon' },
      React.createElement('svg', { viewBox:'0 0 24 24' },
        React.createElement('path', { d:'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z' }),
        React.createElement('path', { d:'M9 2v20M12 8h6M12 12h6M12 16h4', stroke:'white', strokeWidth:1.5, fill:'none', strokeLinecap:'round' }),
        React.createElement('circle', { cx:7.5, cy:17, r:2.5, fill:'#FF8C42' }),
        React.createElement('path', { d:'M9.3 18.8l1.7 1.7', stroke:'#FF8C42', strokeWidth:1.5, strokeLinecap:'round' })
      )
    ),
    React.createElement('span', { className:'logo-text' }, 'Find', React.createElement('span', null, ' It'))
  );
}

// ─── FILTER SIDEBAR ──────────────────────────────────────────────────────────
function FilterSidebar({ collapsed, filters, setFilters }) {
  const t = window.__t || ((k) => k);
  function toggle(key, val) {
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x=>x!==val) : [...f[key], val]
    }));
  }
  return React.createElement('aside', { className:`sidebar${collapsed?' collapsed':''}` },
    React.createElement('div', { className:'nav-header' }, 'Filtres de recherche'),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Prix'),
      React.createElement('div', { className:'filter-label' }, 'Fourchette ',
        React.createElement('span', null, `${filters.priceMin}€ — ${filters.priceMax}€`)
      ),
      React.createElement('input', { type:'range', min:0, max:2000, value:filters.priceMax,
        onChange:e=>setFilters(f=>({...f,priceMax:Number(e.target.value)})) }),
      React.createElement('div', { className:'price-inputs' },
        React.createElement('input', { type:'number', placeholder:'Min', value:filters.priceMin,
          onChange:e=>setFilters(f=>({...f,priceMin:Number(e.target.value)})) }),
        React.createElement('input', { type:'number', placeholder:'Max', value:filters.priceMax,
          onChange:e=>setFilters(f=>({...f,priceMax:Number(e.target.value)})) })
      )
    ),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Délai de livraison'),
      React.createElement('div', { className:'chip-group' },
        DELIVERY_OPTS.map(d => React.createElement('div', {
          key:d, className:`chip${filters.delivery.includes(d)?' active':''}`,
          onClick:()=>toggle('delivery',d)
        }, d))
      )
    ),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Couleur'),
      React.createElement('div', { className:'color-chips' },
        COLORS.map(c => React.createElement('div', {
          key:c.id, className:`color-chip${filters.colors.includes(c.id)?' active':''}`,
          style:{ background:c.hex }, onClick:()=>toggle('colors',c.id), title:c.id
        }))
      )
    ),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Taille'),
      React.createElement('div', { className:'chip-group' },
        SIZES.map(s => React.createElement('div', {
          key:s, className:`chip${filters.sizes.includes(s)?' active':''}`,
          onClick:()=>toggle('sizes',s)
        }, s))
      )
    ),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Matière'),
      React.createElement('div', { className:'chip-group' },
        MATERIALS.map(m => React.createElement('div', {
          key:m, className:`chip${filters.materials.includes(m)?' active':''}`,
          onClick:()=>toggle('materials',m)
        }, m))
      )
    ),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Type de commerce'),
      React.createElement('div', { className:'check-group' },
        [['online','🛒 Boutiques en ligne'],['physical',t('physicalStore')],['both','🔄 Les deux']].map(([v,l]) =>
          React.createElement('label', { key:v, className:'check-item' },
            React.createElement('input', { type:'checkbox', checked:filters.storeType.includes(v),
              onChange:()=>toggle('storeType',v) }), l
          )
        )
      )
    ),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Ressemblance minimum'),
      React.createElement('div', { className:'filter-label' }, 'Seuil ',
        React.createElement('span', null, `${filters.minMatch}%`)
      ),
      React.createElement('input', { type:'range', min:50, max:100, value:filters.minMatch,
        onChange:e=>setFilters(f=>({...f,minMatch:Number(e.target.value)})) })
    ),

    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Note minimale'),
      React.createElement('div', { className:'rating-filter' },
        [1,2,3,4,5].map(n => React.createElement('button', {
          key:n, className:`star-btn${filters.minRating>=n?' active':''}`,
          onClick:()=>setFilters(f=>({...f,minRating:f.minRating===n?0:n}))
        }, '★'))
      )
    )
  );
}

// ─── MAP PREVIEW ─────────────────────────────────────────────────────────────
// Coordonnées normalisées (0-100%) pour la carte stylisée
const STORE_POSITIONS = {
  // Europe
  'amazon':       { lat:52.5200, lng:13.4050, city:'Berlin', country:'Allemagne', flag:'🇩🇪' },
  'zalando':      { lat:52.5200, lng:13.4050, city:'Berlin', country:'Allemagne', flag:'🇩🇪' },
  'asos':         { lat:51.5074, lng:-0.1278, city:'Londres', country:'Royaume-Uni', flag:'🇬🇧' },
  'fnac':         { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'cdiscount':    { lat:44.8378, lng:-0.5792, city:'Bordeaux', country:'France', flag:'🇫🇷' },
  'ikea':         { lat:59.3293, lng:18.0686, city:'Stockholm', country:'Suède', flag:'🇸🇪' },
  'décathlon':    { lat:50.8503, lng:4.3517,  city:'Bruxelles', country:'Belgique', flag:'🇧🇪' },
  'decathlon':    { lat:50.8503, lng:4.3517,  city:'Bruxelles', country:'Belgique', flag:'🇧🇪' },
  'bol':          { lat:51.9225, lng:4.4792,  city:'Rotterdam', country:'Pays-Bas', flag:'🇳🇱' },
  'mango':        { lat:41.3851, lng:2.1734,  city:'Barcelone', country:'Espagne', flag:'🇪🇸' },
  'zara':         { lat:43.3623, lng:-8.4115, city:'A Coruña', country:'Espagne', flag:'🇪🇸' },
  'bershka':      { lat:43.3623, lng:-8.4115, city:'A Coruña', country:'Espagne', flag:'🇪🇸' },
  'snipes':       { lat:51.2217, lng:6.7762,  city:'Düsseldorf', country:'Allemagne', flag:'🇩🇪' },
  'nike':         { lat:45.5231, lng:-122.6765, city:'Portland', country:'USA', flag:'🇺🇸' },
  'adidas':       { lat:49.5733, lng:11.0257, city:'Herzogenaurach', country:'Allemagne', flag:'🇩🇪' },
  'hm':           { lat:59.3293, lng:18.0686, city:'Stockholm', country:'Suède', flag:'🇸🇪' },
  'h&m':          { lat:59.3293, lng:18.0686, city:'Stockholm', country:'Suède', flag:'🇸🇪' },
  'laredoute':    { lat:50.6292, lng:3.0573,  city:'Roubaix', country:'France', flag:'🇫🇷' },
  'kiabi':        { lat:50.6292, lng:3.0573,  city:'Roubaix', country:'France', flag:'🇫🇷' },
  'veepee':       { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'vinted':       { lat:54.6872, lng:25.2797, city:'Vilnius', country:'Lituanie', flag:'🇱🇹' },
  'showroomprive': { lat:48.8566, lng:2.3522, city:'Paris', country:'France', flag:'🇫🇷' },
  'galerieslafayette': { lat:48.8728, lng:2.3323, city:'Paris', country:'France', flag:'🇫🇷' },
  'printemps':    { lat:48.8756, lng:2.3266, city:'Paris', country:'France', flag:'🇫🇷' },
  'courir':       { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'footlocker':   { lat:40.7128, lng:-74.0060, city:'New York', country:'USA', flag:'🇺🇸' },
  'footkorner':   { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'intersport':   { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'sport2000':    { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'darty':        { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'boulanger':    { lat:50.6292, lng:3.0573,  city:'Lille', country:'France', flag:'🇫🇷' },
  'ldlc':         { lat:45.7676, lng:4.8344,  city:'Lyon', country:'France', flag:'🇫🇷' },
  'rue':          { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'hommeprive':   { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'cuir':         { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'unisportstore': { lat:55.6761, lng:12.5683, city:'Copenhague', country:'Danemark', flag:'🇩🇰' },
  'streetshoes':  { lat:52.3676, lng:4.9041,  city:'Amsterdam', country:'Pays-Bas', flag:'🇳🇱' },
  'vera':         { lat:41.9028, lng:12.4964, city:'Rome', country:'Italie', flag:'🇮🇹' },
  'gusti':        { lat:48.1351, lng:11.5820, city:'Munich', country:'Allemagne', flag:'🇩🇪' },
  'maison':       { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'leclerc':      { lat:47.3333, lng:-1.7833, city:'Nantes', country:'France', flag:'🇫🇷' },
  'carrefour':    { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  // USA
  'etsy':         { lat:40.6892, lng:-74.0445, city:'New York', country:'USA', flag:'🇺🇸' },
  'ebay':         { lat:37.3861, lng:-122.0839, city:'San José', country:'USA', flag:'🇺🇸' },
  'walmart':      { lat:36.3728, lng:-94.2088, city:'Bentonville', country:'USA', flag:'🇺🇸' },
  'target':       { lat:44.9778, lng:-93.2650, city:'Minneapolis', country:'USA', flag:'🇺🇸' },
  'bestbuy':      { lat:44.9778, lng:-93.2650, city:'Minneapolis', country:'USA', flag:'🇺🇸' },
  // Asie
  'shein':        { lat:23.1291, lng:113.2644, city:'Guangzhou', country:'Chine', flag:'🇨🇳' },
  'aliexpress':   { lat:30.2741, lng:120.1551, city:'Hangzhou', country:'Chine', flag:'🇨🇳' },
  'wish':         { lat:37.3861, lng:-122.0839, city:'San Francisco', country:'USA', flag:'🇺🇸' },
  'banggood':     { lat:23.1291, lng:113.2644, city:'Guangzhou', country:'Chine', flag:'🇨🇳' },
  // Par pays/domaine Amazon
  'amazon.fr':    { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷' },
  'amazon.be':    { lat:50.8503, lng:4.3517,  city:'Bruxelles', country:'Belgique', flag:'🇧🇪' },
  'amazon.de':    { lat:52.5200, lng:13.4050, city:'Berlin', country:'Allemagne', flag:'🇩🇪' },
  'amazon.co.uk': { lat:51.5074, lng:-0.1278, city:'Londres', country:'Royaume-Uni', flag:'🇬🇧' },
  'amazon.com':   { lat:47.6062, lng:-122.3321, city:'Seattle', country:'USA', flag:'🇺🇸' },
  'amazon':       { lat:47.6062, lng:-122.3321, city:'Seattle', country:'USA', flag:'🇺🇸' },
};

function getStorePosition(storeName) {
  if (!storeName) return null;
  const name = storeName.toLowerCase();
  // Essai direct
  for (const [key, val] of Object.entries(STORE_POSITIONS)) {
    if (name.includes(key)) return val;
  }
  // Fallback : extrait domaine
  const domain = name.replace(/https?:\/\//,'').split('/')[0];
  const base = domain.split('.')[0];
  return STORE_POSITIONS[base] || null;
}

function MapPreview({ results }) {
  const t = window.__t || ((k) => k);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  // Construit les pins depuis les résultats
  const pins = [];
  const seenStores = new Set();
  (results || []).forEach(item => {
    if (!item.store) return;
    const pos = getStorePosition(item.store);
    if (!pos) return;
    const storeKey = item.store.toLowerCase().split(' ')[0];
    if (seenStores.has(storeKey)) return;
    seenStores.add(storeKey);
    pins.push({ ...pos, store: item.store, match: item.match, price: item.price, link: item.storeLink, img: item.img });
  });

  // Pins par défaut si pas de résultats
  const displayPins = pins.length > 0 ? pins.slice(0, 15) : [
    { lat:50.8503, lng:4.3517,  city:'Bruxelles', country:'Belgique', flag:'🇧🇪', store:'Find It', match:100, price:'—' },
    { lat:48.8566, lng:2.3522,  city:'Paris', country:'France', flag:'🇫🇷', store:'Marché mondial', match:95, price:'—' },
    { lat:51.5074, lng:-0.1278, city:'Londres', country:'UK', flag:'🇬🇧', store:'Global', match:90, price:'—' },
    { lat:52.5200, lng:13.4050, city:'Berlin', country:'Allemagne', flag:'🇩🇪', store:'Global', match:85, price:'—' },
    { lat:40.7128, lng:-74.006, city:'New York', country:'USA', flag:'🇺🇸', store:'Global', match:80, price:'—' },
  ];

  useEffect(() => {
    // Charge Leaflet dynamiquement si pas encore chargé
    const loadLeaflet = async () => {
      if (!window.L) {
        // CSS Leaflet
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
          document.head.appendChild(link);
        }
        // JS Leaflet
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      setMapReady(true);
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.L) return;

    // Initialise la carte si pas encore fait
    if (!leafletMapRef.current) {
      const map = window.L.map(mapRef.current, {
        center: [30, 10],
        zoom: 2,
        zoomControl: true,
        attributionControl: true,
        minZoom: 1,
        maxZoom: 18,
      });

      // Tuiles sombres style Google Earth
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const L = window.L;
    const map = leafletMapRef.current;

    // Supprime les anciens markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Ajoute les markers
    displayPins.forEach((pin, i) => {
      const color = pin.match >= 80 ? '#7C3AED' : pin.match >= 60 ? '#06B6D4' : '#A78BFA';
      const size = pin.match >= 80 ? 14 : 11;

      const icon = L.divIcon({
        className: '',
        html: '<div style="width:' + size + 'px;height:' + size + 'px;background:' + color + ';border:2.5px solid rgba(255,255,255,0.9);border-radius:50%;box-shadow:0 0 0 3px ' + color + '44,0 2px 8px rgba(0,0,0,0.6);cursor:pointer;transition:transform 0.15s;position:relative;" onmouseover="this.style.transform=\'scale(1.5)\'" onmouseout="this.style.transform=\'scale(1)\'"></div>',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
      });

      const imgHtml = pin.img ? '<img src="' + pin.img + '" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px;display:block;">' : '';
      const priceHtml = (pin.price && pin.price !== '—') ? '<div style="font-weight:700;font-size:0.95rem;color:#A78BFA;margin-bottom:4px">' + pin.price + '</div>' : '';
      const linkHtml = (pin.link && pin.link.startsWith('http')) ? '<a href="' + pin.link + '" target="_blank" rel="noopener" style="display:block;padding:6px;background:#7C3AED;color:white;border-radius:7px;font-size:0.78rem;text-align:center;text-decoration:none;font-weight:600;">Voir l’offre →</a>' : '';
      const popupHtml = '<div style="font-family:DM Sans,sans-serif;padding:2px">' + imgHtml + '<div style="font-weight:700;font-size:0.88rem;color:#EEEEF2;margin-bottom:4px">' + (pin.flag || '🏪') + ' ' + pin.store + '</div><div style="font-size:0.76rem;color:#9898A8;margin-bottom:6px">📍 ' + pin.city + ', ' + pin.country + '</div>' + priceHtml + '<div style="font-size:0.75rem;margin-bottom:8px"><span style="background:rgba(124,58,237,0.2);color:#A78BFA;padding:2px 8px;border-radius:99px;font-weight:600">' + pin.match + '% match</span></div>' + linkHtml + '</div>';
      const popup = L.popup({ className: 'findit-popup', maxWidth: 220, offset: [0, -6] }).setContent(popupHtml);

      const marker = L.marker([pin.lat, pin.lng], { icon }).bindPopup(popup).addTo(map);
      markersRef.current.push(marker);
    });

    // Centre la carte sur les markers si résultats réels
    if (displayPins.length > 0 && pins.length > 0) {
      const lats = displayPins.map(p => p.lat);
      const lngs = displayPins.map(p => p.lng);
      const bounds = L.latLngBounds(
        [Math.min(...lats) - 5, Math.min(...lngs) - 10],
        [Math.max(...lats) + 5, Math.max(...lngs) + 10]
      );
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
    }

    // Invalidate size pour éviter les tuiles grises
    setTimeout(() => map.invalidateSize(), 100);

  }, [mapReady, results]);

  // Nettoie la carte si le composant est démonté
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return React.createElement('div', {
    style: { position:'relative', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border2)', marginBottom:20 }
  },
    // Conteneur carte
    React.createElement('div', {
      ref: mapRef,
      style: { height:420, width:'100%', background:'#111118' }
    }),
    // Légende
    React.createElement('div', {
      style: {
        position:'absolute', bottom:10, left:10, zIndex:1000,
        background:'rgba(17,17,24,0.85)', backdropFilter:'blur(8px)',
        border:'1px solid var(--border2)', borderRadius:'var(--radius)',
        padding:'7px 12px', fontSize:'0.76rem', color:'var(--text2)',
        display:'flex', alignItems:'center', gap:8, pointerEvents:'none'
      }
    },
      React.createElement('span', { style:{width:10,height:10,borderRadius:'50%',background:'#7C3AED',display:'inline-block',boxShadow:'0 0 6px #7C3AED88'} }),
      pins.length > 0
        ? (pins.length + ' marchand' + (pins.length>1?'s':'') + ' localisé' + (pins.length>1?'s':'') + ' — cliquez sur un point')
        : 'Lancez une recherche pour localiser les marchands'
    )
  );
}



// ─── RESULT ITEM ─────────────────────────────────────────────────────────────
function ResultItem({ item, view, favs, toggleFav, onExpand, expanded }) {
  const t = window.__t || ((k) => k);
  const isExpanded = expanded === item.id;
  const matchScore = item.match !== undefined && item.match !== null ? item.match : 0;

  if (view === 'grid') {
    return React.createElement('div', { className:'result-card fade-in', onClick:()=>onExpand(item.id) },
      React.createElement('div', { className:'card-img' },
        item.img
          ? React.createElement('img', { src:item.img, alt:item.title, loading:'lazy', onError:e=>e.target.style.display='none' })
          : React.createElement('span', { className:'img-placeholder' }, '📦')
      ),
      React.createElement('div', { className:'card-body' },
        React.createElement('div', { className:'card-top' },
          React.createElement('div', { className:'card-title' }, item.title),
          React.createElement('div', { className:getMatchClass(matchScore) }, `${matchScore}%`)
        ),
        item.price && React.createElement('div', { className:'card-price' }, `${item.price} €`),
        React.createElement('div', { className:'card-footer' },
          React.createElement(Stars, { count:item.stars }),
          React.createElement('button', {
            className:`btn-fav${favs.includes(item.id)?' active':''}`,
            onClick:e=>{ e.stopPropagation(); toggleFav(item.id); },
            style:{ width:28, height:28 }
          }, React.createElement(HeartIcon, { filled:favs.includes(item.id) }))
        )
      )
    );
  }

  // Description fallback : titre + extensions si desc vide
  const displayDesc = item.desc && item.desc !== 'Description non disponible.'
    ? item.desc
    : item.extensions && item.extensions.length > 0
      ? item.extensions.join(' · ')
      : item.title;

  const validLink = item.storeLink && item.storeLink !== '#' && item.storeLink.startsWith('http')
    ? item.storeLink : null;

  return React.createElement('div', { className:'result-item fade-in' },
    // Image cliquable → ouvre l'offre
    validLink
      ? React.createElement('a', { href:validLink, target:'_blank', rel:'noopener noreferrer', className:'result-img', style:{cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'} },
          item.img
            ? React.createElement('img', { src:item.img, alt:item.title, loading:'lazy', onError:e=>{ e.target.style.display='none'; } })
            : React.createElement('span', { className:'img-placeholder' }, '📦')
        )
      : React.createElement('div', { className:'result-img', onClick:()=>onExpand(item.id), style:{cursor:'pointer'} },
          item.img
            ? React.createElement('img', { src:item.img, alt:item.title, loading:'lazy', onError:e=>{ e.target.style.display='none'; } })
            : React.createElement('span', { className:'img-placeholder' }, '📦')
        ),

    React.createElement('div', { className:'result-body', onClick:()=>onExpand(item.id), style:{cursor:'pointer'} },
      React.createElement('div', { className:'result-meta' },
        React.createElement('div', { style:{flex:1,minWidth:0} },
          React.createElement('div', { style:{display:'flex',alignItems:'flex-start',gap:5,marginBottom:2} },
            React.createElement('div', { className:'result-title', style:{flex:1,minWidth:0} }, item.title),
            React.createElement('div', { className:getMatchClass(matchScore), style:{flexShrink:0} }, `${matchScore}%`)
          ),
          item.matchReason && React.createElement('div', {
            style:{fontSize:'0.65rem',color:'var(--text3)',lineHeight:1.3,marginBottom:2,
                   display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}
          }, item.matchReason)
        )
      ),
      React.createElement('div', { className:'result-desc' }, displayDesc),
      React.createElement('div', { className:'result-footer' },
        item.price && item.price !== '—' && React.createElement('div', { className:'result-price' },
          `${item.price} €`,
          item.oldPrice && React.createElement('span', { className:'old' }, `${item.oldPrice} €`)
        ),
        React.createElement(Stars, { count:item.stars }),
        item.reviews && React.createElement('span', { style:{fontSize:'0.78rem',color:'var(--text3)'} },
          `(${item.reviews.toLocaleString()} avis)`
        ),
        React.createElement('span', { className:'result-store' }, `🏪 ${item.store}`),
        item.delivery && item.delivery !== 'Délai non précisé' &&
          React.createElement('span', { className:'result-delivery' }, `⚡ ${item.delivery}`),
        item.badge && React.createElement('span', { className:'new-badge' }, item.badge)
      ),
      isExpanded && React.createElement('div', { className:'reviews-section', style:{marginTop:12} },
        React.createElement('div', { className:'reviews-title' }, '💬 Avis clients'),
        item.stars
          ? React.createElement('div', null,
              React.createElement('div', { style:{display:'flex',alignItems:'center',gap:12,marginBottom:8} },
                React.createElement(Stars, { count:item.stars, size:16 }),
                React.createElement('span', { style:{color:'var(--text2)',fontSize:'0.85rem'} },
                  item.reviews ? `${item.reviews.toLocaleString()} avis sur ${item.store}` : `Noté sur ${item.store}`
                )
              ),
              React.createElement('div', { className:'no-reviews' },
                `Avis complets disponibles sur ${item.store}.`
              )
            )
          : React.createElement('div', { className:'no-reviews' }, 'Avis non disponibles pour cet article.')
      )
    ),

    React.createElement('div', { className:'result-actions' },
      React.createElement('button', {
        className:`btn-fav${favs.includes(item.id)?' active':''}`,
        onClick:e=>{ e.stopPropagation(); toggleFav(item.id); },
        title:'Ajouter aux favoris'
      }, React.createElement(HeartIcon, { filled:favs.includes(item.id) })),
      React.createElement('button', {
        className:'btn-icon',
        title:'Partager',
        onClick:e=>{
          e.stopPropagation();
          const url = item.storeLink || window.location.href;
          const text = `${item.title} — ${item.price ? item.price + ' €' : ''} sur ${item.store}`;
          if (navigator.share) {
            navigator.share({ title: item.title, text, url }).catch(()=>{});
          } else {
            navigator.clipboard.writeText(url).then(()=>{ alert('Lien copié !'); });
          }
        },
        style:{width:34,height:34,borderRadius:'99px',background:'var(--dark3)',border:'1px solid var(--border)',color:'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}
      }, React.createElement(SvgIcon, { d:'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13' })),
      validLink
        ? React.createElement('a', {
            href:validLink,
            target:'_blank',
            rel:'noopener noreferrer',
            className:'btn-visit',
            style:{display:'inline-block',textDecoration:'none',textAlign:'center'},
            onClick:e=>e.stopPropagation()
          }, t('seeOffer'))
        : React.createElement('span', {
            className:'btn-visit',
            style:{opacity:0.4,cursor:'not-allowed'}
          }, "Lien indisponible")
    )
  );
}

// ─── UPLOAD MODAL avec IA Vision ─────────────────────────────────────────────
function UploadModal({ onClose, onSearchWithAnalysis, mode }) {
  const t = window.__t || ((k) => k);
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState('image/jpeg');
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();
  const cameraInputRef = useRef();

  // Ouvre automatiquement le bon sélecteur selon le mode choisi (Scan caméra ou Ajouter une image)
  useEffect(() => {
    if (mode === 'camera' && cameraInputRef.current) {
      cameraInputRef.current.click();
    } else if (mode === 'file' && inputRef.current) {
      inputRef.current.click();
    }
  }, [mode]);

  function handleFile(file) {
    if (!file) return;
    setAnalysis(null); setError(null);
    setMediaType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      // Extrait le base64 pur (sans le préfixe data:image/...;base64,)
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function analyzeImage() {
    if (!imageBase64) return;
    setAnalyzing(true); setError(null);
    try {
      const res = await fetch('/.netlify/functions/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (err) {
      setError("Erreur d'analyse : " + err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  function launchSearch() {
    if (!analysis) return;
    onSearchWithAnalysis({
      query: analysis.searchQuery,
      category: analysis.category || 'all',
      description: analysis.description,
      productName: analysis.productName,
      visualCriteria: analysis.visualCriteria || [],
      colors: analysis.colors || [],
      material: analysis.material || null,
      shape: analysis.shape || null,
      pattern: analysis.pattern || null,
      distinctiveFeatures: analysis.distinctiveFeatures || [],
    });
    onClose();
  }

  // Styles inline pour la modal IA
  const analysisCard = {
    background:'var(--dark3)', border:'1px solid var(--border2)',
    borderRadius:'var(--radius-lg)', padding:16, marginBottom:16
  };
  const chip = {
    background:'rgba(255,75,43,0.1)', border:'1px solid rgba(255,75,43,0.25)',
    color:'var(--primary)', fontSize:'0.75rem', padding:'3px 10px',
    borderRadius:'99px', display:'inline-block', margin:'2px'
  };

  return React.createElement('div', { className:'modal-overlay', onClick:onClose },
    React.createElement('div', { className:'modal', style:{maxWidth:520}, onClick:e=>e.stopPropagation() },
      React.createElement('div', { className:'modal-header' },
        React.createElement('div', { className:'modal-title' }, t('scanTitle')),
        React.createElement('button', { className:'modal-close', onClick:onClose },
          React.createElement(SvgIcon, { d:'M18 6L6 18M6 6l12 12' })
        )
      ),

      React.createElement('div', { className:'modal-body' },

        // ── Étape 1 : upload
        !preview && React.createElement('div', null,
          React.createElement('div', { className:'ai-banner', style:{marginBottom:16} },
            React.createElement('div', { className:'ai-banner-head' },
              React.createElement('div', { className:'ai-banner-title' }, '🤖 Identification automatique par Claude Vision')
            ),
            React.createElement('p', null, 'Scannez n\'importe quel article — vêtement, outil, plante, meuble — avec votre appareil photo, ou ajoutez une image existante. L\'IA identifie le produit et lance la recherche automatiquement.')
          ),
          React.createElement('div', {
            className:`upload-zone${dragging?' drag':''}`,
            onDragOver:e=>{ e.preventDefault(); setDragging(true); },
            onDragLeave:()=>setDragging(false),
            onDrop:e=>{ e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); },
            onClick:()=>inputRef.current.click()
          },
            React.createElement(SvgIcon, { d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12', size:40 }),
            React.createElement('p', null, 'Glissez une image ici ou ',
              React.createElement('span', null, 'parcourez vos fichiers')
            ),
            React.createElement('p', { style:{fontSize:'0.75rem',color:'var(--text3)',marginTop:6} },
              'JPG, PNG, WEBP — max 10MB'
            )
          ),
          React.createElement('input', { ref:inputRef, type:'file', accept:'image/*',
            style:{display:'none'}, onChange:e=>handleFile(e.target.files[0]) }),
          React.createElement('input', { ref:cameraInputRef, type:'file', accept:'image/*', capture:'environment',
            style:{display:'none'}, onChange:e=>handleFile(e.target.files[0]) })
        ),

        // ── Étape 2 : image chargée, analyse
        preview && !analysis && React.createElement('div', null,
          React.createElement('img', { src:preview, className:'upload-preview', alt:'Aperçu' }),

          error && React.createElement('div', {
            style:{background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.3)',
              borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:12,fontSize:'0.83rem',color:'#e74c3c'}
          }, error),

          analyzing
            ? React.createElement('div', { className:'loading', style:{padding:'20px 0'} },
                React.createElement('div', { className:'spinner' }),
                React.createElement('p', null, '🤖 Claude analyse votre image…'),
                React.createElement('p', { style:{fontSize:'0.75rem',color:'var(--text3)'} },
                  'Identification du produit en cours'
                )
              )
            : React.createElement('div', null,
                React.createElement('button', { className:'btn-primary', onClick:analyzeImage },
                  '🤖 Analyser avec Claude Vision'
                ),
                React.createElement('button', { className:'btn-secondary', onClick:()=>{ setPreview(null); setImageBase64(null); } },
                  "Changer d'image"
                )
              )
        ),

        // ── Étape 3 : résultat de l'analyse
        preview && analysis && React.createElement('div', null,
          // Miniature + résultat côte à côte
          React.createElement('div', { style:{display:'flex',gap:12,marginBottom:16} },
            React.createElement('img', { src:preview, alt:'Photo',
              style:{width:80,height:80,objectFit:'cover',borderRadius:'var(--radius)',flexShrink:0} }),
            React.createElement('div', { style:{flex:1} },
              React.createElement('div', { style:{display:'flex',alignItems:'center',gap:8,marginBottom:4} },
                React.createElement('span', { className:'new-badge' }, '✅ Identifié'),
                React.createElement('span', { style:{fontSize:'0.75rem',color:'var(--text3)'} },
                  `Confiance : ${analysis.confidence}%`
                )
              ),
              React.createElement('div', { style:{fontFamily:'var(--font-head)',fontWeight:700,fontSize:'0.95rem',marginBottom:4} },
                analysis.productName
              ),
              React.createElement('div', { style:{fontSize:'0.8rem',color:'var(--text2)',lineHeight:1.4} },
                analysis.description
              )
            )
          ),

          // Détails de l'analyse
          React.createElement('div', { style:analysisCard },
            React.createElement('div', { className:'filter-title', style:{marginBottom:8} }, '🔍 Requête de recherche générée'),
            React.createElement('div', { style:{
              background:'var(--dark2)',border:'1px solid var(--border)',
              borderRadius:'var(--radius)',padding:'8px 12px',
              fontSize:'0.85rem',color:'var(--primary)',fontWeight:500,marginBottom:12
            } }, `"${analysis.searchQuery}"`),

            analysis.keyFeatures && analysis.keyFeatures.length > 0 &&
              React.createElement('div', null,
                React.createElement('div', { className:'filter-title', style:{marginBottom:6} }, '✨ Caractéristiques détectées'),
                React.createElement('div', null,
                  analysis.keyFeatures.map((f,i) => React.createElement('span', { key:i, style:chip }, f))
                )
              ),

            analysis.estimatedPrice &&
              React.createElement('div', { style:{marginTop:10,fontSize:'0.82rem',color:'var(--text2)'} },
                '💰 Prix estimé : ',
                React.createElement('strong', { style:{color:'var(--text)'} }, analysis.estimatedPrice)
              )
          ),

          // Modifier la requête
          React.createElement('div', { style:{marginBottom:12} },
            React.createElement('div', { className:'input-label' }, 'Modifier la recherche si nécessaire :'),
            React.createElement('input', {
              className:'input-field', style:{marginBottom:0},
              value:analysis.searchQuery,
              onChange:e=>setAnalysis(a=>({...a,searchQuery:e.target.value}))
            })
          ),

          React.createElement('button', { className:'btn-primary', onClick:launchSearch },
            `🔍 Rechercher "${analysis.searchQuery}"`
          ),
          React.createElement('button', { className:'btn-secondary',
            onClick:()=>{ setAnalysis(null); setPreview(null); setImageBase64(null); }
          }, 'Nouvelle photo')
        )
      )
    )
  );
}

// ─── PROFILE MODAL ─────────────────────────────────────────────────────────────
function ProfileModal({ onClose, auth, onSearchFromHistory }) {
  const t = window.__t || ((k) => k);
  const [tab, setTab] = useState('history');
  const [mode, setMode] = useState('login'); // login | signup
  const [form, setForm] = useState({ name:'', email:'', pass:'' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (auth.isLoggedIn && !profile) {
      setLoadingProfile(true);
      authCall('get_profile').then(data => {
        if (data.success) setProfile(data);
        setLoadingProfile(false);
      });
    }
  }, [auth.isLoggedIn]);

  async function handleAuth() {
    setError(null);
    try {
      if (mode === 'login') {
        await auth.login(form.email, form.pass);
      } else {
        const res = await auth.signup(form.email, form.pass, form.name);
        if (res.success) setSuccess('Compte créé ! Vérifiez vos emails pour confirmer.');
      }
    } catch(e) { setError(e.message); }
  }

  const initials = auth.user?.user_metadata?.full_name
    ? auth.user.user_metadata.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2)
    : auth.user?.email?.substring(0,2).toUpperCase() || 'JD';

  // ── Non connecté
  if (!auth.isLoggedIn) {
    return React.createElement('div', { className:'modal-overlay', onClick:onClose },
      React.createElement('div', { className:'modal', onClick:e=>e.stopPropagation() },
        React.createElement('div', { className:'modal-header' },
          React.createElement('div', { className:'modal-title' }, t('mySpace')),
          React.createElement('button', { className:'modal-close', onClick:onClose },
            React.createElement(SvgIcon, { d:'M18 6L6 18M6 6l12 12' })
          )
        ),
        React.createElement('div', { className:'modal-body' },
          // Boutons OAuth
          React.createElement('div', { style:{display:'flex',flexDirection:'column',gap:8,marginBottom:16} },
            React.createElement('button', {
              onClick:()=>auth.loginWithProvider('google'),
              style:{
                display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                width:'100%',padding:'10px',borderRadius:'var(--radius)',
                background:'white',border:'1px solid #ddd',color:'#333',
                fontFamily:'var(--font-body)',fontWeight:500,fontSize:'0.88rem',cursor:'pointer'
              }
            },
              React.createElement('svg', { viewBox:'0 0 24 24', width:18, height:18 },
                React.createElement('path', { fill:'#4285F4', d:'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' }),
                React.createElement('path', { fill:'#34A853', d:'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' }),
                React.createElement('path', { fill:'#FBBC05', d:'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' }),
                React.createElement('path', { fill:'#EA4335', d:'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' })
              ),
              t('continueWithGoogle')
            )
          ),

          // Séparateur
          React.createElement('div', { style:{display:'flex',alignItems:'center',gap:10,marginBottom:16} },
            React.createElement('div', { style:{flex:1,height:1,background:'var(--border)'} }),
            React.createElement('span', { style:{fontSize:'0.75rem',color:'var(--text3)'} }, t('orByEmail')),
            React.createElement('div', { style:{flex:1,height:1,background:'var(--border)'} })
          ),

          // Toggle login/signup
          React.createElement('div', { style:{display:'flex',gap:0,marginBottom:20,background:'var(--dark3)',borderRadius:'var(--radius)',padding:3} },
            ['login','signup'].map(m => React.createElement('button', {
              key:m,
              onClick:()=>{ setMode(m); setError(null); setSuccess(null); },
              style:{
                flex:1, padding:'8px', border:'none', borderRadius:'var(--radius)',
                background: mode===m ? 'var(--primary)' : 'transparent',
                color: mode===m ? 'white' : 'var(--text2)',
                fontFamily:'var(--font-head)', fontWeight:700, fontSize:'0.85rem', cursor:'pointer'
              }
            }, m==='login' ? t('login') : t('register')))
          ),

          error && React.createElement('div', { style:{
            background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.3)',
            borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:12,
            fontSize:'0.82rem',color:'#e74c3c'
          } }, error),

          success && React.createElement('div', { style:{
            background:'rgba(46,204,113,0.1)',border:'1px solid rgba(46,204,113,0.3)',
            borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:12,
            fontSize:'0.82rem',color:'var(--success)'
          } }, success),

          mode === 'signup' && React.createElement('div', null,
            React.createElement('div', { className:'input-label' }, 'Nom complet'),
            React.createElement('input', { className:'input-field', placeholder:'Jean Dupont',
              value:form.name, onChange:e=>setForm(f=>({...f,name:e.target.value})) })
          ),
          React.createElement('div', null,
            React.createElement('div', { className:'input-label' }, t('emailLabel')),
            React.createElement('input', { className:'input-field', type:'email', placeholder:'jean@email.com',
              value:form.email, onChange:e=>setForm(f=>({...f,email:e.target.value})) })
          ),
          React.createElement('div', null,
            React.createElement('div', { className:'input-label' }, t('passwordLabel')),
            React.createElement('input', { className:'input-field', type:'password', placeholder:'••••••••',
              value:form.pass, onChange:e=>setForm(f=>({...f,pass:e.target.value})),
              onKeyDown:e=>e.key==='Enter'&&handleAuth()
            })
          ),
          React.createElement('button', {
            className:'btn-primary',
            onClick:handleAuth,
            disabled:auth.loading,
            style:{opacity:auth.loading?0.7:1}
          }, auth.loading ? '⏳ Connexion…' : mode==='login' ? t('login') : 'Créer mon compte'),

          React.createElement('div', { style:{textAlign:'center',marginTop:12,fontSize:'0.75rem',color:'var(--text3)'} },
            t('secureMsg')
          )
        )
      )
    );
  }

  // ── Connecté
  return React.createElement('div', { className:'modal-overlay', onClick:onClose },
    React.createElement('div', { className:'modal', style:{maxWidth:560}, onClick:e=>e.stopPropagation() },
      React.createElement('div', { className:'modal-header' },
        React.createElement('div', { className:'modal-title' }, 'Mon compte'),
        React.createElement('button', { className:'modal-close', onClick:onClose },
          React.createElement(SvgIcon, { d:'M18 6L6 18M6 6l12 12' })
        )
      ),

      // Profil hero
      React.createElement('div', { className:'profile-hero' },
        React.createElement('div', { className:'profile-avatar-wrap' },
          React.createElement('div', { className:'profile-avatar' }, initials)
        ),
        React.createElement('div', { className:'profile-name' },
          auth.user?.user_metadata?.full_name || auth.user?.email?.split('@')[0] || 'Utilisateur'
        ),
        React.createElement('div', { className:'profile-email' }, auth.user?.email),
        React.createElement('button', {
          onClick:()=>{ auth.logout(); onClose(); },
          style:{
            marginTop:10, background:'none', border:'1px solid var(--border)',
            color:'var(--text3)', fontSize:'0.78rem', padding:'4px 12px',
            borderRadius:'99px', cursor:'pointer'
          }
        }, t('logoutBtn'))
      ),

      // Tabs
      React.createElement('div', { className:'tabs' },
        [['history','🕐 Historique'],['favorites','❤️ Favoris'],['reco','✨ Recommandations']].map(([id,l]) =>
          React.createElement('div', { key:id, className:`tab${tab===id?' active':''}`, onClick:()=>setTab(id) }, l)
        )
      ),

      // Historique
      tab==='history' && React.createElement('div', { style:{maxHeight:360,overflowY:'auto'} },
        loadingProfile
          ? React.createElement('div', { style:{padding:20,textAlign:'center',color:'var(--text3)'} }, '⏳ Chargement…')
          : profile?.history?.length > 0
            ? profile.history.map((h,i) => React.createElement('div', {
                key:i, className:'history-item',
                onClick:()=>{ onSearchFromHistory(h.query, h.category); onClose(); }
              },
                React.createElement('div', { className:'history-thumb' }, '🔍'),
                React.createElement('div', null,
                  React.createElement('div', { className:'history-query' }, h.query),
                  React.createElement('div', { style:{fontSize:'0.72rem',color:'var(--text3)'} },
                    `${h.results_count} résultats · ${h.category !== 'all' ? h.category : 'Toutes catégories'}`
                  )
                ),
                React.createElement('div', { className:'history-date' },
                  new Date(h.created_at).toLocaleDateString('fr-FR', {day:'numeric',month:'short'})
                )
              ))
            : React.createElement('div', { style:{padding:24,textAlign:'center',color:'var(--text3)',fontSize:'0.85rem'} },
                '🔍 Aucune recherche enregistrée encore.'
              )
      ),

      // Favoris
      tab==='favorites' && React.createElement('div', { style:{maxHeight:360,overflowY:'auto'} },
        loadingProfile
          ? React.createElement('div', { style:{padding:20,textAlign:'center',color:'var(--text3)'} }, '⏳ Chargement…')
          : profile?.favorites?.length > 0
            ? React.createElement('div', { className:'reco-grid', style:{padding:12} },
                profile.favorites.map((f,i) => React.createElement('div', { key:i, className:'reco-card' },
                  React.createElement('div', { className:'reco-img' },
                    f.img
                      ? React.createElement('img', { src:f.img, alt:f.title, style:{width:'100%',height:'100%',objectFit:'cover'} })
                      : '📦'
                  ),
                  React.createElement('div', { className:'reco-name' }, f.title),
                  React.createElement('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'center'} },
                    React.createElement('div', { className:'reco-price' }, f.price ? `${f.price} €` : '—'),
                    React.createElement('div', { className:getMatchClass(f.match), style:{fontSize:'0.65rem'} }, `${f.match}%`)
                  ),
                  f.store_link && React.createElement('a', {
                    href:f.store_link, target:'_blank', rel:'noopener noreferrer',
                    style:{display:'block',marginTop:6,fontSize:'0.72rem',color:'var(--primary)',textDecoration:'none',textAlign:'center'}
                  }, `🏪 ${f.store} →`)
                ))
              )
            : React.createElement('div', { style:{padding:24,textAlign:'center',color:'var(--text3)',fontSize:'0.85rem'} },
                '❤️ Aucun favori encore. Cliquez sur le ♡ sur un article !'
              )
      ),

      // Recommandations IA
      tab==='reco' && React.createElement('div', { style:{padding:16} },
        React.createElement('div', { className:'ai-banner', style:{marginBottom:16} },
          React.createElement('div', { className:'ai-banner-head' },
            React.createElement('div', { className:'ai-banner-title' }, '🤖 Recommandations basées sur vos recherches')
          ),
          React.createElement('p', null,
            profile?.history?.length > 0
              ? `Basé sur vos ${profile.history.length} recherches, voici ce qui pourrait vous intéresser.`
              : 'Faites quelques recherches pour recevoir des recommandations personnalisées.'
          )
        ),
        profile?.history?.length > 0 && React.createElement('div', { className:'reco-grid' },
          ['Nouveautés', 'Tendances', 'Meilleures ventes', 'Promos'].map((label,i) =>
            React.createElement('div', { key:i, className:'reco-card', style:{textAlign:'center',padding:16} },
              React.createElement('div', { style:{fontSize:'1.5rem',marginBottom:8} },
                ['✨','📈','🏆','🔥'][i]
              ),
              React.createElement('div', { className:'reco-name' }, label),
              React.createElement('div', { style:{fontSize:'0.72rem',color:'var(--text3)',marginTop:4} },
                'Basé sur vos recherches'
              )
            )
          )
        )
      )
    )
  );
}

// ─── PRICE COMPARE MODAL ────────────────────────────────────────────────────
function PriceCompareModal({ query, onClose }) {
  const t = window.__t || ((k) => k);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/.netlify/functions/compare?q=${encodeURIComponent(query)}&country=be`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [query]);

  return React.createElement('div', { className:'modal-overlay', onClick:onClose },
    React.createElement('div', { className:'modal', style:{maxWidth:620}, onClick:e=>e.stopPropagation() },
      React.createElement('div', { className:'modal-header' },
        React.createElement('div', { className:'modal-title' }, t('priceCompare')),
        React.createElement('button', { className:'modal-close', onClick:onClose },
          React.createElement(SvgIcon, { d:'M18 6L6 18M6 6l12 12' })
        )
      ),
      React.createElement('div', { style:{padding:16, maxHeight:'70vh', overflowY:'auto'} },
        loading && React.createElement('div', { className:'loading' },
          React.createElement('div', { className:'spinner' }),
          React.createElement('p', null, '🔍 Comparaison des prix en cours…')
        ),
        error && React.createElement('div', { style:{color:'var(--primary)',padding:16} }, error),
        data && React.createElement('div', null,
          // Stats banner
          React.createElement('div', { style:{
            display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16
          }},
            [
              [t('minPrice'), `${data.stats.minPrice} €`, 'var(--success)'],
              [t('maxPrice'), `${data.stats.maxPrice} €`, 'var(--primary)'],
              [t('avgPrice'), `${data.stats.avgPrice} €`, 'var(--info)'],
              [t('maxSavings'), `${data.stats.savings} € (-${data.stats.savingsPct}%)`, 'var(--warning)'],
            ].map(([label, val, color]) =>
              React.createElement('div', { key:label, style:{
                background:'var(--dark3)', border:'1px solid var(--border)',
                borderRadius:'var(--radius)', padding:'10px 12px', textAlign:'center'
              }},
                React.createElement('div', { style:{fontSize:'0.72rem',color:'var(--text3)',marginBottom:4} }, label),
                React.createElement('div', { style:{fontFamily:'var(--font-head)',fontWeight:700,fontSize:'0.88rem',color} }, val)
              )
            )
          ),

          // Recommandation IA
          data.analysis && React.createElement('div', { className:'ai-banner', style:{marginBottom:16} },
            React.createElement('div', { className:'ai-banner-head' },
              React.createElement('div', { className:'ai-banner-title' }, "🤖 Conseil d’achat IA")
            ),
            React.createElement('p', null, data.analysis.recommendation),
            data.analysis.tip && React.createElement('p', { style:{marginTop:6,fontSize:'0.8rem',color:'var(--text3)'} },
              `💡 ${data.analysis.tip}`
            )
          ),

          // Liste des offres
          React.createElement('div', { style:{display:'flex',flexDirection:'column',gap:8} },
            data.results.map((r,i) => React.createElement('div', { key:i, style:{
              display:'flex', alignItems:'center', gap:12,
              background: i===0 ? 'rgba(46,204,113,0.08)' : 'var(--dark3)',
              border: `1px solid ${i===0 ? 'rgba(46,204,113,0.3)' : 'var(--border)'}`,
              borderRadius:'var(--radius)', padding:'10px 12px'
            }},
              // Rank
              React.createElement('div', { style:{
                width:28, height:28, borderRadius:'99px', flexShrink:0,
                background: i===0 ? 'var(--success)' : i===1 ? 'var(--warning)' : 'var(--dark2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:'0.78rem', color:'white'
              }}, i===0 ? '🏆' : `${i+1}`),

              // Image
              r.img && React.createElement('img', {
                src:r.img, alt:r.store,
                style:{width:40,height:40,objectFit:'cover',borderRadius:6,flexShrink:0}
              }),

              // Infos
              React.createElement('div', { style:{flex:1,minWidth:0} },
                React.createElement('div', { style:{
                  fontSize:'0.82rem',fontWeight:600,color:'var(--text)',
                  whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'
                }}, r.title),
                React.createElement('div', { style:{fontSize:'0.75rem',color:'var(--text3)',marginTop:2} },
                  `🏪 ${r.store}`,
                  r.delivery && ` · ⚡ ${r.delivery}`
                )
              ),

              // Prix + lien
              React.createElement('div', { style:{textAlign:'right',flexShrink:0} },
                React.createElement('div', { style:{
                  fontFamily:'var(--font-head)',fontWeight:700,
                  fontSize: i===0 ? '1.1rem' : '0.95rem',
                  color: i===0 ? 'var(--success)' : 'var(--text)'
                }}, r.price || '—'),
                r.storeLink && React.createElement('a', {
                  href:r.storeLink, target:'_blank', rel:'noopener noreferrer',
                  style:{
                    display:'block',marginTop:4,fontSize:'0.72rem',
                    background:'var(--primary)',color:'white',padding:'3px 8px',
                    borderRadius:6,textDecoration:'none',textAlign:'center'
                  }
                }, "Voir →")
              )
            ))
          )
        )
      )
    )
  );
}

// ─── PWA INSTALL BANNER ───────────────────────────────────────────────────────
function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Affiche la bannière après 30s si pas encore installé
      setTimeout(() => setShow(true), 30000);
    });
  }, []);

  if (!show || !deferredPrompt) return null;

  return React.createElement('div', {
    style:{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      background:'var(--dark2)', border:'1px solid var(--border2)',
      borderRadius:'var(--radius-lg)', padding:'12px 20px',
      display:'flex', alignItems:'center', gap:12, zIndex:400,
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)', maxWidth:380, width:'calc(100% - 32px)'
    }
  },
    React.createElement('span', { style:{fontSize:'1.5rem'} }, '📲'),
    React.createElement('div', { style:{flex:1} },
      React.createElement('div', { style:{fontFamily:'var(--font-head)',fontWeight:700,fontSize:'0.88rem'} },
        'Installer Find It'
      ),
      React.createElement('div', { style:{fontSize:'0.75rem',color:'var(--text3)'} },
        "Accès rapide depuis votre écran d'accueil"
      )
    ),
    React.createElement('button', {
      onClick:()=>{ deferredPrompt.prompt(); setShow(false); },
      style:{
        background:'var(--primary)',color:'white',border:'none',
        fontFamily:'var(--font-head)',fontWeight:700,fontSize:'0.82rem',
        padding:'7px 14px',borderRadius:'var(--radius)',cursor:'pointer'
      }
    }, 'Installer'),
    React.createElement('button', {
      onClick:()=>setShow(false),
      style:{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',padding:4}
    }, '✕')
  );
}


// ─── MOBILE BOTTOM NAV ───────────────────────────────────────────────────────
function MobileNav({ onSearch, onProfile, onUpload, searchDone }) {
  const t = window.__t || ((k) => k);
  return React.createElement('nav', { className:'mobile-nav' },
    React.createElement('div', { className:'mobile-nav-items' },
      // Accueil
      React.createElement('div', { className:'mobile-nav-item', onClick:()=>window.scrollTo({top:0,behavior:'smooth'}) },
        React.createElement('svg', { viewBox:'0 0 24 24' },
          React.createElement('path', { d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
        ),
        React.createElement('span', null, 'Accueil')
      ),
      // Recherche photo
      React.createElement('div', { className:'mobile-nav-item', onClick:onUpload },
        React.createElement('svg', { viewBox:'0 0 24 24' },
          React.createElement('path', { d:'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z' }),
          React.createElement('circle', { cx:'12', cy:'13', r:'4' })
        ),
        React.createElement('span', null, 'Scan')
      ),
      // Recherche texte (bouton central)
      React.createElement('div', {
        className:'mobile-nav-item',
        style:{ background:'var(--primary)', borderRadius:'16px', color:'white', padding:'8px 20px' },
        onClick:()=>{ const inp = document.querySelector('.search-input-wrap input, .header-search input'); if(inp){ inp.focus(); window.scrollTo({top:0,behavior:'smooth'}); } }
      },
        React.createElement('svg', { viewBox:'0 0 24 24', style:{width:20,height:20} },
          React.createElement('circle', { cx:'11', cy:'11', r:'8' }),
          React.createElement('path', { d:'m21 21-4.35-4.35' })
        ),
        React.createElement('span', { style:{fontSize:'0.7rem',fontWeight:700} }, 'Chercher')
      ),
      // Favoris
      React.createElement('div', { className:'mobile-nav-item' },
        React.createElement('svg', { viewBox:'0 0 24 24' },
          React.createElement('path', { d:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' })
        ),
        React.createElement('span', null, 'Favoris')
      ),
      // Profil
      React.createElement('div', { className:'mobile-nav-item', onClick:onProfile },
        React.createElement('svg', { viewBox:'0 0 24 24' },
          React.createElement('path', { d:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }),
          React.createElement('circle', { cx:'12', cy:'7', r:'4' })
        ),
        React.createElement('span', null, 'Profil')
      )
    )
  );
}

// ─── MOBILE FILTER BUTTON + DRAWER ───────────────────────────────────────────
function MobileFilterDrawer({ filters, setFilters, onClose }) {
  const t = window.__t || ((k) => k);
  return React.createElement('div', null,
    React.createElement('div', { className:'filter-drawer-overlay', style:{display:'block'}, onClick:onClose }),
    React.createElement('div', { className:'filter-drawer open' },
      React.createElement('div', { className:'filter-drawer-handle' }),
      React.createElement('div', { className:'filter-drawer-header' },
        React.createElement('div', { className:'filter-drawer-title' }, '🎛 Filtres de recherche'),
        React.createElement('button', { className:'filter-drawer-close', onClick:onClose }, '✕')
      ),
      React.createElement(FilterSidebar, { collapsed:false, filters, setFilters })
    )
  );
}


// ─── SÉLECTEUR DE LANGUE ────────────────────────────────────────────────────
function LangSelector({ lang, setLang, LANGUAGES }) {
  const t = window.__t || ((k) => k);
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return React.createElement('div', { style:{position:'relative'} },
    React.createElement('button', {
      onClick: () => setOpen(v => !v),
      style:{
        background:'var(--dark3)', border:'1px solid var(--border)',
        borderRadius:'var(--radius)', padding:'5px 10px',
        cursor:'pointer', display:'flex', alignItems:'center', gap:5,
        color:'var(--text)', fontSize:'0.82rem', fontFamily:'var(--font-body)',
      },
      title: 'Langue / Language'
    },
      current.flag, ' ', current.code.toUpperCase(),
      React.createElement('span', { style:{fontSize:'0.65rem',opacity:0.6} }, '▾')
    ),
    open && React.createElement('div', {
      style:{
        position:'absolute', top:'calc(100% + 6px)', right:0,
        background:'var(--dark2)', border:'1px solid var(--border2)',
        borderRadius:'var(--radius)', minWidth:150, zIndex:999,
        boxShadow:'0 8px 24px rgba(0,0,0,0.4)', overflow:'hidden'
      }
    },
      LANGUAGES.map(l => React.createElement('button', {
        key: l.code,
        onClick: () => { setLang(l.code); setOpen(false); },
        style:{
          display:'flex', alignItems:'center', gap:8, width:'100%',
          padding:'8px 14px', background: l.code === lang ? 'var(--dark3)' : 'transparent',
          border:'none', color: l.code === lang ? 'var(--primary)' : 'var(--text)',
          cursor:'pointer', fontSize:'0.85rem', fontFamily:'var(--font-body)',
          textAlign:'left', fontWeight: l.code === lang ? 600 : 400,
          transition:'background 0.15s'
        },
        onMouseEnter: e => { if(l.code !== lang) e.currentTarget.style.background='var(--dark3)'; },
        onMouseLeave: e => { if(l.code !== lang) e.currentTarget.style.background='transparent'; }
      },
        l.flag, ' ', l.label
      ))
    )
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function App() {
  const auth = useAuth();
  const { t, lang, setLang, LANGUAGES } = useTranslation();
  // Expose t globalement pour les sous-composants sans prop drilling
  window.__t = t;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareQuery, setCompareQuery] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState('list');
  const [sort, setSort] = useState('match');
  const [favs, setFavs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [results, setResults] = useState([]);
  const [searchDone, setSearchDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [filters, setFilters] = useState({
    priceMin:0, priceMax:2000, delivery:[], colors:[],
    sizes:[], materials:[], storeType:[], minMatch:50, minRating:0
  });

  function addToast(msg, type='success') {
    const id = Date.now();
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x=>x.id!==id)), 3500);
  }

  async function handleSearch(q, cat, visualCriteria) {
    const searchQuery = (q || query).trim();
    if (!searchQuery) return;
    const searchCat = cat || activeCategory;

    setLoading(true); setSearchDone(false); setError(null); setResults([]);

    const msgs = [
      t('loading1'), t('loading2'), t('loading3'), t('loading4'), t('loading5')
    ];
    let msgIdx = 0;
    setLoadingMsg(msgs[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      setLoadingMsg(msgs[msgIdx]);
    }, 1200);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: searchCat,
        min_price: filters.priceMin || '',
        max_price: filters.priceMax < 2000 ? filters.priceMax : '',
        country: 'be',
        lang: 'fr',
      });
      // Si des critères visuels sont disponibles (recherche par image), les transmet
      if (visualCriteria && visualCriteria.length > 0) {
        params.set('visual_criteria', JSON.stringify(visualCriteria));
      }

      const res = await fetch(`/.netlify/functions/search?${params.toString()}`);
      const data = await res.json();
      clearInterval(msgInterval);

      if (data.error) throw new Error(data.error);

      const allResults = [...(data.results || []), ...(data.organicResults || [])];
      setResults(allResults);
      setSearchDone(true);
      setLoading(false);
      addToast(`✅ ${t('resultsFound', allResults.length, searchQuery)}`);

      // Sauvegarde la recherche si connecté
      if (auth.isLoggedIn) {
        authCall('save_search', { data: {
          query: searchQuery,
          category: searchCat,
          results_count: allResults.length,
          enhanced_query: allResults[0]?.enhancedQuery || ''
        }});
      }

    } catch (err) {
      clearInterval(msgInterval);
      setLoading(false);
      setError(err.message);
      addToast('❌ Erreur : ' + err.message, 'error');
    }
  }

  // Appelé depuis UploadModal après analyse IA
  function handleImageSearch({ query: q, category, description, productName, visualCriteria, colors, material, shape, pattern, distinctiveFeatures }) {
    setQuery(q);
    setActiveCategory(category || 'all');
    setImageAnalysis({ query:q, productName, description, visualCriteria, colors, material, shape, pattern });
    addToast(`🤖 IA a identifié : "${productName}" — ${(visualCriteria||[]).length} critères visuels détectés`);
    handleSearch(q, category || 'all', visualCriteria || []);
  }

  function toggleFav(id) {
    setFavs(f => f.includes(id) ? f.filter(x=>x!==id) : [...f, id]);
    addToast(favs.includes(id) ? t('removedFav') : t('addedFav'));
  }

  const filteredResults = results.filter(r => {
    if (r.match < filters.minMatch) return false;
    if (filters.minRating && r.stars && r.stars < filters.minRating) return false;
    if (r.priceRaw && filters.priceMin && r.priceRaw < filters.priceMin) return false;
    if (r.priceRaw && filters.priceMax < 2000 && r.priceRaw > filters.priceMax) return false;
    return true;
  }).sort((a,b) => {
    if (sort==='match') return b.match - a.match;
    if (sort==='price_asc') return (a.priceRaw||9999) - (b.priceRaw||9999);
    if (sort==='price_desc') return (b.priceRaw||0) - (a.priceRaw||0);
    if (sort==='stars') return (b.stars||0) - (a.stars||0);
    return 0;
  });

  return React.createElement('div', null,
    React.createElement('header', null,
      React.createElement(Logo, null),
      React.createElement('div', { className:'header-search' },
        React.createElement('svg', { className:'icon', viewBox:'0 0 24 24', width:16, height:16, fill:'none', stroke:'currentColor', strokeWidth:2 },
          React.createElement('circle', { cx:11, cy:11, r:8 }),
          React.createElement('path', { d:'m21 21-4.35-4.35' })
        ),
        React.createElement('input', {
          placeholder:'Recherche rapide…', value:query,
          onChange:e=>setQuery(e.target.value),
          onKeyDown:e=>{ if(e.key==='Enter') { handleSearch(e.target.value); } }
        })
      ),
      React.createElement('div', { className:'header-actions' },
        React.createElement('button', { className:'btn-icon', title:'Carte', onClick:()=>setShowMap(v=>!v) },
          React.createElement(SvgIcon, { d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
        ),
        React.createElement('button', { className:'btn-icon', title:'Favoris' },
          React.createElement(SvgIcon, { d:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' })
        ),
        React.createElement(LangSelector, { lang, setLang, LANGUAGES }),
        React.createElement('button', {
          className:'avatar-btn', onClick:()=>setShowProfile(true),
          title: auth.isLoggedIn ? 'Mon compte' : 'Connexion',
          style:{ position:'relative' }
        },
          auth.isLoggedIn
            ? (auth.user?.user_metadata?.full_name || auth.user?.email || 'JD').substring(0,2).toUpperCase()
            : '👤'
        )
      )
    ),

    React.createElement('button', {
      className:`sidebar-toggle${!sidebarOpen?' collapsed':''}`,
      onClick:()=>setSidebarOpen(v=>!v)
    }, React.createElement(SvgIcon, { d:sidebarOpen?'M15 18l-6-6 6-6':'M9 18l6-6-6-6' })),

    React.createElement('div', { className:'app-layout' },
      React.createElement(FilterSidebar, { collapsed:!sidebarOpen, filters, setFilters }),

      React.createElement('div', { className:`main-content${!sidebarOpen?' sidebar-collapsed':''}` },

        // Hero
        !searchDone && !loading && React.createElement('div', { className:'hero' },
          React.createElement('div', { className:'hero-badge' }, t('heroBadge')),
          React.createElement('h1', null, 'Trouvez n\'importe quel ',
            React.createElement('span', null, 'article'), ' dans le monde entier'
          ),
          React.createElement('p', null, t('heroSubtitle')),

          React.createElement('div', { className:'search-box' },
            // Ligne 1 — champ de recherche (large) + bouton Rechercher
            React.createElement('div', { className:'search-row-1' },
              React.createElement('div', { className:'search-input-wrap' },
                React.createElement('input', {
                  placeholder:t('searchPlaceholder'),
                  value:query, onChange:e=>setQuery(e.target.value),
                  onKeyDown:e=>e.key==='Enter'&&handleSearch()
                })
              ),
              React.createElement('button', { className:'btn-search', onClick:()=>handleSearch() }, t('searchBtn'))
            ),
            // Ligne 2 — Scan (caméra) + Ajouter une image (fichier)
            React.createElement('div', { className:'search-row-2' },
              React.createElement('button', { className:'btn-camera btn-scan', onClick:()=>setShowUpload('camera') },
                React.createElement(SvgIcon, { d:'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z' }),
                t('scanBtn')
              ),
              React.createElement('button', { className:'btn-camera btn-add-image', onClick:()=>setShowUpload('file') },
                React.createElement(SvgIcon, { d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' }),
                t('addImageBtn')
              )
            )
          ),

          React.createElement('div', { className:'categories' },
            CATEGORIES.map(c => React.createElement('div', {
              key:c.id, className:`cat-chip${activeCategory===c.id?' active':''}`,
              onClick:()=>setActiveCategory(c.id)
            }, c.icon, ' ', c.label))
          )
        ),

        // Bannière résultat IA
        searchDone && imageAnalysis && React.createElement('div', {
          className:'ai-banner fade-in', style:{marginBottom:16}
        },
          React.createElement('div', { className:'ai-banner-head' },
            React.createElement('div', { className:'ai-banner-title' },
              `🤖 IA a identifié : "${imageAnalysis.productName}"`
            )
          ),
          React.createElement('p', { style:{marginBottom:8} }, imageAnalysis.description),
          // Attributs visuels détectés
          (imageAnalysis.colors?.length || imageAnalysis.material || imageAnalysis.shape) &&
            React.createElement('div', { style:{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8} },
              imageAnalysis.colors?.map((c,i) => React.createElement('span', {
                key:i, style:{background:'rgba(255,75,43,0.12)',border:'1px solid rgba(255,75,43,0.3)',
                color:'var(--primary)',fontSize:'0.72rem',padding:'2px 8px',borderRadius:'99px'}
              }, '🎨 ' + c)),
              imageAnalysis.material && React.createElement('span', {
                style:{background:'rgba(52,152,219,0.12)',border:'1px solid rgba(52,152,219,0.3)',
                color:'#3498db',fontSize:'0.72rem',padding:'2px 8px',borderRadius:'99px'}
              }, '🧵 ' + imageAnalysis.material),
              imageAnalysis.shape && React.createElement('span', {
                style:{background:'rgba(46,204,113,0.12)',border:'1px solid rgba(46,204,113,0.3)',
                color:'var(--success)',fontSize:'0.72rem',padding:'2px 8px',borderRadius:'99px'}
              }, '📐 ' + imageAnalysis.shape),
              imageAnalysis.pattern && imageAnalysis.pattern !== 'uni' && React.createElement('span', {
                style:{background:'rgba(155,89,182,0.12)',border:'1px solid rgba(155,89,182,0.3)',
                color:'#9b59b6',fontSize:'0.72rem',padding:'2px 8px',borderRadius:'99px'}
              }, '🔷 ' + imageAnalysis.pattern)
            ),
          // Critères visuels transmis à la recherche
          imageAnalysis.visualCriteria?.length > 0 &&
            React.createElement('div', { style:{display:'flex',flexWrap:'nowrap',gap:5,overflowX:'auto',paddingBottom:2} },
              imageAnalysis.visualCriteria.slice(0,6).map((crit,i) => React.createElement('span', {
                key:i, style:{background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',
                color:'var(--text2)',fontSize:'0.68rem',padding:'2px 8px',borderRadius:'99px',
                whiteSpace:'nowrap',flexShrink:0}
              }, '✓ ' + crit))
            )
        ),

        searchDone && results.length > 0 && results[0].enhancedQuery && results[0].enhancedQuery !== query &&
          React.createElement('div', { className:'ai-banner fade-in', style:{marginBottom:16, background:'rgba(52,152,219,0.08)', borderColor:'rgba(52,152,219,0.2)'} },
            React.createElement('div', { className:'ai-banner-head' },
              React.createElement('div', { className:'ai-banner-title', style:{color:'var(--info)'} }, '🔬 Recherche optimisée par IA')
            ),
            React.createElement('p', null,
              React.createElement('span', { style:{color:'var(--text3)'} }, 'Requête enrichie : '),
              React.createElement('span', { style:{color:'var(--text)',fontStyle:'italic'} }, `"${results[0].enhancedQuery}"`)
            ),
            results[0].visualCriteria && results[0].visualCriteria.length > 0 &&
              React.createElement('div', { style:{display:'flex',flexWrap:'wrap',gap:4,marginTop:8} },
                results[0].visualCriteria.map((c,i) => React.createElement('span', {
                  key:i, style:{
                    background:'rgba(52,152,219,0.12)',border:'1px solid rgba(52,152,219,0.25)',
                    color:'#3498db',fontSize:'0.72rem',padding:'2px 8px',borderRadius:'99px'
                  }
                }, `✓ ${c}`))
              )
          ),

        showMap && React.createElement('div', { style:{marginBottom:16} },
          React.createElement('div', { className:'section-title' }, '🗺 Disponibilité mondiale'),
          React.createElement(MapPreview, { results: filteredResults })
        ),

        loading && React.createElement('div', { className:'loading' },
          React.createElement('div', { className:'spinner' }),
          React.createElement('p', null, loadingMsg),
          React.createElement('p', { style:{fontSize:'0.78rem',color:'var(--text3)'} },
            'Consultation de Google Shopping en temps réel'
          )
        ),

        error && React.createElement('div', { className:'empty-state' },
          React.createElement('div', { className:'empty-icon' }, '⚠️'),
          React.createElement('h3', null, 'Erreur de recherche'),
          React.createElement('p', null, error),
          React.createElement('button', { className:'btn-primary',
            style:{marginTop:16,maxWidth:200,margin:'16px auto'},
            onClick:()=>handleSearch()
          }, 'Réessayer')
        ),

        searchDone && React.createElement('div', { className:'fade-in' },
          React.createElement('div', { className:'categories', style:{justifyContent:'flex-start',marginBottom:16} },
            CATEGORIES.map(c => React.createElement('div', {
              key:c.id, className:`cat-chip${activeCategory===c.id?' active':''}`,
              onClick:()=>{ setActiveCategory(c.id); handleSearch(query, c.id); }
            }, c.icon, ' ', c.label))
          ),

          React.createElement('div', { className:'results-header' },
            React.createElement('div', { className:'results-count' },
              React.createElement('strong', null, filteredResults.length),
              ` résultat${filteredResults.length>1?'s':''} pour "${query}"`
            ),
            React.createElement('div', { style:{display:'flex',gap:12,alignItems:'center'} },
              React.createElement('select', { className:'sort-select', value:sort, onChange:e=>setSort(e.target.value) },
                React.createElement('option', {value:'match'}, 'Par : Ressemblance'),
                React.createElement('option', {value:'price_asc'}, 'Par : Prix ↑'),
                React.createElement('option', {value:'price_desc'}, 'Par : Prix ↓'),
                React.createElement('option', {value:'stars'}, 'Par : Note')
              ),
              React.createElement('div', { className:'view-btns' },
                React.createElement('button', { className:`view-btn${view==='list'?' active':''}`, onClick:()=>setView('list') },
                  React.createElement(SvgIcon, { d:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' })
                ),
                React.createElement('button', { className:`view-btn${view==='grid'?' active':''}`, onClick:()=>setView('grid') },
                  React.createElement(SvgIcon, { d:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' })
                )
              )
            )
          ),

          filteredResults.length === 0
            ? React.createElement('div', { className:'empty-state' },
                React.createElement('div', { className:'empty-icon' }, '🔍'),
                React.createElement('h3', null, 'Aucun résultat pour ces filtres'),
                React.createElement('p', null, "Essayez d'élargir vos critères.")
              )
            : view === 'list'
              ? React.createElement('div', { className:'result-list' },
                  filteredResults.map(item => React.createElement(ResultItem, {
                    key:item.id, item, view, favs, toggleFav,
                    onExpand:id=>setExpanded(e=>e===id?null:id), expanded
                  }))
                )
              : React.createElement('div', { className:'result-grid' },
                  filteredResults.map(item => React.createElement(ResultItem, {
                    key:item.id, item, view, favs, toggleFav,
                    onExpand:id=>setExpanded(e=>e===id?null:id), expanded
                  }))
                ),

          React.createElement('div', { style:{marginTop:20,textAlign:'center',display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'} },
            React.createElement('button', { className:'btn-camera', onClick:()=>setShowUpload('camera') },
              t('newPhotoSearch')
            ),
            React.createElement('button', { className:'btn-camera', onClick:()=>setShowMap(v=>!v) },
              '🗺 ', showMap?'Masquer la carte':'Voir sur la carte'
            ),
            React.createElement('button', {
              className:'btn-camera',
              style:{background:'rgba(46,204,113,0.1)',borderColor:'rgba(46,204,113,0.3)',color:'var(--success)'},
              onClick:()=>{ setCompareQuery(query); setShowCompare(true); }
            }, t('comparePrices'))
          )
        )
      )
    ),

    // ── MOBILE NAV
    React.createElement(MobileNav, {
      onUpload:()=>setShowUpload('camera'),
      onProfile:()=>setShowProfile(true),
      searchDone
    }),

    // ── BOUTON FILTRE MOBILE
    React.createElement('button', {
      className:'mobile-filter-btn',
      onClick:()=>setShowMobileFilters(true),
      title:'Filtres'
    }, React.createElement(SvgIcon, { d:'M3 6h18M7 12h10M10 18h4' })),

    // ── DRAWER FILTRES MOBILE
    showMobileFilters && React.createElement(MobileFilterDrawer, {
      filters, setFilters,
      onClose:()=>setShowMobileFilters(false)
    }),

        showCompare && React.createElement(PriceCompareModal, {
      query: compareQuery,
      onClose:()=>setShowCompare(false)
    }),
    React.createElement(PWAInstallBanner, null),
    showUpload && React.createElement(UploadModal, {
      mode: showUpload,
      onClose:()=>setShowUpload(false),
      onSearchWithAnalysis:handleImageSearch
    }),
    showProfile && React.createElement(ProfileModal, {
      onClose:()=>setShowProfile(false),
      auth,
      onSearchFromHistory:(q,cat)=>{ setQuery(q); setActiveCategory(cat||'all'); handleSearch(q, cat||'all'); }
    }),
    React.createElement(Toast, { toasts })
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
