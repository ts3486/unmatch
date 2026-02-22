// AnalyticsContext — provides the AnalyticsAdapter throughout the app.
// No default exports. TypeScript strict mode.

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  createAnalytics,
  type AnalyticsAdapter,
} from '@/src/services/analytics';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AnalyticsContext = createContext<AnalyticsAdapter | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps): React.ReactElement {
  // The adapter is created once for the lifetime of the app.
  const adapter = useMemo(() => createAnalytics(), []);

  return (
    <AnalyticsContext.Provider value={adapter}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the AnalyticsAdapter instance.
 * Must be used inside AnalyticsProvider; throws otherwise.
 */
export function useAnalytics(): AnalyticsAdapter {
  const value = useContext(AnalyticsContext);
  if (value === null) {
    throw new Error('useAnalytics must be used inside AnalyticsProvider.');
  }
  return value;
}
