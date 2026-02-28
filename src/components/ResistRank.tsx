// ResistRank — visual component showing the current resist rank and progress.
// Uses react-native-paper components. No emojis. TypeScript strict mode.

import {
	RESIST_RANK_CAP,
	RESIST_RANK_RESISTS_PER_LEVEL,
} from "@/src/constants/config";
import { colors } from "@/src/constants/theme";
import type React from "react";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { ProgressBar, Surface, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Animated Surface
// ---------------------------------------------------------------------------

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ResistRankProps {
	level: number;
	resistCount: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Displays the Resist Rank and progress toward the next rank.
 * At max rank (30) shows a "Max Rank" badge instead of progress bar.
 * Animates with an idle pulse on the container and a ring pop when a new
 * resist is earned.
 */
export function ResistRank({
	level,
	resistCount,
}: ResistRankProps): React.ReactElement {
	const isMaxLevel = level >= RESIST_RANK_CAP;

	// Resists within the current level window (0–4 out of 5).
	const resistsIntoCurrentLevel = resistCount % RESIST_RANK_RESISTS_PER_LEVEL;
	const progressFraction = isMaxLevel
		? 1
		: resistsIntoCurrentLevel / RESIST_RANK_RESISTS_PER_LEVEL;

	// Number of "growth rings" to render (filled vs unfilled).
	const rings = Array.from(
		{ length: RESIST_RANK_RESISTS_PER_LEVEL },
		(_, i) => i,
	);

	// ---------------------------------------------------------------------------
	// Idle pulse animation on container
	// ---------------------------------------------------------------------------

	const pulseAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		const pulse = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.02,
					duration: 2000,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 2000,
					useNativeDriver: true,
				}),
			]),
		);
		pulse.start();
		return () => pulse.stop();
	}, [pulseAnim]);

	// ---------------------------------------------------------------------------
	// Ring pop animation on new resist
	// ---------------------------------------------------------------------------

	// One Animated.Value per ring slot.
	const ringScales = useRef<Animated.Value[]>(
		Array.from(
			{ length: RESIST_RANK_RESISTS_PER_LEVEL },
			() => new Animated.Value(1),
		),
	).current;

	// Track previous resistCount to detect increment.
	const prevResistCount = useRef<number>(resistCount);

	useEffect(() => {
		if (resistCount > prevResistCount.current) {
			// The newly-filled ring index within the current level window.
			// resistsIntoCurrentLevel is already the updated value after increment.
			const newlyFilledIndex = resistsIntoCurrentLevel - 1;
			// Guard: only animate a valid ring index.
			if (
				newlyFilledIndex >= 0 &&
				newlyFilledIndex < RESIST_RANK_RESISTS_PER_LEVEL
			) {
				const scale = ringScales[newlyFilledIndex];
				if (scale !== undefined) {
					Animated.sequence([
						Animated.spring(scale, {
							toValue: 1.3,
							useNativeDriver: true,
							speed: 40,
							bounciness: 6,
						}),
						Animated.spring(scale, {
							toValue: 1,
							useNativeDriver: true,
							speed: 40,
							bounciness: 6,
						}),
					]).start();
				}
			}
		}
		prevResistCount.current = resistCount;
	}, [resistCount, resistsIntoCurrentLevel, ringScales]);

	// ---------------------------------------------------------------------------
	// Render
	// ---------------------------------------------------------------------------

	return (
		<Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
			<Surface style={styles.container} elevation={2}>
				{/* Title */}
				<Text variant="titleMedium" style={styles.title}>
					Your Resist Rank
				</Text>

				{/* Level header */}
				<View style={styles.headerRow}>
					<View>
						<Text variant="labelMedium" style={styles.label}>
							Rank
						</Text>
						<Text variant="displayMedium" style={styles.levelNumber}>
							{level}
						</Text>
						<Text variant="bodySmall" style={styles.sublabel}>
							{isMaxLevel
								? "Maximum rank reached"
								: `Rank ${level} of ${RESIST_RANK_CAP}`}
						</Text>
					</View>

					{/* Growth ring indicators */}
					<View style={styles.ringsContainer}>
						{rings.map((i) => (
							<Animated.View
								key={i}
								style={[
									styles.ring,
									i < resistsIntoCurrentLevel
										? styles.ringFilled
										: styles.ringEmpty,
									{
										transform: [
											{ scale: ringScales[i] ?? new Animated.Value(1) },
										],
									},
								]}
							/>
						))}
						<Text variant="labelSmall" style={styles.ringsLabel}>
							{isMaxLevel
								? "Max"
								: `${resistsIntoCurrentLevel} / ${RESIST_RANK_RESISTS_PER_LEVEL}`}
						</Text>
					</View>
				</View>

				{/* Progress bar toward next level */}
				<View style={styles.progressSection}>
					<ProgressBar
						progress={progressFraction}
						color={isMaxLevel ? colors.success : colors.primary}
						style={styles.progressBar}
					/>
					{!isMaxLevel && (
						<Text variant="labelSmall" style={styles.progressLabel}>
							{RESIST_RANK_RESISTS_PER_LEVEL - resistsIntoCurrentLevel} more to
							Rank {level + 1}
						</Text>
					)}
					{isMaxLevel && (
						<View style={styles.maxBadge}>
							<Text variant="labelSmall" style={styles.maxBadgeText}>
								Max Rank
							</Text>
						</View>
					)}
				</View>
			</Surface>
		</Animated.View>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		padding: 28,
		borderWidth: 1,
		borderColor: colors.border,
	},
	title: {
		color: colors.text,
		fontWeight: "700",
		marginBottom: 12,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	label: {
		color: colors.muted,
		textTransform: "uppercase",
		letterSpacing: 1.2,
		marginBottom: 4,
	},
	levelNumber: {
		color: colors.primary,
		fontWeight: "700",
		lineHeight: 64,
	},
	sublabel: {
		color: colors.muted,
		marginTop: 2,
	},
	ringsContainer: {
		alignItems: "flex-end",
		gap: 4,
	},
	ring: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginBottom: 3,
	},
	ringFilled: {
		backgroundColor: colors.primary,
	},
	ringEmpty: {
		backgroundColor: colors.border,
	},
	ringsLabel: {
		color: colors.muted,
		marginTop: 4,
	},
	progressSection: {
		gap: 8,
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.border,
	},
	progressLabel: {
		color: colors.muted,
		textAlign: "right",
	},
	maxBadge: {
		alignSelf: "flex-end",
		backgroundColor: colors.success,
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 8,
	},
	maxBadgeText: {
		color: "#0B1220",
		fontWeight: "700",
	},
});
