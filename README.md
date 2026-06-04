# 🛍️ Find It — Recherche de produits mondiale par IA

> Trouvez n'importe quel article dans le monde entier — par texte ou par photo.

[![Netlify Status](https://api.netlify.com/api/v1/badges/rad-manatee-f5b617/deploy-status)](https://rad-manatee-f5b617.netlify.app)
![Version](https://img.shields.io/badge/version-1.2.0-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Fonctionnalités

| Fonctionnalité | Statut |
|---|---|
| 🔍 Recherche textuelle Google Shopping | ✅ Actif |
| 📸 Analyse d'image par Claude Vision | ✅ Actif |
| 🤖 Scoring de ressemblance intelligent | ✅ Actif |
| 🔬 Requêtes enrichies automatiquement | ✅ Actif |
| 🗺 Carte mondiale interactive | ✅ Actif |
| 🎛 Filtres avancés | ✅ Actif |
| 👤 Espace personnel | 🔄 En cours |
| 📱 App mobile native | 📅 Planifié |

---

## 🚀 Démo en ligne

🌐 **[rad-manatee-f5b617.netlify.app](https://rad-manatee-f5b617.netlify.app)**

---

## 🏗 Architecture

```
findit/
├── index.html                    # Point d'entrée HTML
├── app.jsx                       # Application React principale
├── style.css                     # Styles (dark mode, responsive)
├── netlify.toml                  # Configuration Netlify
├── .gitignore                    # Fichiers exclus de Git
├── .env.example                  # Template variables d'environnement
├── netlify/
│   └── functions/
│       ├── search.js             # API Google Shopping + scoring IA
│       └── analyze-image.js     # Analyse d'image Claude Vision
└── README.md                     # Ce fichier
```

---

## ⚙️ Stack technique

- **Frontend** : React 18 (CDN), CSS Variables, Dark Mode
- **Backend** : Netlify Functions (Node.js serverless)
- **APIs** :
  - [SerpApi](https://serpapi.com) — Google Shopping temps réel
  - [Anthropic Claude](https://anthropic.com) — Vision IA + scoring
- **Hébergement** : Netlify (déploiement auto depuis GitHub)

---

## 🔧 Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/crisfag/findit.git
cd findit

# 2. Installer Netlify CLI
npm install -g netlify-cli

# 3. Configurer les variables
cp .env.example .env
# Remplis .env avec tes clés API

# 4. Lancer en local
netlify dev
# → http://localhost:8888
```

---

## 💰 Coûts estimés

| Service | Plan | Coût/mois |
|---|---|---|
| Netlify | Free | 0€ |
| SerpApi | Starter | ~23€ |
| Anthropic | Pay-as-you-go | ~5-15€ |
| **Total** | | **~28-38€** |

---

## 📈 Roadmap

- [ ] v1.3 — Authentification utilisateur (Supabase)
- [ ] v1.4 — Historique et favoris persistants
- [ ] v1.5 — Notifications nouveautés 03:00 UTC
- [ ] v1.6 — Comparateur de prix multi-sources
- [ ] v2.0 — Application mobile React Native
- [ ] v2.1 — Extension Chrome/Firefox
- [ ] v2.2 — Mode scan AR temps réel

---

## 📄 Licence

MIT © 2025 Find It

---

*Fait avec ❤️ et Claude AI*
