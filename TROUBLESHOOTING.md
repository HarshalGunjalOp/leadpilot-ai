# Quick Fix Guide

## Common Issues & Solutions

### ❌ Error: Cannot find module './853.js' (or similar)

**Cause**: Next.js webpack cache corruption

**Solution**:
```bash
# Clean and restart
rm -rf .next && pnpm dev

# OR use the helper script
./scripts/clean-start.sh
```

---

### ❌ Error: No organization selected

**Cause**: Auth system expecting org but user has personal account

**Solution**: Already fixed in `src/lib/auth-helpers.ts`
- Now supports both personal and team accounts
- Uses `userId` as fallback for personal accounts

---

### ❌ 404 on Dashboard Pages

**Cause**: Pages didn't exist

**Solution**: All dashboard pages now created:
- `/dashboard/leads` ✅
- `/dashboard/icp` ✅
- `/dashboard/sequences` ✅
- `/dashboard/analytics` ✅
- `/dashboard/settings` ✅

---

### ❌ Buttons Don't Work

**Cause**: Missing API endpoints

**Solution**: All API routes now created:
- `/api/icp/create` ✅
- `/api/icp/list` ✅
- `/api/leads/generate` ✅
- `/api/create-subscription` ✅
- `/api/verify-subscription` ✅

---

## Quick Commands

### Development
```bash
# Clean start (recommended after pull)
rm -rf .next && pnpm dev

# Type check
pnpm run type-check

# Build for production
pnpm run build

# Start production server
pnpm start
```

### Database
```bash
# Generate Prisma client
pnpm prisma generate

# Push schema changes
pnpm prisma db push

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed
```

### Testing
```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

---

## Port Already in Use?

If you see "Port 3000 is in use":
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# OR let Next.js use 3001 (automatic)
# It will show: "trying 3001 instead"
```

---

## Nuclear Option (if nothing works)

```bash
# Delete everything and reinstall
rm -rf .next node_modules
pnpm install
pnpm prisma generate
pnpm dev
```

---

## Environment Issues

Check your `.env` file has all required variables:
```bash
# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Razorpay (Payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY=
NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY=

# Database
DATABASE_URL=

# OpenAI (optional)
OPENAI_API_KEY=
```

---

## Still Having Issues?

1. Check terminal output for specific errors
2. Check browser console for client-side errors
3. Clear browser cache and cookies
4. Try incognito/private browsing mode
5. Verify all environment variables are set

---

**Last Updated**: October 21, 2025
