# Etupedia

Etupedia est une encyclopédie académique qui agrège et restructure le contenu de sources universitaires reconnues.

## Fonctionnalités

- **Recherche multi-sources**: Recherche dans les 50 plus grandes encyclopédies universitaires ouvertes
- **Interface élégante**: Design inspiré de Grokipedia avec un thème sombre/clair
- **Navigation intelligente**: Table des matières interactive avec scroll automatique
- **Scraping intelligent**: Extraction et restructuration automatique du contenu
- **Design responsive**: Interface adaptée à tous les écrans

## Technologies

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Cheerio** (web scraping)
- **Axios** (requêtes HTTP)
- **Fonts**: Space Grotesk, Space Mono, SF Pro

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
etupedia/
├── app/
│   ├── page.tsx              # Page d'accueil avec recherche
│   ├── search/page.tsx       # Page de résultats de recherche
│   ├── article/[slug]/       # Page d'article avec sidebar
│   ├── api/
│   │   ├── search/           # API de recherche
│   │   └── article/[slug]/   # API de récupération d'article
│   ├── globals.css           # Styles globaux
│   └── layout.tsx            # Layout principal
├── components/
│   └── theme-provider.tsx    # Provider pour le thème dark/light
├── lib/
│   └── scraper.ts            # Système de scraping
└── public/                   # Assets statiques
```

## Sources académiques

Actuellement configuré pour scraper:
- Wikipedia
- Britannica (à venir)
- Stanford Encyclopedia of Philosophy (à venir)
- Scholarpedia (à venir)
- Et plus...

## Fonctionnement du scraping

Le système de scraping:
1. Recherche dans les sources académiques configurées
2. Extrait le contenu HTML
3. Nettoie et restructure le contenu
4. Génère une table des matières hiérarchique
5. Présente le tout dans une interface épurée

## Build

```bash
npm run build
npm start
```

## Licence

Privé - v0.1
