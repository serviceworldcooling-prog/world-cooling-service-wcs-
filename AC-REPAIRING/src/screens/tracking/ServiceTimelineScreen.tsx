import React from 'react';
import { Alert, StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const ServiceTimelineScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params || { bookingId: 'AC-1029' };
  const { bookings } = useApp();

  const booking = bookings.find(b => b.id === bookingId) || bookings[0];

  return (
    <ScreenContainer title="Service Status Timeline" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Short details header card */}
        <View style={styles.bookingCard}>
          <View style={styles.row}>
            <Text style={styles.bookingId}>Booking Reference: #{booking.id}</Text>
            <Text style={styles.price}>₹{booking.totalPrice}</Text>
          </View>
          <Text style={styles.serviceName}>{booking.serviceName}</Text>
          <Text style={styles.scheduleText}>{booking.date} • {booking.time}</Text>
        </View>

        {/* Timeline container */}
        <Text style={styles.sectionTitle}>Service Progress Tracker</Text>
        
        <View style={styles.timelineContainer}>
          {booking.timeline.map((step, index) => {
            const isCompleted = step.done;
            const isLast = index === booking.timeline.length - 1;
            
            // Check if this is the "current" active step
            // It is active if it's NOT done, but the previous one IS done.
            const isActive = !isCompleted && (index === 0 || booking.timeline[index - 1].done);

            return (
              <View key={index} style={styles.timelineItem}>
                
                {/* Left Side: Vertical line and circles */}
                <View style={styles.leftCol}>
                  <View style={[
                    styles.circle,
                    isCompleted ? styles.circleCompleted : isActive ? styles.circleActive : styles.circlePending
                  ]}>
                    {isCompleted ? (
                      <MaterialIcons name="check" size={14} color="#ffffff" />
                    ) : isActive ? (
                      <View style={styles.activeDotInner} />
                    ) : null}
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.verticalLine,
                      isCompleted ? styles.lineCompleted : styles.linePending
                    ]} />
                  )}
                </View>

                {/* Right Side: Step details */}
                <View style={styles.rightCol}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[
                      styles.stepTitleText,
                      isCompleted ? styles.titleCompleted : isActive ? styles.titleActive : styles.titlePending
                    ]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepTime}>{step.time}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>

              </View>
            );
          })}
        </View>

        {/* Technician info card */}
        {booking.technicianName && (
          <View style={styles.techCard}>
            <Text style={styles.techCardLabel}>ASSIGNED AC TECHNICIAN</Text>
            <View style={styles.techRow}>
              <Image source={{ uri: booking.technicianAvatar }} style={styles.techAvatar} />
              <View style={styles.techInfo}>
                <Text style={styles.techName}>{booking.technicianName}</Text>
                <Text style={styles.techPhone}>{booking.technicianPhone}</Text>
              </View>
              <TouchableOpacity 
                style={styles.chatBtn}
                onPress={() => navigation.navigate('Chat', { technicianName: booking.technicianName })}
              >
                <MaterialIcons name="chat" size={16} color="#ffffff" />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Option action */}
        {booking.status === 'Completed' ? (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('RatingsReviews', { bookingId: booking.id })}
          >
            <MaterialIcons name="star" size={20} color="#ffffff" style={{ marginRight: SPACING.sm }} />
            <Text style={styles.actionBtnText}>Rate Service Experience</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => {
              Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking? Cancellations within 2 hours are subject to a ₹50 fee.', [
                { text: 'Keep Booking' },
                { text: 'Cancel Booking', onPress: () => navigation.goBack() }
              ]);
            }}
          >
            <Text style={styles.cancelBtnText}>Cancel Booking Request</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  timelineContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftCol: {
    alignItems: 'center',
    width: 24,
    marginRight: SPACING.sm,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
    backgroundColor: COLORS.surface,
  },
  circleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  circleActive: {
    borderColor: COLORS.secondary,
  },
  activeDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },
  circlePending: {
    borderColor: COLORS.border,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    zIndex: 1,
    marginVertical: -2,
  },
  lineCompleted: {
    backgroundColor: COLORS.success,
  },
  linePending: {
    backgroundColor: COLORS.divider,
  },
  rightCol: {
    flex: 1,
    paddingLeft: SPACING.xs,
    paddingBottom: SPACING.lg,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitleText: {
    fontSize: 14,
    fontWeight: '800',
  },
  titleCompleted: {
    color: COLORS.primary,
  },
  titleActive: {
    color: COLORS.secondary,
  },
  titlePending: {
    color: COLORS.textLight,
  },
  stepTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  techCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  techCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  techPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: ROUNDED.sm,
  },
  chatBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    height: 48,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 48,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
