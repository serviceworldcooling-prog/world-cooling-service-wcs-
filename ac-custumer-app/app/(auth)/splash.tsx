import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';

export default function SplashScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brandingContainer}>
        {/* Animated outer ring/circle */}
        <MotiView
          from={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 1500 }}
          style={[styles.logoCircle, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '20', borderWidth: 2 }]}
        >
          {/* Rotating Wind/Fan icon representing cooling */}
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{
              type: 'timing',
              duration: 6000,
              loop: true,
              repeat: Infinity,
            } as any}
          >
            <Icons.Wind size={80} color={colors.primary} />
          </MotiView>
        </MotiView>

        {/* Animated text labels */}
        <MotiText
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 400 }}
          style={[styles.title, { color: colors.text }]}
        >
          WCS
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 650 }}
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          World Cooling Service
        </MotiText>

        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 800, delay: 850 }}
          style={[styles.tagline, { color: colors.textSecondary }]}
        >
          Premium HVAC Services & Repairs
        </MotiText>
      </View>

      {/* Modern thin line progress indicator */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ type: 'timing', duration: 2000, delay: 500 }}
          style={[styles.progressBar, { backgroundColor: colors.primary }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressTrack: {
    width: 140,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 80,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  }
});
