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
        [['online','🛒 Boutiques en ligne'],['physical','🏪 Magasins physiques'],['both','🔄 Les deux']].map(([v,l]) =>
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
function MapPreview() {
  const pins = [
    { top:'30%', left:'22%', label:'Bruxelles', match:97 },
    { top:'55%', left:'45%', label:'Paris', match:92 },
    { top:'20%', left:'62%', label:'Amsterdam', match:88 },
    { top:'65%', left:'72%', label:'Munich', match:85 },
    { top:'40%', left:'80%', label:'Milan', match:79 },
    { top:'15%', left:'35%', label:'Londres', match:75 },
  ];
  return React.createElement('div', { className:'map-preview' },
    React.createElement('div', { className:'map-bg' }),
    React.createElement('div', { className:'map-grid' }),
    pins.map((p,i) => React.createElement('div', {
      key:i, className:'map-pin', style:{ top:p.top, left:p.left }
    },
      React.createElement('div', { className:'pin-bubble', style:{position:'relative'} },
        `${p.label} · ${p.match}%`
      ),
      React.createElement('div', { className:'pin-dot' })
    )),
    React.createElement('div', { className:'map-label' }, '🗺 Vue mondiale — résultats géolocalisés')
  );
}

// ─── RESULT ITEM ─────────────────────────────────────────────────────────────
function ResultItem({ item, view, favs, toggleFav, onExpand, expanded }) {
  const isExpanded = expanded === item.id;

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
          React.createElement('div', { className:getMatchClass(item.match) }, `${item.match}%`)
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

  return React.createElement('div', { className:'result-item fade-in' },
    React.createElement('div', { className:'result-img', onClick:()=>onExpand(item.id), style:{cursor:'pointer'} },
      item.img
        ? React.createElement('img', { src:item.img, alt:item.title, loading:'lazy', onError:e=>e.target.style.display='none' })
        : React.createElement('span', { className:'img-placeholder' }, '📦')
    ),
    React.createElement('div', { className:'result-body', onClick:()=>onExpand(item.id), style:{cursor:'pointer'} },
      React.createElement('div', { className:'result-meta' },
        React.createElement('div', { className:'result-title' }, item.title),
        React.createElement('div', { className:getMatchClass(item.match) }, `${item.match}%`)
      ),
      React.createElement('div', { className:'result-desc' }, item.desc),
      React.createElement('div', { className:'result-footer' },
        item.price && React.createElement('div', { className:'result-price' },
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
      item.extensions && item.extensions.length > 0 &&
        React.createElement('div', { className:'chip-group', style:{marginTop:6} },
          item.extensions.slice(0,4).map((ext,i) =>
            React.createElement('span', { key:i, className:'chip', style:{fontSize:'0.72rem',padding:'2px 8px'} }, ext)
          )
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
                `Les avis détaillés sont disponibles directement sur ${item.store}. Cliquez sur "Voir l'offre" pour les consulter.`
              )
            )
          : React.createElement('div', { className:'no-reviews' }, 'Avis non disponibles pour cet article.')
      )
    ),
    React.createElement('div', { className:'result-actions' },
      React.createElement('button', {
        className:`btn-fav${favs.includes(item.id)?' active':''}`,
        onClick:e=>{ e.stopPropagation(); toggleFav(item.id); }
      }, React.createElement(HeartIcon, { filled:favs.includes(item.id) })),
      React.createElement('a', {
        href:item.storeLink, target:'_blank', rel:'noopener noreferrer',
        className:'btn-visit', onClick:e=>e.stopPropagation()
      }, "Voir l'offre →")
    )
  );
}

// ─── UPLOAD MODAL avec IA Vision ─────────────────────────────────────────────
function UploadModal({ onClose, onSearchWithAnalysis }) {
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState('image/jpeg');
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

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
        React.createElement('div', { className:'modal-title' }, '📸 Recherche par image IA'),
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
            React.createElement('p', null, 'Photographiez n\'importe quel article — vêtement, outil, plante, meuble — et l\'IA identifie le produit et lance la recherche automatiquement.')
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

// ─── PROFILE MODAL ───────────────────────────────────────────────────────────
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
              React.createElement('div', { className:'ai-banner-title' }, '✨ Espace personnel')
            ),
            React.createElement('p', null, 'Connectez-vous pour sauvegarder vos recherches, recevoir des recommandations IA et découvrir les nouveautés.')
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
          React.createElement('button', { className:'btn-primary', onClick:()=>setLoggedIn(true) },
            'Se connecter / Créer un compte'
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
          React.createElement('div', { className:'profile-avatar' }, 'JD')
        ),
        React.createElement('div', { className:'profile-name' }, 'Jean Dupont'),
        React.createElement('div', { className:'profile-email' }, 'jean.dupont@email.com')
      ),
      React.createElement('div', { className:'tabs' },
        [['history','🕐 Historique'],['reco','✨ Recommandations'],['new','🆕 Nouveautés']].map(([id,l]) =>
          React.createElement('div', { key:id, className:`tab${tab===id?' active':''}`, onClick:()=>setTab(id) }, l)
        )
      ),
      tab==='history' && React.createElement('div', { style:{maxHeight:320,overflowY:'auto'} },
        HISTORY_ITEMS.map(h => React.createElement('div', { key:h.id, className:'history-item' },
          React.createElement('div', { className:'history-thumb' }, h.emoji),
          React.createElement('div', null,
            React.createElement('div', { className:'history-query' }, h.query),
            React.createElement('div', { style:{fontSize:'0.75rem',color:'var(--text3)'} }, '12 résultats trouvés')
          ),
          React.createElement('div', { className:'history-date' }, h.date)
        ))
      ),
      tab==='reco' && React.createElement('div', { style:{padding:16} },
        React.createElement('div', { className:'ai-banner', style:{marginBottom:16} },
          React.createElement('div', { className:'ai-banner-head' },
            React.createElement('div', { className:'ai-banner-title' }, '🤖 Recommandations IA personnalisées')
          ),
          React.createElement('p', null, 'Basé sur vos recherches, notre IA a sélectionné ces articles.')
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
      tab==='new' && React.createElement('div', { style:{padding:16} },
        React.createElement('div', { style:{display:'flex',alignItems:'center',gap:8,marginBottom:16} },
          React.createElement('span', { className:'new-badge' }, "Mis à jour aujourd'hui à 03:00 UTC"),
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

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  async function handleSearch(q, cat) {
    const searchQuery = (q || query).trim();
    if (!searchQuery) return;
    const searchCat = cat || activeCategory;

    setLoading(true); setSearchDone(false); setError(null); setResults([]);

    const msgs = [
      '🔍 Connexion aux sources mondiales…',
      '🌍 Consultation de Google Shopping…',
      '💰 Comparaison des prix en cours…',
      '⭐ Récupération des avis clients…',
      '📦 Tri par pertinence…'
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

      const res = await fetch(`/.netlify/functions/search?${params.toString()}`);
      const data = await res.json();
      clearInterval(msgInterval);

      if (data.error) throw new Error(data.error);

      const allResults = [...(data.results || []), ...(data.organicResults || [])];
      setResults(allResults);
      setSearchDone(true);
      setLoading(false);
      addToast(`✅ ${allResults.length} résultats trouvés pour "${searchQuery}"`);

    } catch (err) {
      clearInterval(msgInterval);
      setLoading(false);
      setError(err.message);
      addToast('❌ Erreur : ' + err.message, 'error');
    }
  }

  // Appelé depuis UploadModal après analyse IA
  function handleImageSearch({ query: q, category, description, productName }) {
    setQuery(q);
    setActiveCategory(category || 'all');
    setImageAnalysis({ query:q, productName, description });
    addToast(`🤖 IA a identifié : "${productName}"`);
    handleSearch(q, category || 'all');
  }

  function toggleFav(id) {
    setFavs(f => f.includes(id) ? f.filter(x=>x!==id) : [...f, id]);
    addToast(favs.includes(id) ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️');
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
          onKeyDown:e=>e.key==='Enter'&&handleSearch()
        })
      ),
      React.createElement('div', { className:'header-actions' },
        React.createElement('button', { className:'btn-icon', title:'Carte', onClick:()=>setShowMap(v=>!v) },
          React.createElement(SvgIcon, { d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
        ),
        React.createElement('button', { className:'btn-icon', title:'Favoris' },
          React.createElement(SvgIcon, { d:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' })
        ),
        React.createElement('button', { className:'avatar-btn', onClick:()=>setShowProfile(true) }, 'JD')
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
          React.createElement('div', { className:'hero-badge' }, '✨ Recherche mondiale en temps réel'),
          React.createElement('h1', null, 'Trouvez n\'importe quel ',
            React.createElement('span', null, 'article'), ' dans le monde entier'
          ),
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
              '📸 Photo IA'
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

        // Bannière résultat IA
        searchDone && imageAnalysis && React.createElement('div', {
          className:'ai-banner fade-in', style:{marginBottom:16}
        },
          React.createElement('div', { className:'ai-banner-head' },
            React.createElement('div', { className:'ai-banner-title' },
              `🤖 IA a identifié : "${imageAnalysis.productName}"`
            )
          ),
          React.createElement('p', null, imageAnalysis.description)
        ),

        showMap && React.createElement('div', { style:{marginBottom:16} },
          React.createElement('div', { className:'section-title' }, '🗺 Disponibilité mondiale'),
          React.createElement(MapPreview, null)
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
            React.createElement('button', { className:'btn-camera', onClick:()=>setShowUpload(true) },
              '📸 Nouvelle recherche par photo'
            ),
            React.createElement('button', { className:'btn-camera', onClick:()=>setShowMap(v=>!v) },
              '🗺 ', showMap?'Masquer la carte':'Voir sur la carte'
            )
          )
        )
      )
    ),

    showUpload && React.createElement(UploadModal, {
      onClose:()=>setShowUpload(false),
      onSearchWithAnalysis:handleImageSearch
    }),
    showProfile && React.createElement(ProfileModal, { onClose:()=>setShowProfile(false) }),
    React.createElement(Toast, { toasts })
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
