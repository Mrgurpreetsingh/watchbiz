# Kubernetes Deployment - WatchBiz

Configuration Kubernetes pour déployer WatchBiz sur un cluster K8s.

---

## 📁 Structure

```
k8s/
├── base/                           # Configuration de base
│   ├── namespace.yaml              # Namespace watchbiz
│   ├── app-deployment.yaml         # Déploiement Next.js
│   ├── postgres-deployment.yaml    # PostgreSQL StatefulSet
│   ├── redis-deployment.yaml       # Redis pour cache/sessions
│   ├── configmap.yaml              # Variables non-sensibles
│   ├── secrets.example.yaml        # ⚠️ TEMPLATE - À copier
│   ├── ingress.yaml                # Ingress NGINX
│   └── kustomization.yaml          # Kustomize base
│
└── overlays/                       # Overlays par environnement
    ├── dev/                        # Développement
    │   ├── deployment-patch.yaml
    │   └── kustomization.yaml
    └── prod/                       # Production
        ├── deployment-patch.yaml
        └── kustomization.yaml
```

---

## 🔐 Configuration des Secrets

### ⚠️ IMPORTANT - Avant le Premier Déploiement

**Le fichier `secrets.yaml` est IGNORÉ par git** pour protéger vos credentials.

### 1. Créer votre fichier secrets.yaml

```bash
# Copier le template
cp k8s/base/secrets.example.yaml k8s/base/secrets.yaml

# Éditer avec vos vraies valeurs
nano k8s/base/secrets.yaml
```

### 2. Remplacer les Placeholders

**Fichier:** `k8s/base/secrets.yaml`

```yaml
stringData:
  # Database - CHANGEZ "change-me-in-production"
  POSTGRES_PASSWORD: "VotreSuperMotDePasseSecurise123!"
  DATABASE_URL: "postgresql://watchbiz:VotreSuperMotDePasseSecurise123!@postgres-service:5432/watchbiz"

  # NextAuth - Générez un secret
  NEXTAUTH_SECRET: "$(openssl rand -base64 32)"
  NEXTAUTH_URL: "https://votre-domaine.com"

  # Stripe - Clés PRODUCTION
  STRIPE_SECRET_KEY: "sk_live_VOTRE_CLE_SECRETE"
  STRIPE_WEBHOOK_SECRET: "whsec_VOTRE_WEBHOOK_SECRET"

  # Redis
  REDIS_PASSWORD: "UnAutreMotDePasseSecurise456!"
  REDIS_URL: "redis://:UnAutreMotDePasseSecurise456!@redis-service:6379"
```

### 3. Générer un NEXTAUTH_SECRET

```bash
# Générer un secret aléatoire (32+ caractères)
openssl rand -base64 32

# OU
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Obtenir vos Clés Stripe

1. **Dashboard Stripe**: https://dashboard.stripe.com/apikeys
2. **Production Keys**:
   - Secret key: `sk_live_...`
   - Publishable key: `pk_live_...`
3. **Webhook Secret**:
   - Créer webhook: `https://votre-domaine.com/api/webhooks/stripe`
   - Copier signing secret: `whsec_...`

---

## 🚀 Déploiement

### Prérequis

```bash
# Installer kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Installer kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
```

### Déploiement Development

```bash
# Appliquer la configuration dev
kubectl apply -k k8s/overlays/dev

# Vérifier le déploiement
kubectl get pods -n watchbiz
kubectl get services -n watchbiz

# Voir les logs
kubectl logs -f deployment/watchbiz-app -n watchbiz
```

### Déploiement Production

```bash
# ⚠️ VÉRIFIEZ vos secrets avant de déployer!
cat k8s/base/secrets.yaml

# Appliquer la configuration prod
kubectl apply -k k8s/overlays/prod

# Vérifier
kubectl get all -n watchbiz
```

---

## 🔒 Sécurité Avancée - Sealed Secrets (Recommandé)

Pour une sécurité maximale, utilisez **Sealed Secrets** au lieu de Secrets en clair.

### 1. Installer Sealed Secrets Controller

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.18.0/controller.yaml

# Installer CLI kubeseal
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.18.0/kubeseal-linux-amd64 -O kubeseal
chmod +x kubeseal
sudo mv kubeseal /usr/local/bin/
```

### 2. Créer un Sealed Secret

```bash
# Créer le secret (temporaire)
kubectl create secret generic watchbiz-secrets \
  --from-literal=POSTGRES_PASSWORD='VotreMotDePasse' \
  --from-literal=NEXTAUTH_SECRET='VotreSecret' \
  --dry-run=client -o yaml > /tmp/secret.yaml

# Sceller le secret (peut être commité)
kubeseal -f /tmp/secret.yaml -w k8s/base/sealed-secrets.yaml

# Supprimer le fichier temporaire
rm /tmp/secret.yaml

# Appliquer le sealed secret
kubectl apply -f k8s/base/sealed-secrets.yaml
```

### 3. Modifier kustomization.yaml

```yaml
# k8s/base/kustomization.yaml
resources:
  - namespace.yaml
  - sealed-secrets.yaml  # Au lieu de secrets.yaml
  - app-deployment.yaml
  # ...
```

---

## 📊 Monitoring

### Vérifier l'État

```bash
# Tous les ressources
kubectl get all -n watchbiz

# Secrets (liste uniquement)
kubectl get secrets -n watchbiz

# ConfigMaps
kubectl get configmaps -n watchbiz

# Ingress
kubectl get ingress -n watchbiz
```

### Logs

```bash
# App logs
kubectl logs -f deployment/watchbiz-app -n watchbiz

# PostgreSQL logs
kubectl logs -f statefulset/postgres -n watchbiz

# Redis logs
kubectl logs -f deployment/redis -n watchbiz

# Logs d'un pod spécifique
kubectl logs POD_NAME -n watchbiz
```

### Debug

```bash
# Shell dans le pod
kubectl exec -it POD_NAME -n watchbiz -- /bin/sh

# Port-forward pour accès local
kubectl port-forward svc/watchbiz-app 3000:3000 -n watchbiz

# Describe resource
kubectl describe pod POD_NAME -n watchbiz
```

---

## 🔄 Mise à Jour

### Redéployer après modification

```bash
# Rebuild l'image Docker
docker build -t watchbiz:latest .
docker tag watchbiz:latest your-registry/watchbiz:latest
docker push your-registry/watchbiz:latest

# Restart le déploiement
kubectl rollout restart deployment/watchbiz-app -n watchbiz

# Vérifier le rollout
kubectl rollout status deployment/watchbiz-app -n watchbiz
```

### Rollback

```bash
# Voir l'historique
kubectl rollout history deployment/watchbiz-app -n watchbiz

# Rollback vers version précédente
kubectl rollout undo deployment/watchbiz-app -n watchbiz

# Rollback vers version spécifique
kubectl rollout undo deployment/watchbiz-app --to-revision=2 -n watchbiz
```

---

## 🗑️ Nettoyage

```bash
# Supprimer tout le namespace (⚠️ DESTRUCTIF)
kubectl delete namespace watchbiz

# OU supprimer par overlay
kubectl delete -k k8s/overlays/dev
```

---

## 📝 Checklist Déploiement

### Avant le Premier Déploiement

- [ ] ✅ Copié `secrets.example.yaml` → `secrets.yaml`
- [ ] ✅ Remplacé tous les placeholders `change-me-in-production`
- [ ] ✅ Généré NEXTAUTH_SECRET (32+ caractères)
- [ ] ✅ Configuré clés Stripe PRODUCTION
- [ ] ✅ Configuré webhook Stripe
- [ ] ✅ Vérifié DATABASE_URL
- [ ] ✅ Configuré Ingress avec votre domaine
- [ ] ✅ Configuré certificat SSL/TLS (Let's Encrypt)
- [ ] ✅ Testé en dev d'abord (`overlays/dev`)

### Post-Déploiement

- [ ] ✅ Pods running: `kubectl get pods -n watchbiz`
- [ ] ✅ Services accessibles
- [ ] ✅ Ingress configuré correctement
- [ ] ✅ Database migrations exécutées
- [ ] ✅ Logs sans erreur
- [ ] ✅ Test smoke sur production
- [ ] ✅ Webhook Stripe fonctionnel

---

## 🆘 Troubleshooting

### Pod en CrashLoopBackOff

```bash
# Voir les logs
kubectl logs POD_NAME -n watchbiz --previous

# Describe le pod
kubectl describe pod POD_NAME -n watchbiz

# Causes communes:
# - Secrets mal configurés
# - Database inaccessible
# - Migrations non exécutées
```

### Database Connection Failed

```bash
# Vérifier le service PostgreSQL
kubectl get svc postgres-service -n watchbiz

# Vérifier le pod PostgreSQL
kubectl logs statefulset/postgres -n watchbiz

# Tester la connexion depuis le pod app
kubectl exec -it POD_NAME -n watchbiz -- psql $DATABASE_URL
```

### Ingress ne fonctionne pas

```bash
# Vérifier Ingress Controller installé
kubectl get pods -n ingress-nginx

# Vérifier l'Ingress
kubectl describe ingress watchbiz-ingress -n watchbiz

# Vérifier les endpoints
kubectl get endpoints -n watchbiz
```

---

## 📚 Ressources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Guide](https://kustomize.io/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

---

**⚠️ RAPPEL SÉCURITÉ:**

- **JAMAIS** commiter `secrets.yaml` avec de vraies valeurs
- Utiliser Sealed Secrets ou un vault (Vault, AWS Secrets Manager)
- Rotationner les secrets régulièrement
- Limiter les accès RBAC au namespace
- Activer Network Policies

---

**Dernière mise à jour:** 2026-02-10
