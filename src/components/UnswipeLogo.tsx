// UnswipeLogo component
// SVG mark: swipe-right stroke + D-curve return arc with arrowhead + accent dot
// The shape reads as a swipe gesture that turns around — the core concept of Unswipe.
// ViewBox: 0 0 44 44
// TypeScript strict mode.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/src/constants/theme';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UnswipeLogoProps {
  markSize?: number;
  layout?: 'horizontal' | 'vertical' | 'mark-only';
  // Kept as ringColor/leafColor for backward compatibility with existing usages.
  ringColor?: string;
  leafColor?: string;
  wordmarkColor?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UnswipeLogo({
  markSize = 40,
  layout = 'horizontal',
  ringColor = colors.primary,
  leafColor = colors.success,
  wordmarkColor = colors.text,
}: UnswipeLogoProps): React.ReactElement {
  const mark = (
    <Svg width={markSize} height={markSize} viewBox="0 0 44 44">
      {/* Horizontal swipe stroke going right */}
      <Path
        d="M 6 26 L 28 26"
        fill="none"
        stroke={ringColor}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* D-shaped return arc: right side loops up and back */}
      <Path
        d="M 28 26 C 40 26 40 14 28 14"
        fill="none"
        stroke={ringColor}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Arrowhead at return point — tip at (28,14), wings open rightward */}
      <Path
        d="M 28 14 L 35 10 M 28 14 L 35 18"
        fill="none"
        stroke={ringColor}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Accent dot at swipe origin */}
      <Circle cx={6} cy={26} r={3.5} fill={leafColor} />
    </Svg>
  );

  if (layout === 'mark-only') return mark;

  const fontSize = Math.round(markSize * 0.54);
  const gap = Math.round(markSize * 0.22);

  if (layout === 'vertical') {
    return (
      <View style={styles.vertical}>
        {mark}
        <Text
          style={[
            styles.wordmark,
            { fontSize, color: wordmarkColor, marginTop: Math.round(markSize * 0.18) },
          ]}
        >
          Unswipe
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.horizontal, { gap }]}>
      {mark}
      <Text style={[styles.wordmark, { fontSize, color: wordmarkColor }]}>Unswipe</Text>
    </View>
  );
}


// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  horizontal: { flexDirection: 'row', alignItems: 'center' },
  vertical: { alignItems: 'center' },
  wordmark: { fontWeight: '800', letterSpacing: 1.5, includeFontPadding: false },
});
