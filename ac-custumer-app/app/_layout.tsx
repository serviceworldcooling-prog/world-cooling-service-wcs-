import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../store/useAppStore';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { View } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';

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
    
    const segs = segments as string[];
    const isPermissionPage = 
      segs[1] === 'perm-location' ||
      segs[1] === 'perm-camera' ||
      segs[1] === 'perm-media' ||
      segs[1] === 'perm-microphone' ||
      segs[1] === 'permissions';

    if (!isAuthenticated && isPermissionPage) {
      const timer = setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
      return () => clearTimeout(timer);
    } else if (!isAuthenticated && !inAuthGroup) {
      const timer = setTimeout(() => {
        router.replace('/(auth)/splash');
      }, 0);
      return () => clearTimeout(timer);
    } else if (isAuthenticated && inAuthGroup) {
      if (
        segs[1] === 'permissions' ||
        segs[1] === 'perm-location' ||
        segs[1] === 'perm-camera' ||
        segs[1] === 'perm-media' ||
        segs[1] === 'perm-microphone'
      ) return;
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

  const showGlobalTabBar = isAuthenticated && segments[0] === 'screens';

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {showGlobalTabBar && <BottomTabBar />}
      </View>
    </ThemeProvider>
  );
}
