// UrgeKindCard — tappable card for selecting an urge kind in the panic flow.
// Uses react-native-paper Surface. No emojis. TypeScript strict mode.

import { colors } from "@/src/constants/theme";
import type { UrgeKind } from "@/src/domain/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";

// ---------------------------------------------------------------------------
// Icon map (no emojis — MaterialCommunityIcons only)
// ---------------------------------------------------------------------------

const ICON_MAP: Record<UrgeKind, string> = {
	swipe: "gesture-swipe-horizontal",
	check: "bell-ring-outline",
	spend: "credit-card-outline",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UrgeKindCardProps {
	urgeKind: UrgeKind;
	label: string;
	helpText: string;
	onPress: () => void;
	selected?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Large tappable card for selecting an urge kind.
 * Highlights with a primary-colored border when selected.
 */
export function UrgeKindCard({
	urgeKind,
	label,
	helpText,
	onPress,
	selected = false,
}: UrgeKindCardProps): React.ReactElement {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityHint={helpText}
		>
			{({ pressed }) => (
				<Surface
					style={[
						styles.card,
						selected && styles.cardSelected,
						pressed && styles.cardPressed,
					]}
					elevation={selected ? 4 : 2}
				>
					<View style={styles.iconContainer}>
						<MaterialCommunityIcons
							name={
								ICON_MAP[urgeKind] as React.ComponentProps<
									typeof MaterialCommunityIcons
								>["name"]
							}
							size={32}
							color={selected ? colors.primary : colors.muted}
						/>
					</View>
					<View style={styles.textContainer}>
						<Text
							variant="titleMedium"
							style={[styles.label, selected && styles.labelSelected]}
						>
							{label}
						</Text>
						<Text variant="bodySmall" style={styles.helpText}>
							{helpText}
						</Text>
					</View>
					{selected && (
						<MaterialCommunityIcons
							name="check-circle"
							size={22}
							color={colors.primary}
							style={styles.checkIcon}
						/>
					)}
				</Surface>
			)}
		</Pressable>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surface,
		borderRadius: 14,
		padding: 18,
		marginBottom: 12,
		borderWidth: 1.5,
		borderColor: colors.border,
		gap: 14,
	},
	cardSelected: {
		borderColor: colors.primary,
		backgroundColor: "#0D1829",
	},
	cardPressed: {
		opacity: 0.85,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 12,
		backgroundColor: colors.background,
		alignItems: "center",
		justifyContent: "center",
	},
	textContainer: {
		flex: 1,
		gap: 3,
	},
	label: {
		color: colors.text,
		fontWeight: "600",
	},
	labelSelected: {
		color: colors.primary,
	},
	helpText: {
		color: colors.muted,
	},
	checkIcon: {
		marginLeft: 4,
	},
});
