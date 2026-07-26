import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const BookServiceScreen = ({ route, navigation }: any) => {
  const { category } = route.params || { category: { id: '1', name: 'AC Wet Servicing', price: 599, description: 'Deep water jet cleaning' } };
  
  const [acType, setAcType] = useState<'Split' | 'Window'>('Split');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const basePrice = category.price;
  const acTypeMultiplier = acType === 'Split' ? 1.0 : 0.85; // Window AC is slightly cheaper
  const unitPrice = Math.floor(basePrice * acTypeMultiplier);
  
  const addons = [
    { id: 'drain', name: 'Drain pipe leak repair', price: 199, icon: 'plumbing' },
    { id: 'perfume', name: 'Premium air freshener spray', price: 99, icon: 'opacity' },
    { id: 'bracket', name: 'Outdoor unit bracket check', price: 149, icon: 'build' },
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(addonId => addonId !== id) : [...prev, id]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const subTotal = (unitPrice * quantity) + addonsTotal;
  const gstTax = Math.floor(subTotal * 0.18);
  const total = subTotal + gstTax;

  const handleNext = () => {
    navigation.navigate('SelectDateTime', {
      bookingDetails: {
        serviceName: category.name,
        category: category.name,
        acType,
        quantity,
        addonsPrice: addonsTotal,
        price: subTotal,
        tax: gstTax,
        totalPrice: total,
      }
    });
  };

  return (
    <ScreenContainer title="Service Details" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Service Title Card */}
        <View style={styles.card}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDesc}>{category.description || 'Professional AC repair and support'}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>4.9 (1.2k+ reviews)</Text>
          </View>
        </View>

        {/* AC Type Selector */}
        <Text style={styles.sectionTitle}>Select AC Type</Text>
        <View style={styles.acTypeRow}>
          <TouchableOpacity 
            style={[styles.typeCard, acType === 'Split' ? styles.typeCardActive : null]}
            onPress={() => setAcType('Split')}
          >
            <MaterialIcons name="layers" size={28} color={acType === 'Split' ? COLORS.secondary : COLORS.primary} />
            <Text style={[styles.typeText, acType === 'Split' ? styles.typeTextActive : null]}>Split AC</Text>
            <Text style={styles.typePrice}>₹{basePrice}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeCard, acType === 'Window' ? styles.typeCardActive : null]}
            onPress={() => setAcType('Window')}
          >
            <MaterialIcons name="grid-on" size={28} color={acType === 'Window' ? COLORS.secondary : COLORS.primary} />
            <Text style={[styles.typeText, acType === 'Window' ? styles.typeTextActive : null]}>Window AC</Text>
            <Text style={styles.typePrice}>₹{Math.floor(basePrice * 0.85)}</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityCard}>
          <View>
            <Text style={styles.qtyTitle}>Number of Units</Text>
            <Text style={styles.qtyDesc}>Select how many AC units need service</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity 
              style={[styles.counterBtn, quantity <= 1 ? styles.counterBtnDisabled : null]}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <MaterialIcons name="remove" size={20} color={quantity <= 1 ? COLORS.textLight : COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.counterBtn}
              onPress={() => setQuantity(quantity + 1)}
            >
              <MaterialIcons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add-ons */}
        <Text style={styles.sectionTitle}>Add Extras (Optional)</Text>
        <View style={styles.addonsList}>
          {addons.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);
            return (
              <TouchableOpacity 
                key={addon.id} 
                style={[styles.addonItem, isSelected ? styles.addonItemActive : null]}
                onPress={() => toggleAddon(addon.id)}
                activeOpacity={0.7}
              >
                <View style={styles.addonLeft}>
                  <MaterialIcons name={addon.icon as any} size={20} color={isSelected ? COLORS.secondary : COLORS.textSecondary} />
                  <Text style={styles.addonName}>{addon.name}</Text>
                </View>
                <View style={styles.addonRight}>
                  <Text style={styles.addonPrice}>+₹{addon.price}</Text>
                  <MaterialIcons 
                    name={isSelected ? 'check-box' : 'check-box-outline-blank'} 
                    size={20} 
                    color={isSelected ? COLORS.primary : COLORS.textLight} 
                    style={{ marginLeft: SPACING.sm }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bill Summary */}
        <Text style={styles.sectionTitle}>Price Summary</Text>
        <View style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{acType} AC Wet Jet Service (x{quantity})</Text>
            <Text style={styles.billVal}>₹{unitPrice * quantity}</Text>
          </View>
          {selectedAddons.length > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Add-ons Selection</Text>
              <Text style={styles.billVal}>₹{addonsTotal}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST Taxes & Service Charges (18%)</Text>
            <Text style={styles.billVal}>₹{gstTax}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotalRow]}>
            <Text style={styles.totalLabel}>Total Payable Price</Text>
            <Text style={styles.totalVal}>₹{total}</Text>
          </View>
        </View>

        {/* Next Button */}
        <AppButton
          title="Select Date & Time"
          onPress={handleNext}
          icon="event"
          style={styles.nextBtn}
        />

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.md,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  categoryDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  acTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  typeCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  typeTextActive: {
    color: COLORS.secondary,
  },
  typePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quantityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.small,
  },
  qtyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  qtyDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  counterBtnDisabled: {
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  qtyVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginHorizontal: SPACING.md,
  },
  addonsList: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  addonItemActive: {
    backgroundColor: '#FAFDFB',
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addonName: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  addonRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addonPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  billCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.lg,
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
  billTotalRow: {
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
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
});
