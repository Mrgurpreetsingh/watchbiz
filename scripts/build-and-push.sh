#!/bin/bash
# 🚀 Build et Push Docker Image

set -e

# Variables
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-watchbiz}"
VERSION="${1:-latest}"
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"

echo "🔨 Building Docker image..."
echo "Registry: $REGISTRY"
echo "Image: $IMAGE_NAME"
echo "Version: $VERSION"
echo "Platform: $PLATFORM"

# Build multi-platform
docker buildx build \
  --platform "$PLATFORM" \
  --tag "$REGISTRY/$IMAGE_NAME:$VERSION" \
  --tag "$REGISTRY/$IMAGE_NAME:latest" \
  --push \
  .

echo "✅ Image pushed: $REGISTRY/$IMAGE_NAME:$VERSION"

# Security scan
echo "🔍 Running security scan..."
trivy image "$REGISTRY/$IMAGE_NAME:$VERSION"

echo "✨ Done!"
