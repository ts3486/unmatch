// Pure progress-rule functions — no DB dependency.
// All rules are LOCKED. Changes require explicit spec approval.
// No default exports.

import { LIFE_TREE_CAP, LIFE_TREE_RESISTS_PER_LEVEL, LIFE_TREE_START } from '../constants/config';
import type { UrgeKind, UrgeOutcome } from './types';

// ---------------------------------------------------------------------------
// Tree level
// ---------------------------------------------------------------------------

/**
 * Derive the Life Tree level from the cumulative resist count.
 *
 * Formula: floor(resistCountTotal / LIFE_TREE_RESISTS_PER_LEVEL) + LIFE_TREE_START
 * Capped at LIFE_TREE_CAP (30). Level never decreases.
 *
 * @param resistCountTotal - Lifetime count of successful resists (>= 0).
 * @returns Tree level in the range [1, 30].
 */
export function calculateTreeLevel(resistCountTotal: number): number {
  if (resistCountTotal < 0) {
    return LIFE_TREE_START;
  }
  const computed =
    Math.floor(resistCountTotal / LIFE_TREE_RESISTS_PER_LEVEL) + LIFE_TREE_START;
  return Math.min(computed, LIFE_TREE_CAP);
}

// ---------------------------------------------------------------------------
// Day success
// ---------------------------------------------------------------------------

/**
 * Determine whether a given day counts as a success day.
 *
 * A day is a success if the user completed at least one panic resist
 * OR completed the daily task. Once a day is marked successful, later
 * failures on the same day do not remove the success.
 *
 * @param panicSuccessCount - Number of panic sessions resolved as 'success' today.
 * @param dailyTaskCompleted - Whether the daily content task was completed today.
 */
export function isDaySuccess(
  panicSuccessCount: number,
  dailyTaskCompleted: boolean,
): boolean {
  return panicSuccessCount >= 1 || dailyTaskCompleted;
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

/**
 * Calculate the current streak by counting consecutive success days
 * working backward from (and including) today.
 *
 * @param dates - Array of YYYY-MM-DD strings that were success days.
 *                Need not be sorted; duplicates are ignored.
 * @param today - The current local date as YYYY-MM-DD.
 * @returns Number of consecutive success days ending on today (0 if today is not a success day).
 */
export function calculateStreak(dates: string[], today: string): number {
  const successSet = new Set(dates);

  let streak = 0;
  let current = today;

  while (successSet.has(current)) {
    streak += 1;
    current = subtractOneDay(current);
  }

  return streak;
}

/**
 * Subtract exactly one calendar day from a YYYY-MM-DD string.
 * Uses UTC arithmetic on the date components to avoid DST drift.
 */
function subtractOneDay(dateLocal: string): string {
  const [yearStr, monthStr, dayStr] = dateLocal.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // Date months are 0-indexed
  const day = parseInt(dayStr, 10);

  const d = new Date(Date.UTC(year, month, day - 1));

  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ---------------------------------------------------------------------------
// Counter increment guards
// ---------------------------------------------------------------------------

/**
 * Return true only when the outcome is 'success', meaning the resist
 * count should be incremented.
 *
 * Outcomes 'fail' and 'ongoing' must not increment the resist counter.
 *
 * @param outcome - The recorded outcome of a urge event.
 */
export function shouldIncrementResist(outcome: UrgeOutcome): boolean {
  return outcome === 'success';
}

/**
 * Return true only when the urge was a spend urge that was successfully
 * resisted, meaning the spend-avoided counter should be incremented.
 *
 * @param urgeKind - The kind of urge that was recorded.
 * @param outcome  - The recorded outcome of that urge event.
 */
export function shouldIncrementSpendAvoided(
  urgeKind: UrgeKind,
  outcome: UrgeOutcome,
): boolean {
  return urgeKind === 'spend' && outcome === 'success';
}
