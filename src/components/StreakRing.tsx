// Circular streak display with animated arc.
// Shows "DAYS CLEAN" label, streak count, and a motivational title.
// TypeScript strict mode.

import { colors } from "@/src/constants/theme";
import type React from "react";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

// ---------------------------------------------------------------------------
// Animated circle
// ---------------------------------------------------------------------------

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ---------------------------------------------------------------------------
// Streak titles based on day count
// ---------------------------------------------------------------------------

function getStreakTitle(days: number): string {
	if (days === 0) return "GETTING STARTED";
	if (days <= 2) return "BUILDING MOMENTUM";
	if (days <= 5) return "GAINING STRENGTH";
	if (days <= 10) return "DETERMINED";
	if (days <= 20) return "UNSTOPPABLE";
	if (days <= 30) return "BREAKTHROUGH";
	if (days <= 60) return "TRANSFORMED";
	if (days <= 90) return "LEGENDARY";
	return "TRANSCENDENT";
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StreakRingProps {
	streak: number;
	bestStreak: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RING_SIZE = 220;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Arc caps at 30 days for full circle
const MAX_DAYS_FOR_FULL = 30;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StreakRing({
	streak,
	bestStreak,
}: StreakRingProps): React.ReactElement {
	const progress = useSharedValue(0);
	const targetProgress = Math.min(streak / MAX_DAYS_FOR_FULL, 1);

	useEffect(() => {
		progress.value = withTiming(targetProgress, { duration: 1000 });
	}, [targetProgress, progress]);

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
	}));

	const streakLabel = useMemo(() => {
		if (streak === 0) return "0d";
		return `${streak}d`;
	}, [streak]);

	const title = useMemo(() => getStreakTitle(streak), [streak]);

	return (
		<View style={styles.container}>
			<Svg
				width={RING_SIZE}
				height={RING_SIZE}
				viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
			>
				<Defs>
					<LinearGradient id="streakGrad" x1="0" y1="0" x2="1" y2="1">
						<Stop offset="0%" stopColor={colors.primary} />
						<Stop offset="100%" stopColor="#A855F7" />
					</LinearGradient>
				</Defs>

				{/* Background track */}
				<Circle
					cx={RING_SIZE / 2}
					cy={RING_SIZE / 2}
					r={RADIUS}
					stroke={colors.border}
					strokeWidth={STROKE_WIDTH}
					fill="none"
					opacity={0.5}
				/>

				{/* Progress arc */}
				<AnimatedCircle
					cx={RING_SIZE / 2}
					cy={RING_SIZE / 2}
					r={RADIUS}
					stroke="url(#streakGrad)"
					strokeWidth={STROKE_WIDTH}
					fill="none"
					strokeLinecap="round"
					strokeDasharray={CIRCUMFERENCE}
					animatedProps={animatedProps}
					rotation={-90}
					origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
				/>
			</Svg>

			{/* Center text overlay */}
			<View style={styles.centerContent}>
				<Text style={styles.daysCleanLabel}>CHECK-INS</Text>
				<Text style={styles.streakNumber}>{streakLabel}</Text>
				<Text style={styles.title}>{title}</Text>
			</View>
		</View>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 24,
	},
	centerContent: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
	},
	daysCleanLabel: {
		color: colors.muted,
		fontSize: 13,
		fontWeight: "700",
		letterSpacing: 2,
		marginBottom: 4,
	},
	streakNumber: {
		color: colors.text,
		fontSize: 56,
		fontWeight: "700",
		lineHeight: 64,
	},
	title: {
		color: colors.muted,
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 1.5,
		marginTop: 4,
	},
});
