import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, StatusBar, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING } from '../../constants/theme';

import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

export const SplashScreen = ({ navigation }: any) => {
  const { isAuthenticated, authLoading } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim1 = useRef(new Animated.Value(0)).current;
  const textFadeAnim2 = useRef(new Animated.Value(0)).current;
  const textFadeAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parallel entrance of logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Constant rotation of fan/ac icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    // Sequence for texts
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(textFadeAnim1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(250),
      Animated.timing(textFadeAnim2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(textFadeAnim3, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      delay: 500,
      useNativeDriver: false, // width needs layout animation
    }).start();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Onboarding');
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [authLoading, isAuthenticated]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.brandingContainer}>
        {/* Animated outer ring/circle */}
        <Animated.View
          style={[
            styles.logoCircle,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              backgroundColor: COLORS.primary + '12',
              borderColor: COLORS.primary + '20',
              borderWidth: 2,
            },
          ]}
        >
          {/* Rotating Wind/Fan icon representing cooling */}
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialIcons name="toys" size={80} color={COLORS.primary} />
          </Animated.View>
        </Animated.View>

        {/* Animated text labels */}
        <Animated.Text
          style={[
            styles.title,
            {
              color: COLORS.textPrimary,
              opacity: textFadeAnim1,
              transform: [
                {
                  translateY: textFadeAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          WCS
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              color: COLORS.textSecondary,
              opacity: textFadeAnim2,
              transform: [
                {
                  translateY: textFadeAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          World Cooling Service
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              color: COLORS.textLight,
              opacity: textFadeAnim3,
            },
          ]}
        >
          Premium HVAC Services & Repairs
        </Animated.Text>
      </View>

      {/* Modern thin line progress indicator */}
      <View style={[styles.progressTrack, { backgroundColor: COLORS.border }]}>
        <Animated.View style={[styles.progressBar, { backgroundColor: COLORS.primary, width: progressBarWidth }]} />
      </View>
    </View>
  );
};

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
    shadowColor: COLORS.primary,
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
  },
});
