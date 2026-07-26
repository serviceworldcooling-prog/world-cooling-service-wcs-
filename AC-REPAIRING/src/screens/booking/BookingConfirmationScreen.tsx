import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const BookingConfirmationScreen = ({ route, navigation }: any) => {
  const { bookingDetails } = route.params || { bookingDetails: {} };

  const handleProceed = () => {
    navigation.navigate('PaymentMethod', { bookingDetails });
  };

  return (
    <ScreenContainer title="Review Booking" onBack={() => navigation.goBack()}>
      <View style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.serviceName}>{bookingDetails.serviceName}</Text>
              <Text style={styles.qty}>Qty: {bookingDetails.quantity}</Text>
            </View>
            <Text style={styles.acType}>Type: {bookingDetails.acType} AC</Text>
          </View>

          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.card}>
            <View style={styles.rowAlign}>
              <MaterialIcons name="event" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.boldText}>{bookingDetails.date}</Text>
                <Text style={styles.subText}>{bookingDetails.time}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Service Address</Text>
          <View style={styles.card}>
            <View style={styles.rowAlign}>
              <MaterialIcons name="room" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.addressText}>{bookingDetails.address}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Pricing Summary</Text>
          <View style={styles.card}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Base Service Rate</Text>
              <Text style={styles.billVal}>₹{bookingDetails.price}</Text>
            </View>
            {bookingDetails.discount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: COLORS.success }]}>Applied Code Discount</Text>
                <Text style={[styles.billVal, { color: COLORS.success }]}>-₹{bookingDetails.discount}</Text>
              </View>
            )}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Taxes & Fees (18%)</Text>
              <Text style={styles.billVal}>₹{bookingDetails.tax}</Text>
            </View>
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalVal}>₹{bookingDetails.totalPrice}</Text>
            </View>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            title="Proceed to Payments"
            onPress={handleProceed}
            icon="payment"
            style={styles.nextBtn}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  qty: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  acType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boldText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  billVal: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
});
