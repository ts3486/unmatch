// BreathingExercise — animated breathing guide component.
// Uses React Native Animated API. No emojis. TypeScript strict mode.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@/src/constants/theme';
import {
  BREATHING_EXHALE,
  BREATHING_HOLD,
  BREATHING_INHALE,
} from '@/src/constants/config';

// ---------------------------------------------------------------------------
// Phase calculation
// ---------------------------------------------------------------------------

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale';

const CYCLE_DURATION = BREATHING_INHALE + BREATHING_HOLD + BREATHING_EXHALE; // 12s

/**
 * Derives the current breathing phase and time remaining in that phase
 * from the total elapsed time within one cycle.
 */
function getPhase(timeLeft: number, totalDuration: number): {
  phase: BreathingPhase;
  phaseTimeLeft: number;
} {
  const elapsed = totalDuration - timeLeft;
  const positionInCycle = elapsed % CYCLE_DURATION;

  if (positionInCycle < BREATHING_INHALE) {
    return {
      phase: 'Inhale',
      phaseTimeLeft: BREATHING_INHALE - positionInCycle,
    };
  }

  if (positionInCycle < BREATHING_INHALE + BREATHING_HOLD) {
    return {
      phase: 'Hold',
      phaseTimeLeft: BREATHING_INHALE + BREATHING_HOLD - positionInCycle,
    };
  }

  return {
    phase: 'Exhale',
    phaseTimeLeft: CYCLE_DURATION - positionInCycle,
  };
}

// ---------------------------------------------------------------------------
// Phase display config
// ---------------------------------------------------------------------------

const PHASE_CONFIG: Record<BreathingPhase, { color: string; instruction: string }> = {
  Inhale: { color: colors.primary, instruction: 'breathe in slowly' },
  Hold: { color: colors.secondary, instruction: 'hold gently' },
  Exhale: { color: colors.success, instruction: 'release slowly' },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BreathingExerciseProps {
  /** Seconds remaining in the overall session. */
  timeLeft: number;
  /** Total session duration in seconds (used to derive elapsed time). */
  totalDuration: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Shows current breathing phase with a pulsing circle animation
 * and countdown text.
 *
 * Cycle: 4s Inhale → 2s Hold → 6s Exhale → repeat
 */
export function BreathingExercise({
  timeLeft,
  totalDuration,
}: BreathingExerciseProps): React.ReactElement {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const currentPhaseRef = useRef<BreathingPhase | null>(null);

  const { phase, phaseTimeLeft } = getPhase(timeLeft, totalDuration);
  const config = PHASE_CONFIG[phase];

  // Animate the circle whenever the phase changes.
  useEffect(() => {
    if (currentPhaseRef.current === phase) {
      return;
    }
    currentPhaseRef.current = phase;

    if (phase === 'Inhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: BREATHING_INHALE * 1_000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: BREATHING_INHALE * 1_000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === 'Hold') {
      // No scale change during hold; keep at full size.
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: BREATHING_HOLD * 1_000,
        useNativeDriver: true,
      }).start();
    } else {
      // Exhale — shrink back.
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: BREATHING_EXHALE * 1_000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: BREATHING_EXHALE * 1_000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phase, scaleAnim, opacityAnim]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay =
    minutes > 0
      ? `${minutes}:${String(seconds).padStart(2, '0')}`
      : `${seconds}s`;

  return (
    <View style={styles.container}>
      {/* Animated circle */}
      <View style={styles.circleWrapper}>
        <Animated.View
          style={[
            styles.outerRing,
            {
              borderColor: config.color,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.innerCircle,
            {
              backgroundColor: config.color,
              opacity: Animated.multiply(opacityAnim, 0.25),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      </View>

      {/* Phase label */}
      <Text variant="displaySmall" style={[styles.phaseText, { color: config.color }]}>
        {phase}
      </Text>
      <Text variant="bodyMedium" style={styles.instructionText}>
        {config.instruction}
      </Text>
      <Text variant="labelLarge" style={styles.phaseCountdown}>
        {Math.ceil(phaseTimeLeft)}s
      </Text>

      {/* Overall timer */}
      <View style={styles.timerContainer}>
        <Text variant="labelMedium" style={styles.timerLabel}>
          Session remaining
        </Text>
        <Text variant="headlineMedium" style={styles.timerText}>
          {timerDisplay}
        </Text>
      </View>

      {/* Cycle guide */}
      <View style={styles.cycleGuide}>
        <CycleStep label="Inhale" duration={BREATHING_INHALE} active={phase === 'Inhale'} />
        <View style={styles.cycleDivider} />
        <CycleStep label="Hold" duration={BREATHING_HOLD} active={phase === 'Hold'} />
        <View style={styles.cycleDivider} />
        <CycleStep label="Exhale" duration={BREATHING_EXHALE} active={phase === 'Exhale'} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// CycleStep sub-component
// ---------------------------------------------------------------------------

interface CycleStepProps {
  label: string;
  duration: number;
  active: boolean;
}

function CycleStep({ label, duration, active }: CycleStepProps): React.ReactElement {
  return (
    <View style={styles.cycleStep}>
      <Text
        variant="labelMedium"
        style={[styles.cycleStepLabel, active && styles.cycleStepLabelActive]}
      >
        {label}
      </Text>
      <Text
        variant="labelSmall"
        style={[styles.cycleStepDuration, active && styles.cycleStepDurationActive]}
      >
        {duration}s
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  circleWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  innerCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  phaseText: {
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  instructionText: {
    color: colors.muted,
    fontStyle: 'italic',
  },
  phaseCountdown: {
    color: colors.text,
    marginTop: 2,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  timerLabel: {
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerText: {
    color: colors.text,
    fontWeight: '600',
  },
  cycleGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  cycleDivider: {
    width: 24,
    height: 1,
    backgroundColor: colors.border,
  },
  cycleStep: {
    alignItems: 'center',
    gap: 2,
  },
  cycleStepLabel: {
    color: colors.muted,
  },
  cycleStepLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  cycleStepDuration: {
    color: colors.border,
  },
  cycleStepDurationActive: {
    color: colors.muted,
  },
});
