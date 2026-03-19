// Home tab screen — breathing exercise with daily check-in footer.
// TypeScript strict mode.

import { BreathingExercise } from "@/src/components/BreathingExercise";
import { CoachMarkOverlay } from "@/src/components/CoachMarkOverlay";
import { Logo } from "@/src/components/Logo";
import { PrivacyBadge } from "@/src/components/PrivacyBadge";
import { BREATHING_DURATION_SECONDS } from "@/src/constants/config";
import { colors } from "@/src/constants/theme";
import { useAppState } from "@/src/contexts/AppStateContext";
import { useCheckin } from "@/src/hooks/useCheckin";
import { useCoachMarks } from "@/src/hooks/useCoachMarks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type LayoutRectangle,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { Button, Chip, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeScreen(): React.ReactElement {
	const { todaySuccess, isLoading } = useAppState();

	const checkin = useCheckin();

	const coachMarks = useCoachMarks();

	// Layout refs for coach mark spotlight targets.
	const [checkinLayout, setCheckinLayout] = useState<LayoutRectangle | null>(
		null,
	);
	const [breathingLayout, setBreathingLayout] =
		useState<LayoutRectangle | null>(null);
	const checkinRef = useRef<View>(null);
	const breathingRef = useRef<View>(null);

	const targetLayoutForMark = (markId: string): LayoutRectangle | null => {
		switch (markId) {
			case "reset_button":
				return breathingLayout;
			case "checkin":
				return checkinLayout;
			default:
				return null;
		}
	};

	// ---------------------------------------------------------------------------
	// Breathing timer — always running, loops continuously
	// ---------------------------------------------------------------------------

	const [breathingTimeLeft, setBreathingTimeLeft] = useState<number>(
		BREATHING_DURATION_SECONDS,
	);
	const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(
		BREATHING_DURATION_SECONDS,
	);
	const [sessionComplete, setSessionComplete] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		const id = setInterval(() => {
			setBreathingTimeLeft((prev) => {
				if (prev <= 1) {
					return BREATHING_DURATION_SECONDS;
				}
				return prev - 1;
			});
			setSessionTimeLeft((prev) => {
				if (prev <= 1) {
					setSessionComplete(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1_000);
		timerRef.current = id;

		return () => {
			clearInterval(id);
			timerRef.current = null;
		};
	}, []);

	const handleRestartSession = useCallback(() => {
		setSessionTimeLeft(BREATHING_DURATION_SECONDS);
		setSessionComplete(false);
	}, []);

	// ---------------------------------------------------------------------------
	// Loading state
	// ---------------------------------------------------------------------------

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<Text variant="bodyMedium" style={styles.loadingText}>
					Loading...
				</Text>
			</View>
		);
	}

	// ---------------------------------------------------------------------------
	// Render
	// ---------------------------------------------------------------------------

	return (
		<View style={styles.root}>
			<View style={styles.content}>
				{/* Header */}
				<View style={styles.headerRow}>
					<Logo markSize={28} layout="horizontal" />
					<View style={styles.headerRight}>
						<PrivacyBadge />
						{todaySuccess && (
							<Chip
								compact
								style={styles.successChip}
								textStyle={styles.successChipText}
							>
								Today done
							</Chip>
						)}
					</View>
				</View>

				{/* Breathing exercise — always visible */}
				<View
					ref={breathingRef}
					style={styles.breathingArea}
					onLayout={(e) => setBreathingLayout(e.nativeEvent.layout)}
				>
					<BreathingExercise
						timeLeft={breathingTimeLeft}
						totalDuration={BREATHING_DURATION_SECONDS}
						sessionTimeLeft={sessionTimeLeft}
						sessionComplete={sessionComplete}
						onRestart={handleRestartSession}
					/>
				</View>
			</View>

			{/* Sticky bottom: Daily check-in CTA */}
			<View
				ref={checkinRef}
				style={styles.stickyBottom}
				onLayout={(e) => setCheckinLayout(e.nativeEvent.layout)}
			>
				{checkin.isComplete ? (
					<TouchableOpacity
						onPress={() => router.push("/checkin")}
						activeOpacity={0.7}
						style={styles.checkinDoneRow}
					>
						<MaterialCommunityIcons
							name="check-circle"
							size={20}
							color={colors.success}
						/>
						<Text variant="titleSmall" style={styles.checkinDoneText}>
							Check-in done
						</Text>
						<MaterialCommunityIcons
							name="chevron-right"
							size={18}
							color={colors.muted}
						/>
					</TouchableOpacity>
				) : (
					<Button
						mode="contained"
						onPress={() => router.push("/checkin")}
						style={styles.checkinButton}
						contentStyle={styles.checkinButtonContent}
						labelStyle={styles.checkinButtonLabel}
						accessibilityLabel="Open daily check-in"
						accessibilityHint="Quick self-reflection — private and offline"
					>
						Daily check-in
					</Button>
				)}
			</View>

			{/* Coach mark walkthrough overlay */}
			{coachMarks.currentMark !== null && (
				<CoachMarkOverlay
					key="coach-overlay"
					mark={coachMarks.currentMark}
					step={coachMarks.currentStep}
					totalSteps={coachMarks.totalSteps}
					targetLayout={targetLayoutForMark(coachMarks.currentMark.id)}
					onNext={coachMarks.next}
					onSkip={coachMarks.skipAll}
				/>
			)}
		</View>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.background,
	},
	loadingContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.background,
	},
	loadingText: {
		color: colors.muted,
	},
	content: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 56,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	successChip: {
		backgroundColor: "#1A3D2E",
		borderColor: colors.success,
		borderWidth: 1,
	},
	successChipText: {
		color: colors.success,
		fontSize: 12,
	},
	breathingArea: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	stickyBottom: {
		backgroundColor: colors.background,
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 24,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	checkinButton: {
		borderRadius: 14,
		borderColor: colors.primary,
		backgroundColor: colors.primary,
	},
	checkinButtonContent: {
		paddingVertical: 8,
	},
	checkinButtonLabel: {
		fontSize: 16,
		fontWeight: "600",
		letterSpacing: 0.3,
		color: "#FFFFFF",
	},
	checkinDoneRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 12,
	},
	checkinDoneText: {
		color: colors.success,
		fontWeight: "600",
	},
});
