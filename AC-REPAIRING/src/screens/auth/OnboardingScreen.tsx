import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity, FlatList, Animated, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING } from '../../constants/theme';
import { AppButton } from '../../components/Common';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Job Assignments',
    description: 'Receive and accept AC repair, wet servicing, and installation jobs directly from the WCS dispatcher.',
    image: require('../../../assets/onboarding_service.png'),
    bgAccent: '#0F766E'
  },
  {
    title: 'Live Navigation',
    description: 'Get precise routing to customer locations and share real-time progress updates with a tap.',
    image: require('../../../assets/onboarding_tracking.png'),
    bgAccent: '#14B8A6'
  },
  {
    title: 'Digital Reports',
    description: 'Upload service completion proof, parts details, and get digital signatures from customers.',
    image: require('../../../assets/onboarding_pricing.png'),
    bgAccent: '#F97316'
  }
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

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
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={[styles.slideContainer, { width }]}>
        <View style={styles.contentCard}>
          {/* Decorative Background Elements */}
          <View style={[styles.circleBg, { backgroundColor: item.bgAccent + '08' }]} />
          <View style={[styles.circleBgOuter, { borderColor: item.bgAccent + '15', borderWidth: 1 }]} />

          <View style={[styles.imageWrapper, { backgroundColor: '#ffffff' }]}>
            <Image
              source={item.image}
              style={styles.slideImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: COLORS.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.desc, { color: COLORS.textSecondary }]}>{item.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={[styles.skipText, { color: COLORS.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, index) => index.toString()}
        style={styles.flatList}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(idx - 1) * width, idx * width, (idx + 1) * width],
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange: [(idx - 1) * width, idx * width, (idx + 1) * width],
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: COLORS.primary,
                  }
                ]}
              />
            );
          })}
        </View>

        <AppButton 
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'} 
          onPress={handleNext}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
};

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
    shadowColor: '#000',
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
  },
  actionBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.md,
  }
});
