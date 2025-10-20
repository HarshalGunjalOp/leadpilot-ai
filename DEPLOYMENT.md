# Vercel Configuration

This file configures deployment settings for Vercel.

## Build Settings

- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Development Command**: `pnpm dev`

## Environment Variables

Add these in Vercel dashboard:

### Required
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY`
- `NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### Optional
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Database

Use Neon (recommended) or Supabase for PostgreSQL:
- Neon: https://neon.tech
- Supabase: https://supabase.com

## Webhooks

After deploying, update Razorpay webhook URL to:
```
https://your-domain.vercel.app/api/webhooks/razorpay
```
