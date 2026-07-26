import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';
import { MOCK_COUPONS } from '../../constants/mockData';

export const CouponsScreen = ({ route, navigation }: any) => {
  const { bookingDetails } = route.params || { bookingDetails: {} };
  const [promoCode, setPromoCode] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [error, setError] = useState('');

  const handleApplyCoupon = (coupon: any) => {
    if (bookingDetails.price < coupon.minCartValue) {
      setError(`Minimum booking value to apply this coupon is ₹${coupon.minCartValue}.`);
      return;
    }
    setSelectedCoupon(coupon);
    setError('');
  };

  const handleApplyCustomCode = () => {
    const coupon = MOCK_COUPONS.find(c => c.code.toLowerCase() === promoCode.trim().toLowerCase());
    if (coupon) {
      handleApplyCoupon(coupon);
    } else {
      setError('Invalid Promo Code. Please try another one.');
    }
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setError('');
  };

  const handleNext = () => {
    const discount = selectedCoupon ? selectedCoupon.discount : 0;
    const finalTotal = Math.max(0, bookingDetails.totalPrice - discount);
    navigation.navigate('BookingConfirmation', {
      bookingDetails: {
        ...bookingDetails,
        discount,
        totalPrice: finalTotal,
        couponCode: selectedCoupon ? selectedCoupon.code : null,
      }
    });
  };

  return (
    <ScreenContainer title="Apply Coupons" onBack={() => navigation.goBack()}>
      <View style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Custom Promo Code Input */}
          <View style={styles.promoInputRow}>
            <AppInput
              value={promoCode}
              onChangeText={(text) => {
                setPromoCode(text);
                setError('');
              }}
              placeholder="Enter Promo Code"
              style={styles.inputStyle}
            />
            <AppButton
              title="Apply"
              onPress={handleApplyCustomCode}
              style={styles.applyBtn}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Selected Coupon Indicator */}
          {selectedCoupon && (
            <View style={styles.appliedCard}>
              <View style={styles.appliedLeft}>
                <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
                <View style={{ marginLeft: SPACING.sm }}>
                  <Text style={styles.appliedTitle}>Coupon '{selectedCoupon.code}' Applied!</Text>
                  <Text style={styles.appliedSub}>₹{selectedCoupon.discount} savings applied to bill.</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List of Coupons */}
          <Text style={styles.sectionTitle}>Available Coupons</Text>
          {MOCK_COUPONS.map((item) => {
            const isSelected = selectedCoupon?.id === item.id;
            return (
              <View key={item.id} style={[styles.couponCard, isSelected ? styles.couponCardActive : null]}>
                <View style={styles.cardTop}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.code}</Text>
                  </View>
                  <Text style={styles.discountText}>Save ₹{item.discount}</Text>
                </View>
                <Text style={styles.descText}>{item.description}</Text>
                <Text style={styles.minText}>Valid on orders above ₹{item.minCartValue}</Text>
                
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.actionBtn, isSelected ? styles.actionBtnActive : null]}
                    onPress={() => handleApplyCoupon(item)}
                    disabled={isSelected}
                  >
                    <Text style={[styles.actionBtnText, isSelected ? styles.actionBtnTextActive : null]}>
                      {isSelected ? 'Applied' : 'Apply Coupon'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            title={selectedCoupon ? `Proceed (Saved ₹${selectedCoupon.discount})` : "Proceed to Payment"}
            onPress={handleNext}
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
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputStyle: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  applyBtn: {
    width: 90,
    backgroundColor: COLORS.primary,
    height: 48,
    marginTop: 6,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  appliedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.successLight,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    marginVertical: SPACING.sm,
  },
  appliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  appliedSub: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  couponCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  couponCardActive: {
    borderColor: COLORS.success,
    backgroundColor: '#FAFFFB',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: ROUNDED.sm,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  discountText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.success,
  },
  descText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  minText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    height: 32,
    paddingHorizontal: SPACING.md,
    borderRadius: ROUNDED.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnActive: {
    backgroundColor: COLORS.success,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnTextActive: {
    color: '#ffffff',
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
