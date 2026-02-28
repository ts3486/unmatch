# Onboarding Flow Improvements

**Flow:** Welcome → Goal → Triggers → (Budget) → Notifications → Demo (intro → breathing → action → checkin → nicework) → Hard Paywall

---

## What's Working Well

1. **Emotional tone is strong.** Non-judgmental copy ("No judgment — these are just patterns"), empowering ("put you back in control"), avoids clinical/therapy language. Critical for a shame-sensitive product category.

2. **Goal-first structure is correct.** "What would feel like a win?" creates early psychological investment. Affirmation text reinforces commitment.

3. **Demo before paywall is a smart conversion mechanism.** Users experience the core loop (breathe → action → checkin) before the paywall, arriving with felt product value. Textbook "aha moment before monetization."

4. **Stealth notifications.** Offering discreet notifications shows understanding of real-world context (embarrassment, privacy). Builds trust.

5. **Hard paywall position is correct.** Placed after the full demo gives maximum perceived value before the gate.

---

## UX Problems

### 1. No back navigation anywhere
There's no way to return to a previous step. If a user picks the wrong goal or wants to reconsider triggers, they're stuck. This creates anxiety and increases abandonment.

**Fix:** Add a back button to every step, or allow tapping progress dots to navigate.

### 2. Demo breathing copy says "60-second" but demo is 12s
`onboarding.tsx:731` says "We'll guide you through a 60-second breathing reset" but `DEMO_BREATHING_SECONDS` is one cycle = 12s. This is a trust-breaking mismatch.

**Fix:** Change copy to "a quick breathing reset" or extend the demo to a few cycles.

### 3. "I did it" button on the action step is misleading
`onboarding.tsx:851` — The user sees an example action card then presses "I did it." They didn't actually do anything. This feels dishonest.

**Fix:** Change to "Got it" or "Makes sense" — acknowledge understanding, not completion.

### 4. Checkin preview is non-interactive
The mood/fatigue/urge chips (lines 880-948) are static Views. Users see a frozen preview with pre-selected values they can't touch. Missed opportunity for engagement.

**Fix:** Make chips tappable (even if data isn't saved) or add a "try tapping one" prompt.

### 5. "Nice work" screen auto-transitions in 1.5s
`DemoNiceWork` fires `handleStart` after 1.5 seconds with no user input. Users haven't finished reading before being funneled to the paywall. Creates a jarring "bait and switch" feeling.

**Fix:** Replace auto-transition with a user-initiated CTA button. At minimum extend to 3-4 seconds.

### 6. Trigger step allows 0 selections
A user can tap "Continue" without selecting any triggers. This weakens personalization value and downstream feature relevance.

**Fix:** Soft nudge ("Select at least one to personalize your experience") or require 1 trigger minimum.

---

## Marketing / Conversion Problems

### 7. Welcome screen has no value proposition hierarchy
"Something worth protecting" is poetic but vague. No concrete hooks.

**Fix:** Lead with a specific pain point the user already feels ("Spent 2 hours swiping last night?", "Another $9.99 on a boost that went nowhere?") followed by the solution.

### 8. No social proof or urgency at any point
The entire flow is the user alone with the app. No mention of user count, testimonials, or stats.

**Fix:** Add a single line of social proof on the welcome screen or pre-paywall ("Join 10,000+ people taking back control" or similar).

### 9. "Less than one Tinder boost" anchor is great — but buried
`paywall.tsx:157` — The single best conversion copy in the app. Reframes $4.99 against a purchase the user has already made impulsively. But it's a small badge on the monthly card, which isn't even the pre-selected plan.

**Fix:** Surface this anchor earlier and bigger — on the welcome or "nice work" screen before the paywall.

### 10. Paywall defaults to Lifetime but anchor copy is on Monthly
The "Less than one Tinder boost" reframe only applies to $4.99/month. The pre-selected $29.99 lifetime plan has a generic "Best value" badge.

**Fix:** Add a comparably strong anchor to lifetime ("Less than 3 months of Tinder Gold") or reconsider which plan is pre-selected.

### 11. No trial / soft entry
Hard paywall with no free trial is aggressive for a habit-change app where trust builds over days. Users who complete even 2 resets are far more likely to pay.

**Fix:** Add a 3-day or 7-day free trial with a "start free" CTA. This is the **#1 highest-impact change for revenue**.

### 12. Notification step + starter course toggle feel like low-value admin
These setup decisions interrupt the emotional arc between "I identified my patterns" and "I just did my first reset."

**Fix:** Move notification preferences to post-onboarding settings, or collapse into a single "Enable gentle reminders?" toggle.

---

## Minor / Technical

### 13. Budget step hardcodes `$` prefix
No locale awareness. Fine for v1 English market but worth noting for future.

### 14. `selectedGoal` defaults to `"reduce_swipe"`
`onboarding.tsx:167` — A user who taps "Continue" without actively choosing gets a pre-selected goal. Inflates analytics for `reduce_swipe` and may not reflect real intent.

**Fix:** Default to `null` and disable Continue until a tap occurs.

---

## Prioritized Recommendations

| Priority | Change | Expected Impact |
|----------|--------|-----------------|
| **P0** | Fix "60-second" copy mismatch with actual 12s demo | Trust / retention |
| **P0** | Add back navigation to every step | Drop-off reduction |
| **P1** | Add free trial option to paywall | Conversion lift (est. 2-3x) |
| **P1** | Surface "Tinder boost" anchor more prominently / apply to default plan | Paywall conversion |
| **P1** | Replace auto-transition on "Nice work" with user-initiated CTA | Perceived respect / trust |
| **P2** | Add social proof line to welcome or pre-paywall | Conversion |
| **P2** | Change "I did it" to "Got it" | Honesty / tone |
| **P2** | Default goal to `null`, require active selection | Analytics accuracy |
| **P3** | Make checkin preview tappable | Engagement |
| **P3** | Move notifications/course toggle to post-onboarding | Flow simplification |
| **P3** | Require at least 1 trigger | Personalization quality |
