// Logo component — split heart mark for Unmatch
// Uses assets/images/logo.png
// TypeScript strict mode.

import { colors } from "@/src/constants/theme";
import type React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LogoProps {
	markSize?: number;
	layout?: "horizontal" | "vertical" | "mark-only";
	wordmarkColor?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoSource = require("@/assets/images/logo.png") as number;

export function Logo({
	markSize = 40,
	layout = "horizontal",
	wordmarkColor = colors.text,
}: LogoProps): React.ReactElement {
	const mark = (
		<Image
			source={logoSource}
			style={{ width: markSize, height: markSize }}
			resizeMode="contain"
		/>
	);

	if (layout === "mark-only") return mark;

	const fontSize = Math.round(markSize * 0.54);
	const gap = Math.round(markSize * 0.22);

	if (layout === "vertical") {
		return (
			<View style={styles.vertical}>
				{mark}
				<Text
					style={[
						styles.wordmark,
						{
							fontSize,
							color: wordmarkColor,
							marginTop: Math.round(markSize * 0.18),
						},
					]}
				>
					Unmatch
				</Text>
			</View>
		);
	}

	return (
		<View style={[styles.horizontal, { gap }]}>
			{mark}
			<Text style={[styles.wordmark, { fontSize, color: wordmarkColor }]}>
				Unmatch
			</Text>
		</View>
	);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
	horizontal: { flexDirection: "row", alignItems: "center" },
	vertical: { alignItems: "center" },
	wordmark: {
		fontWeight: "800",
		letterSpacing: 1.5,
		includeFontPadding: false,
	},
});
