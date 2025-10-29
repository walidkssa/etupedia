# Guide de Déploiement Etupedia sur Vercel

Ce guide explique comment déployer Etupedia sur Vercel avec le domaine etupedia.com

## Prérequis

- Un compte GitHub
- Un compte Vercel (gratuit)
- Le domaine etupedia.com configuré

## Étape 1: Initialiser Git et Pusher sur GitHub

```bash
# Si ce n'est pas déjà fait, initialiser git
git init

# Ajouter tous les fichiers
git add .

# Faire un commit
git commit -m "Initial commit - Ready for deployment"

# Créer un repository sur GitHub (via l'interface web)
# Puis lier le repository local
git remote add origin https://github.com/VOTRE_USERNAME/etupedia.git
git branch -M main
git push -u origin main
```

## Étape 2: Connecter Vercel à GitHub

1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer sur "Add New Project"
4. Sélectionner le repository `etupedia`
5. Vercel détectera automatiquement qu'il s'agit d'un projet Next.js

## Étape 3: Configuration du Projet

### Build & Development Settings
Vercel détectera automatiquement:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables (Optionnel)
Si vous utilisez des API keys:

1. Dans Vercel Dashboard → Settings → Environment Variables
2. Ajouter les variables depuis `.env.example`:
   ```
   NEXT_PUBLIC_APP_URL=https://etupedia.com
   OPENAI_API_KEY=votre_clé_api (si utilisée)
   ```

## Étape 4: Déployer

1. Cliquer sur "Deploy"
2. Attendre 2-3 minutes que le build se termine
3. Vercel génère une URL temporaire (ex: `etupedia.vercel.app`)

## Étape 5: Configurer le Domaine Personnalisé

### Option A: Domaine acheté sur Vercel
1. Dashboard → Settings → Domains
2. Cliquer "Add"
3. Entrer `etupedia.com`
4. Suivre les instructions DNS

### Option B: Domaine externe (GoDaddy, Namecheap, etc.)

1. **Dans Vercel Dashboard**:
   - Aller sur Settings → Domains
   - Cliquer "Add Domain"
   - Entrer `etupedia.com`
   - Vercel affichera les enregistrements DNS nécessaires

2. **Chez votre registrar de domaine**:

   Ajouter ces enregistrements DNS:

   **Pour apex domain (etupedia.com)**:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19
   TTL: 3600
   ```

   **Pour www (www.etupedia.com)**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

   **Alternative (recommandé)**:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Attendre la propagation DNS** (5 minutes à 48h, généralement ~30 min)

4. **Vérifier**:
   ```bash
   dig etupedia.com
   ```

## Étape 6: Configurer les Redirections

Dans Vercel Dashboard, les redirections sont déjà configurées via `vercel.json`:
- www → apex (ou inverse selon préférence)
- HTTPS automatique (SSL gratuit)

## Étape 7: Optimisations Post-Déploiement

### Analytics
Vercel Analytics est automatiquement activé (gratuit).

### Performance
- **Edge Network**: Automatique, CDN global
- **Image Optimization**: Next.js Image component automatiquement optimisé
- **Caching**: Headers configurés dans `vercel.json`

### Monitoring
1. Dashboard Vercel → Analytics
2. Voir les Core Web Vitals
3. Monitoring des erreurs

## Déploiements Automatiques

Chaque fois que vous pushez sur GitHub:

```bash
git add .
git commit -m "Update: votre message"
git push
```

Vercel déploiera automatiquement:
- **Branch `main`**: Production (etupedia.com)
- **Autres branches**: Preview deployments

## Commandes Utiles

### Déployer depuis CLI (optionnel)
```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Rollback
Si un déploiement pose problème:
1. Dashboard → Deployments
2. Trouver le déploiement précédent stable
3. Cliquer "Promote to Production"

## Troubleshooting

### Build Errors
- Vérifier les logs dans Vercel Dashboard
- Tester localement: `npm run build`

### Domain Not Working
- Vérifier DNS: `nslookup etupedia.com`
- Attendre propagation DNS (jusqu'à 48h)
- Vérifier configuration chez le registrar

### 404 Errors
- Les routes Next.js App Router sont automatiques
- Vérifier que les fichiers sont dans `app/`

## MCP (Model Context Protocol) - Vercel Integration

Note: Pour l'instant, Vercel n'a pas d'intégration MCP officielle dans Claude Code.
Le déploiement se fait via:
1. GitHub → Vercel (automatique)
2. Vercel CLI (manuel)
3. Vercel API (programmatique)

## Sécurité

- ✅ HTTPS automatique (Let's Encrypt)
- ✅ Headers de sécurité configurés (`vercel.json`)
- ✅ Environment variables sécurisées
- ✅ Rate limiting (à configurer si nécessaire)

## Support

- Documentation Vercel: https://vercel.com/docs
- Discord Vercel: https://vercel.com/discord
- Status: https://www.vercel-status.com/

## Récapitulatif

1. ✅ Pusher le code sur GitHub
2. ✅ Connecter GitHub à Vercel
3. ✅ Déployer (automatique)
4. ✅ Configurer le domaine etupedia.com
5. ✅ Attendre DNS (30 min)
6. ✅ Vérifier le site sur etupedia.com

**C'est tout ! Votre site est maintenant en ligne sur https://etupedia.com**
