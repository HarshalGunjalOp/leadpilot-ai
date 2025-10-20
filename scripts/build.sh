#!/usr/bin/env bash

echo "🚀 Deploying to Vercel..."

# Build project
echo "📦 Building project..."
pnpm build

# Run migrations (for preview/production)
if [ "$VERCEL_ENV" = "production" ] || [ "$VERCEL_ENV" = "preview" ]; then
  echo "🗄️  Running database migrations..."
  pnpm db:push
fi

echo "✅ Build complete!"
