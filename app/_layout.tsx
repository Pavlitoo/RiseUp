import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import 'react-native-reanimated';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { SyncStatus } from '@/components/sync-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFrameworkReady } from '@/hooks/use-framework-ready';
import { useMusic } from '@/hooks/use-music';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const { authState, loading } = useAuth();
  
  // Initialize music
  useMusic();
  
  // Стабільні компоненти без залежностей від мови
  const LoadingScreen = useCallback(() => {
    return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText style={{ fontSize: 18 }}>🌟 RiseUp</ThemedText>
        <ThemedText style={{ marginTop: 10, opacity: 0.7 }}>Завантаження...</ThemedText>
      </ThemedView>
      <StatusBar style="auto" />
    </ThemeProvider>
    );
  }, [colorScheme]);
  
  const AuthScreen = useCallback(() => {
    return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthWrapper />
      <StatusBar style="auto" />
    </ThemeProvider>
    );
  }, [colorScheme]);

  // Show loading screen while auth is initializing
  if (loading) {
    return <LoadingScreen />;
  }

  if (!authState.isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SyncStatus />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}