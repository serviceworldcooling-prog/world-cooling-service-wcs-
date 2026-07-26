import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton } from '../../components/Common';

export const PaymentSuccessScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params || { bookingId: 'AC-1092' };

  const handleTrack = () => {
    navigation.replace('TrackTechnician', { bookingId });
  };

  const handleDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Animated Checkbox Icon Box */}
        <View style={styles.iconOuterCircle}>
          <View style={styles.iconInnerCircle}>
            <MaterialIcons name="check" size={54} color="#ffffff" />
          </View>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your AC Service Request has been registered successfully.</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>BOOKING REFERENCE ID</Text>
          <Text style={styles.bookingId}>#{bookingId}</Text>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialIcons name="info-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>We are assigning a nearby technician. You will receive an SMS and Push Notification shortly.</Text>
          </View>
        </View>

      </View>

      <View style={styles.footer}>
        <AppButton
          title="Track Service Man (Live)"
          onPress={handleTrack}
          icon="my-location"
          style={styles.primaryBtn}
        />
        <AppButton
          title="Back to Home Dashboard"
          onPress={handleDashboard}
          variant="outline"
          style={styles.secondaryBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconOuterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconInnerCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.small,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  bookingId: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    lineHeight: 16,
  },
  footer: {
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    marginBottom: SPACING.sm,
  },
  secondaryBtn: {
    height: 52,
    borderColor: COLORS.primary,
  },
});
