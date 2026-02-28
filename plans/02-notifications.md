# Plan 02 — Notifications Fix

## Problem
Notification scheduling logic is wired and functional, but three issues prevent notifications from actually working:
1. The foreground notification handler suppresses all alerts (`shouldShowAlert: false`).
2. Evening nudge and streak nudge notifications lack identifiers, so tap routing does nothing.
3. The `"daily-checkin"` identifier is handled in tap routing but never scheduled.

## Scope
- `app/_layout.tsx` (notification handler + tap routing)
- `src/services/notifications.ts` (scheduling functions)

## Tasks

### 1. Fix foreground notification handler
- **File:** `app/_layout.tsx` (lines 17–25)
- Change `shouldShowAlert` to `true`, `shouldShowBanner` to `true`, `shouldShowList` to `true`.
- Keep `shouldPlaySound: true` and `shouldSetBadge: false` (or make badge configurable).
- This allows notifications received while the app is open to actually display.

### 2. Add identifiers to scheduled notifications
- **File:** `src/services/notifications.ts`
- `scheduleEveningNudge()`: add `identifier: "evening-nudge"` to the scheduling call.
- `scheduleStreakNudge()`: add `identifier: "streak-nudge"` to the scheduling call.
- Any other scheduled notification that lacks an identifier should get one.

### 3. Fix tap routing in `_layout.tsx`
- **File:** `app/_layout.tsx` (notification response listener)
- Add cases for `"evening-nudge"` → navigate to `/(tabs)/panic` or `/(tabs)/home`.
- Add case for `"streak-nudge"` → navigate to `/(tabs)/progress`.
- Decide on the `"daily-checkin"` identifier:
  - **Option A:** Schedule a daily check-in reminder notification with `identifier: "daily-checkin"` in `notifications.ts`. Route tap to `/(tabs)/home` (where the inline check-in lives).
  - **Option B:** Remove the `"daily-checkin"` case from routing if we don't want this notification type.
- Remove or update the dead `default` case.

### 4. Test notification flows
- Verify evening nudge fires and shows alert when app is foregrounded.
- Verify tapping a notification from the notification center navigates to the correct screen.
- Verify streak nudge and course-unlock notifications route correctly.

## Acceptance Criteria
- [ ] Foreground notifications display visually (banner/alert)
- [ ] Every scheduled notification has a unique identifier
- [ ] Tapping any notification navigates to the relevant screen
- [ ] No orphan routing cases (every handled identifier has a corresponding schedule function)
- [ ] `pnpm run preflight` passes
