# 📱 WatchBiz PWA - Documentation

## Vue d'ensemble

WatchBiz est configuré comme une **Progressive Web App** (PWA), permettant aux utilisateurs d'installer l'application sur leur appareil mobile pour une expérience native.

---

## ✅ Fonctionnalités PWA

- **Installation sur écran d'accueil** - L'app s'installe comme une app native
- **Mode hors ligne** - Les pages visitées restent accessibles sans connexion
- **Cache intelligent** - Images, fonts, et API sont mis en cache
- **Performance optimisée** - Chargement rapide grâce au caching
- **Notifications** - Prêt pour les push notifications (à implémenter)

---

## 📦 Architecture

### 1. Service Worker

**Fichier**: Généré automatiquement dans `public/sw.js` lors du build

**Configuration**: `next.config.ts`

```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [...]
})
```

**Stratégies de cache**:
- **CacheFirst** - Fonts Google (1 an), Images (30 jours)
- **NetworkFirst** - API calls (5 min) avec fallback cache
- **StaleWhileRevalidate** - CSS/JS (24h) avec mise à jour en arrière-plan

### 2. Manifest

**Fichier**: `public/manifest.json`

Définit:
- Nom de l'app (`WatchBiz`)
- Couleurs (thème: `#d4af37` gold champagne)
- Icônes (72px à 512px)
- Display mode (`standalone` - plein écran sans navigateur)
- Screenshots pour l'app store

### 3. Icônes

**Génération**: `npm run generate-icons`

**Source**: `public/logo-source.png` (1024x1024)

**Output**: `public/icons/`
- `icon-{72,96,128,144,152,192,384,512}x{size}.png` - PWA icons
- `apple-touch-icon-{120,152,167,180}x{size}.png` - iOS icons
- `favicon.ico` - Favicon navigateur

**Script**: `scripts/generate-pwa-icons.ts`

### 4. Composant d'installation

**Fichier**: `components/pwa/install-prompt.tsx`

**Fonctionnalités**:
- Détection automatique de la possibilité d'installation
- Affichage d'une bannière élégante
- Gestion du localStorage (ne réaffiche pas avant 7 jours)
- Support Android (beforeinstallprompt) + instructions iOS

**Intégration**: `app/layout.tsx` ligne 53

---

## 🚀 Utilisation

### Développement

```bash
# PWA désactivée en dev pour éviter les problèmes de cache
npm run dev
```

### Production

```bash
# Build avec génération du service worker
npm run build

# Lancer le serveur de production
npm start

# Accéder à http://localhost:3000
```

### Génération des icônes

```bash
# 1. Placer votre logo (1024x1024) dans public/logo-source.png
# 2. Générer toutes les icônes
npm run generate-icons
```

---

## 📱 Installation Utilisateur

### Android (Chrome/Edge/Samsung Internet)

1. Visiter le site en HTTPS
2. Une bannière "Installer WatchBiz" apparaît automatiquement
3. Cliquer sur "Installer"
4. L'app s'installe sur l'écran d'accueil

**Alternative**: Menu → "Installer l'application" ou "Ajouter à l'écran d'accueil"

### iOS (Safari)

1. Visiter le site en HTTPS
2. Cliquer sur le bouton **Partager** (􀈂)
3. Sélectionner **"Sur l'écran d'accueil"**
4. Confirmer

**Note**: iOS ne supporte pas `beforeinstallprompt`, donc pas de bannière automatique. Le composant affiche des instructions manuelles sur iOS.

---

## 🧪 Tests

### Test d'installation

1. **Build**: `npm run build`
2. **Run**: `npm start`
3. **Accès mobile**: Ouvrir `http://<votre-ip>:3000` sur téléphone
4. **Installation**: Suivre les étapes ci-dessus

### Test hors ligne

1. Installer l'app
2. Naviguer sur plusieurs pages
3. Activer le mode avion
4. Rouvrir l'app
5. Les pages visitées doivent s'afficher

### Test du service worker (Chrome DevTools)

1. Ouvrir DevTools (F12)
2. Onglet **Application**
3. Section **Service Workers**
4. Vérifier que `sw.js` est enregistré et actif
5. Section **Cache Storage**
6. Vérifier les caches: `google-fonts`, `images`, `static-resources`, `api-cache`

### Lighthouse PWA Audit

```bash
# Dans Chrome DevTools
1. F12 → Onglet Lighthouse
2. Sélectionner "Progressive Web App"
3. Cliquer "Generate report"
4. Score attendu: 90-100/100
```

---

## 🔧 Configuration Avancée

### Ajouter une nouvelle stratégie de cache

`next.config.ts`:

```typescript
runtimeCaching: [
  // ... existing caches
  {
    urlPattern: /^https:\/\/votre-api\.com\/.*/i,
    handler: 'NetworkFirst', // ou CacheFirst, StaleWhileRevalidate
    options: {
      cacheName: 'mon-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 // 24h
      }
    }
  }
]
```

### Modifier les couleurs du thème

`public/manifest.json`:

```json
{
  "theme_color": "#d4af37",      // Couleur de la barre de statut
  "background_color": "#fffbf5"  // Couleur du splash screen
}
```

### Désactiver la PWA

`next.config.ts`:

```typescript
const withPWA = require('next-pwa')({
  disable: true, // Désactiver complètement
  // OU
  disable: process.env.NODE_ENV === 'development' // Seulement en dev (défaut)
})
```

---

## 📊 Métriques PWA

### Service Worker Cache

- **Fonts**: ~500 KB (Google Fonts)
- **Images**: Variable (max 64 images × ~200 KB)
- **Static**: ~2-5 MB (JS/CSS bundles)
- **API**: Variable (max 50 entrées)

**Total cache estimé**: 10-20 MB

### Performance

- **First Load**: 2-3s (réseau)
- **Repeat Load**: <1s (cache)
- **Offline Load**: <500ms (cache uniquement)

---

## 🐛 Troubleshooting

### Problème: Service worker ne se met pas à jour

**Solution**:
```javascript
// Dans DevTools → Application → Service Workers
// Cliquer sur "Update" ou "Unregister"
```

### Problème: Bannière d'installation ne s'affiche pas

**Causes possibles**:
- Déjà installé (vérifier mode standalone)
- Fermé il y a moins de 7 jours (localStorage)
- HTTPS requis (sauf localhost)
- iOS (pas de beforeinstallprompt)

**Debug**:
```javascript
// Vérifier si déjà installé
window.matchMedia('(display-mode: standalone)').matches // true si installé

// Réinitialiser localStorage
localStorage.removeItem('pwa-install-dismissed')
```

### Problème: Icônes ne s'affichent pas

**Vérifications**:
1. Les fichiers existent dans `public/icons/`
2. Le manifest pointe vers les bons chemins
3. Clear cache navigateur
4. Rebuild: `npm run build`

---

## 📚 Ressources

- **next-pwa**: https://github.com/shadowwalker/next-pwa
- **PWA Checklist**: https://web.dev/pwa-checklist/
- **Workbox** (cache strategies): https://developer.chrome.com/docs/workbox/
- **Web App Manifest**: https://web.dev/add-manifest/

---

## 🚀 Prochaines Étapes

### Push Notifications

1. Ajouter Firebase Cloud Messaging
2. Configurer les permissions
3. Créer un endpoint API pour envoyer des notifications
4. Tester sur mobile

### Offline Fallback

1. Créer une page `public/offline.html` personnalisée
2. Configurer dans `next.config.ts`:
   ```typescript
   {
     fallbackOnce: true,
     fallbacks: {
       document: '/offline'
     }
   }
   ```

### App Shortcuts

Ajouter dans `manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "Voir les montres",
      "url": "/products",
      "icons": [{"src": "/icons/shortcut-products.png", "sizes": "192x192"}]
    }
  ]
}
```

---

**Dernière mise à jour**: 2026-02-10
