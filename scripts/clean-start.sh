#!/bin/bash

# Clean Next.js build cache and restart
# Use this script when you encounter module not found errors

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "🧹 Cleaning node_modules cache (optional)..."
# Uncomment if needed:
# rm -rf node_modules/.cache

echo "✅ Cache cleaned!"
echo "🚀 Starting dev server..."
pnpm dev
