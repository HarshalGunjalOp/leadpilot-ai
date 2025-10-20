# 🔄 Stripe → Razorpay Migration

## Summary

Successfully replaced **Stripe** billing integration with **Razorpay** across the entire LeadPilot AI codebase.

---

## Changes Made

### 1. **Dependencies**
- ✅ Removed: `stripe@^14.21.0`
- ✅ Added: `razorpay@^2.8.1`
- ✅ Ran: `pnpm install`

### 2. **Core Library**
- ✅ Created `src/lib/razorpay.ts`:
  - `createOrder()` - Create Razorpay payment orders
  - `verifySignature()` - Verify webhook signatures using HMAC-SHA256
  - `createCustomer()` - Placeholder customer creation
  - Exports Razorpay instance

- ✅ Updated `src/lib/stripe.ts`:
  - Now a compatibility shim that wraps Razorpay functions
  - Maintains same API so existing imports don't break
  - Functions: `createCheckoutSession()`, `createBillingPortalSession()`, `createCustomer()`

### 3. **Webhook Handler**
- ✅ Updated `src/app/api/webhooks/stripe/route.ts` (keeping path for compatibility):
  - Changed signature verification to use Razorpay's `x-razorpay-signature` header
  - Updated event handling:
    - `subscription.activated` / `subscription.charged` / `subscription.updated` → `handleSubscriptionChange()`
    - `subscription.cancelled` → `handleSubscriptionDeleted()`
    - `payment.captured` → `handlePaymentSucceeded()`
    - `payment.failed` → `handlePaymentFailed()`
  - Removed all `Stripe` namespace type references
  - Used `any` types for Razorpay payloads with eslint-disable comments

- ✅ Created `src/app/api/webhooks/razorpay/route.ts` that re-exports the handler

### 4. **Configuration**
- ✅ Updated `src/config/plans.ts`:
  - Changed `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` → `NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY`
  - Changed `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY` → `NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY`

### 5. **Environment Variables**
- ✅ Updated `.env.example`:
  ```diff
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
  - NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
  + RAZORPAY_KEY_ID
  + RAZORPAY_KEY_SECRET
  + RAZORPAY_WEBHOOK_SECRET
  + NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY
  + NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY
  ```

- ✅ Updated `.env` with Razorpay placeholders

### 6. **Documentation**
- ✅ **README.md**:
  - Updated prerequisites to mention Razorpay instead of Stripe
  - Updated setup instructions for Razorpay dashboard
  - Changed webhook URL from `/api/webhooks/stripe` → `/api/webhooks/razorpay`
  - Updated environment variable examples
  
- ✅ **DEPLOYMENT.md**:
  - Updated webhook URL to Razorpay endpoint
  - Updated required environment variables list
  
- ✅ **PROJECT_SUMMARY.md**:
  - Updated billing section to mention Razorpay
  - Updated service references
  
- ✅ **CHANGELOG.md**:
  - Updated to reflect Razorpay integration

- ✅ **FIXES_APPLIED.md**:
  - Replaced "Stripe API version" fix with "Razorpay migration" section

---

## Database Schema

**Note:** Database field names (`stripeCustomerId`, `stripeSubId`) were **kept as-is** for backward compatibility. These fields now store Razorpay customer IDs and subscription IDs. No migration needed.

---

## Verification

✅ **TypeScript Check**: `pnpm type-check` - **PASSED** (0 errors)  
✅ **ESLint**: `pnpm lint` - **PASSED** (0 warnings or errors)  
✅ **Dependencies**: `pnpm install` - **SUCCESS** (razorpay added, stripe removed)

---

## What You Need to Do

### 1. Get Razorpay Credentials
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate **Test** and **Live** keys
4. Copy:
   - `Key ID` → `RAZORPAY_KEY_ID`
   - `Key Secret` → `RAZORPAY_KEY_SECRET`

### 2. Create Razorpay Plans
1. Go to Dashboard → Subscriptions → Plans
2. Create **Pro Monthly** plan:
   - Amount: ₹3,999 (or your preferred amount)
   - Interval: 1 month
   - Copy Plan ID → `NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY`
3. Create **Pro Yearly** plan:
   - Amount: ₹38,999 (20% discount)
   - Interval: 12 months
   - Copy Plan ID → `NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY`

### 3. Setup Webhook
1. Go to Dashboard → Settings → Webhooks
2. Add webhook endpoint:
   - **Development**: `http://localhost:3000/api/webhooks/razorpay` (use ngrok/localtunnel)
   - **Production**: `https://your-domain.vercel.app/api/webhooks/razorpay`
3. Select events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.updated`
   - `subscription.cancelled`
   - `payment.captured`
   - `payment.failed`
4. Copy webhook secret → `RAZORPAY_WEBHOOK_SECRET`

### 4. Update .env
Replace placeholder values in `.env`:
```bash
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_KEY_SECRET"
RAZORPAY_WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"
NEXT_PUBLIC_RZP_PLAN_PRO_MONTHLY="plan_YOUR_MONTHLY_PLAN_ID"
NEXT_PUBLIC_RZP_PLAN_PRO_YEARLY="plan_YOUR_YEARLY_PLAN_ID"
```

### 5. Test the Integration
```bash
# Start dev server
pnpm dev

# Test flow:
# 1. Sign up → Create org
# 2. Go to pricing page
# 3. Click "Upgrade to Pro"
# 4. Should redirect to Razorpay checkout
# 5. Complete test payment
# 6. Webhook should update subscription status
# 7. Check dashboard - should show Pro plan
```

---

## Breaking Changes

### ❌ Removed Stripe Functions
The following are no longer available:
- `createBillingPortalSession()` - Razorpay doesn't have a billing portal; redirects to `/dashboard/settings/billing`
- `cancelSubscription()` - Implement via Razorpay API if needed
- `resumeSubscription()` - Implement via Razorpay API if needed

### ⚠️ Payment Flow Changes
- **Before (Stripe)**: Checkout sessions with automatic subscription management
- **After (Razorpay)**: Order-based payments; subscriptions managed via Razorpay Subscriptions API

### 🔄 Webhook Event Mapping

| Stripe Event | Razorpay Event |
|--------------|----------------|
| `customer.subscription.created` | `subscription.activated` |
| `customer.subscription.updated` | `subscription.updated` |
| `customer.subscription.deleted` | `subscription.cancelled` |
| `invoice.payment_succeeded` | `payment.captured` |
| `invoice.payment_failed` | `payment.failed` |

---

## Currency Note

- **Stripe** uses cents (e.g., `$4900` = $49.00)
- **Razorpay** uses paise (e.g., `499900` paise = ₹4,999.00)

Update pricing accordingly in your plans configuration.

---

## Rollback Instructions

If you need to revert to Stripe:

```bash
# 1. Restore Stripe dependency
pnpm add stripe@^14.21.0
pnpm remove razorpay

# 2. Restore original files from git
git checkout HEAD -- src/lib/stripe.ts
git checkout HEAD -- src/app/api/webhooks/stripe/route.ts
git checkout HEAD -- src/config/plans.ts
git checkout HEAD -- .env.example

# 3. Update environment variables back to Stripe
# (see git history for original values)

# 4. Reinstall and check
pnpm install
pnpm type-check
pnpm lint
```

---

## Support

- **Razorpay Docs**: https://razorpay.com/docs
- **Subscriptions Guide**: https://razorpay.com/docs/payments/subscriptions
- **Webhooks Guide**: https://razorpay.com/docs/webhooks
- **API Reference**: https://razorpay.com/docs/api

---

**Migration completed successfully! ✅**

All TypeScript errors resolved. All ESLint checks passed. Ready for Razorpay integration testing.
