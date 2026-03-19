// CoachMarkOverlay — animated overlay with spotlight and tooltip.
// Renders a coach mark walkthrough on the home screen.
// Uses react-native-paper Surface, Text, Button. TypeScript strict mode.
// No default exports.

import { colors } from "@/src/constants/theme";
import type { CoachMarkConfig } from "@/src/hooks/useCoachMarks";
import type React from "react";
import { useEffect, useRef } from "react";
import {
	Animated,
	type LayoutRectangle,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import { Button, Surface, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CoachMarkOverlayProps {
	mark: CoachMarkConfig;
	step: number;
	totalSteps: number;
	targetLayout: LayoutRectangle | null;
	onNext: () => void;
	onSkip: () => void;
}

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------

const FADE_DURATION = 250;
const SLIDE_DURATION = 300;
const PULSE_DURATION = 1400;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CoachMarkOverlay({
	mark,
	step,
	totalSteps,
	targetLayout,
	onNext,
	onSkip,
}: CoachMarkOverlayProps): React.ReactElement {
	const isLastStep = step === totalSteps;

	// Animated values.
	const backdropOpacity = useRef(new Animated.Value(0)).current;
	const tooltipOpacity = useRef(new Animated.Value(0)).current;
	const tooltipTranslateY = useRef(new Animated.Value(24)).current;
	const spotlightOpacity = useRef(new Animated.Value(0)).current;
	// Gentle opacity pulse instead of scale to avoid exceeding screen width.
	const pulseOpacity = useRef(new Animated.Value(1)).current;

	// Entrance animation on mount.
	useEffect(() => {
		Animated.sequence([
			Animated.timing(backdropOpacity, {
				toValue: 1,
				duration: FADE_DURATION,
				useNativeDriver: true,
			}),
			Animated.parallel([
				Animated.timing(tooltipOpacity, {
					toValue: 1,
					duration: SLIDE_DURATION,
					useNativeDriver: true,
				}),
				Animated.spring(tooltipTranslateY, {
					toValue: 0,
					tension: 65,
					friction: 9,
					useNativeDriver: true,
				}),
				Animated.timing(spotlightOpacity, {
					toValue: 1,
					duration: SLIDE_DURATION,
					useNativeDriver: true,
				}),
			]),
		]).start();

		// Looping opacity pulse on spotlight border.
		const pulse = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseOpacity, {
					toValue: 0.4,
					duration: PULSE_DURATION,
					useNativeDriver: true,
				}),
				Animated.timing(pulseOpacity, {
					toValue: 1,
					duration: PULSE_DURATION,
					useNativeDriver: true,
				}),
			]),
		);
		pulse.start();

		return () => {
			pulse.stop();
		};
	}, [
		backdropOpacity,
		tooltipOpacity,
		tooltipTranslateY,
		spotlightOpacity,
		pulseOpacity,
	]);

	// Transition animation when step changes.
	// Instead of fade-out-then-in (which flickers because React renders new
	// content before the effect runs), instantly snap to the "start" position
	// with setValue() and only animate inward.
	const prevStep = useRef(step);
	useEffect(() => {
		if (prevStep.current === step) return;
		prevStep.current = step;

		// Snap to starting position (invisible + offset).
		tooltipOpacity.setValue(0);
		tooltipTranslateY.setValue(14);
		spotlightOpacity.setValue(0);

		// Animate in.
		Animated.parallel([
			Animated.timing(tooltipOpacity, {
				toValue: 1,
				duration: SLIDE_DURATION,
				useNativeDriver: true,
			}),
			Animated.spring(tooltipTranslateY, {
				toValue: 0,
				tension: 65,
				friction: 9,
				useNativeDriver: true,
			}),
			Animated.timing(spotlightOpacity, {
				toValue: 1,
				duration: SLIDE_DURATION,
				useNativeDriver: true,
			}),
		]).start();
	}, [step, tooltipOpacity, tooltipTranslateY, spotlightOpacity]);

	return (
		<View style={styles.overlay} pointerEvents="box-none">
			{/* Animated backdrop */}
			<Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
				<Pressable style={StyleSheet.absoluteFill} onPress={onNext} />
			</Animated.View>

			{/* Animated spotlight — opacity pulse only, no scale */}
			{targetLayout !== null && (
				<Animated.View
					style={[
						styles.spotlight,
						{
							top: targetLayout.y - 6,
							left: targetLayout.x - 6,
							width: targetLayout.width + 12,
							height: targetLayout.height + 12,
							borderRadius: 12,
							opacity: Animated.multiply(spotlightOpacity, pulseOpacity),
						},
					]}
					pointerEvents="none"
				/>
			)}

			{/* Animated tooltip card */}
			<Animated.View
				style={[
					styles.tooltipWrapper,
					targetLayout !== null
						? {
								top: Math.min(targetLayout.y + targetLayout.height + 16, 500),
							}
						: { top: "40%" as unknown as number },
					{
						opacity: tooltipOpacity,
						transform: [{ translateY: tooltipTranslateY }],
					},
				]}
			>
				<Surface style={styles.tooltip} elevation={4}>
					<Text variant="titleSmall" style={styles.title}>
						{mark.title}
					</Text>
					<Text variant="bodySmall" style={styles.body}>
						{mark.body}
					</Text>

					{/* Actions row with page number */}
					<View style={styles.actions}>
						<Pressable onPress={onSkip} hitSlop={8}>
							<Text variant="labelSmall" style={styles.skipLabel}>
								Skip
							</Text>
						</Pressable>

						<Text variant="labelSmall" style={styles.pageNumber}>
							{step}/{totalSteps}
						</Text>

						<Button
							mode="contained"
							onPress={onNext}
							style={styles.nextButton}
							labelStyle={styles.nextLabel}
							compact
						>
							{isLastStep ? "Got it" : "Next"}
						</Button>
					</View>
				</Surface>
			</Animated.View>
		</View>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1000,
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(11,18,32,0.85)",
	},
	spotlight: {
		position: "absolute",
		backgroundColor: "transparent",
		borderWidth: 2,
		borderColor: colors.primary,
	},
	tooltipWrapper: {
		position: "absolute",
		left: 36,
		right: 36,
	},
	tooltip: {
		backgroundColor: colors.surface,
		borderRadius: 24,
		paddingHorizontal: 18,
		paddingTop: 16,
		paddingBottom: 12,
		borderWidth: 1,
		borderColor: colors.border,
	},
	title: {
		color: colors.text,
		fontWeight: "700",
		marginBottom: 4,
	},
	body: {
		color: colors.muted,
		lineHeight: 20,
		marginBottom: 14,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	pageNumber: {
		color: colors.muted,
		fontSize: 11,
		letterSpacing: 0.5,
	},
	skipLabel: {
		color: colors.muted,
		fontSize: 13,
	},
	nextButton: {
		borderRadius: 14,
		backgroundColor: colors.primary,
	},
	nextLabel: {
		fontSize: 13,
		fontWeight: "600",
	},
});
