// Home tab screen.
// Shows inline check-in hero, compact stat row, today's course card, and Reset CTA.
// TypeScript strict mode.

import { CheckinOverlay } from "@/src/components/CheckinOverlay";
import { CoachMarkOverlay } from "@/src/components/CoachMarkOverlay";
import { InlineCheckin } from "@/src/components/InlineCheckin";
import { Logo } from "@/src/components/Logo";
import { MeditationRank } from "@/src/components/MeditationRank";
import { PrivacyBadge } from "@/src/components/PrivacyBadge";
import { colors } from "@/src/constants/theme";
import { useAppState } from "@/src/contexts/AppStateContext";
import { getCatalog } from "@/src/data/seed-loader";
import { useCheckin } from "@/src/hooks/useCheckin";
import { useCoachMarks } from "@/src/hooks/useCoachMarks";
import { useContent } from "@/src/hooks/useContent";
import { router } from "expo-router";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import {
	type LayoutRectangle,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeScreen(): React.ReactElement {
	const {
		streak,
		meditationRank,
		meditationCount,
		todaySuccess,
		userProfile,
		isLoading,
	} = useAppState();

	const {
		allContent,
		currentDayIndex,
		isLoading: contentLoading,
	} = useContent(userProfile?.created_at ?? null);

	const checkin = useCheckin();
	const [checkinOverlayVisible, setCheckinOverlayVisible] = useState(false);

	const coachMarks = useCoachMarks();

	// Layout refs for coach mark spotlight targets.
	const [resetButtonLayout, setResetButtonLayout] =
		useState<LayoutRectangle | null>(null);
	const [checkinLayout, setCheckinLayout] = useState<LayoutRectangle | null>(
		null,
	);
	const [courseLayout, setCourseLayout] = useState<LayoutRectangle | null>(
		null,
	);
	const resetButtonRef = useRef<View>(null);
	const checkinRef = useRef<View>(null);
	const courseRef = useRef<View>(null);

	// Map coach mark ID to its target layout.
	const targetLayoutForMark = (markId: string): LayoutRectangle | null => {
		switch (markId) {
			case "reset_button":
				return resetButtonLayout;
			case "checkin":
				return checkinLayout;
			case "course":
				return courseLayout;
			default:
				return null;
		}
	};

	const catalog = getCatalog();
	const resetCtaLabel = catalog.copy.panicCta ?? "Reset now";

	// Today's content card (day_index matches current day in the course).
	const todayContent =
		allContent.find((c) => c.day_index === currentDayIndex) ?? null;

	const handleResetPress = useCallback((): void => {
		router.push("/(tabs)/panic");
	}, []);

	const handleCheckinExpand = useCallback((): void => {
		setCheckinOverlayVisible(true);
	}, []);

	const handleCheckinClose = useCallback((): void => {
		setCheckinOverlayVisible(false);
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
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
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

				{/* Inline check-in hero */}
				<View
					ref={checkinRef}
					onLayout={(e) => setCheckinLayout(e.nativeEvent.layout)}
				>
					<InlineCheckin checkin={checkin} onExpand={handleCheckinExpand} />
				</View>

				{/* Today's course card */}
				{!contentLoading && todayContent !== null && (
					<View
						ref={courseRef}
						onLayout={(e) => setCourseLayout(e.nativeEvent.layout)}
					>
						<Card style={styles.courseCard} mode="contained">
							<Card.Content>
								<Text variant="labelSmall" style={styles.courseDayLabel}>
									Day {currentDayIndex} of 7
								</Text>
								<Text variant="titleMedium" style={styles.courseTitle}>
									{todayContent.title}
								</Text>
								<Text variant="bodySmall" style={styles.courseBody}>
									{todayContent.body}
								</Text>
							</Card.Content>
							<Card.Actions>
								<Text variant="labelMedium" style={styles.courseAction}>
									{todayContent.action_text}
								</Text>
							</Card.Actions>
						</Card>
					</View>
				)}

				<MeditationRank
					level={meditationRank}
					meditationCount={meditationCount}
				/>

				{/* Spacer to prevent content from hiding behind sticky CTA */}
				<View style={styles.bottomSpacer} />
			</ScrollView>

			{/* Sticky bottom: Reset CTA */}
			<View
				ref={resetButtonRef}
				style={styles.stickyBottom}
				onLayout={(e) => setResetButtonLayout(e.nativeEvent.layout)}
			>
				<Button
					mode="contained"
					onPress={handleResetPress}
					style={styles.resetButton}
					contentStyle={styles.resetButtonContent}
					labelStyle={styles.resetButtonLabel}
					accessibilityLabel="Open the reset flow"
					accessibilityHint="Starts the guided reset protocol"
				>
					{resetCtaLabel}
				</Button>
			</View>

			{/* Full-screen daily check-in overlay */}
			{checkinOverlayVisible && (
				<CheckinOverlay checkin={checkin} onClose={handleCheckinClose} />
			)}

			{/* Coach mark walkthrough overlay — stable key prevents remount between steps */}
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
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 56,
		paddingBottom: 16,
		gap: 16,
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
	courseCard: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
	},
	courseDayLabel: {
		color: colors.primary,
		textTransform: "uppercase",
		letterSpacing: 1,
		marginBottom: 6,
	},
	courseTitle: {
		color: colors.text,
		fontWeight: "600",
		marginBottom: 8,
	},
	courseBody: {
		color: colors.muted,
		lineHeight: 20,
	},
	courseAction: {
		color: colors.secondary,
		flex: 1,
		flexWrap: "wrap",
	},
	bottomSpacer: {
		height: 80,
	},
	stickyBottom: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: colors.background,
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 24,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	resetButton: {
		borderRadius: 14,
		backgroundColor: colors.primary,
	},
	resetButtonContent: {
		paddingVertical: 8,
	},
	resetButtonLabel: {
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
});
