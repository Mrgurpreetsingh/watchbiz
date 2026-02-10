# 🚀 Multi-Stage Dockerfile optimisé pour Next.js 15
# Image finale : ~120-150 MB (vs 1+ GB non optimisé)

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

# Copier seulement les fichiers de dépendances
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Installer les dépendances en mode production
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Générer le client Prisma
RUN npx prisma generate

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder
WORKDIR /app

# Copier node_modules du stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement de build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js avec standalone output (optimisé)
RUN npm run build

# ============================================
# Stage 3: Runner (Image finale ultra-légère)
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer utilisateur non-root pour sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier seulement les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier Prisma pour migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Passer à l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "server.js"]
