// Manual mock for expo-file-system/legacy.
// Mirrors the legacy API surface used by data-export and data-import services.
// Used in Jest (Node environment) where native modules are unavailable.

export const documentDirectory = "/mock/documents/";
export const cacheDirectory = "/mock/cache/";

export const writeAsStringAsync = jest.fn().mockResolvedValue(undefined);
export const readAsStringAsync = jest.fn().mockResolvedValue("");
export const deleteAsync = jest.fn().mockResolvedValue(undefined);
export const getInfoAsync = jest
	.fn()
	.mockResolvedValue({ exists: false, isDirectory: false });
