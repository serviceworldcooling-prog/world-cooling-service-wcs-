import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const EmergencyBookingScreen = ({ navigation }: any) => {
  const { user, addBooking } = useApp();

  const [brand, setBrand] = useState('Voltas');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState(user.phone);
  const [selectedAddress, setSelectedAddress] = useState(user.addresses[0] || null);

  const brands = ['Voltas', 'Daikin', 'Lloyd', 'Blue Star', 'Samsung', 'LG', 'Others'];

  const handleBook = () => {
    if (!desc) {
      Alert.alert('Details Needed', 'Please describe the issue briefly.');
      return;
    }
    if (!selectedAddress) {
      Alert.alert('Address Needed', 'Please select or save a location.');
      return;
    }

    // Place simulated emergency booking in state
    const newBooking = addBooking({
      serviceName: `Emergency AC Repair (${brand})`,
      category: 'Repair',
      date: 'Today',
      time: 'Immediate Dispatch (45 mins)',
      price: 599, // Base emergency charge
      discount: 0,
      tax: 108,
      totalPrice: 707,
      address: selectedAddress.address,
    });

    Alert.alert(
      'Emergency Dispatch Active!',
      `Technician Rahul Sharma is being dispatched immediately to your address. Arrival in 35-45 mins.`,
      [{ text: 'Track Technician', onPress: () => navigation.replace('TrackTechnician', { bookingId: newBooking.id }) }]
    );
  };

  return (
    <ScreenContainer title="Emergency AC Dispatch" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Warning Alert Banner */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <MaterialIcons name="flash-on" size={24} color="#ffffff" />
            <Text style={styles.alertTitle}>Blazing Fast 45-Min Dispatch</Text>
          </View>
          <Text style={styles.alertDesc}>
            Our dispatch agents will prioritize your request. A visiting and breakdown diagnosis technician will be dispatched within 45 mins. A flat premium service fee of ₹200 applies.
          </Text>
        </View>

        {/* Brand Selector */}
        <Text style={styles.sectionTitle}>Select AC Brand</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsRow}>
          {brands.map((b) => {
            const isSelected = brand === b;
            return (
              <TouchableOpacity
                key={b}
                style={[styles.brandChip, isSelected ? styles.brandChipActive : null]}
                onPress={() => setBrand(b)}
                activeOpacity={0.8}
              >
                <Text style={[styles.brandText, isSelected ? styles.brandTextActive : null]}>{b}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Inputs */}
        <View style={styles.form}>
          <AppInput
            label="DESCRIBE BREAKDOWN ISSUE"
            value={desc}
            onChangeText={setDesc}
            placeholder="AC not cooling at all / throwing water / sparking sound / fan motor stopped"
            icon="error-outline"
          />

          <AppInput
            label="EMERGENCY CONTACT PHONE"
            value={phone}
            onChangeText={setPhone}
            placeholder="Contact number"
            keyboardType="phone-pad"
            icon="phone"
            style={{ marginTop: SPACING.md }}
          />
        </View>

        {/* Address Selector */}
        <Text style={styles.sectionTitle}>Select Address</Text>
        {user.addresses.map((item) => {
          const isSelected = selectedAddress?.id === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.addrCard, isSelected ? styles.addrCardActive : null]}
              onPress={() => setSelectedAddress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.addrHeader}>
                <Text style={styles.addrLabel}>{item.label}</Text>
                <MaterialIcons
                  name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={18}
                  color={isSelected ? COLORS.secondary : COLORS.textLight}
                />
              </View>
              <Text style={styles.addrText} numberOfLines={1}>{item.address}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Submit */}
        <AppButton
          title="Dispatch Emergency Tech Now"
          onPress={handleBook}
          icon="offline-bolt"
          style={styles.bookBtn}
        />

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  alertCard: {
    backgroundColor: COLORS.danger,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.medium,
    marginBottom: SPACING.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginLeft: 6,
  },
  alertDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  brandsRow: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.md,
    marginBottom: SPACING.sm,
  },
  brandChip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: ROUNDED.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginRight: SPACING.xs,
    ...SHADOWS.small,
  },
  brandChipActive: {
    borderColor: COLORS.danger,
    backgroundColor: '#FFF1F2',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  brandTextActive: {
    color: COLORS.danger,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginTop: SPACING.sm,
  },
  addrCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  addrCardActive: {
    borderColor: COLORS.danger,
    backgroundColor: '#FFF1F2',
  },
  addrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addrLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addrText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bookBtn: {
    backgroundColor: COLORS.danger,
    height: 50,
    marginTop: SPACING.xl,
  },
});
