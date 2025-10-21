# 🔧 Dashboard Header Credit Display Fix

## Issue
The dashboard header was showing a hardcoded "5 / 5 leads used" badge, even for new users with 0 leads generated.

## Root Cause
The `dashboard-header.tsx` component had a hardcoded badge:
```tsx
<Badge variant="secondary">
  <span className="text-xs">5 / 5 leads used</span>
</Badge>
```

## Solution
Made the header dynamic by:

1. **Fetching Real Credit Data** - Calls `/api/user/plan` to get actual usage
2. **Auto-Refresh** - Updates every 10 seconds to reflect changes
3. **Event-Based Updates** - Listens for `leadsUpdated` event for immediate updates
4. **Smart Display** - Shows different formats based on plan:
   - FREE: "X / 5 leads used"
   - PRO: "X / 1000 leads used"
   - ENTERPRISE: "X leads used" (unlimited)

## Changes Made

### 1. `/src/components/dashboard/dashboard-header.tsx`
```tsx
// Before: Hardcoded
<Badge variant="secondary">
  <span className="text-xs">5 / 5 leads used</span>
</Badge>

// After: Dynamic
{creditInfo ? (
  <Badge variant={creditInfo.used >= creditInfo.limit ? "destructive" : "secondary"}>
    <span className="text-xs">
      {creditInfo.limit === 999999 
        ? `${creditInfo.used} leads used`
        : `${creditInfo.used} / ${creditInfo.limit} leads used`
      }
    </span>
  </Badge>
) : (
  <Badge variant="secondary">
    <span className="text-xs">Loading...</span>
  </Badge>
)}
```

Features:
- ✅ Fetches actual credit usage from API
- ✅ Auto-refreshes every 10 seconds
- ✅ Listens for "leadsUpdated" custom event
- ✅ Shows red badge when limit reached
- ✅ Different display for unlimited plans

### 2. `/src/app/dashboard/leads/generate/page.tsx`
```tsx
// Emit event after successful lead generation
if (typeof window !== 'undefined') {
  window.dispatchEvent(new CustomEvent('leadsUpdated'));
}
```

This triggers immediate update in the header without waiting for the 10-second refresh.

## How It Works Now

### New User (0 leads)
```
Header shows: "0 / 5 leads used" ✅
Badge color: Secondary (gray) ✅
```

### After Generating 2 Leads
```
Header shows: "2 / 5 leads used" ✅
Badge color: Secondary (gray) ✅
Updates: Immediately via event + every 10 seconds ✅
```

### After Using All 5 Free Leads
```
Header shows: "5 / 5 leads used" ✅
Badge color: Destructive (red) ✅
```

### PRO Plan User
```
Header shows: "50 / 1000 leads used" ✅
Badge color: Secondary (gray) ✅
```

### Enterprise Plan User
```
Header shows: "500 leads used" ✅
Badge color: Secondary (gray) ✅
No limit displayed (unlimited) ✅
```

## Testing

### Test 1: Fresh Account
1. Sign in with new account
2. Check dashboard header
3. **Expected**: "0 / 5 leads used"

### Test 2: Generate Leads
1. Go to generate leads page
2. Generate 2 leads
3. **Expected**: Header immediately updates to "2 / 5 leads used"

### Test 3: Reach Limit
1. Generate remaining 3 leads
2. **Expected**: Header shows "5 / 5 leads used" in red badge

### Test 4: Auto-Refresh
1. Have dashboard open in one tab
2. Generate leads from another tab/window
3. **Expected**: Header updates within 10 seconds

## Benefits

1. **Accurate** - Shows real-time credit usage
2. **Responsive** - Updates immediately after lead generation
3. **User-Friendly** - Clear visual indicator (red when limit reached)
4. **Flexible** - Works for all plan types (FREE, PRO, ENTERPRISE)
5. **Reliable** - Auto-refreshes to catch any missed updates

## Summary

✅ **Before**: Hardcoded "5 / 5 leads used" for everyone
✅ **After**: Dynamic display showing actual usage (e.g., "0 / 5 leads used" for new users)
✅ **Updates**: Immediately on lead generation + every 10 seconds
✅ **Visual**: Red badge when limit reached, gray otherwise

The header now accurately reflects your actual lead usage!
