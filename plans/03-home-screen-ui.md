# Plan 03 — Home Screen: Surface Built Components & Clean Dead Code

## Problem
Several components were built but never rendered on the Home screen, and dead code remains:
- `MotivationCard` is computed (`getDailyMessage()`) but never placed in JSX.
- `TimeSavedCard` + `useWeeklySuccessCount` are complete but unused anywhere.
- `StatCard` is defined inline but never instantiated.
- `TIME_SAVED_PER_MEDITATION_MINUTES` is imported by `TimeSavedCard` but doesn't exist in config (would crash if rendered).

## Scope
- `app/(tabs)/home/index.tsx`
- `src/components/TimeSavedCard.tsx`
- `src/hooks/useWeeklySuccessCount.ts`
- `src/constants/config.ts`

## Tasks

### 1. Render `MotivationCard` on Home screen
- **File:** `app/(tabs)/home/index.tsx`
- The `dailyMessage` variable is already computed. Add `<MotivationCard message={dailyMessage} />` to the JSX.
- Place it logically — below the greeting, above the check-in section (or per design preference).

### 2. Add missing config constant and render `TimeSavedCard`
- **File:** `src/constants/config.ts`
- Add `export const TIME_SAVED_PER_MEDITATION_MINUTES = 15;` (or whatever the intended value is — confirm with user).
- **File:** `app/(tabs)/home/index.tsx`
- Import and render `<TimeSavedCard />` in the Home screen layout, below the stats area.

### 3. Remove dead `StatCard` definition
- **File:** `app/(tabs)/home/index.tsx` (lines 179–196)
- Delete the unused `StatCard` component definition. It's never instantiated and adds confusion.
- If the intent was to use it, replace with actual usage or extract to `src/components/`.

### 4. Verify layout and styling
- Ensure the newly visible components fit the existing layout and theme.
- Check vertical spacing, card order, and scroll behavior.
- Test on both iOS and Android screen sizes.

## Acceptance Criteria
- [ ] `MotivationCard` visible on Home screen with daily rotating message
- [ ] `TimeSavedCard` visible on Home screen showing weekly time saved
- [ ] `TIME_SAVED_PER_MEDITATION_MINUTES` defined in config
- [ ] Dead `StatCard` code removed
- [ ] Home screen layout looks clean and scrolls correctly
- [ ] `pnpm run preflight` passes
