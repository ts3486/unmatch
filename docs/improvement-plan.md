# Unmatch — UX & Business Improvement Roadmap

## Overview

13 improvements identified from a UX and business analysis of the Unmatch app. Prioritized by impact and effort, organized into tiers for phased implementation.

### Priority Matrix

| #  | Improvement                          | Impact | Effort | Category |
|----|--------------------------------------|--------|--------|----------|
| 9  | Delay paywall past first value moment | High   | Low    | Business |
| 8  | Add annual subscription plan         | High   | Low    | Business |
| 1  | Quick Reset (1-tap breathing)        | High   | Medium | UX       |
| 2  | Motivational hero on home screen     | Medium | Low    | UX       |
| 13 | Goal-based personalization           | High   | Medium | UX       |
| 12 | Money Saved card                     | High   | Low    | UX       |
| 3  | Post-course content                  | High   | High   | Retention |
| 7  | Contextual share prompts             | Medium | Low    | Growth   |
| 6  | Milestone celebrations               | Medium | Medium | UX       |
| 11 | Win-back for churned users           | Medium | Medium | Business |
| 5  | Emoji-based check-in                 | Low    | Low    | UX       |
| 10 | Referral mechanic                    | Medium | Medium | Growth   |
| 4  | Proactive intervention               | High   | High   | UX       |

### Suggested Implementation Phases

```
Phase 1 (Quick Wins)     → #9, #8, #12, #2, #7, #5
Phase 2 (Core UX)        → #1, #13, #6
Phase 3 (Growth & Retain)→ #11, #10, #3
Phase 4 (Platform)       → #4
```

---

## Tier 1: High Impact / Low Effort

---

### #9 — Delay Paywall Past First Value Moment

**Category:** Business — Conversion optimization

#### Problem

Users hit the paywall immediately after onboarding — before experiencing any value. They're asked to pay based on a *promise*, not an *experience*. This is the hardest moment to convert.

#### Solution

Let users complete their first panic meditation for free. Show the paywall *after* they feel the relief of a successful reset. Convert on emotion, not promise.

#### Flow Change

```
BEFORE: Onboarding → Paywall (blocked) → Tabs
AFTER:  Onboarding → Tabs (free, 1 meditation) → Meditation completes → Paywall → Tabs (premium)
```

#### Implementation

| File | Change |
|------|--------|
| `app/onboarding.tsx` | Route to `/(tabs)` instead of `/paywall` |
| `app/(tabs)/_layout.tsx` | Guard: redirect to paywall only when `!isPremium && meditationCount > 0` |
| `app/paywall.tsx` | Add `post_first_meditation` as `trigger_source` for analytics |

#### Edge Cases

- Free users get exactly 1 meditation — completion screen shows, then redirect fires
- Offline: works entirely — `meditationCount` is local SQLite state
- App kill mid-meditation: `meditationCount` still 0, user gets another attempt
- No new DB columns needed — derived from existing `meditationCount`

#### Expected Impact

- Higher trial-to-paid conversion (user has experienced value)
- Lower onboarding drop-off (no paywall friction before first use)
- Better App Store reviews (users can try before buying)

---

### #8 — Add Annual Subscription Plan

**Category:** Business — Revenue optimization

#### Problem

Only a monthly plan exists ($4.99/mo). Users who would commit long-term have no incentive, and the app misses higher LTV from annual subscribers.

#### Solution

Add a $29.99/year plan (~50% discount vs. monthly) as the default highlighted option.

#### Pricing

| Plan | Price | Per Month | Savings |
|------|-------|-----------|---------|
| Monthly | $4.99/mo | $4.99 | — |
| Annual | $29.99/yr | $2.49 | 50% |

#### Implementation

| File | Change |
|------|--------|
| `src/domain/types.ts` | Add `'annual'` to `SubscriptionPeriod` union |
| `src/data/repositories/subscription-repository.ts` | Add `recordAnnualSubscription()` |
| `src/contexts/AppStateContext.tsx` | Support `'annual'` in `unlockPremium()` |
| `src/services/subscription-service.ts` | Detect annual products in `syncSubscriptionToDb()` |
| `app/paywall.tsx` | Plan selector UI with annual as default |

#### Paywall UI

```
┌─────────────────────────────────┐
│  ★ BEST VALUE                   │
│  Annual — $29.99/year           │
│  $2.49/mo · Save 50%           │
│  [selected, primary border]     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Monthly — $4.99/month          │
│  [unselected, muted border]     │
└─────────────────────────────────┘
```

#### Prerequisites

- Create annual product in App Store Connect
- Add annual package to RevenueCat offering

#### Expected Impact

- 2-3x higher LTV from annual subscribers
- Lower churn rate (annual commitment = stickier)

---

### #12 — Money Saved / Spend Avoided Card

**Category:** UX — Value reinforcement

#### Problem

The app tracks `spend_avoided_count_total` (times user resisted a spend urge) but never surfaces it. Users who chose "reduce_spend" as their goal get no visible reinforcement of their primary metric.

#### Solution

Add a prominent "Spend Urges Resisted" card on the home screen (for reduce_spend users) and the progress screen (for all users).

#### Implementation

| File | Change |
|------|--------|
| `src/components/SpendAvoidedCard.tsx` | New card component |
| `app/(tabs)/index.tsx` | Show on home when `goal_type === 'reduce_spend'` and count > 0 |
| `app/(tabs)/progress.tsx` | Show on progress for all users when count > 0 |

#### Card Design

```
┌─────────────────────────────────┐
│  🐷  12                         │
│      times you resisted         │
│      a spend urge               │
└─────────────────────────────────┘
```

- Piggy-bank icon in warning color (#F2C14E)
- COUNT only — never dollar amounts (privacy rule)
- All data is local SQLite

#### Expected Impact

- Stronger retention for reduce_spend users
- Concrete, personal value reinforcement

---

### #2 — Motivational Hero on Home Screen

**Category:** UX — Emotional engagement

#### Problem

The home screen reads like a dashboard (check-in form, course card, rank display). The first thing users see should validate *why they're here* and how far they've come.

#### Solution

Replace the current header area with a personalized motivational message tied to streak/progress. Use the 33 motivation messages already in `catalog.json` (currently unused).

#### Examples

- "Day 12. You've resisted 4 urges this week."
- "3-day streak. The itch fades faster each time."
- "Every dollar not spent on a boost is a dollar you chose yourself."

#### Implementation

| File | Change |
|------|--------|
| `app/(tabs)/index.tsx` | Add motivational text hero below header, above check-in |
| `src/hooks/useMotivation.ts` | New hook: select message based on streak, day count, time of day |
| `data/seed/catalog.json` | Messages already exist — no change needed |

#### Selection Logic

- Rotate daily (hash of date string → index into message array)
- Weight toward streak/spend messages based on user's `goal_type`
- Show streak count inline when streak > 1

#### Expected Impact

- Emotional hook on every app open
- Leverages existing unused content (33 messages)
- Reinforces identity as "someone who's making progress"

---

### #7 — Contextual Share Prompts

**Category:** Growth — Organic acquisition

#### Problem

The share card exists but is only accessible via a button buried on the progress screen. Sharing is a top organic growth lever for self-improvement apps, but users need to be prompted at the right moment.

#### Solution

Prompt sharing at natural celebration moments — don't wait for users to find the button.

#### Trigger Points

| Moment | Prompt |
|--------|--------|
| First meditation completed | "You just completed your first reset." |
| 7-day streak reached | "7 days in a row. Want to share your streak?" |
| Meditation rank level-up | "You reached Rank {n}." |
| Course completed (day 7) | "You finished the 7-day course." |
| New personal best streak | "New personal best: {n} days!" |

#### Implementation

| File | Change |
|------|--------|
| `app/(tabs)/panic.tsx` | Add share prompt on completion screen for milestone moments |
| `src/hooks/useMilestones.ts` | New hook: detect milestone events from state changes |
| `src/components/SharePrompt.tsx` | Reusable bottom sheet with share card preview + "Share" / "Not now" |

#### Expected Impact

- More shares at high-emotion moments (when users are most likely to act)
- Organic awareness via social proof
- Zero acquisition cost

---

### #5 — Emoji-Based Check-in

**Category:** UX — Daily engagement

#### Problem

Mood/fatigue/urge on 1-5 numeric scales feels like a medical questionnaire. For a self-care app, this should feel warmer and more intuitive.

#### Solution

Replace numeric Likert scales with emoji or word-based selectors. Same underlying data (1-5), friendlier UI.

#### Mapping

| Value | Mood | Fatigue | Urge |
|-------|------|---------|------|
| 1 | 😞 Rough | 😴 Exhausted | 🧘 None |
| 2 | 😕 Low | 😩 Tired | 🌊 Mild |
| 3 | 😐 Okay | 😐 So-so | ⚡ Moderate |
| 4 | 🙂 Good | 😊 Rested | 🔥 Strong |
| 5 | 😊 Great | 💪 Energized | 🌋 Intense |

#### Implementation

| File | Change |
|------|--------|
| `src/components/InlineCheckin.tsx` | Replace slider with emoji chip row |
| `src/components/CheckinOverlay.tsx` | Same emoji chip pattern in full overlay |

#### Data Impact

- None — still stores 1-5 integers in SQLite
- Analytics payload unchanged

#### Expected Impact

- More intuitive daily interaction
- Slightly higher check-in completion rate
- Warmer brand feel

---

## Tier 2: High Impact / Medium Effort

---

### #1 — Quick Reset (1-Tap Breathing)

**Category:** UX — Core flow optimization

#### Problem

The panic flow is 6 steps: urge select → 60s breathing → action select → (spend delay) → log outcome → complete. When someone is mid-impulse, every extra tap is a chance to drop off.

#### Solution

Add a "Quick Reset" mode — 1-tap breathing start that skips urge selection upfront. Collect metadata *after* breathing is done, when the user is calmer.

#### Flow Change

```
CURRENT:  Select urge → Breathing → Select action → Log outcome → Complete
QUICK:    Breathing (immediate) → Select urge → Select action → Log outcome → Complete
```

#### Implementation

| File | Change |
|------|--------|
| `app/(tabs)/panic.tsx` | Add "Quick start" button that jumps to breathing step |
| `src/hooks/usePanicFlow.ts` | New `quickStart()` action that sets step to `breathing` without urge |
| `app/(tabs)/index.tsx` | Home CTA could default to quick start |

#### UX Details

- Quick start button is prominent (primary CTA), full flow is secondary ("Choose urge type first")
- Urge kind asked after breathing completes (step reordering)
- All analytics events still fire with correct data

#### Expected Impact

- Faster time-to-relief (< 2 seconds from tap to breathing)
- Higher meditation completion rate (less pre-meditation friction)
- Better emergency usage (urge is strongest at the start)

---

### #13 — Goal-Based Personalization

**Category:** UX — Relevance

#### Problem

Users pick a goal during onboarding (reduce swiping/opening/night-checking/spending) but it's never referenced again. The experience is identical regardless of goal.

#### Solution

Use `goal_type` to personalize the home screen, notifications, recommended actions, and progress metrics.

#### Personalization by Goal

| Goal | Home Hero | Priority Metric | Notification Tone |
|------|-----------|-----------------|-------------------|
| reduce_swipe | Swipe-free days | Sessions resisted | "Another day without mindless swiping" |
| reduce_open | App-free hours | Check urges resisted | "You haven't checked in 6 hours" |
| reduce_night_check | Bedtime streak | Night checks avoided | "Great evening — no late-night checking" |
| reduce_spend | Money saved | Spend urges resisted | "Your wallet thanks you" |

#### Implementation

| File | Change |
|------|--------|
| `app/(tabs)/index.tsx` | Conditional hero text and metric card based on `goal_type` |
| `src/services/notification-service.ts` | Goal-specific notification copy |
| `app/(tabs)/panic.tsx` | Pre-select urge kind matching goal (swipe→swipe, spend→spend, etc.) |
| `src/hooks/useMotivation.ts` | Weight message selection toward goal-relevant topics |

#### Expected Impact

- Users feel the app "gets them" — higher perceived value
- More relevant daily touchpoints
- Better retention across all goal types (not just generic)

---

### #6 — Milestone Celebrations

**Category:** UX — Reward loop

#### Problem

Meditation rank (1-30) and streaks are tracked, but milestones aren't celebrated beyond a brief notice on the completion screen. Users miss them.

#### Solution

Full-screen celebration overlays at key moments.

#### Milestone Triggers

| Milestone | Trigger |
|-----------|---------|
| First meditation | `meditationCount === 1` |
| 7-day streak | `streak === 7` |
| 30-day streak | `streak === 30` |
| Rank 5 / 10 / 15 / 20 / 25 / 30 | Rank level-up at these thresholds |
| Course completed | All 7 days marked complete |

#### Celebration Screen

- Full-screen overlay with confetti animation (reuse existing confetti from panic completion)
- Large icon/badge for the milestone
- Personalized copy ("You've meditated every day for a week!")
- Share button (ties into #7)
- "Continue" dismissal

#### Implementation

| File | Change |
|------|--------|
| `src/components/MilestoneCelebration.tsx` | New full-screen celebration component |
| `src/hooks/useMilestones.ts` | Detect milestone triggers, track "already celebrated" in SQLite |
| `app/(tabs)/_layout.tsx` or `app/_layout.tsx` | Render celebration overlay when milestone detected |
| DB migration | Add `milestones_seen` table (milestone_id, seen_at) |

#### Expected Impact

- Stronger emotional reward loop
- Natural share moments (ties into #7)
- Users feel progress is recognized

---

### #11 — Win-Back for Churned Users

**Category:** Business — Re-engagement

#### Problem

If a subscription expires, the user hits a paywall and that's it. No re-engagement strategy.

#### Solution

Three-layer win-back:

1. **Free emergency reset**: Allow 1 free meditation per week for lapsed subscribers (keeps them opening the app)
2. **Streak preservation nudge**: Push notification after 3 days of inactivity: "Your streak was 12 days. One reset to keep it alive."
3. **Discount offer**: Show discounted annual plan to returning users

#### Implementation

| File | Change |
|------|--------|
| `app/(tabs)/_layout.tsx` | Allow lapsed users through if `freeResetsThisWeek < 1` |
| `src/data/repositories/subscription-repository.ts` | Track `free_resets_used_this_week` |
| `src/services/notification-service.ts` | Schedule inactivity nudge (3-day check) |
| `app/paywall.tsx` | "Welcome back" mode with discount messaging |

#### Expected Impact

- Reduces permanent churn (users stay in the funnel)
- Streak preservation is a powerful re-engagement hook
- Free weekly reset = ongoing value = reason to re-subscribe

---

### #10 — Referral Mechanic

**Category:** Growth — Viral loop

#### Problem

Dating app fatigue is a social phenomenon — friend groups talk about it. There's no way for a happy user to bring friends.

#### Solution

"Gift a free week" — let subscribers share a 7-day trial link. This costs nothing (trial is already free) but creates a warm intro.

#### Implementation

| Component | Detail |
|-----------|--------|
| Share action | Generate a referral URL (deep link or App Store link with campaign param) |
| Referral tracking | `referral_shared` and `referral_redeemed` analytics events |
| UI entry point | Settings > "Gift a free week to a friend" |
| Celebration | After 3 referrals, show achievement badge |

#### Technical Notes

- V1 can be simple: share a pre-written message + App Store link (no backend needed)
- Tracking via App Store campaign links or Branch.io in V2
- No backend required for initial version

#### Expected Impact

- Zero-cost acquisition channel
- Social proof ("my friend uses this too")
- Higher conversion from warm referrals vs. cold App Store discovery

---

## Tier 3: High Impact / High Effort

---

### #3 — Post-Course Content

**Category:** Retention — Day 8+ engagement

#### Problem

The Learn tab has a 7-day course. After day 7, the tab becomes a completed checklist with nothing new. This is the exact moment users churn — the structured program is over, and there's no reason to keep coming back to Learn.

#### Solution

Add rolling weekly challenges and themed mini-courses that unlock after the 7-day course.

#### Content Ideas

| Content | Duration | Theme |
|---------|----------|-------|
| Weekend Warrior | 3 days | Survive Fri-Sun without swiping |
| Budget Reset | 5 days | Zero dating app spending for a week |
| Notification Detox | 3 days | Turn off all dating notifications |
| Sleep Hygiene Sprint | 5 days | No phone in bed for a week |
| Social Reconnect | 7 days | Replace app time with real connections |

#### Implementation

| File | Change |
|------|--------|
| `data/seed/courses/` | New JSON files for each mini-course |
| `src/domain/types.ts` | `Course` type with `prerequisite` field |
| `src/data/repositories/content-repository.ts` | Multi-course support |
| `src/hooks/useContent.ts` | Course selection, unlock logic |
| `app/(tabs)/learn.tsx` | Course browser + active course view |
| DB migration | Extend content/content_progress tables for multi-course |

#### Paywall Opportunity

- 7-day starter course: free (or part of trial)
- Additional courses: premium-only (natural gate)

#### Expected Impact

- Dramatically improved day 8+ retention
- Reason to keep opening the Learn tab
- More content = more perceived value for subscription

---

### #4 — Proactive Intervention

**Category:** UX — Preemptive support

#### Problem

The app is entirely reactive — user must open it and tap "Meditate." But urges happen when users are *in* a dating app, not in Unmatch.

#### Solution

Meet users where the urge happens:

1. **Screen Time API** (iOS): Detect when dating apps are opened, send a gentle notification: "Take a breath first?"
2. **Smart scheduling**: Push notification at the user's peak urge time (already tracked in progress data — time-of-day patterns)
3. **Surface the blocker guide**: Currently buried in settings. Show it during onboarding or after first "fail" outcome.

#### Implementation

| Component | Effort | Detail |
|-----------|--------|--------|
| Screen Time API | High | Requires `FamilyControls` framework, ShieldConfiguration, DeviceActivityMonitor |
| Smart notification timing | Medium | Analyze `urge_event.started_at` to find peak hours, schedule nudge 15 min before |
| Blocker guide surfacing | Low | Add prompt after first fail outcome or in onboarding step 3 |

#### Technical Constraints

- Screen Time API requires a separate App Group and extension target
- User must grant Screen Time permission (can't be silent)
- Android equivalent: Digital Wellbeing API (different implementation)

#### Expected Impact

- Intervene *before* the urge escalates (instead of after)
- Most impactful feature possible — but also most complex
- Screen Time integration is a major differentiator vs. competitors

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 weeks)

Low effort items that can ship independently:

```
#9  Delay paywall          → Business (conversion)
#8  Annual plan            → Business (LTV)
#12 Money Saved card       → UX (value reinforcement)
#2  Motivational hero      → UX (emotional engagement)
#7  Contextual share       → Growth (organic)
#5  Emoji check-in         → UX (daily engagement)
```

### Phase 2: Core UX (2-3 weeks)

Medium effort items that improve the core experience:

```
#1  Quick Reset            → UX (core flow)
#13 Goal personalization   → UX (relevance)
#6  Milestone celebrations → UX (reward loop)
```

### Phase 3: Growth & Retention (3-4 weeks)

Medium effort items focused on keeping and growing users:

```
#11 Win-back              → Business (re-engagement)
#10 Referral mechanic     → Growth (viral)
#3  Post-course content   → Retention (day 8+)
```

### Phase 4: Platform (4-6 weeks)

High effort, high reward — requires native platform work:

```
#4  Proactive intervention → UX (Screen Time API)
```

---

## Verification Checklist (All Phases)

- [ ] `pnpm run preflight` passes (typecheck + lint + test)
- [ ] `npx expo export --platform ios` bundles without errors
- [ ] All features work in airplane mode
- [ ] No spend amounts in analytics payloads
- [ ] No forbidden wording (cure/treatment/explicit sexual)
- [ ] Theme colors match locked palette
- [ ] Reset flow reachable within 2 taps
- [ ] Privacy: no free-text in analytics, no notes or amounts sent
