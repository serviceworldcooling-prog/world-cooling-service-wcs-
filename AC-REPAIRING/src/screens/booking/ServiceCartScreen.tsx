import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';

export const ServiceCartScreen = ({ navigation }: any) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Cart item states
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'AC Wet Servicing', quantity: 1, basePrice: 599, total: 599 },
  ]);

  const [addOns, setAddOns] = useState([
    { id: 'add-1', name: 'Anti-Rust Coating', desc: 'Protects coils from corrosion', price: 299, selected: false },
    { id: 'add-2', name: 'Premium Outer Bracket', desc: 'Heavy duty heavy wall stand', price: 499, selected: false },
    { id: 'add-3', name: 'Extra Drain Pipe (3 meters)', desc: 'Flexible high-density pipe', price: 150, selected: false },
  ]);

  const toggleAddOn = (id: string) => {
    setAddOns(
      addOns.map((add) =>
        add.id === id ? { ...add, selected: !add.selected } : add
      )
    );
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'COOL50') {
      setDiscount(150);
      setCouponApplied(true);
    } else {
      alert('Invalid Promo Code. Try "COOL50"');
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setDiscount(0);
    setCouponCode('');
  };

  const baseTotal = cartItems.reduce((acc, curr) => acc + curr.total, 0);
  const addOnsTotal = addOns.reduce((acc, curr) => acc + (curr.selected ? curr.price : 0), 0);
  const totalBeforeTax = baseTotal + addOnsTotal - discount;
  const gst = Math.round(totalBeforeTax * 0.18);
  const finalPrice = Math.max(0, totalBeforeTax + gst);

  return (
    <ScreenContainer title="Service Cart" onBack={() => navigation.goBack()} scroll>
      {/* Selected Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selected Services</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemMeta}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.basePrice}</Text>
            </View>
            <View style={styles.quantityControls}>
              <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Add-ons List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Add-ons</Text>
        {addOns.map((addon) => (
          <TouchableOpacity
            key={addon.id}
            style={[styles.addOnCard, addon.selected && styles.addOnSelected]}
            onPress={() => toggleAddOn(addon.id)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={addon.selected ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={addon.selected ? COLORS.secondary : COLORS.textLight}
            />
            <View style={styles.addOnMeta}>
              <Text style={styles.addOnName}>{addon.name}</Text>
              <Text style={styles.addOnDesc}>{addon.desc}</Text>
            </View>
            <Text style={styles.addOnPrice}>+₹{addon.price}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coupon Application */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promotions & Coupons</Text>
        {couponApplied ? (
          <View style={styles.appliedPromo}>
            <View style={styles.promoDetails}>
              <MaterialIcons name="local-offer" size={20} color={COLORS.success} />
              <Text style={styles.promoText}>COOL50 Applied (-₹150)</Text>
            </View>
            <TouchableOpacity onPress={removeCoupon}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.couponRow}>
            <AppInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter Promo Code (e.g. COOL50)"
              style={{ flex: 1, marginVertical: 0 }}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bill Details */}
      <View style={styles.billCard}>
        <Text style={styles.billTitle}>Invoice Summary</Text>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Base Amount</Text>
          <Text style={styles.billVal}>₹{baseTotal}</Text>
        </View>
        {addOnsTotal > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Add-ons</Text>
            <Text style={styles.billVal}>+₹{addOnsTotal}</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Discount</Text>
            <Text style={[styles.billVal, { color: COLORS.success }]}>-₹{discount}</Text>
          </View>
        )}
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>GST & Safety Cess (18%)</Text>
          <Text style={styles.billVal}>₹{gst}</Text>
        </View>
        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalVal}>₹{finalPrice}</Text>
        </View>
      </View>

      <AppButton
        title="Select Date & Time"
        onPress={() => {
          navigation.navigate('SelectDateTime', {
            bookingDetails: {
              items: cartItems,
              addOns: addOns.filter((a) => a.selected),
              totalPrice: finalPrice,
            },
          });
        }}
        variant="secondary"
        icon="chevron-right"
        style={styles.checkoutBtn}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  cartItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 2,
  },
  quantityControls: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: ROUNDED.xs,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addOnCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  addOnSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  addOnMeta: {
    flex: 1,
    marginLeft: SPACING.sm,
    paddingRight: SPACING.xs,
  },
  addOnName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addOnDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  addOnPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    paddingHorizontal: SPACING.md,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  appliedPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
    borderWidth: 1,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
  },
  promoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  promoText: {
    fontWeight: '700',
    color: COLORS.success,
    fontSize: 13,
  },
  removeText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 12,
  },
  billCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  billVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  checkoutBtn: {
    marginBottom: SPACING.xl,
  },
});
