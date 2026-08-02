// BreathingExercise — animated breathing guide component.
// Delegates the animated circle to BreathingCircle (reanimated + haptics).
// No emojis. TypeScript strict mode.

import {
	BREATHING_EXHALE,
	BREATHING_HOLD,
	BREATHING_INHALE,
} from "@/src/constants/config";
import { colors } from "@/src/constants/theme";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	type AccessibilityRole,
	Animated,
	StyleSheet,
	View,
} from "react-native";
import { Text } from "react-native-paper";
import { BreathingCircle, type BreathingPhase } from "./BreathingCircle";

// ---------------------------------------------------------------------------
// Phase calculation
// ---------------------------------------------------------------------------

const CYCLE_DURATION = BREATHING_INHALE + BREATHING_HOLD + BREATHING_EXHALE; // 12s

/**
 * Derives the current breathing phase and time remaining in that phase
 * from the total elapsed time within one cycle.
 */
function getPhase(
	timeLeft: number,
	totalDuration: number,
): {
	phase: BreathingPhase;
	phaseTimeLeft: number;
} {
	const elapsed = totalDuration - timeLeft;
	const positionInCycle = elapsed % CYCLE_DURATION;

	if (positionInCycle < BREATHING_INHALE) {
		return {
			phase: "Inhale",
			phaseTimeLeft: BREATHING_INHALE - positionInCycle,
		};
	}

	if (positionInCycle < BREATHING_INHALE + BREATHING_HOLD) {
		return {
			phase: "Hold",
			phaseTimeLeft: BREATHING_INHALE + BREATHING_HOLD - positionInCycle,
		};
	}

	return {
		phase: "Exhale",
		phaseTimeLeft: CYCLE_DURATION - positionInCycle,
	};
}

// ---------------------------------------------------------------------------
// Phase display config
// ---------------------------------------------------------------------------

const PHASE_CONFIG: Record<BreathingPhase, { color: string }> = {
	Inhale: { color: colors.primary },
	Hold: { color: colors.secondary },
	Exhale: { color: colors.success },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatElapsed(totalSeconds: number): string {
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${mins}:${String(secs).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BreathingExerciseProps {
	/** Seconds remaining in the overall session. */
	timeLeft: number;
	/** Total session duration in seconds (used to derive elapsed time). */
	totalDuration: number;
	/** Seconds remaining in the session countdown (1:00 → 0:00). */
	sessionTimeLeft?: number;
	/** Whether the session countdown has completed. */
	sessionComplete?: boolean;
	/** Called when the user taps restart. */
	onRestart?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Shows current breathing phase with an animated circle (via BreathingCircle)
 * and a countdown timer. Haptic feedback is triggered inside BreathingCircle.
 *
 * Cycle: 4s Inhale -> 2s Hold -> 6s Exhale -> repeat
 */
export function BreathingExercise({
	timeLeft,
	totalDuration,
	sessionTimeLeft,
	sessionComplete,
	onRestart,
}: BreathingExerciseProps): React.ReactElement {
	const { t } = useTranslation();
	const { phase, phaseTimeLeft } = getPhase(timeLeft, totalDuration);
	const phaseConfig = PHASE_CONFIG[phase];
	const phaseLabels: Record<BreathingPhase, string> = {
		Inhale: t("breathing.phase.inhale"),
		Hold: t("breathing.phase.hold"),
		Exhale: t("breathing.phase.exhale"),
	};

	const affirmations = useMemo(
		() => t("breathing.affirmations", { returnObjects: true }) as string[],
		[t],
	);

	// Derive which breathing cycle we're in (0-based) to pick an affirmation.
	const elapsed = totalDuration - timeLeft;
	const cycleIndex = Math.floor(elapsed / CYCLE_DURATION);
	const affirmation =
		affirmations[cycleIndex % affirmations.length] ?? affirmations[0];

	// Affirmation animation — fade out + slide down, then fade in + slide up.
	const affirmationOpacity = useRef(new Animated.Value(1)).current;
	const affirmationTranslateY = useRef(new Animated.Value(0)).current;
	const prevCycleIndex = useRef(cycleIndex);

	useEffect(() => {
		if (sessionComplete) return;
		if (cycleIndex !== prevCycleIndex.current) {
			prevCycleIndex.current = cycleIndex;
			Animated.parallel([
				Animated.timing(affirmationOpacity, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(affirmationTranslateY, {
					toValue: 8,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start(() => {
				affirmationTranslateY.setValue(-8);
				Animated.parallel([
					Animated.timing(affirmationOpacity, {
						toValue: 1,
						duration: 400,
						useNativeDriver: true,
					}),
					Animated.timing(affirmationTranslateY, {
						toValue: 0,
						duration: 400,
						useNativeDriver: true,
					}),
				]).start();
			});
		}
	}, [cycleIndex, affirmationOpacity, affirmationTranslateY, sessionComplete]);

	// Phase label animation — scale pulse + opacity on phase change.
	const phaseScale = useRef(new Animated.Value(1)).current;
	const phaseOpacity = useRef(new Animated.Value(1)).current;
	const prevPhase = useRef(phase);

	useEffect(() => {
		if (sessionComplete) return;
		if (phase !== prevPhase.current) {
			prevPhase.current = phase;
			Animated.timing(phaseOpacity, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			}).start(() => {
				phaseScale.setValue(0.85);
				Animated.parallel([
					Animated.spring(phaseScale, {
						toValue: 1,
						useNativeDriver: true,
						speed: 20,
						bounciness: 8,
					}),
					Animated.timing(phaseOpacity, {
						toValue: 1,
						duration: 200,
						useNativeDriver: true,
					}),
				]).start();
			});
		}
	}, [phase, phaseScale, phaseOpacity, sessionComplete]);

	return (
		<View style={styles.container}>
			{/* Motivational text / completion message */}
			{sessionComplete ? (
				<View style={styles.affirmationContainer}>
					<Text variant="headlineSmall" style={styles.completionText}>
						{t("breathing.completionText")}
					</Text>
				</View>
			) : (
				<Animated.View
					style={[
						styles.affirmationContainer,
						{
							opacity: affirmationOpacity,
							transform: [{ translateY: affirmationTranslateY }],
						},
					]}
				>
					<Text variant="headlineSmall" style={styles.affirmationText}>
						{affirmation}
					</Text>
				</Animated.View>
			)}

			{/* Animated circle with haptics */}
			<BreathingCircle
				phase={phase}
				phaseTimeLeft={phaseTimeLeft}
				sessionComplete={sessionComplete}
			/>

			{/* Phase label — hidden when session complete */}
			{!sessionComplete && (
				<Animated.View
					style={{
						opacity: phaseOpacity,
						transform: [{ scale: phaseScale }],
					}}
				>
					<Text
						variant="titleLarge"
						style={[styles.phaseText, { color: phaseConfig.color }]}
						accessibilityLiveRegion="polite"
						accessibilityLabel={phaseLabels[phase]}
						accessibilityRole={"text" as AccessibilityRole}
					>
						{phaseLabels[phase]}
					</Text>
				</Animated.View>
			)}

			{/* Session countdown */}
			{sessionTimeLeft !== undefined && (
				<View style={styles.sessionContainer}>
					{sessionComplete ? (
						onRestart !== undefined && (
							<Text
								variant="labelMedium"
								style={styles.restartLink}
								onPress={onRestart}
							>
								{t("breathing.restartSession")}
							</Text>
						)
					) : (
						<>
							<Text variant="labelMedium" style={styles.sessionLabel}>
								{t("breathing.session")}
							</Text>
							<Text variant="headlineMedium" style={styles.sessionTime}>
								{formatElapsed(sessionTimeLeft)}
							</Text>
						</>
					)}
				</View>
			)}

			{/* Cycle guide — freeze active states when session complete */}
			{!sessionComplete && (
				<View style={styles.cycleGuide}>
					<CycleStep
						label={phaseLabels.Inhale}
						duration={BREATHING_INHALE}
						active={!sessionComplete && phase === "Inhale"}
					/>
					<View style={styles.cycleDivider} />
					<CycleStep
						label={phaseLabels.Hold}
						duration={BREATHING_HOLD}
						active={!sessionComplete && phase === "Hold"}
					/>
					<View style={styles.cycleDivider} />
					<CycleStep
						label={phaseLabels.Exhale}
						duration={BREATHING_EXHALE}
						active={!sessionComplete && phase === "Exhale"}
					/>
				</View>
			)}
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

function CycleStep({
	label,
	duration,
	active,
}: CycleStepProps): React.ReactElement {
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
				style={[
					styles.cycleStepDuration,
					active && styles.cycleStepDurationActive,
				]}
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
		alignItems: "center",
		paddingVertical: 24,
		gap: 12,
	},
	phaseText: {
		fontWeight: "700",
		letterSpacing: 1,
	},
	cycleGuide: {
		flexDirection: "row",
		alignItems: "center",
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
		alignItems: "center",
		gap: 2,
	},
	cycleStepLabel: {
		color: colors.muted,
	},
	cycleStepLabelActive: {
		color: colors.text,
		fontWeight: "700",
	},
	cycleStepDuration: {
		color: colors.border,
	},
	cycleStepDurationActive: {
		color: colors.muted,
	},
	sessionContainer: {
		alignItems: "center",
		marginTop: 4,
		gap: 2,
	},
	sessionLabel: {
		color: colors.muted,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	sessionTime: {
		color: colors.text,
		fontWeight: "600",
	},
	restartLink: {
		color: colors.primary,
		paddingVertical: 4,
	},
	affirmationContainer: {
		paddingHorizontal: 16,
		marginTop: 4,
		height: 60,
		justifyContent: "center",
	},
	affirmationText: {
		color: colors.secondary,
		textAlign: "center",
		fontWeight: "600",
		lineHeight: 30,
	},
	completionText: {
		color: colors.success,
		textAlign: "center",
		fontWeight: "700",
		lineHeight: 30,
	},
});
