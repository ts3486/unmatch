# Plan 06 — UX & Data Polish (Minor Fixes)

## Problem
Several small UX inconsistencies and data issues that don't block launch but should be cleaned up:
1. "Edit details" on completed check-in leads to a read-only view (misleading label).
2. Progress screen double-counts meditation vs. panic success.
3. Budget fields exist in schema but are never populated.
4. DB column `resist_count_total` doesn't match domain name `meditation_count_total`.

## Scope
- `app/(tabs)/home/index.tsx` (check-in section)
- `app/(tabs)/progress/index.tsx` (stats computation)
- `src/repositories/progress-repository.ts` (column naming)
- `src/types/` (domain types)
- DB migration (if renaming column)

## Tasks

### 1. Fix "Edit details" label on completed check-in
- **File:** `app/(tabs)/home/index.tsx`
- After a check-in is completed, the link currently says "Edit details" but navigates to a read-only summary.
- **Option A (simple):** Change label to "View details" — accurate and no logic change needed.
- **Option B (full):** Implement an edit path that allows updating a submitted check-in via `updateCheckin()`. More work, lower priority.
- **Recommended:** Option A for now.

### 2. Fix meditation count double-count in progress stats
- **File:** `app/(tabs)/progress/index.tsx` (lines 272–273)
- `meditationCount` and `panicSuccessCount` use the identical filter (`outcome === "success"`).
- Clarify semantics: if meditation count should equal panic success count (they are the same thing), rename to avoid confusion. If they should differ, fix the filter.
- **Recommended:** Remove the separate `meditationCount` stat or rename to make it clear they are the same metric. A "meditation" in this app IS a successful panic reset.

### 3. Decide on budget fields
- `spending_budget_weekly`, `spending_budget_daily`, `spending_limit_mode` exist in the DB schema and `UserProfile` type but are always null.
- **Option A:** Remove from schema and types (clean up dead fields).
- **Option B:** Add a budget setup screen in Settings for users who want spend tracking (future feature).
- **Recommended:** Keep in schema but add a comment marking them as V2. No UI work now.

### 4. Reconcile DB column naming (low priority)
- `progress` table has `resist_count_total`; domain model uses `meditation_count_total`.
- The mapping works correctly in the repository layer.
- **Option A:** Rename column via migration to `meditation_count_total` for consistency.
- **Option B:** Leave as-is, add a code comment explaining the mapping.
- **Recommended:** Option B for now — a migration for a rename alone is not worth the risk.

## Acceptance Criteria
- [ ] Completed check-in shows "View details" (not "Edit details")
- [ ] Progress screen stats are clearly labeled and not misleading
- [ ] Budget fields documented as V2 (or removed if decided)
- [ ] Column naming mismatch documented with code comment
- [ ] `pnpm run preflight` passes
