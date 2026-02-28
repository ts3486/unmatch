// ResistRankCompact — compact rank stat card for the home screen stat row.
// Shows resist rank number and progress toward next rank.
// TypeScript strict mode.

import {
	RESIST_RANK_CAP,
	RESIST_RANK_RESISTS_PER_LEVEL,
} from "@/src/constants/config";
import { colors } from "@/src/constants/theme";
import type React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ResistRankCompactProps {
	level: number;
	resistCount: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResistRankCompact({
	level,
	resistCount,
}: ResistRankCompactProps): React.ReactElement {
	const isMaxLevel = level >= RESIST_RANK_CAP;
	const resistsIntoCurrentLevel = resistCount % RESIST_RANK_RESISTS_PER_LEVEL;

	return (
		<Surface style={styles.card} elevation={2}>
			<Text variant="displaySmall" style={styles.value}>
				{level}
			</Text>
			<Text variant="labelMedium" style={styles.label}>
				rank
			</Text>
			<Text variant="labelSmall" style={styles.progress}>
				{isMaxLevel
					? "Max"
					: `${resistsIntoCurrentLevel}/${RESIST_RANK_RESISTS_PER_LEVEL}`}
			</Text>
		</Surface>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: colors.surface,
		borderRadius: 14,
		padding: 16,
		alignItems: "center",
		borderWidth: 1,
		borderColor: colors.border,
	},
	value: {
		color: colors.primary,
		fontWeight: "800",
		letterSpacing: -1,
		lineHeight: 52,
	},
	label: {
		color: colors.muted,
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginTop: 2,
	},
	progress: {
		color: colors.muted,
		marginTop: 4,
	},
});
