// Root layout — wraps all routes in providers and configures the Stack navigator.
// No default exports other than the required route component.
// TypeScript strict mode.

import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

// Suppress the LogBox warning overlay in dev builds.
// It covers interactive elements (e.g. CTA buttons) and breaks E2E tests.
// Warnings are still logged to the Metro console.
LogBox.ignoreAllLogs();
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '@/src/constants/theme';
import { DatabaseProvider } from '@/src/contexts/DatabaseContext';
import { AppStateProvider } from '@/src/contexts/AppStateContext';
import { AnalyticsProvider } from '@/src/contexts/AnalyticsContext';

export default function RootLayout(): React.ReactElement {
  return (
    <PaperProvider theme={paperTheme}>
      <DatabaseProvider>
        <AppStateProvider>
          <AnalyticsProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: '#0B1220' },
                headerTintColor: '#E6EDF7',
                headerShadowVisible: false,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen
                name="paywall"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="settings/blocker-guide"
                options={{ title: 'Blocker Guide' }}
              />
              <Stack.Screen
                name="settings/privacy"
                options={{ title: 'Privacy' }}
              />
              <Stack.Screen
                name="progress/day/[date]"
                options={{ title: 'Day Detail' }}
              />
              <Stack.Screen
                name="checkin"
                options={{ title: 'Daily Check-in' }}
              />
            </Stack>
          </AnalyticsProvider>
        </AppStateProvider>
      </DatabaseProvider>
    </PaperProvider>
  );
}
