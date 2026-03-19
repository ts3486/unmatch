// Panic route redirect — the meditate flow now lives on the Home tab.
// This file keeps the route valid for deep links but hides from the tab bar
// (via href: null in _layout.tsx).

import { Redirect } from "expo-router";
import type React from "react";

export default function PanicRedirect(): React.ReactElement {
	return <Redirect href="/(tabs)" />;
}
