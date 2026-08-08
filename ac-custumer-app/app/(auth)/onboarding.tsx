import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { MotiView, MotiText } from 'moti';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Expert AC Service',
    description: 'Get verified HVAC specialists to service, repair, or install your AC within 2 hours.',
    image: require('../../assets/onboarding_service.png'),
    bgAccent: '#0F766E'
  },
  {
    title: 'Real-time Tracking',
    description: 'Track your assigned service technician live on the map from workshop to your doorstep.',
    image: require('../../assets/onboarding_tracking.png'),
    bgAccent: '#14B8A6'
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden costs. Get clear breakdowns, AMC plans, and secure online payment options.',
    image: require('../../assets/onboarding_pricing.png'),
    bgAccent: '#F97316'
  }
];

export default function OnboardingScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.push('/(auth)/permissions');
    }
  };

  const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => {
    return (
      <View style={[styles.slideContainer, { width }]}>
        <View style={styles.contentCard}>
          {/* Decorative Background Elements */}
          <View style={[styles.circleBg, { backgroundColor: item.bgAccent + '06' }]} />
          <View style={[styles.circleBgOuter, { borderColor: item.bgAccent + '10', borderWidth: 1 }]} />

          <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: -15 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 1200, delay: 100 }}
            style={[styles.imageWrapper, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
          >
            <Image
              source={item.image}
              style={styles.slideImage}
              contentFit="cover"
              transition={300}
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
            style={styles.textContainer}
          >
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.description}</Text>
          </MotiView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.push('/(auth)/permissions')}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef as any}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, index) => index.toString()}
        style={styles.flatList}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => {
            // Animated style for pagination dots
            const animatedDotStyle = useAnimatedStyle(() => {
              const dotWidth = interpolate(
                scrollX.value,
                [(idx - 1) * width, idx * width, (idx + 1) * width],
                [8, 28, 8],
                Extrapolate.CLAMP
              );
              const opacity = interpolate(
                scrollX.value,
                [(idx - 1) * width, idx * width, (idx + 1) * width],
                [0.35, 1, 0.35],
                Extrapolate.CLAMP
              );
              return {
                width: dotWidth,
                opacity,
              };
            });

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.dot,
                  animatedDotStyle,
                  { backgroundColor: colors.primary }
                ]}
              />
            );
          })}
        </View>

        <PrimaryButton 
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'} 
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
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentCard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  circleBg: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: 10,
  },
  circleBgOuter: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -30,
  },
  imageWrapper: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  }
});
