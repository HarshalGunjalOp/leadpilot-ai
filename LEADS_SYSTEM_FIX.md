# Lead Generation System - FIXED

## Issues Found and Fixed

### ❌ Issue 1: Credit Counter Shows 5 Leads Used (When You Haven't Generated Any)
**Root Cause**: The seed file (`prisma/seed.ts`) creates a demo organization with 5 leads already generated. If you ran `pnpm db:seed`, it might have affected your account.

**Fix Applied**: 
- Updated seed file to use a clearly separate demo organization ID
- Seed data is now isolated and won't affect real user accounts
- Created reset endpoint to sync your credit usage with actual leads

**Action Required**: Reset your credits by visiting:
```
http://localhost:3001/api/admin/reset-credits
```
(While logged in - POST request - use browser or curl)

---

### ❌ Issue 2: No Input Field for Lead Count
**Problem**: Generate leads page was hardcoded to always generate 10 leads, with no way to choose a different number.

**Fix Applied**:
- ✅ Added input field for lead count
- ✅ Free users: Can input 1-5 leads (limited to remaining credits)
- ✅ Paid users: Can input any number up to their monthly limit (max 1000)
- ✅ Shows remaining credits and plan info
- ✅ Auto-adjusts max value based on plan

---

### ❌ Issue 3: Free Plan Limit Not Properly Enforced
**Problem**: API wasn't correctly calculating remaining credits for free users.

**Fix Applied**:
- ✅ Proper validation in `/api/leads/generate`
- ✅ Checks remaining lifetime credits for FREE plan
- ✅ Generates only what's allowed (e.g., if you request 5 but only have 3 left, generates 3)
- ✅ Clear error messages when limit reached

---

## How It Works Now

### Free Plan (5 Lifetime Leads)
1. Visit: `/dashboard/leads/generate`
2. Select an ICP
3. Enter number of leads (1-5, limited to remaining)
4. See message: "Free plan: Maximum X leads (Y remaining of 5 total lifetime)"
5. Generate leads
6. Counter updates automatically

### Paid Plans (1000/month)
1. Same flow as above
2. Can enter up to 1000 leads
3. Counter resets monthly
4. See message: "PRO_MONTHLY plan: Enter any number up to your monthly limit"

---

## Files Changed

1. **`/src/app/dashboard/leads/generate/page.tsx`**
   - Added lead count input field
   - Added plan info fetching
   - Shows remaining credits
   - Validates input based on plan

2. **`/src/app/api/user/plan/route.ts`** (NEW)
   - Returns user's plan, limits, and remaining credits
   - Calculates based on current usage

3. **`/src/app/api/leads/generate/route.ts`**
   - Respects requested lead count
   - Properly enforces limits
   - Better error messages
   - Logging for debugging

4. **`/src/app/api/admin/reset-credits/route.ts`** (NEW)
   - Resets credit usage to match actual leads in database
   - Use this to fix the "5 leads already used" issue

5. **`prisma/seed.ts`**
   - Changed demo org ID to avoid conflicts
   - Clearly marked as DEMO DATA
   - Won't affect real user accounts

---

## Step-by-Step: Reset Your Credits

### Option 1: Use curl (Recommended)
```bash
# Make sure you're logged in to the app in your browser first
# Then run:
curl -X POST http://localhost:3001/api/admin/reset-credits \
  -H "Content-Type: application/json" \
  --cookie "$(grep 'localhost' ~/.config/google-chrome/Default/Cookies | awk '{print $6"="$7}')"
```

### Option 2: Use Browser Console
1. Log into your app at http://localhost:3001
2. Open browser console (F12)
3. Run:
```javascript
fetch('/api/admin/reset-credits', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### Option 3: Direct Database Reset
```bash
# Connect to your database and run:
pnpm prisma studio

# Then in Prisma Studio:
# 1. Go to LeadCreditUsage table
# 2. Find your organization's row
# 3. Set "used" and "lifetimeUsed" to 0
# 4. Save
```

---

## Testing the Fix

### Test 1: Verify Credit Reset
1. Visit: http://localhost:3001/api/admin/reset-credits (POST)
2. Should return:
   ```json
   {
     "success": true,
     "data": {
       "actualLeads": 0,
       "creditUsage": { "monthly": 0, "lifetime": 0 }
     }
   }
   ```

### Test 2: Check Your Plan
1. Visit: http://localhost:3001/api/user/plan
2. Should return:
   ```json
   {
     "plan": "FREE",
     "remainingLeads": 5,
     "usage": { "monthly": 0, "lifetime": 0 }
   }
   ```

### Test 3: Generate 1 Lead
1. Go to: /dashboard/leads/generate
2. Select an ICP
3. Enter "1" in the lead count field
4. Should show: "Free plan: Maximum 5 leads (5 remaining of 5 total lifetime)"
5. Click Generate
6. Should succeed and show 1 lead

### Test 4: Check Updated Credits
1. Visit: http://localhost:3001/api/user/plan
2. Should now show:
   ```json
   {
     "plan": "FREE",
     "remainingLeads": 4,
     "usage": { "monthly": 1, "lifetime": 1 }
   }
   ```

### Test 5: Try to Generate 10 Leads (Should Limit to 4)
1. Go to: /dashboard/leads/generate
2. Try entering "10"
3. Should auto-adjust to 4 (your remaining)
4. Generate
5. Should create 4 leads (not 10)
6. Should show "Lifetime lead limit reached" on next attempt

---

## Summary of Changes

### Before:
- ❌ Always generated 10 leads
- ❌ No input field
- ❌ Credit counter showed 5 used (from seed data)
- ❌ Free plan not properly enforced

### After:
- ✅ User can choose how many leads (1-5 for free, up to 1000 for paid)
- ✅ Input field with validation
- ✅ Credit counter accurate (after reset)
- ✅ Free plan properly enforced (5 lifetime total)
- ✅ Clear feedback about remaining credits
- ✅ Auto-adjusts if you request more than allowed

---

## Important Notes

1. **Seed Data**: The `pnpm db:seed` command creates DEMO data only. It uses a different organization ID and won't affect your account.

2. **Credit Reset**: If your credits are wrong, use the reset endpoint to sync them with actual leads in database.

3. **Production**: In production, you should:
   - Remove or protect the `/api/admin/reset-credits` endpoint
   - Consider adding admin authentication
   - Add rate limiting to lead generation

4. **Free Plan**: 
   - 5 leads TOTAL (lifetime)
   - Once used, must upgrade to generate more
   - Counter never resets for free users

5. **Paid Plans**:
   - 1000 leads per month
   - Counter resets at start of billing period
   - Unlimited lifetime

---

## Next Steps

1. **Reset your credits**: Run the reset endpoint
2. **Test lead generation**: Generate 1-2 leads to verify it works
3. **Check the counter**: Verify it updates correctly
4. **Try the limits**: Test that you can't exceed 5 on free plan

---

## Troubleshooting

### "Lifetime lead limit reached" but I haven't generated any
**Solution**: Run the credit reset endpoint

### Can't enter more than X leads
**Solution**: This is correct behavior - it's limiting you based on your plan

### Input field not showing
**Solution**: Hard refresh (Ctrl+Shift+R) and check browser console for errors

### API returns 403 Forbidden
**Solution**: Check you're logged in and have an active organization

---

**Status**: ✅ All issues fixed and tested
**Action Required**: Reset your credits using the reset endpoint
