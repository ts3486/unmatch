// Manual mock for expo-document-picker.
// Used in Jest (Node environment) for data import tests.

export const getDocumentAsync = jest.fn().mockResolvedValue({
	canceled: true,
	assets: null,
});
