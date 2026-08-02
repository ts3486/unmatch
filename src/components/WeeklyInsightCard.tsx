// WeeklyInsightCard — rotating insight cards derived from urge event data.
// Shows: strongest day, strongest time, and weekly trend.
// Rotates between insights every few seconds with a fade transition.
// TypeScript strict mode.

import { colors } from "@/src/constants/theme";
import type { DayOfWeekCount, TimeOfDayCount } from "@/src/data/repositories";
import type { TFunction } from "i18next";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from "react-native-reanimated";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInsights(
	t: TFunction,
	dowCounts: DayOfWeekCount[],
	timeCounts: TimeOfDayCount[],
	thisWeekResets: number,
	lastWeekResets: number,
): string[] {
	const insights: string[] = [];

	// Strongest day-of-week
	const bestDow = dowCounts.reduce(
		(best, cur) => (cur.count > best.count ? cur : best),
		dowCounts[0] ?? { dayOfWeek: 1, count: 0 },
	);
	if (bestDow.count > 0) {
		const dayLabel = t(`weeklyInsight.dow.${bestDow.dayOfWeek}`, {
			defaultValue: t("weeklyInsight.dow.default"),
		});
		insights.push(t("weeklyInsight.resetMostOn", { day: dayLabel }));
	}

	// Strongest time-of-day
	const bestTime = timeCounts.reduce(
		(best, cur) => (cur.count > best.count ? cur : best),
		timeCounts[0] ?? { bucket: "morning", count: 0 },
	);
	if (bestTime.count > 0) {
		const timeLabel = t(`weeklyInsight.timeOfDay.${bestTime.bucket}`, {
			defaultValue: bestTime.bucket,
		});
		insights.push(t("weeklyInsight.strongestTimeIs", { time: timeLabel }));
	}

	// Weekly trend
	if (lastWeekResets > 0) {
		const pct = Math.round(
			((thisWeekResets - lastWeekResets) / lastWeekResets) * 100,
		);
		if (pct > 0) {
			insights.push(t("weeklyInsight.resetsUp", { pct }));
		} else if (pct < 0) {
			insights.push(t("weeklyInsight.resetsDown", { pct: Math.abs(pct) }));
		} else {
			insights.push(t("weeklyInsight.sameResets"));
		}
	} else if (thisWeekResets > 0) {
		insights.push(
			thisWeekResets > 1
				? t("weeklyInsight.resetsThisWeek", { count: thisWeekResets })
				: t("weeklyInsight.resetThisWeek"),
		);
	}

	return insights;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WeeklyInsightCardProps {
	dowCounts: DayOfWeekCount[];
	timeCounts: TimeOfDayCount[];
	thisWeekResets: number;
	lastWeekResets: number;
	rotateIntervalMs?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WeeklyInsightCard({
	dowCounts,
	timeCounts,
	thisWeekResets,
	lastWeekResets,
	rotateIntervalMs = 4000,
}: WeeklyInsightCardProps): React.ReactElement | null {
	const { t } = useTranslation();
	const insights = buildInsights(
		t,
		dowCounts,
		timeCounts,
		thisWeekResets,
		lastWeekResets,
	);
	const [index, setIndex] = useState(0);
	const opacity = useSharedValue(1);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	useEffect(() => {
		if (insights.length <= 1) return;

		timerRef.current = setInterval(() => {
			// Fade out
			opacity.value = withTiming(
				0,
				{ duration: 300, easing: Easing.in(Easing.ease) },
				() => {
					// After fade-out, advance index and fade in
					opacity.value = withTiming(1, {
						duration: 300,
						easing: Easing.out(Easing.ease),
					});
				},
			);
			setIndex((prev) => (prev + 1) % insights.length);
		}, rotateIntervalMs);

		return () => {
			if (timerRef.current !== null) {
				clearInterval(timerRef.current);
			}
		};
	}, [insights.length, opacity, rotateIntervalMs]);

	if (insights.length === 0) {
		return null;
	}

	const currentInsight = insights[index] ?? insights[0] ?? "";

	return (
		<Card style={styles.card} mode="contained">
			<Card.Content style={styles.content}>
				<Text variant="labelMedium" style={styles.sectionLabel}>
					{t("weeklyInsight.sectionLabel")}
				</Text>
				<Animated.View style={animatedStyle}>
					<Text variant="bodyLarge" style={styles.insightText}>
						{currentInsight}
					</Text>
				</Animated.View>
				{insights.length > 1 && (
					<View style={styles.dots}>
						{insights.map((_, i) => (
							<View
								key={i}
								style={[
									styles.dot,
									i === index ? styles.dotActive : styles.dotInactive,
								]}
							/>
						))}
					</View>
				)}
			</Card.Content>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
	},
	content: {
		paddingVertical: 14,
		gap: 8,
	},
	sectionLabel: {
		color: colors.muted,
		letterSpacing: 0.6,
	},
	insightText: {
		color: colors.text,
		fontWeight: "500",
		minHeight: 28,
	},
	dots: {
		flexDirection: "row",
		gap: 6,
		marginTop: 4,
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	dotActive: {
		backgroundColor: colors.primary,
	},
	dotInactive: {
		backgroundColor: colors.border,
	},
});
