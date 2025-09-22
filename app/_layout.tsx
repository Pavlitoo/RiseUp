import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFrameworkReady } from '@/hooks/use-framework-ready';
import { useMusic } from '@/hooks/use-music';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageKey } from '@/hooks/use-translations';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const { authState } = useAuth(); // Видалили loading, оскільки тепер завжди false
  const primaryColor = useThemeColor({}, 'primary');
  const languageKey = useLanguageKey();
  
  // Initialize music
  useMusic();

  // Видалили loading screen, оскільки тепер стан завантажується асинхронно
  // і не блокує інтерфейс

  if (!authState.isAuthenticated) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthWrapper />
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider key={languageKey} value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}