// Manual mock for expo-localization.
// Used in Jest (Node environment) so modules that import src/i18n can run.

export const getLocales = jest.fn().mockReturnValue([{ languageCode: "en" }]);
