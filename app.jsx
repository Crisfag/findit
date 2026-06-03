// ─── DATA ───────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:'all', label:'Tout', icon:'🔍' },
  { id:'fashion', label:'Vêtements', icon:'👗' },
  { id:'tools', label:'Bricolage', icon:'🔧' },
  { id:'deco', label:'Décoration', icon:'🏠' },
  { id:'games', label:'Jeux', icon:'🎮' },
  { id:'books', label:'Livres', icon:'📚' },
  { id:'garden', label:'Jardin', icon:'🌿' },
  { id:'pets', label:'Animaux', icon:'🐾' },
  { id:'kids', label:'Enfants', icon:'🧸' },
];

const COLORS = [
  { id:'black', hex:'#1a1a1a' }, { id:'white', hex:'#f5f5f5' },
  { id:'red', hex:'#e74c3c' }, { id:'blue', hex:'#3498db' },
  { id:'green', hex:'#2ecc71' }, { id:'yellow', hex:'#f1c40f' },
  { id:'brown', hex:'#795548' }, { id:'gray', hex:'#9e9e9e' },
  { id:'pink', hex:'#e91e63' }, { id:'orange', hex:'#ff5722' },
];

const SIZES = ['XS','S','M','L','XL','XXL','Unique'];
const MATERIALS = ['Coton','Cuir','Lin','Bois','Métal','Plastique','Verre','Céramique'];
const DELIVERY = ['24h','48h','3-5 jours','1 semaine'];
const STORES = [
  { name:'Amazon', type:'online', country:'Global', delivery:'24h-48h', flag:'🌍' },
  { name:'Zalando', type:'online', country:'EU', delivery:'2-4 jours', flag:'🇪🇺' },
  { name:'ASOS', type:'online', country:'EU', delivery:'3-5 jours', flag:'🇬🇧' },
  { name:'Décathlon', type:'both', country:'BE/FR', delivery:'24h', flag:'🇧🇪' },
  { name:'H&M', type:'physical', country:'BE', delivery:'En magasin', flag:'🇧🇪' },
  { name:'IKEA', type:'both', country:'BE', delivery:'3-7 jours', flag:'🇧🇪' },
  { name:'Fnac', type:'both', country:'BE/FR', delivery:'48h', flag:'🇧🇪' },
  { name:'Cdiscount', type:'online', country:'FR', delivery:'2-5 jours', flag:'🇫🇷' },
  { name:'Etsy', type:'online', country:'Global', delivery:'7-14 jours', flag:'🌍' },
  { name:'eBay', type:'online', country:'Global', delivery:'5-10 jours', flag:'🌍' },
];

const MOCK_RESULTS = [
  { id:1, title:'Veste en cuir noir premium', desc:'Veste en cuir véritable de qualité supérieure, doublure satin, coupe ajustée. Idéale pour toutes les saisons.', price:'189.99', oldPrice:'249.99', match:97, stars:4.8, reviews:234, store:'Zalando', delivery:'2-3 jours', dist:'12 km', category:'fashion', img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80', color:'black' },
  { id:2, title:'Perceuse visseuse sans fil Bosch', desc:'Perceuse-visseuse 18V, couple max 50Nm, livré avec 2 batteries 2Ah et chargeur rapide.', price:'129.00', oldPrice:'159.00', match:92, stars:4.7, reviews:89, store:'Décathlon', delivery:'24h', dist:'3.2 km', category:'tools', img:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&q=80', color:'blue' },
  { id:3, title:'Canapé 3 places velours vert forêt', desc:'Canapé scandinave en velours côtelé, pieds en bois de hêtre, largeur 210cm. Tissu résistant aux taches.', price:'649.00', oldPrice:null, match:88, stars:4.5, reviews:156, store:'IKEA', delivery:'7-10 jours', dist:'18 km', category:'deco', img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80', color:'green' },
  { id:4, title:'LEGO Technic 42154 — F1 McLaren', desc:'Set LEGO Technic officiel, 1432 pièces, voiture Formule 1 McLaren à l\'échelle 1:8. À partir de 18 ans.', price:'219.99', oldPrice:'249.99', match:85, stars:4.9, reviews:412, store:'Fnac', delivery:'48h', dist:'5 km', category:'games', img:'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200&q=80', color:'orange' },
  { id:5, title:'Monstera Deliciosa — Plante tropicale', desc:'Monstera deliciosa en pot de 21cm, hauteur 60-70cm. Livraison soignée avec emballage protecteur.', price:'34.90', oldPrice:null, match:82, stars:4.6, reviews:67, store:'Etsy', delivery:'5-7 jours', dist:'Envoi postal', category:'garden', img:'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=200&q=80', color:'green' },
  { id:6, title:'Sneakers Nike Air Max 270', desc:'Chaussures de sport Nike Air Max 270, semelle Air visible 270°, tige en mesh respirant. Du 36 au 48.', price:'139.95', oldPrice:'169.95', match:79, stars:4.4, reviews:521, store:'Amazon', delivery:'24h', dist:'En ligne', category:'fashion', img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80', color:'white' },
  { id:7, title:'Harry Potter — Intégrale 7 volumes', desc:'Collection complète Harry Potter, édition reliée grand format, illustrations originales de Jim Kay.', price:'99.00', oldPrice:'129.00', match:75, stars:4.9, reviews:1024, store:'Fnac', delivery:'48h', dist:'5 km', category:'books', img:'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&q=80', color:'brown' },
  { id:8, title:'Collier en or 18k — Pendentif cœur', desc:'Collier en or jaune 18 carats, chaîne forçat 45cm, pendentif cœur serti de diamants 0.05ct.', price:'299.00', oldPrice:null, match:71, stars:4.7, reviews:38, store:'Etsy', delivery:'7-10 jours', dist:'Envoi postal', category:'fashion', img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80', color:'yellow' },
];

const MOCK_REVIEWS = {
  1: [
    { name:'Marie L.', date:'15 mai 2025', stars:5, text:'Qualité exceptionnelle, je suis très satisfaite. La coupe est parfaite et le cuir est vraiment de bonne qualité.', avatar:'ML' },
    { name:'Thomas R.', date:'2 avril 2025', stars:4, text:'Belle veste, conforme à la description. Livraison rapide. Je retire une étoile car la taille est un peu grande.', avatar:'TR' },
    { name:'Sophie D.', date:'18 mars 2025', stars:5, text:'Je recommande vivement ! Correspond exactement aux photos.', avatar:'SD' },
  ],
  2: [
    { name:'Pierre M.', date:'10 mai 2025', stars:5, text:'Excellente perceuse, très puissante pour les travaux du quotidien.', avatar:'PM' },
  ],
};

const HISTORY_ITEMS = [
  { id:1, query:'Veste en cuir noir', date:'Aujourd\'hui', emoji:'👗' },
  { id:2, query:'Canapé velours vert', date:'Hier', emoji:'🏠' },
  { id:3, query:'Nike Air Max 270', date:'Il y a 3 jours', emoji:'👟' },
  { id:4, query:'LEGO Technic McLaren', date:'Il y a 5 jours', emoji:'🎮' },
  { id:5, query:'Monstera Deliciosa', date:'Il y a 1 semaine', emoji:'🌿' },
];

const NEW_ARRIVALS = [
  { id:1, name:'Hoodie oversize lavande', price:'49.99', match:94, emoji:'👕' },
  { id:2, name:'Lampe LED arc design', price:'89.00', match:91, emoji:'💡' },
  { id:3, name:'Puzzle 1000p Van Gogh', price:'24.90', match:88, emoji:'🧩' },
  { id:4, name:'Sac à dos cuir vintage', price:'79.99', match:85, emoji:'🎒' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const { useState, useEffect, useRef, useCallback } = React;

function StarIcon({ filled }) {
  return React.createElement('svg', { viewBox:'0 0 24 24' },
    React.createElement('path', { d:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
  );
}

function HeartIcon({ filled }) {
  return React.createElement('svg', { style:{ fill: filled ? '#FF4B2B' : 'none', stroke: filled ? '#FF4B2B' : 'currentColor', strokeWidth:1.8, width:15, height:15 } },
    React.createElement('path', { d:'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
  );
}

function getMatchClass(pct) {
  if (pct >= 90) return 'match-badge high';
  if (pct >= 75) return 'match-badge mid';
  return 'match-badge';
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Logo() {
  return React.createElement('a', { href:'#', className:'logo' },
    React.createElement('div', { className:'logo-icon' },
      React.createElement('svg', { viewBox:'0 0 24 24', xmlns:'http://www.w3.org/2000/svg' },
        React.createElement('path', { d:'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z' }),
        React.createElement('path', { d:'M9 2v20M12 8h6M12 12h6M12 16h4', stroke:'white', strokeWidth:1.5, fill:'none', strokeLinecap:'round' }),
        React.createElement('circle', { cx:7.5, cy:17, r:2.5, fill:'#FF8C42' }),
        React.createElement('path', { d:'M9.3 18.8l1.7 1.7', stroke:'#FF8C42', strokeWidth:1.5, strokeLinecap:'round' })
      )
    ),
    React.createElement('span', { className:'logo-text' }, 'Find', React.createElement('span', null, ' It'))
  );
}

function SvgIcon({ d, size=18 }) {
  return React.createElement('svg', { viewBox:'0 0 24 24', width:size, height:size, fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' },
    React.createElement('path', { d })
  );
}

function Toast({ toasts }) {
  return React.createElement('div', { className:'toast-wrap' },
    toasts.map(t => React.createElement('div', { key:t.id, className:`toast ${t.type}` },
      t.type === 'success' ? React.createElement(SvgIcon, { d:'M20 6L9 17l-5-5' }) : null,
      t.msg
    ))
  );
}

function Stars({ count, max=5 }) {
  return React.createElement('div', { className:'result-stars' },
    Array.from({length:max}).map((_,i) =>
      React.createElement('svg', { key:i, viewBox:'0 0 24 24', style:{ width:13, height:13, fill: i < Math.round(count) ? '#F39C12' : '#333', stroke:'none' } },
        React.createElement('path', { d:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
      )
    ),
    React.createElement('span', null, count)
  );
}

// ─── FILTER SIDEBAR ───────────────────────────────────────────────────────────
function FilterSidebar({ collapsed, filters, setFilters }) {
  const [priceRange, setPriceRange] = useState([0, 1000]);

  function toggle(key, val) {
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(val)
        ? f[key].filter(x => x !== val)
        : [...f[key], val]
    }));
  }

  return React.createElement('aside', { className:`sidebar${collapsed ? ' collapsed' : ''}` },
    React.createElement('div', { className:'nav-header' }, 'Filtres de recherche'),

    // Price
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Prix'),
      React.createElement('div', { className:'filter-label' }, 'Fourchette ',
        React.createElement('span', null, `${filters.priceMin}€ — ${filters.priceMax}€`)
      ),
      React.createElement('input', { type:'range', min:0, max:2000, value:filters.priceMax,
        onChange: e => setFilters(f => ({...f, priceMax: Number(e.target.value)})) }),
      React.createElement('div', { className:'price-inputs' },
        React.createElement('input', { type:'number', placeholder:'Min', value:filters.priceMin,
          onChange: e => setFilters(f => ({...f, priceMin: Number(e.target.value)})) }),
        React.createElement('input', { type:'number', placeholder:'Max', value:filters.priceMax,
          onChange: e => setFilters(f => ({...f, priceMax: Number(e.target.value)})) })
      )
    ),

    // Delivery
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Délai de livraison'),
      React.createElement('div', { className:'chip-group' },
        DELIVERY.map(d => React.createElement('div', {
          key:d, className:`chip${filters.delivery.includes(d) ? ' active' : ''}`,
          onClick: () => toggle('delivery', d)
        }, d))
      )
    ),

    // Colors
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Couleur'),
      React.createElement('div', { className:'color-chips' },
        COLORS.map(c => React.createElement('div', {
          key:c.id,
          className:`color-chip${filters.colors.includes(c.id) ? ' active' : ''}`,
          style:{ background:c.hex },
          onClick: () => toggle('colors', c.id),
          title: c.id
        }))
      )
    ),

    // Sizes
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Taille'),
      React.createElement('div', { className:'chip-group' },
        SIZES.map(s => React.createElement('div', {
          key:s, className:`chip${filters.sizes.includes(s) ? ' active' : ''}`,
          onClick: () => toggle('sizes', s)
        }, s))
      )
    ),

    // Materials
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Matière'),
      React.createElement('div', { className:'chip-group' },
        MATERIALS.map(m => React.createElement('div', {
          key:m, className:`chip${filters.materials.includes(m) ? ' active' : ''}`,
          onClick: () => toggle('materials', m)
        }, m))
      )
    ),

    // Store type
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Type de commerce'),
      React.createElement('div', { className:'check-group' },
        [['online','🛒 Boutiques en ligne'],['physical','🏪 Magasins physiques'],['both','🔄 Les deux']].map(([v,l]) =>
          React.createElement('label', { key:v, className:'check-item' },
            React.createElement('input', { type:'checkbox', checked: filters.storeType.includes(v),
              onChange: () => toggle('storeType', v) }),
            l
          )
        )
      )
    ),

    // Match %
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Ressemblance minimum'),
      React.createElement('div', { className:'filter-label' }, 'Seuil ',
        React.createElement('span', null, `${filters.minMatch}%`)
      ),
      React.createElement('input', { type:'range', min:50, max:100, value:filters.minMatch,
        onChange: e => setFilters(f => ({...f, minMatch: Number(e.target.value)})) })
    ),

    // Rating
    React.createElement('div', { className:'filter-section' },
      React.createElement('div', { className:'filter-title' }, 'Note minimale'),
      React.createElement('div', { className:'rating-filter' },
        [1,2,3,4,5].map(n => React.createElement('button', {
          key:n, className:`star-btn${filters.minRating >= n ? ' active' : ''}`,
          onClick: () => setFilters(f => ({...f, minRating: f.minRating === n ? 0 : n}))
        }, '★'))
      )
    )
  );
}

// ─── MAP PREVIEW ──────────────────────────────────────────────────────────────
function MapPreview() {
  const pins = [
    { top:'30%', left:'22%', pct:97, label:'Bruxelles' },
    { top:'55%', left:'45%', pct:92, label:'Paris' },
    { top:'20%', left:'62%', pct:88, label:'Amsterdam' },
    { top:'65%', left:'72%', pct:85, label:'Munich' },
    { top:'40%', left:'80%', pct:79, label:'Milan' },
    { top:'15%', left:'35%', pct:75, label:'Londres' },
  ];
  return React.createElement('div', { className:'map-preview' },
    React.createElement('div', { className:'map-bg' }),
    React.createElement('div', { className:'map-grid' }),
    pins.map((p,i) => React.createElement('div', {
      key:i, className:'map-pin', style:{ top:p.top, left:p.left }
    },
      React.createElement('div', { className:'pin-bubble', style:{ position:'relative' } },
        `${p.label} · ${p.pct}%`
      ),
      React.createElement('div', { className:'pin-dot' })
    )),
    React.createElement('div', { className:'map-label' }, '🗺 Vue mondiale — cliquez pour explorer')
  );
}

// ─── RESULT ITEM ──────────────────────────────────────────────────────────────
function ResultItem({ item, view, favs, toggleFav, onExpand, expanded }) {
  const reviews = MOCK_REVIEWS[item.id] || null;

  if (view === 'grid') {
    return React.createElement('div', { className:'result-card fade-in', onClick: () => onExpand(item.id) },
      React.createElement('div', { className:'card-img' },
        item.img
          ? React.createElement('img', { src:item.img, alt:item.title, loading:'lazy' })
          : React.createElement('span', { className:'img-placeholder' }, item.emoji || '📦')
      ),
      React.createElement('div', { className:'card-body' },
        React.createElement('div', { className:'card-top' },
          React.createElement('div', { className:'card-title' }, item.title),
          React.createElement('div', { className:getMatchClass(item.match) }, `${item.match}%`)
        ),
        React.createElement('div', { className:'card-price' }, `${item.price} €`),
        React.createElement('div', { className:'card-footer' },
          React.createElement(Stars, { count:item.stars }),
          React.createElement('button', { className:`btn-fav${favs.includes(item.id) ? ' active' : ''}`,
            onClick: e => { e.stopPropagation(); toggleFav(item.id); },
            style:{ width:28, height:28 }
          }, React.createElement(HeartIcon, { filled: favs.includes(item.id) }))
        )
      )
    );
  }

  return React.createElement('div', { className:'result-item fade-in', onClick: () => onExpand(item.id) },
    React.createElement('div', { className:'result-img' },
      item.img
        ? React.createElement('img', { src:item.img, alt:item.title, loading:'lazy' })
        : React.createElement('span', { className:'img-placeholder' }, '📦')
    ),
    React.createElement('div', { className:'result-body' },
      React.createElement('div', { className:'result-meta' },
        React.createElement('div', { className:'result-title' }, item.title),
        React.createElement('div', { className:getMatchClass(item.match) }, `${item.match}%`)
      ),
      React.createElement('div', { className:'result-desc' }, item.desc),
      React.createElement('div', { className:'result-footer' },
        React.createElement('div', { className:'result-price' }, `${item.price} €`,
          item.oldPrice && React.createElement('span', { className:'old' }, `${item.oldPrice} €`)
        ),
        React.createElement(Stars, { count:item.stars }),
        React.createElement('span', { className:'result-store' }, `🏪 ${item.store}`),
        React.createElement('span', { className:'result-delivery' }, `⚡ ${item.delivery}`),
        React.createElement('span', { className:'result-dist' }, `📍 ${item.dist}`)
      ),
      expanded === item.id && React.createElement('div', null,
        React.createElement('div', { className:'reviews-section' },
          React.createElement('div', { className:'reviews-title' }, '💬 Avis clients'),
          reviews
            ? reviews.map((r,i) => React.createElement('div', { key:i, className:'review-item' },
                React.createElement('div', { className:'review-head' },
                  React.createElement('div', { className:'reviewer-avatar' }, r.avatar),
                  React.createElement('span', { className:'reviewer-name' }, r.name),
                  React.createElement('div', { className:'review-stars' },
                    Array.from({length:5}).map((_,j) =>
                      React.createElement('svg', { key:j, viewBox:'0 0 24 24', style:{ width:11, height:11, fill: j < r.stars ? '#F39C12' : '#333', stroke:'none' } },
                        React.createElement('path', { d:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
                      )
                    )
                  ),
                  React.createElement('span', { className:'review-date' }, r.date)
                ),
                React.createElement('div', { className:'review-text' }, r.text)
              ))
            : React.createElement('div', { className:'no-reviews' }, 'Avis non disponibles pour cet article.')
        )
      )
    ),
    React.createElement('div', { className:'result-actions' },
      React.createElement('button', { className:`btn-fav${favs.includes(item.id) ? ' active' : ''}`,
        onClick: e => { e.stopPropagation(); toggleFav(item.id); }
      }, React.createElement(HeartIcon, { filled: favs.includes(item.id) })),
      React.createElement('button', { className:'btn-visit',
        onClick: e => { e.stopPropagation(); }
      }, 'Voir l\'offre →')
    )
  );
}

// ─── UPLOAD MODAL ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSearch }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return React.createElement('div', { className:'modal-overlay', onClick: onClose },
    React.createElement('div', { className:'modal', onClick: e => e.stopPropagation() },
      React.createElement('div', { className:'modal-header' },
        React.createElement('div', { className:'modal-title' }, '📸 Recherche par image'),
        React.createElement('button', { className:'modal-close', onClick:onClose },
          React.createElement(SvgIcon, { d:'M18 6L6 18M6 6l12 12' })
        )
      ),
      React.createElement('div', { className:'modal-body' },
        preview
          ? React.createElement('div', null,
              React.createElement('img', { src:preview, className:'upload-preview', alt:'Preview' }),
              React.createElement('button', { className:'btn-primary', onClick:() => { onSearch('Image scannée'); onClose(); } },
                '🔍 Rechercher des articles similaires'
              ),
              React.createElement('button', { className:'btn-secondary', onClick:() => setPreview(null) }, 'Changer l\'image')
            )
          : React.createElement('div', null,
              React.createElement('div', {
                className:`upload-zone${dragging ? ' drag' : ''}`,
                onDragOver: e => { e.preventDefault(); setDragging(true); },
                onDragLeave: () => setDragging(false),
                onDrop: handleDrop,
                onClick: () => inputRef.current.click()
              },
                React.createElement(SvgIcon, { d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12', size:40 }),
                React.createElement('p', null, 'Glissez une image ici ou ',
                  React.createElement('span', null, 'parcourez vos fichiers')
                ),
                React.createElement('p', { style:{fontSize:'0.75rem', color:'var(--text3)', marginTop:6} }, 'JPG, PNG, WEBP — max 10MB')
              ),
              React.createElement('input', { ref:inputRef, type:'file', accept:'image/*', style:{display:'none'},
                onChange: e => handleFile(e.target.files[0]) }),
              React.createElement('div', { style:{textAlign:'center', padding:'12px 0', color:'var(--text3)', fontSize:'0.8rem'} }, '— ou —'),
              React.createElement('button', { className:'btn-secondary',
                onClick:() => { onSearch('Photo prise en direct'); onClose(); }
              }, '📷 Prendre une photo (appareil photo)')
            )
      )
    )
  );
}

// ─── PROFILE MODAL ────────────────────────────────────────────────────────────
function ProfileModal({ onClose }) {
  const [tab, setTab] = useState('history');
  const [loggedIn, setLoggedIn] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', pass:'' });

  if (!loggedIn) {
    return React.createElement('div', { className:'modal-overlay', onClick:onClose },
      React.createElement('div', { className:'modal', onClick:e=>e.stopPropagation() },
        React.createElement('div', { className:'modal-header' },
          React.createElement('div', { className:'modal-title' }, '👤 Mon espace Find It'),
          React.createElement('button', { className:'modal-close', onClick:onClose },
            React.createElement(SvgIcon, { d:'M18 6L6 18M6 6l12 12' })
          )
        ),
        React.createElement('div', { className:'modal-body' },
          React.createElement('div', { className:'ai-banner', style:{marginBottom:20} },
            React.createElement('div', { className:'ai-banner-head' },
              React.createElement('div', { className:'ai-banner-icon' },
                React.createElement('svg', { viewBox:'0 0 24 24', width:15, height:15, style:{fill:'var(--primary)'} },
                  React.createElement('path', { d:'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z' })
                )
              ),
              React.createElement('div', { className:'ai-banner-title' }, 'Espace personnel')
            ),
            React.createElement('p', null, 'Connectez-vous pour sauvegarder vos recherches, recevoir des recommandations IA personnalisées et découvrir les nouveautés adaptées à vos goûts.')
          ),
          ['name','email','pass'].map(k => React.createElement('div', { key:k },
            React.createElement('div', { className:'input-label' },
              k==='name'?'Nom complet':k==='email'?'Adresse email':'Mot de passe'),
            React.createElement('input', {
              className:'input-field', type:k==='pass'?'password':'text',
              placeholder:k==='name'?'Jean Dupont':k==='email'?'jean@email.com':'••••••••',
              value:form[k], onChange:e=>setForm(f=>({...f,[k]:e.target.value}))
            })
          )),
          React.createElement('button', { className:'btn-primary', onClick:()=>setLoggedIn(true) }, 'Se connecter / Créer un compte'),
          React.createElement('div', { style:{textAlign:'center',marginTop:12,fontSize:'0.78rem',color:'var(--text3)'} },
            'En continuant, vous acceptez nos ',
            React.createElement('a', { href:'#', style:{color:'var(--primary)'} }, 'conditions d\'utilisation')
          )
        )
      )
    );
  }

  return React.createElement('div', { className:'modal-overlay', onClick:onClose },
    React.createElement('div', { className:'modal', style:{maxWidth:560}, onClick:e=>e.stopPropagation() },
      React.createElement('div', { className:'modal-header' },
        React.createElement('div', { className:'modal-title' }, 'Mon compte'),
        React.createElement('button', { className:'modal-close', onClick:onClose },
          React.createElement(SvgIcon, { d:'M18 6L6 18M6 6l12 12' })
        )
      ),
      React.createElement('div', { className:'profile-hero' },
        React.createElement('div', { className:'profile-avatar-wrap' },
          React.createElement('div', { className:'profile-avatar' }, 'JD'),
          React.createElement('div', { className:'profile-edit-btn' },
            React.createElement('svg', { viewBox:'0 0 24 24', width:10, height:10, fill:'white' },
              React.createElement('path', { d:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
              React.createElement('path', { d:'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
            )
          )
        ),
        React.createElement('div', { className:'profile-name' }, 'Jean Dupont'),
        React.createElement('div', { className:'profile-email' }, 'jean.dupont@email.com')
      ),
      React.createElement('div', { className:'tabs' },
        [['history','🕐 Historique'],['reco','✨ Recommandations'],['new','🆕 Nouveautés']].map(([id,l]) =>
          React.createElement('div', { key:id, className:`tab${tab===id?' active':''}`, onClick:()=>setTab(id) }, l)
        )
      ),
      tab === 'history' && React.createElement('div', { style:{maxHeight:320, overflowY:'auto'} },
        HISTORY_ITEMS.map(h => React.createElement('div', { key:h.id, className:'history-item' },
          React.createElement('div', { className:'history-thumb' }, h.emoji),
          React.createElement('div', null,
            React.createElement('div', { className:'history-query' }, h.query),
            React.createElement('div', { style:{fontSize:'0.75rem',color:'var(--text3)'} }, '12 résultats trouvés')
          ),
          React.createElement('div', { className:'history-date' }, h.date)
        ))
      ),
      tab === 'reco' && React.createElement('div', { style:{padding:16} },
        React.createElement('div', { className:'ai-banner', style:{marginBottom:16} },
          React.createElement('div', { className:'ai-banner-head' },
            React.createElement('div', { className:'ai-banner-icon' },
              React.createElement('svg', { viewBox:'0 0 24 24', width:15, height:15, style:{fill:'var(--primary)'} },
                React.createElement('path', { d:'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z' })
              )
            ),
            React.createElement('div', { className:'ai-banner-title' }, '🤖 Recommandations IA personnalisées')
          ),
          React.createElement('p', null, 'Basé sur vos 5 dernières recherches, notre IA a sélectionné ces articles pour vous.')
        ),
        React.createElement('div', { className:'reco-grid' },
          NEW_ARRIVALS.map(r => React.createElement('div', { key:r.id, className:'reco-card' },
            React.createElement('div', { className:'reco-img' }, r.emoji),
            React.createElement('div', { className:'reco-name' }, r.name),
            React.createElement('div', { className:'reco-price' }, `${r.price} €`),
            React.createElement('div', { className:'reco-match' }, `Correspondance : ${r.match}%`)
          ))
        )
      ),
      tab === 'new' && React.createElement('div', { style:{padding:16} },
        React.createElement('div', { style:{display:'flex',alignItems:'center',gap:8,marginBottom:16} },
          React.createElement('span', { className:'new-badge' }, 'Mis à jour aujourd\'hui à 03:00 UTC'),
          React.createElement('span', { style:{fontSize:'0.78rem',color:'var(--text3)'} }, '≥ 80% de correspondance')
        ),
        React.createElement('div', { className:'reco-grid' },
          NEW_ARRIVALS.map(r => React.createElement('div', { key:r.id, className:'reco-card' },
            React.createElement('div', { className:'reco-img' }, r.emoji),
            React.createElement('div', { style:{display:'flex',alignItems:'center',gap:4,marginBottom:4} },
              React.createElement('span', { className:'new-badge' }, 'NEW'),
              React.createElement('span', { className:'reco-match' }, `${r.match}%`)
            ),
            React.createElement('div', { className:'reco-name' }, r.name),
            React.createElement('div', { className:'reco-price' }, `${r.price} €`)
          ))
        )
      )
    )
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState('list');
  const [sort, setSort] = useState('match');
  const [favs, setFavs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [searchDone, setSearchDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({
    priceMin: 0, priceMax: 2000, delivery: [], colors: [],
    sizes: [], materials: [], storeType: [], minMatch: 50, minRating: 0
  });

  function addToast(msg, type='success') {
    const id = Date.now();
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  function handleSearch(q) {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true); setSearchDone(false);
    setTimeout(() => { setLoading(false); setSearchDone(true); addToast(`${MOCK_RESULTS.length} résultats trouvés pour "${searchQuery}"`) }, 1400);
  }

  function toggleFav(id) {
    setFavs(f => f.includes(id) ? f.filter(x=>x!==id) : [...f, id]);
    addToast(favs.includes(id) ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️');
  }

  function handleExpand(id) {
    setExpanded(e => e === id ? null : id);
  }

  const filteredResults = MOCK_RESULTS
    .filter(r => {
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      if (r.match < filters.minMatch) return false;
      if (r.stars < filters.minRating) return false;
      const price = parseFloat(r.price);
      if (price < filters.priceMin || price > filters.priceMax) return false;
      return true;
    })
    .sort((a,b) => {
      if (sort === 'match') return b.match - a.match;
      if (sort === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sort === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      if (sort === 'stars') return b.stars - a.stars;
      return 0;
    });

  return React.createElement('div', null,
    // Header
    React.createElement('header', null,
      React.createElement(Logo, null),
      React.createElement('div', { className:'header-search' },
        React.createElement('svg', { className:'icon', viewBox:'0 0 24 24', width:16, height:16, fill:'none', stroke:'currentColor', strokeWidth:2 },
          React.createElement('circle', { cx:11, cy:11, r:8 }),
          React.createElement('path', { d:'m21 21-4.35-4.35' })
        ),
        React.createElement('input', { placeholder:'Recherche rapide…', value:query, onChange:e=>setQuery(e.target.value), onKeyDown:e=>e.key==='Enter'&&handleSearch() })
      ),
      React.createElement('div', { className:'header-actions' },
        React.createElement('button', { className:'btn-icon', title:'Carte mondiale', onClick:()=>setShowMap(v=>!v) },
          React.createElement(SvgIcon, { d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
        ),
        React.createElement('button', { className:'btn-icon', title:'Favoris' },
          React.createElement(SvgIcon, { d:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' })
        ),
        favs.length > 0 && React.createElement('span', { style:{
          position:'absolute', top:12, right:88, background:'var(--primary)', color:'white',
          width:16, height:16, borderRadius:'99px', fontSize:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700
        } }, favs.length),
        React.createElement('button', { className:'avatar-btn', onClick:()=>setShowProfile(true), title:'Mon profil' }, 'JD')
      )
    ),

    // Sidebar toggle
    React.createElement('button', { className:`sidebar-toggle${!sidebarOpen?' collapsed':''}`, onClick:()=>setSidebarOpen(v=>!v) },
      React.createElement(SvgIcon, { d: sidebarOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6' })
    ),

    React.createElement('div', { className:'app-layout' },
      React.createElement(FilterSidebar, { collapsed:!sidebarOpen, filters, setFilters }),
      React.createElement('div', { className:`main-content${!sidebarOpen?' sidebar-collapsed':''}` },

        // Hero
        !searchDone && !loading && React.createElement('div', { className:'hero' },
          React.createElement('div', { className:'hero-badge' }, '✨ Recherche mondiale en temps réel'),
          React.createElement('h1', null, 'Trouvez n\'importe quel ', React.createElement('span', null, 'article'), ' dans le monde entier'),
          React.createElement('p', null, 'Photographiez, décrivez ou parcourez — Find It scanne le marché mondial et vous trouve les meilleures offres en quelques secondes.'),

          React.createElement('div', { className:'search-box' },
            React.createElement('div', { className:'search-input-wrap' },
              React.createElement('input', {
                placeholder:'Ex: veste en cuir noir, perceuse Bosch, canapé velours…',
                value:query, onChange:e=>setQuery(e.target.value),
                onKeyDown:e=>e.key==='Enter'&&handleSearch()
              })
            ),
            React.createElement('div', { className:'search-divider' }),
            React.createElement('button', { className:'btn-camera', onClick:()=>setShowUpload(true) },
              React.createElement(SvgIcon, { d:'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z' }),
              'Photo'
            ),
            React.createElement('button', { className:'btn-search', onClick:()=>handleSearch() }, '🔍 Rechercher')
          ),

          React.createElement('div', { className:'categories' },
            CATEGORIES.map(c => React.createElement('div', {
              key:c.id, className:`cat-chip${activeCategory===c.id?' active':''}`,
              onClick:()=>setActiveCategory(c.id)
            }, c.icon, ' ', c.label))
          )
        ),

        // Map view
        showMap && React.createElement('div', { style:{marginBottom:16} },
          React.createElement('div', { className:'section-title' }, '🗺 Disponibilité mondiale'),
          React.createElement(MapPreview, null)
        ),

        // Loading
        loading && React.createElement('div', { className:'loading' },
          React.createElement('div', { className:'spinner' }),
          React.createElement('p', null, '🔍 Analyse de votre recherche en cours…'),
          React.createElement('p', { style:{fontSize:'0.78rem',color:'var(--text3)'} }, 'Consultation de 2 400 sources mondiales')
        ),

        // Results
        searchDone && React.createElement('div', { className:'fade-in' },
          React.createElement('div', { className:'categories', style:{justifyContent:'flex-start', marginBottom:16} },
            CATEGORIES.map(c => React.createElement('div', {
              key:c.id, className:`cat-chip${activeCategory===c.id?' active':''}`,
              onClick:()=>setActiveCategory(c.id)
            }, c.icon, ' ', c.label))
          ),

          React.createElement('div', { className:'results-header' },
            React.createElement('div', { className:'results-count' },
              React.createElement('strong', null, filteredResults.length), ` résultat${filteredResults.length>1?'s':''} pour "${query || 'Image scannée'}"`
            ),
            React.createElement('div', { style:{display:'flex', gap:12, alignItems:'center'} },
              React.createElement('select', { className:'sort-select', value:sort, onChange:e=>setSort(e.target.value) },
                React.createElement('option', {value:'match'}, 'Trier par : Ressemblance'),
                React.createElement('option', {value:'price_asc'}, 'Trier par : Prix ↑'),
                React.createElement('option', {value:'price_desc'}, 'Trier par : Prix ↓'),
                React.createElement('option', {value:'stars'}, 'Trier par : Note')
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
                React.createElement('p', null, 'Essayez d\'élargir vos critères de recherche.')
              )
            : view === 'list'
              ? React.createElement('div', { className:'result-list' },
                  filteredResults.map(item => React.createElement(ResultItem, { key:item.id, item, view, favs, toggleFav, onExpand:handleExpand, expanded }))
                )
              : React.createElement('div', { className:'result-grid' },
                  filteredResults.map(item => React.createElement(ResultItem, { key:item.id, item, view, favs, toggleFav, onExpand:handleExpand, expanded }))
                )
        ),

        // Search done → also show map toggle
        searchDone && React.createElement('div', { style:{marginTop:20, textAlign:'center'} },
          React.createElement('button', { className:'btn-camera', style:{display:'inline-flex', margin:'0 auto'},
            onClick:()=>setShowMap(v=>!v)
          }, '🗺 ', showMap ? 'Masquer la carte' : 'Afficher la carte mondiale')
        )
      )
    ),

    // Modals
    showUpload && React.createElement(UploadModal, { onClose:()=>setShowUpload(false), onSearch:q=>{setQuery(q);handleSearch(q);} }),
    showProfile && React.createElement(ProfileModal, { onClose:()=>setShowProfile(false) }),

    // Toasts
    React.createElement(Toast, { toasts })
  );
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
