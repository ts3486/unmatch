// i18next init — bundled resources only, no remote backend.
// TypeScript strict mode.

import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ja from "./locales/ja.json";

export type SupportedLocale = "en" | "ja";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "ja"];

export function isSupportedLocale(value: string): value is SupportedLocale {
	return (SUPPORTED_LOCALES as string[]).includes(value);
}

export function resolveDeviceLocale(): SupportedLocale {
	const languageCode = Localization.getLocales()[0]?.languageCode ?? "en";
	return isSupportedLocale(languageCode) ? languageCode : "en";
}

void i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		ja: { translation: ja },
	},
	lng: resolveDeviceLocale(),
	fallbackLng: "en",
	interpolation: { escapeValue: false },
	compatibilityJSON: "v4",
});

export default i18n;
