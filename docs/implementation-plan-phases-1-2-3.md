# Implementation Plan — Onboarding & Paywall Phases 1–3

> Grounded in the actual codebase as of 2026-03-19.
> Source files read: `app/onboarding.tsx`, `app/paywall.tsx`,
> `src/components/BreathingExercise.tsx`, `src/components/BreathingCircle.tsx`,
> `src/contexts/AppStateContext.tsx`, `src/domain/types.ts`.

---

## Overview

| Phase | Theme | Effort | Risk |
|-------|-------|--------|------|
| 1 | Quick wins — compliance & trust signals | Small | Low |
| 2 | Personalization — goal-aware copy throughout | Small–Medium | Low |
| 3 | Breathing demo — new onboarding step | Medium | Medium |

Recommended order: **Phase 1 → Phase 2 → Phase 3**.
Phases 1 and 2 are independent. Phase 3 builds on Phase 2 (needs goal-aware copy for the demo label).

---

## Phase 1 — Quick Wins

### 1.1 Add auto-renewal terms below CTA (App Store required)

**File:** `app/paywall.tsx`

**What to change:**
- In the `isTrialOffer` CTA block (lines 201–219), add a `<Text>` element immediately below the `<Button>` with subscription terms.
- Required wording per Apple guideline 3.1.2: price, billing period, how to cancel. Example:
  > "$4.99/month after trial. Cancel anytime in App Store settings. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period."

**Code-level detail:**
```tsx
// After the "Try 7 Days for Free" Button in the isTrialOffer branch:
<Text variant="bodySmall" style={styles.legalText}>
  $4.99/month after free trial. Subscription auto-renews. Cancel anytime in
  App Store settings at least 24 hours before renewal.
</Text>
```

Add to `StyleSheet.create`:
```ts
legalText: {
  color: colors.muted,
  textAlign: 'center',
  fontSize: 11,
  lineHeight: 16,
  paddingHorizontal: 8,
},
```

**Effort:** Small
**Risk:** None — text only. Required for App Store compliance with free trial SKUs.

---

### 1.2 Add restore button to trial-offer mode

**File:** `app/paywall.tsx`

**Current state:** The "Restore purchase" `<Button>` (lines 240–253) is inside the `else` branch of `isTrialOffer ? ... : ...`. Users in trial mode who have a previous purchase have no way to restore.

**What to change:**
Extract the restore button out of the `!isTrialOffer` branch and render it in both modes. The `handleRestore` callback (lines 123–139) already exists and works for both modes.

**Code-level detail:**
```tsx
// Replace the current isTrialOffer ternary block with:
{isTrialOffer ? (
  <Button mode="contained" onPress={() => { void handlePurchase(); }} ...>
    Try 7 Days for Free
  </Button>
) : (
  <Button mode="contained" onPress={() => { void handlePurchase(); }} ...>
    Subscribe — $4.99/month
  </Button>
)}

{/* Restore — visible in both modes */}
<Button
  mode="text"
  onPress={() => { void handleRestore(); }}
  textColor={colors.muted}
  style={styles.restoreButton}
  labelStyle={styles.restoreLabel}
  accessibilityLabel="Restore previous purchase"
  accessibilityRole="button"
>
  Restore purchase
</Button>
```

**Effort:** Small
**Risk:** None — `handleRestore` already handles the case where no purchases are found (sets `feedbackMessage`). The button renders below the CTA so it doesn't compete visually.

---

### 1.3 Remove notification-denial Alert from onboarding

**File:** `app/onboarding.tsx`

**Current state:** `handleStart` (lines 191–228) shows an `Alert.alert("Notifications Disabled", ...)` if `requestPermissions()` returns `false`. This interrupts the navigation flow to the paywall, and the user sees a modal right before the paywall — a bad emotional state to enter a purchase decision.

**What to change:**
Remove the `if (!granted)` Alert block entirely. The notification permission is already obtained (or not); the user can enable it later from Settings. If the user denied, that's fine — they can still use the app.

**Code-level detail:**
```ts
// BEFORE (lines 216–222):
const granted = await requestPermissions();
if (!granted) {
  Alert.alert(
    "Notifications Disabled",
    "You can enable notifications in your device settings.",
  );
}

// AFTER:
await requestPermissions();
// Permission result is silently accepted either way.
```

Also remove the `Alert` import from the top of the file if it's no longer used elsewhere.

**Effort:** Small (delete 5 lines)
**Risk:** Low. `Alert` is only used here; removing it should be confirmed with a global search to ensure no other usage in this file.

**Watch out:** Run `pnpm run preflight` — the `Alert` removal may cause an unused-import lint error if it's the only usage.

---

### 1.4 Move Tinder Boost callout above fold

**File:** `app/paywall.tsx`

**Current state:** The `priceCompareWrap` block (lines 182–198) is rendered in this order:
1. Header (logo + headline + subtext)
2. Feature list
3. **Tinder Boost callout** ← currently here
4. CTA button
5. Trust signals

The callout is the app's strongest conversion copy ("CHEAPER THAN ONE TINDER BOOST") but it appears below the fold on most devices, after users must scroll past three feature rows.

**What to change:**
Move the `priceCompareWrap` block to render immediately after the header section and before the feature list.

**New render order:**
1. Header (logo + headline + subtext)
2. **Tinder Boost callout** ← moved here
3. Feature list
4. CTA button
5. Trust signals

**Code-level detail:**
In the JSX of `PaywallScreen`, cut the entire `{/* Price comparison callout */}` block and paste it after `{/* Logo + Headline */}` and before `{/* Feature list */}`.

No style changes needed — the existing `priceCompareWrap` / `priceCompareBadge` styles work in any position.

**Effort:** Small (reorder JSX blocks)
**Risk:** Low. Visual regression only — take a screenshot before and after to confirm layout. The `content` container uses `gap: 28` so the spacing adjusts automatically.

---

### Phase 1 — Implementation Order

```
1.3 (remove Alert)  →  1.4 (reorder JSX)  →  1.2 (restore button)  →  1.1 (legal text)
```

Start with 1.3 and 1.4 since they're pure deletions/moves with no new state. Then add the restore button and legal text.

---

## Phase 2 — Personalization

### 2.1 Goal-specific paywall headline

**File:** `app/paywall.tsx`

**Current state:**
```tsx
<Text variant="headlineMedium" style={styles.headline}>
  {isTrialOffer ? "Pause from dating apps" : "Continue with Unmatch"}
</Text>
```

**How to get `goal_type`:**
`useAppState()` already returns `userProfile`, and `userProfile.goal_type` is a `GoalType`. The paywall already imports `useAppState`. After `completeOnboarding` is called in `handleStart`, the profile is immediately available in context before navigation.

**What to add:**
```tsx
// Add after existing useAppState destructure:
const { isPremium, hasEverSubscribed, refreshPremiumStatus, unlockPremium, userProfile } = useAppState();
const goalType = userProfile?.goal_type ?? null;
```

Add a goal-headline map constant above the component:
```ts
const GOAL_HEADLINES: Record<GoalType, string> = {
  reduce_swipe:      "Stop mindless swiping",
  reduce_open:       "Break the checking habit",
  reduce_night_check:"Rest without the scroll",
  reduce_spend:      "Stop spending on boosts",
};
```

Update the headline render:
```tsx
<Text variant="headlineMedium" style={styles.headline}>
  {isTrialOffer
    ? (goalType !== null ? GOAL_HEADLINES[goalType] : "Pause from dating apps")
    : "Continue with Unmatch"}
</Text>
```

**Import needed:** `GoalType` from `@/src/domain/types`

**Effort:** Small
**Risk:** Low. Falls back to the current headline if `userProfile` is null (edge case: direct deep-link to `/paywall`).

---

### 2.2 Goal-specific feature ordering

**File:** `app/paywall.tsx`

**Current state:** `FEATURES` is a static array of 3 items (lines 33–37), rendered in fixed order for all users.

**What to add:**
Replace the single `FEATURES` constant with a function that returns a goal-ordered array.

```ts
const ALL_FEATURES: FeatureItem[] = [
  { icon: "timer-outline",          label: "60-second panic meditation — anytime, offline" },
  { icon: "credit-card-off-outline",label: "Spend delay cards — think before you boost" },
  { icon: "chart-line",             label: "Progress tracking — streaks, rank & insights" },
];

// Feature order prioritized by goal — first item is most relevant to the goal
const GOAL_FEATURE_ORDER: Record<GoalType, number[]> = {
  reduce_swipe:       [0, 2, 1], // meditation first, then progress, then spend
  reduce_open:        [0, 2, 1], // same — breathing is the core tool
  reduce_night_check: [0, 2, 1], // same
  reduce_spend:       [1, 0, 2], // spend delay card first for spend goal
};

function getOrderedFeatures(goal: GoalType | null): FeatureItem[] {
  if (goal === null) return ALL_FEATURES;
  return GOAL_FEATURE_ORDER[goal].map((i) => ALL_FEATURES[i]);
}
```

In the component:
```tsx
const features = getOrderedFeatures(goalType);

// Replace FEATURES.map with features.map in the JSX:
{features.map((feature) => ( ... ))}
```

**Effort:** Small
**Risk:** Low. No data or navigation changes — purely presentational reordering.

---

### 2.3 Goal-specific Ready screen copy

**File:** `app/onboarding.tsx`

**Current state:** The "ready" step (lines 425–469) shows:
- `readyTitle`: "You're all set." (static)
- `readyBody`: `GOAL_AFFIRMATIONS[selectedGoal]` (already goal-specific — affirmation text)
- `readyDetail`: "Your 7-day starter course to reduce your dating app usage begins today. We'll send you a nudge each evening to keep you on track." (static, lines 447–449)

**What to change:**
Add a `GOAL_READY_DETAIL` map to give a goal-specific `readyDetail` line. The existing `GOAL_AFFIRMATIONS` handles the body text well; the detail line is where the static text feels generic.

```ts
const GOAL_READY_DETAIL: Record<GoalType, string> = {
  reduce_swipe:
    "Your 7-day course starts today. Each day, a short lesson on why swiping feels so compulsive — and what to do instead.",
  reduce_open:
    "Your 7-day course starts today. You'll learn what drives the checking reflex and build a habit that feels better.",
  reduce_night_check:
    "Your 7-day course starts today. We'll send a gentle nudge each evening to help you wind down without the scroll.",
  reduce_spend:
    "Your 7-day course starts today. You'll understand the pricing tricks that make boosts feel rational — and how to resist them.",
};
```

In the "ready" step JSX:
```tsx
<Text variant="bodyMedium" style={styles.readyDetail}>
  {selectedGoal !== null
    ? GOAL_READY_DETAIL[selectedGoal]
    : "Your 7-day starter course to reduce your dating app usage begins today."}
</Text>
```

**Effort:** Small
**Risk:** None — copy-only change, no logic.

---

### Phase 2 — Implementation Order

```
2.3 (ready screen copy — onboarding.tsx only)
→ 2.1 (paywall headline — needs userProfile access added)
→ 2.2 (paywall feature order — depends on same goalType variable from 2.1)
```

Do 2.1 and 2.2 in the same commit since they both touch `paywall.tsx` and share the `goalType` variable and `GoalType` import.

---

## Phase 3 — 30s Breathing Demo Before Paywall

This is the highest-impact but most involved change. It inserts a new `"breathing_demo"` step into the onboarding flow, after "ready" and before the paywall navigation.

### 3.1 Extend Step type and STEPS array

**File:** `app/onboarding.tsx`

**Current state:**
```ts
type Step = "welcome" | "personalize" | "features" | "ready";
const STEPS: Step[] = ["welcome", "personalize", "features", "ready"];
```

**What to change:**
```ts
type Step = "welcome" | "personalize" | "features" | "ready" | "breathing_demo";
const STEPS: Step[] = ["welcome", "personalize", "features", "ready", "breathing_demo"];
```

**Impact:** `ProgressDots` uses `steps.indexOf(current)` so the new step automatically gets a 5th dot and correct step counts.

**Note:** The progress dots on the breathing demo step show "5 of 5" — acceptable since it's the last step before the paywall. If you want to hide the dots on this step, pass a filtered `steps` array to `ProgressDots` that excludes `"breathing_demo"`.

---

### 3.2 Update back-navigation for new step

**File:** `app/onboarding.tsx`

**Current state (`goBack`):**
```ts
const goBack = useCallback((): void => {
  if (step === "personalize") setStep("welcome");
  else if (step === "features") setStep("personalize");
  else if (step === "ready") setStep("features");
}, [step]);
```

**What to add:**
```ts
else if (step === "breathing_demo") setStep("ready");
```

---

### 3.3 Update Ready step to navigate to breathing_demo instead of calling handleStart

**File:** `app/onboarding.tsx`

**Current state:** The "ready" step's CTA calls `handleStart()`, which triggers `completeOnboarding`, requests permissions, and routes to `/paywall`.

**New flow:** The "ready" CTA should advance to `"breathing_demo"`. The actual `handleStart` call moves to the end of the `"breathing_demo"` step.

**What to change:**
```tsx
// In the "ready" step's bottom button:
<Button
  mode="contained"
  onPress={() => { setStep("breathing_demo"); }}  // was: void handleStart()
  style={styles.primaryButton}
  contentStyle={styles.primaryButtonContent}
  labelStyle={styles.primaryButtonLabel}
  testID="ready-continue"
>
  Try a quick breathing reset  {/* label change — sets expectation */}
</Button>
```

---

### 3.4 Add breathing demo state

**File:** `app/onboarding.tsx`

The breathing demo needs a countdown timer. Add state:

```ts
const BREATHING_DEMO_SECONDS = 30 as const; // 2.5 cycles of 12s

const [demoTimeLeft, setDemoTimeLeft] = useState<number>(BREATHING_DEMO_SECONDS);
const [demoComplete, setDemoComplete] = useState<boolean>(false);
```

Add a `useEffect` that runs when `step === "breathing_demo"` to tick down the timer:

```ts
useEffect(() => {
  if (step !== "breathing_demo" || demoComplete) return;

  if (demoTimeLeft <= 0) {
    setDemoComplete(true);
    return;
  }

  const id = setInterval(() => {
    setDemoTimeLeft((t) => t - 1);
  }, 1000);

  return () => { clearInterval(id); };
}, [step, demoTimeLeft, demoComplete]);
```

Also reset timer when navigating back to avoid stale state:
```ts
// In goBack, when stepping back from breathing_demo:
else if (step === "breathing_demo") {
  setDemoTimeLeft(BREATHING_DEMO_SECONDS);
  setDemoComplete(false);
  setStep("ready");
}
```

---

### 3.5 Add goal-specific demo label

The breathing demo should show a contextual label matching the user's goal (this is a fix carried over from the original `onboarding-improvement-plan.md`).

```ts
const DEMO_URGE_LABEL: Record<GoalType, string> = {
  reduce_swipe:       "MANAGE THE SWIPE URGE",
  reduce_open:        "RESIST THE URGE TO CHECK",
  reduce_night_check: "WIND DOWN WITHOUT APPS",
  reduce_spend:       "PAUSE BEFORE YOU SPEND",
};
```

Used in the demo step heading.

---

### 3.6 New imports for breathing_demo step

**File:** `app/onboarding.tsx`

Add these imports:
```ts
import { BreathingExercise } from "@/src/components/BreathingExercise";
```

`BreathingExercise` takes `timeLeft: number` and `totalDuration: number` — both are available from the new state.

---

### 3.7 New breathing_demo step JSX

**File:** `app/onboarding.tsx`

Add a new branch in the conditional rendering (before the fallback `return <View />`):

```tsx
if (step === "breathing_demo") {
  return (
    <View style={styles.root}>
      <ProgressDots steps={STEPS} current="breathing_demo" />
      <BackButton onPress={goBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineMedium" style={styles.stepTitle}>
          {selectedGoal !== null
            ? DEMO_URGE_LABEL[selectedGoal]
            : "A quick breathing reset"}
        </Text>
        <Text variant="bodyLarge" style={styles.featuresSubtitle}>
          {demoComplete
            ? "That's what Unmatch does in a moment of urge."
            : "Breathe with the circle. This is the core of Unmatch."}
        </Text>

        {/* Breathing animation — hidden once complete */}
        {!demoComplete && (
          <BreathingExercise
            timeLeft={demoTimeLeft}
            totalDuration={BREATHING_DEMO_SECONDS}
          />
        )}

        {/* Completion message */}
        {demoComplete && (
          <View style={styles.demoCompleteWrap}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={64}
              color={colors.success}
            />
            <Text variant="bodyLarge" style={styles.demoCompleteText}>
              You just rode out an urge without acting on it.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        {/* Skip — always visible */}
        {!demoComplete && (
          <Button
            mode="text"
            onPress={() => { void handleStart(); }}
            textColor={colors.muted}
            style={styles.skipButton}
            testID="breathing-demo-skip"
          >
            Skip
          </Button>
        )}

        {/* Continue — only visible after demo completes or as skip-equivalent */}
        {demoComplete && (
          <Button
            mode="contained"
            onPress={() => { void handleStart(); }}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.primaryButton}
            contentStyle={styles.primaryButtonContent}
            labelStyle={styles.primaryButtonLabel}
            testID="breathing-demo-continue"
          >
            {isSubmitting ? "Setting up..." : "Start my pause"}
          </Button>
        )}
      </View>
    </View>
  );
}
```

Add new styles:
```ts
demoCompleteWrap: {
  alignItems: "center",
  gap: 20,
  paddingVertical: 32,
},
demoCompleteText: {
  color: colors.secondary,
  textAlign: "center",
  lineHeight: 26,
  fontStyle: "italic",
},
skipButton: {
  alignSelf: "center",
},
```

---

### 3.8 handleStart is now called from breathing_demo, not ready

The `handleStart` function itself doesn't change — it still calls `completeOnboarding`, requests permissions, and routes to `/paywall`. What changes is *when* it's called: from the `breathing_demo` step's "Start my pause" button instead of the `ready` step.

No changes to `handleStart` needed.

---

### Phase 3 — Implementation Order

```
3.1 Extend Step type + STEPS array
→ 3.2 Update goBack
→ 3.4 Add demo state + useEffect timer
→ 3.5 Add DEMO_URGE_LABEL map
→ 3.6 Add BreathingExercise import
→ 3.3 Update ready step CTA (navigates to breathing_demo instead of handleStart)
→ 3.7 Add breathing_demo JSX branch
```

Commit all as one atomic PR — the step type change cascades through goBack, the timer, and the JSX.

---

## Cross-Cutting Concerns

### Dependency graph

```
Phase 1   ──── no deps ────────────────────────────► can ship anytime
Phase 2.3 ──── no deps ────────────────────────────► onboarding.tsx only
Phase 2.1/2.2 ─ needs userProfile in paywall.tsx ──► one paywall.tsx commit
Phase 3   ──── ideally after Phase 2.3 ships ───────► goal label in demo step
```

### App Store review implications

| Change | Review risk |
|--------|-------------|
| 1.1 Auto-renewal terms | **Required** for trials. Missing this can cause rejection or post-approval removal. |
| 1.2 Restore button in trial mode | Low — Apple reviewers look for this; adding it reduces review friction. |
| 1.3 Remove Alert | None — reduces modal UI, not an issue. |
| 1.4 Reorder paywall elements | None — visual only. |
| 2.x Personalized copy | None — copy changes only. |
| 3.x Breathing demo step | None — adds pre-paywall content, no gating issues. Breathing exercise is already an approved part of the app in `/panic`. |

### RevenueCat considerations

No RevenueCat API changes across any phase. The paywall still calls `getOfferings()` → `purchasePackage()` unchanged. The only RevenueCat-adjacent touch is 1.2 (restore button in trial mode) which calls the already-implemented `restorePurchases()`.

### TypeScript / lint

- Phase 1.3: Removing `Alert` import — run `pnpm run preflight` immediately; ESLint will warn on unused import.
- Phase 2.1: Adding `GoalType` import to `paywall.tsx` — check no circular import via `src/domain/types`.
- Phase 3.6: Adding `BreathingExercise` import to `onboarding.tsx` — large component, ensure it doesn't meaningfully inflate the bundle. Run `npx expo export --platform ios` to confirm.

### Testing

Per CLAUDE.md TDD requirements — UI screens are excluded from mandatory TDD, but:

- Phase 1.3: Verify no `Alert` call anywhere in `onboarding.tsx` (grep test or manual check).
- Phase 2: No new domain logic — no tests required.
- Phase 3: The timer countdown (`setInterval` in `useEffect`) is testable via `useFakeTimers` in Jest if desired, but UI-only by CLAUDE.md rules. Recommend manual smoke test: navigate to ready → tap "Try a quick breathing reset" → wait 30s → confirm "Start my pause" appears → tap → confirm `/paywall` loads.

### Offline behaviour

All changes work offline:
- Phase 1: Copy only — no network calls.
- Phase 2: `userProfile` is from SQLite (local) — available offline.
- Phase 3: `BreathingExercise` uses `setInterval` and `react-native-reanimated` — no network. `handleStart` calls `completeOnboarding` (SQLite write) then `requestPermissions` (device API) then `router.replace` — all local.

---

## Effort Summary

| Change | File(s) | Effort |
|--------|---------|--------|
| 1.1 Auto-renewal terms | `paywall.tsx` | Small |
| 1.2 Restore in trial mode | `paywall.tsx` | Small |
| 1.3 Remove notification Alert | `onboarding.tsx` | Small |
| 1.4 Reorder Tinder Boost callout | `paywall.tsx` | Small |
| 2.1 Goal-specific headline | `paywall.tsx` | Small |
| 2.2 Goal-specific feature order | `paywall.tsx` | Small |
| 2.3 Goal-specific ready copy | `onboarding.tsx` | Small |
| 3.1–3.8 Breathing demo step | `onboarding.tsx` | Medium |

**Total Phase 1:** ~30 min implementation, no new components.
**Total Phase 2:** ~45 min, no new components.
**Total Phase 3:** ~2–3 hours including manual testing of the full timer flow and animation.
