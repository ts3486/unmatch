# Plan 04 — Analytics: Integrate a Real Backend

## Problem
`src/services/analytics.ts` always returns `NoopAnalyticsAdapter`. No analytics SDK is installed. Every `analytics.track()` call across the entire app discards data silently. Zero business telemetry is collected.

## Scope
- `src/services/analytics.ts`
- `package.json` (new dependency)
- `app/_layout.tsx` (initialization)
- Possibly `app.config.ts` / `app.json` (plugin config)

## Decision Required
**Which analytics backend to use?** Options:

| Option | Pros | Cons |
|--------|------|------|
| **PostHog** | Privacy-focused, self-hostable, Expo SDK exists | Requires account setup |
| **Firebase Analytics** | Free, Google ecosystem, well-documented | Google dependency, privacy concerns |
| **Amplitude** | Strong mobile analytics, generous free tier | Heavier SDK |
| **Mixpanel** | Event-based model fits our design | Paid after free tier |

The existing code already defines all event types, names, and privacy guards. The only work is writing a real `AnalyticsAdapter` implementation and swapping it in.

## Tasks

### 1. Choose and install analytics SDK
- Install the chosen SDK (`expo-firebase-analytics`, `posthog-react-native`, etc.).
- Add any required Expo config plugin entries.

### 2. Implement a real `AnalyticsAdapter`
- **File:** `src/services/analytics.ts`
- Create e.g. `PostHogAnalyticsAdapter implements AnalyticsAdapter`.
- Map `track()`, `identify()`, `setUserProperties()`, and `reset()` to the SDK's methods.
- Respect the existing privacy rules: never send `notes`, `spend_amount`, or free-text fields.

### 3. Swap adapter in factory function
- **File:** `src/services/analytics.ts`
- In the adapter factory (currently hardcoded to `NoopAnalyticsAdapter`), return the real adapter in production builds and keep `NoopAnalyticsAdapter` for `__DEV__` (or allow both via config).

### 4. Initialize analytics on app mount
- **File:** `app/_layout.tsx`
- Call the SDK's init method (e.g. `PostHog.init(apiKey)`) early in the root layout.
- Ensure initialization happens before any `track()` calls.

### 5. Verify event flow
- Trigger key user actions (panic flow, check-in, content view, paywall view).
- Confirm events appear in the analytics dashboard with correct names and properties.
- Confirm no forbidden fields (`notes`, `spend_amount`) are sent.

## Acceptance Criteria
- [ ] Real analytics adapter replaces `NoopAnalyticsAdapter` in production
- [ ] SDK initialized on app mount
- [ ] Key events (`panic_started`, `panic_outcome_logged`, `checkin_completed`, `paywall_viewed`) appear in dashboard
- [ ] No privacy-violating fields sent (verify in network inspector or dashboard)
- [ ] `NoopAnalyticsAdapter` still used in dev/test if desired
- [ ] `pnpm run preflight` passes
