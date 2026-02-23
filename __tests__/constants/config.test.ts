// Unit tests for src/constants/config.ts.
// These constants are LOCKED per CLAUDE.md and must not change without
// explicit spec approval. Tests serve as a regression guard.

import {
  BREATHING_DURATION_SECONDS,
  BREATHING_EXHALE,
  BREATHING_HOLD,
  BREATHING_INHALE,
  RESIST_RANK_CAP,
  RESIST_RANK_RESISTS_PER_LEVEL,
  RESIST_RANK_START,
} from '@/src/constants/config';

// ---------------------------------------------------------------------------
// Resist Rank constants (LOCKED per spec)
// ---------------------------------------------------------------------------

describe('Resist Rank constants (LOCKED)', () => {
  it('RESIST_RANK_START is 1', () => {
    expect(RESIST_RANK_START).toBe(1);
  });

  it('RESIST_RANK_CAP is 30', () => {
    expect(RESIST_RANK_CAP).toBe(30);
  });

  it('RESIST_RANK_RESISTS_PER_LEVEL is 5', () => {
    expect(RESIST_RANK_RESISTS_PER_LEVEL).toBe(5);
  });

  it('RESIST_RANK_CAP is reachable: (CAP - START) * RESISTS_PER_LEVEL resists = level 30', () => {
    // At (30 - 1) * 5 = 145 resists the tree hits cap exactly.
    const resistsToMax = (RESIST_RANK_CAP - RESIST_RANK_START) * RESIST_RANK_RESISTS_PER_LEVEL;
    const computedLevel = Math.floor(resistsToMax / RESIST_RANK_RESISTS_PER_LEVEL) + RESIST_RANK_START;
    expect(Math.min(computedLevel, RESIST_RANK_CAP)).toBe(RESIST_RANK_CAP);
  });

  it('RESIST_RANK_START < RESIST_RANK_CAP', () => {
    expect(RESIST_RANK_START).toBeLessThan(RESIST_RANK_CAP);
  });
});

// ---------------------------------------------------------------------------
// Breathing exercise constants (LOCKED per spec)
// ---------------------------------------------------------------------------

describe('Breathing exercise constants (LOCKED)', () => {
  it('BREATHING_DURATION_SECONDS is 60', () => {
    expect(BREATHING_DURATION_SECONDS).toBe(60);
  });

  it('BREATHING_INHALE is 4', () => {
    expect(BREATHING_INHALE).toBe(4);
  });

  it('BREATHING_HOLD is 2', () => {
    expect(BREATHING_HOLD).toBe(2);
  });

  it('BREATHING_EXHALE is 6', () => {
    expect(BREATHING_EXHALE).toBe(6);
  });

  it('one breathing cycle (inhale + hold + exhale) equals 12 seconds', () => {
    // Box-breath style: 4 + 2 + 6 = 12s per cycle
    expect(BREATHING_INHALE + BREATHING_HOLD + BREATHING_EXHALE).toBe(12);
  });

  it('BREATHING_DURATION_SECONDS is divisible by one cycle length (whole cycles fit)', () => {
    const cycleLength = BREATHING_INHALE + BREATHING_HOLD + BREATHING_EXHALE;
    expect(BREATHING_DURATION_SECONDS % cycleLength).toBe(0);
  });

  it('BREATHING_INHALE is positive', () => {
    expect(BREATHING_INHALE).toBeGreaterThan(0);
  });

  it('BREATHING_HOLD is non-negative', () => {
    expect(BREATHING_HOLD).toBeGreaterThanOrEqual(0);
  });

  it('BREATHING_EXHALE is positive', () => {
    expect(BREATHING_EXHALE).toBeGreaterThan(0);
  });

  it('BREATHING_DURATION_SECONDS is positive', () => {
    expect(BREATHING_DURATION_SECONDS).toBeGreaterThan(0);
  });
});
