#!/usr/bin/env bash
set -e

echo "🚀 Setting up LeadPilot AI..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required. Install with: npm install -g pnpm"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check for .env file
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copying .env.example..."
  cp .env.example .env
  echo "✅ Created .env file. Please fill in your credentials before running the app."
  exit 0
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm db:generate

# Run migrations
echo "🗄️  Running database migrations..."
pnpm db:migrate || {
  echo "⚠️  Migration failed. Please check your DATABASE_URL in .env"
  exit 1
}

# Seed database
echo "🌱 Seeding database..."
pnpm db:seed || {
  echo "⚠️  Seeding failed, but you can continue."
}

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env with your Clerk, Stripe, and OpenAI credentials"
echo "  2. Run 'pnpm dev' to start the development server"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "For Stripe webhooks (development):"
echo "  stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo ""
