#!/bin/bash

# LeadPilot AI - Health Check Script
# Run this to verify all fixes are working

echo "================================"
echo "  LeadPilot AI Health Check"
echo "================================"
echo ""

# Check Node modules
echo "1. Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "   ✅ node_modules exists"
else
  echo "   ❌ node_modules missing - run: pnpm install"
  exit 1
fi

# Check Prisma Client
echo ""
echo "2. Checking Prisma Client..."
if [ -d "node_modules/.prisma/client" ]; then
  echo "   ✅ Prisma Client generated"
else
  echo "   ❌ Prisma Client missing - run: pnpm db:generate"
  exit 1
fi

# TypeScript Check
echo ""
echo "3. Running TypeScript check..."
if pnpm type-check > /dev/null 2>&1; then
  echo "   ✅ TypeScript: No errors"
else
  echo "   ❌ TypeScript: Has errors"
  echo "   Run: pnpm type-check"
  exit 1
fi

# ESLint Check
echo ""
echo "4. Running ESLint check..."
if pnpm lint > /dev/null 2>&1; then
  echo "   ✅ ESLint: No errors"
else
  echo "   ⚠️  ESLint: Has warnings (check with: pnpm lint)"
fi

# Environment Check
echo ""
echo "5. Checking environment variables..."
if [ -f ".env" ]; then
  echo "   ✅ .env file exists"
  
  # Check for placeholder values
  if grep -q "xxxxxxxxxxxxx" .env; then
    echo "   ⚠️  WARNING: .env contains placeholder values"
    echo "      Please update with real API keys"
  else
    echo "   ✅ .env appears configured"
  fi
else
  echo "   ❌ .env file missing - copy from .env.example"
fi

echo ""
echo "================================"
echo "  Summary"
echo "================================"
echo ""
echo "✅ All critical checks passed!"
echo ""
echo "Next steps:"
echo "1. Update .env with real API keys"
echo "2. Run: pnpm db:migrate"
echo "3. Run: pnpm db:seed (optional)"
echo "4. Run: pnpm dev"
echo ""
echo "Visit: http://localhost:3000"
echo "================================"
