# 🌟 WatchBiz - E-commerce de Montres de Luxe

E-commerce moderne fullstack développé avec les dernières technologies web.

## 🚀 Stack Technique

### Frontend
- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Icônes modernes
- **Zustand** - Gestion d'état (panier)

### Backend
- **Next.js API Routes** - API REST
- **Prisma ORM** - ORM moderne pour PostgreSQL
- **NextAuth.js v5** - Authentification
- **Stripe** - Paiement en ligne

### Base de données
- **PostgreSQL** - Base de données relationnelle

## 📁 Structure du Projet

```
watchbiz/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Routes d'authentification
│   ├── (shop)/              # Routes boutique
│   ├── admin/               # Dashboard admin
│   ├── api/                 # API Routes
│   ├── layout.tsx           # Layout racine
│   ├── page.tsx             # Page d'accueil
│   └── globals.css          # Styles globaux
├── components/              # Composants React
│   ├── ui/                 # Composants UI réutilisables
│   ├── layout/             # Header, Footer, etc.
│   └── features/           # Composants métier
├── lib/                     # Utilitaires et config
│   ├── prisma.ts           # Client Prisma
│   ├── utils.ts            # Helpers
│   └── store/              # Zustand stores
├── types/                   # Types TypeScript
├── hooks/                   # Custom React hooks
├── actions/                 # Server Actions
├── prisma/                  # Schéma Prisma
│   └── schema.prisma
├── public/                  # Assets statiques
└── .env.local              # Variables d'environnement
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou pnpm

### Étapes

1. **Cloner le projet**
```bash
git clone <repo-url>
cd watchbiz
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**
```bash
# Créer une base PostgreSQL
createdb watchbiz

# Copier .env.example vers .env.local
cp .env.example .env.local

# Modifier DATABASE_URL dans .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/watchbiz"
```

4. **Initialiser Prisma**
```bash
npm run db:generate
npm run db:push
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponibles

- `npm run dev` - Lancer le serveur de développement (avec Turbopack)
- `npm run build` - Build de production
- `npm start` - Lancer le serveur de production
- `npm run lint` - Linter le code
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la BDD
- `npm run db:studio` - Ouvrir Prisma Studio

## 🎯 Fonctionnalités à Implémenter

- [ ] Authentification (NextAuth + JWT)
- [ ] Catalogue de produits avec filtres
- [ ] Panier d'achat (Zustand)
- [ ] Processus de commande
- [ ] Paiement Stripe
- [ ] Dashboard admin
- [ ] Gestion des produits (CRUD)
- [ ] Gestion des commandes
- [ ] Reviews et ratings
- [ ] Recherche avancée
- [ ] SEO optimisé
- [ ] PWA (Progressive Web App)
- [ ] Tests (Jest + Playwright)
- [ ] CI/CD (GitHub Actions)

## 🗄️ Schéma de Base de Données

Le schéma Prisma inclut :
- **Users** - Utilisateurs et admins
- **Products** - Produits (montres)
- **Categories** - Catégories
- **Brands** - Marques
- **Orders** - Commandes
- **OrderItems** - Articles de commande
- **Reviews** - Avis clients
- **Addresses** - Adresses de livraison

## 🔐 Variables d'Environnement

Voir [.env.example](.env.example) pour la liste complète.

## 🤝 Contribution

Ce projet est un portfolio personnel démontrant des compétences fullstack modernes.

## 📝 License

MIT

---

**Développé avec ❤️ pour démontrer des compétences fullstack modernes**
