import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING } from '../../constants/theme';
import { AppButton } from '../../components/Common';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to CoolBreeze',
    subtitle: 'AC Service Excellence',
    description: 'Instantly book expert air conditioning wet servicing, repair, gas refills, and installations from certified professionals.',
    icon: 'ac-unit',
    iconColor: COLORS.secondary,
  },
  {
    id: '2',
    title: 'Expert Technicians',
    subtitle: 'Verified & Certified Specialists',
    description: 'All our service professionals are background-checked, vetted, and have 5+ years of experience. We provide a 30-day service warranty.',
    icon: 'verified-user',
    iconColor: '#10B981',
  },
  {
    id: '3',
    title: 'Live Tracking & Support',
    subtitle: 'Real-time GPS Tracking',
    description: 'Monitor your assigned AC technician in real-time as they navigate to your doorstep. Chat directly inside the app for seamless support.',
    icon: 'my-location',
    iconColor: '#3B82F6',
  },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const slide = SLIDES[currentSlideIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoName}>CoolBreeze</Text>
        {currentSlideIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.slideContainer}>
        <View style={[styles.illustrationCard, { backgroundColor: COLORS.surface }]}>
          <View style={[styles.iconWrapper, { backgroundColor: slide.iconColor + '10' }]}>
            <MaterialIcons name={slide.icon as any} size={80} color={slide.iconColor} />
          </View>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: slide.iconColor }]} />
            <Text style={[styles.badgeText, { color: slide.iconColor }]}>{slide.subtitle}</Text>
          </View>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentSlideIndex ? styles.indicatorActive : null,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <AppButton
          title={currentSlideIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          icon={currentSlideIndex === SLIDES.length - 1 ? 'arrow-forward' : undefined}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    height: 50,
  },
  logoName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  illustrationCard: {
    width: width - 48,
    height: width - 80,
    borderRadius: ROUNDED.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: ROUNDED.full,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: COLORS.secondary,
  },
  actionBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: ROUNDED.md,
  },
});
