#!/bin/bash
# ☸️ Deploy to Kubernetes

set -e

# Variables
ENV="${1:-dev}"
NAMESPACE="${NAMESPACE:-watchbiz}"

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
  echo "❌ Usage: ./deploy-k8s.sh [dev|prod]"
  exit 1
fi

echo "🚀 Deploying to $ENV environment..."

# Apply Kustomize overlay
kubectl apply -k "k8s/overlays/$ENV"

echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/watchbiz-app -n "$NAMESPACE" --timeout=5m

echo "📊 Checking pods..."
kubectl get pods -n "$NAMESPACE"

echo "🔍 Running health check..."
kubectl exec -n "$NAMESPACE" deployment/watchbiz-app -- wget -O- http://localhost:3000/api/health

echo "✅ Deployment successful!"
echo ""
echo "📝 Next steps:"
echo "  - Check logs: kubectl logs -f deployment/watchbiz-app -n $NAMESPACE"
echo "  - Port forward: kubectl port-forward -n $NAMESPACE svc/watchbiz-app-service 3000:80"
