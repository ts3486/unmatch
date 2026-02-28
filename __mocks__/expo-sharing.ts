// Manual mock for expo-sharing.
// Used in Jest (Node environment) for data export tests.

export const isAvailableAsync = jest.fn().mockResolvedValue(true);
export const shareAsync = jest.fn().mockResolvedValue(undefined);
