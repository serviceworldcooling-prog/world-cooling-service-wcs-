import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const TrackTechnicianScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params || { bookingId: 'AC-1029' };
  const { bookings } = useApp();

  const booking = bookings.find(b => b.id === bookingId) || bookings[0];

  const [eta, setEta] = useState(15);
  const mapProgress = new Animated.Value(0);

  useEffect(() => {
    // Animate map tracking dot closer to center over time
    Animated.loop(
      Animated.sequence([
        Animated.timing(mapProgress, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: false,
        }),
        Animated.delay(1000),
        Animated.timing(mapProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        })
      ])
    ).start();

    // Decrement ETA slightly
    const timer = setInterval(() => {
      setEta(prev => (prev > 1 ? prev - 1 : 15));
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const handleCall = () => {
    Alert.alert(
      'Calling Technician',
      `Connecting call to ${booking.technicianName || 'Rahul Sharma'} at ${booking.technicianPhone || '+91 98765 43210'}...`,
      [{ text: 'End Call' }]
    );
  };

  const handleMessage = () => {
    navigation.navigate('Chat', { technicianName: booking.technicianName || 'Rahul Sharma' });
  };

  const dotLeft = mapProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['15%', '46%']
  });

  const dotTop = mapProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['25%', '47%']
  });

  return (
    <ScreenContainer title="Track Service Man" onBack={() => navigation.goBack()}>
      <View style={styles.flex}>
        
        {/* Map Simulator */}
        <View style={styles.mapContainer}>
          {/* Mock Grid Lines and Map Graphics */}
          <View style={styles.mapGridLineH} />
          <View style={[styles.mapGridLineH, { top: '66%' }]} />
          <View style={styles.mapGridLineV} />
          <View style={[styles.mapGridLineV, { left: '66%' }]} />
          
          <View style={styles.routePath} />

          {/* Home Destination Pin */}
          <View style={styles.homePinBox}>
            <View style={styles.homePinOutline}>
              <MaterialIcons name="home" size={24} color="#ffffff" />
            </View>
            <Text style={styles.pinLabel}>Your Home</Text>
          </View>

          {/* Moving Technician Pin */}
          <Animated.View style={[styles.techPinBox, { left: dotLeft, top: dotTop }]}>
            <View style={styles.techPinOutline}>
              <MaterialIcons name="directions-bike" size={20} color="#ffffff" />
            </View>
            <Text style={styles.techPinLabel}>Rahul (On Bike)</Text>
          </Animated.View>
        </View>

        {/* Technician Summary Bar */}
        <View style={styles.techCard}>
          <View style={styles.techHeader}>
            <Image 
              source={{ uri: booking.technicianAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' }} 
              style={styles.avatar} 
            />
            <View style={styles.techInfo}>
              <Text style={styles.techName}>{booking.technicianName || 'Rahul Sharma'}</Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{booking.technicianRating || 4.8} Rating</Text>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.experienceText}>Expert Level</Text>
              </View>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionCircle} onPress={handleMessage}>
                <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionCircle, { marginLeft: SPACING.sm }]} onPress={handleCall}>
                <MaterialIcons name="phone" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ETA and Status */}
          <View style={styles.etaRow}>
            <View style={styles.etaCol}>
              <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
              <Text style={styles.etaVal}>{eta} Mins</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.etaCol}>
              <Text style={styles.etaLabel}>DISTANCE</Text>
              <Text style={styles.etaVal}>2.4 km away</Text>
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity 
            style={styles.timelineBtn}
            onPress={() => navigation.navigate('ServiceTimeline', { bookingId: booking.id })}
          >
            <Text style={styles.timelineBtnText}>View Service Timeline</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E0F2FE', // Light blue map background
    borderRadius: ROUNDED.md,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapGridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 12,
    backgroundColor: '#BAE6FD', // simulated roads
  },
  mapGridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 12,
    backgroundColor: '#BAE6FD',
  },
  routePath: {
    position: 'absolute',
    top: '47%',
    left: '20%',
    width: '30%',
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  homePinBox: {
    position: 'absolute',
    left: '45%',
    top: '42%',
    alignItems: 'center',
  },
  homePinOutline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDED.xs,
    marginTop: 4,
    ...SHADOWS.small,
  },
  techPinBox: {
    position: 'absolute',
    alignItems: 'center',
  },
  techPinOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  techPinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDED.xs,
    marginTop: 4,
    ...SHADOWS.small,
  },
  techCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    ...SHADOWS.medium,
  },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.sm,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 2,
  },
  bullet: {
    fontSize: 12,
    color: COLORS.textLight,
    marginHorizontal: 4,
  },
  experienceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  etaCol: {
    flex: 1,
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    fontWeight: '800',
    letterSpacing: 1,
  },
  etaVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.divider,
  },
  timelineBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
