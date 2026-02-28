// Manual mock for expo-file-system.
// Used in Jest (Node environment) for data export/import tests.

export const documentDirectory = "/mock/documents/";
export const cacheDirectory = "/mock/cache/";

export const writeAsStringAsync = jest.fn().mockResolvedValue(undefined);
export const readAsStringAsync = jest.fn().mockResolvedValue("");
export const deleteAsync = jest.fn().mockResolvedValue(undefined);
export const getInfoAsync = jest
	.fn()
	.mockResolvedValue({ exists: false, isDirectory: false });
