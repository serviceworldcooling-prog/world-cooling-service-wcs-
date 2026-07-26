import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../store/useAppStore';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Colors } from '../theme/colors';

export default function RootLayout() {
  const { isAuthenticated, themeMode, initAuth } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isNavReady = navigationState?.key != null;
  const [authReady, setAuthReady] = React.useState(false);

  const isDark = themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Restore session from stored token on app start
  useEffect(() => {
    initAuth().finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!isNavReady || !authReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      const timer = setTimeout(() => {
        router.replace('/(auth)/splash');
      }, 0);
      return () => clearTimeout(timer);
    } else if (isAuthenticated && inAuthGroup) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, segments, isNavReady, authReady]);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
