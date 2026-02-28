# Plan 01 — RevenueCat / IAP Fix

## Problem
The RevenueCat SDK is installed (`react-native-purchases ^8.12.0`) but never initialized at app startup. Every purchase, restore, and subscription-sync call fails silently. Additionally, the Android API key is a placeholder and subscription expiry is never enforced locally.

## Scope
- `src/services/subscription-service.ts`
- `app/_layout.tsx`
- `src/constants/config.ts`
- `src/contexts/AppStateContext.tsx` (expiry check)

## Tasks

### 1. Call `initPurchases()` on app mount
- **File:** `app/_layout.tsx`
- In the root layout's `useEffect`, call `initPurchases()` before any other RC operation (before the foreground `getCustomerInfo` sync).
- Gate on platform: pass the iOS key on iOS, Android key on Android.
- Handle initialization failure gracefully (log, don't crash).

### 2. Replace placeholder API keys
- **File:** `src/constants/config.ts`
- Replace `REVENUECAT_API_KEY_ANDROID = "TODO_REPLACE_WITH_ANDROID_KEY"` with the real key.
- Confirm whether the iOS `test_` key needs to be swapped for a production key (check RevenueCat dashboard).
- **Action required from user:** Provide production API keys or confirm test keys are acceptable for now.

### 3. Add subscription expiry enforcement
- **File:** `src/services/subscription-service.ts` or a new `useSubscriptionSync` hook
- On app foreground (already in `_layout.tsx`), after `getCustomerInfo()` succeeds, compare `expires_at` with `Date.now()`.
- If expired and RC says not active, update `subscription_state` row: `is_premium = 0`, `status = 'expired'`.
- If RC call fails (offline), add a local-only fallback: check `expires_at` against current time. If past expiry + a grace period (e.g. 3 days), mark as expired locally.
- This prevents lapsed users from retaining premium indefinitely.

### 4. Verify purchase and restore flows end-to-end
- After init is wired, test in sandbox:
  - "Subscribe — $4.99/month" loads offerings and completes purchase.
  - "Restore purchases" finds existing entitlements.
  - Trial → conversion path works.
  - Foreground sync correctly updates local DB.

## Acceptance Criteria
- [ ] `initPurchases()` called once on app mount, before any RC operation
- [ ] No crash if RC init fails (offline / bad key)
- [ ] Android key is a real key (or clearly marked as needing user input)
- [ ] Subscription expiry is enforced: lapsed sub → `is_premium = 0`
- [ ] Sandbox purchase + restore succeed on iOS
- [ ] `pnpm run preflight` passes
