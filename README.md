# Find It — Application de recherche produits mondiale

## Structure du projet
```
find-it/
├── index.html      ← Point d'entrée
├── style.css       ← Styles complets (dark mode, responsive)
├── app.jsx         ← Application React complète
└── README.md       ← Ce fichier
```

## Fonctionnalités implémentées

### Recherche
- ✅ Barre de recherche textuelle
- ✅ Recherche par photo (upload ou appareil photo)
- ✅ Filtres par catégorie (vêtements, bricolage, déco, jeux, livres, jardin, animaux, enfants)
- ✅ Chargement simulé avec animation

### Résultats
- ✅ Vue liste (image gauche + description + badge % de correspondance)
- ✅ Vue grille
- ✅ Tri par ressemblance, prix, note
- ✅ Badge de correspondance coloré (vert ≥90%, orange ≥75%, rouge <75%)
- ✅ Prix, anciens prix barrés, livraison, distance, note étoiles
- ✅ Avis clients avec photos au clic (expand)
- ✅ Message "Avis non disponibles" si absent
- ✅ Favoris persistants dans la session

### Filtres (volet gauche rétractable)
- ✅ Prix (fourchette + inputs min/max)
- ✅ Délai de livraison
- ✅ Couleurs (chips visuelles)
- ✅ Tailles
- ✅ Matières
- ✅ Type de commerce (en ligne / physique / les deux)
- ✅ Pourcentage de ressemblance minimum
- ✅ Note minimale (étoiles interactives)

### Carte mondiale
- ✅ Vue carte avec pointeurs interactifs par ville
- ✅ Affichage du % de correspondance par localisation

### Espace personnel
- ✅ Connexion / inscription
- ✅ Avatar avec initiales
- ✅ Historique des recherches
- ✅ Recommandations IA personnalisées
- ✅ Section Nouveautés (≥80% correspondance, mise à jour 03:00 UTC)

### UX
- ✅ Sidebar rétractable
- ✅ Toast notifications
- ✅ Animations fade-in
- ✅ Design dark mode élégant
- ✅ Logo Find It (sac shopping + géolocalisation)
- ✅ Responsive mobile

## Déploiement rapide

### Option 1 — Vercel (recommandé, gratuit)
1. Créez un repo GitHub et uploadez les 3 fichiers
2. Allez sur [vercel.com](https://vercel.com)
3. "New Project" → importez votre repo GitHub
4. Deploy → URL publique automatique en 60 secondes

### Option 2 — Netlify (gratuit)
1. Allez sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier `find-it/` directement
3. URL publique instantanée

### Option 3 — GitHub Pages (gratuit)
1. Uploadez sur GitHub dans un repo public
2. Settings → Pages → Source: main branch
3. URL: https://username.github.io/find-it

## Prochaines étapes suggérées
- [ ] Intégrer l'API Claude (vision) pour l'analyse d'images réelles
- [ ] Connecter une API produits (Google Shopping, Amazon PA, etc.)
- [ ] Backend Node.js pour la géolocalisation réelle
- [ ] Base de données utilisateurs (Supabase/Firebase)
- [ ] PWA pour utilisation mobile native
- [ ] Mode multilingue (FR/EN/NL/DE)
