import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Expert AC Service',
    description: 'Get verified HVAC specialists to service, repair, or install your AC within 2 hours.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Real-time Tracking',
    description: 'Track your assigned service technician live on the map from workshop to your doorstep.',
    icon: 'MapPin'
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden costs. Get clear breakdowns, AMC plans, and secure online payment options.',
    icon: 'CreditCard'
  }
];

export default function OnboardingScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/(auth)/permissions');
    }
  };

  const currentIcon = SLIDES[currentSlide].icon;
  const IconComponent = (Icons as any)[currentIcon] || Icons.HelpCircle;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={() => router.push('/(auth)/permissions')}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '10' }]}>
          <IconComponent size={96} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{SLIDES[currentSlide].title}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{SLIDES[currentSlide].description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.dot, 
                { backgroundColor: idx === currentSlide ? colors.primary : colors.border },
                idx === currentSlide && { width: 24 }
              ]} 
            />
          ))}
        </View>

        <PrimaryButton 
          title={currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'} 
          onPress={handleNext} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  }
});
