import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const PaymentMethodScreen = ({ route, navigation }: any) => {
  const { bookingDetails } = route.params || { bookingDetails: {} };
  const { addBooking } = useApp();

  const [paymentMode, setPaymentMode] = useState<'COD' | 'UPI' | 'CARD' | 'NET'>('COD');
  const [loading, setLoading] = useState(false);

  const paymentOptions = [
    { id: 'COD', name: 'Cash / Pay after service', icon: 'payments', desc: 'Pay with Cash, UPI or Card to the technician after completion' },
    { id: 'UPI', name: 'Google Pay / PhonePe / UPI', icon: 'qr-code-scanner', desc: 'Instantly pay using your preferred UPI app' },
    { id: 'CARD', name: 'Credit / Debit Card', icon: 'credit-card', desc: 'Visa, MasterCard, RuPay, Maestro accepted' },
    { id: 'NET', name: 'Net Banking', icon: 'account-balance', desc: 'Pay via SBI, HDFC, ICICI, Axis and other major banks' },
  ];

  const handlePayConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      // Create actual booking state in AppContext
      const newBooking = addBooking({
        serviceName: bookingDetails.serviceName,
        category: bookingDetails.category,
        date: bookingDetails.date,
        time: bookingDetails.time,
        price: bookingDetails.price,
        discount: bookingDetails.discount || 0,
        tax: bookingDetails.tax,
        totalPrice: bookingDetails.totalPrice,
        address: bookingDetails.address,
      });

      setLoading(false);
      navigation.replace('PaymentSuccess', { bookingId: newBooking.id });
    }, 2000);
  };

  return (
    <ScreenContainer title="Payment Mode" onBack={() => navigation.goBack()} loading={loading}>
      <View style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Billing Card Info */}
          <View style={styles.billCard}>
            <Text style={styles.cardTitle}>Bill Summary</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Service charges</Text>
              <Text style={styles.billVal}>₹{bookingDetails.price}</Text>
            </View>
            {bookingDetails.discount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: COLORS.success }]}>Coupon discount ({bookingDetails.couponCode})</Text>
                <Text style={[styles.billVal, { color: COLORS.success }]}>-₹{bookingDetails.discount}</Text>
              </View>
            )}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST & Service Taxes</Text>
              <Text style={styles.billVal}>₹{bookingDetails.tax}</Text>
            </View>
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalVal}>₹{bookingDetails.totalPrice}</Text>
            </View>
          </View>

          {/* Payment Options list */}
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentOptions.map((opt) => {
            const isSelected = paymentMode === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected ? styles.optionCardActive : null]}
                onPress={() => setPaymentMode(opt.id as any)}
                activeOpacity={0.8}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionLeft}>
                    <MaterialIcons name={opt.icon as any} size={22} color={isSelected ? COLORS.secondary : COLORS.primary} />
                    <Text style={[styles.optionName, isSelected ? styles.optionNameActive : null]}>{opt.name}</Text>
                  </View>
                  <MaterialIcons 
                    name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={20} 
                    color={isSelected ? COLORS.primary : COLORS.textLight} 
                  />
                </View>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}

        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            title={`Pay & Confirm Booking (₹${bookingDetails.totalPrice})`}
            onPress={handlePayConfirm}
            icon="verified"
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
  billCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
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
    fontWeight: '500',
  },
  billVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  optionCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  optionNameActive: {
    color: COLORS.secondary,
  },
  optionDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginLeft: 30,
    lineHeight: 16,
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
