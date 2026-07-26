import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const MembershipScreen = ({ navigation }: any) => {
  const { user, updateProfile } = useApp();

  const handleUpgrade = (tier: 'Gold' | 'Platinum') => {
    updateProfile({ membership: tier });
    Alert.alert(
      'Membership Upgraded!',
      `Congratulations! You are now a CoolBreeze ${tier} member. Enjoy free wet servicing & priority technicians.`,
      [{ text: 'Great!', onPress: () => navigation.goBack() }]
    );
  };

  const benefits = [
    { title: 'Free AC Wet Jet Services', desc: 'Get 2 free wet services every year worth ₹1,198' },
    { title: 'Priority Dispatch Support', desc: 'Technicians dispatched within 30 mins during peak summer' },
    { title: 'Zero Service Call Fees', desc: 'Pay no visiting or inspection charges for repairs' },
    { title: 'Flat 10% Off Spares & Spares Parts', desc: 'Save money on capacitors, fans, gas topups' },
  ];

  return (
    <ScreenContainer title="Membership & Clubs" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Tier status indicator card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>YOUR ACTIVE MEMBERSHIP</Text>
          <Text style={styles.membershipTier}>{user.membership} Tier</Text>
          <Text style={styles.statusDesc}>Expires in 10 months. You have saved ₹850 this month.</Text>
        </View>

        {/* Benefits list */}
        <Text style={styles.sectionTitle}>Exclusive Club Member Benefits</Text>
        <View style={styles.benefitsCard}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <MaterialIcons name="check-circle" size={20} color={COLORS.success} style={{ marginRight: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upgrade options pricing */}
        <Text style={styles.sectionTitle}>Select Upgrade Package</Text>
        
        {/* Gold Package */}
        <View style={styles.pkgCard}>
          <View style={styles.pkgHeader}>
            <View>
              <Text style={styles.pkgName}>CoolBreeze Gold</Text>
              <Text style={styles.pkgSub}>Best for single-family homes</Text>
            </View>
            <Text style={styles.price}>₹999/yr</Text>
          </View>
          <TouchableOpacity 
            style={[styles.pkgBtn, user.membership === 'Gold' ? styles.pkgBtnActive : null]}
            onPress={() => handleUpgrade('Gold')}
            disabled={user.membership === 'Gold'}
          >
            <Text style={styles.pkgBtnText}>{user.membership === 'Gold' ? 'Active Package' : 'Upgrade to Gold'}</Text>
          </TouchableOpacity>
        </View>

        {/* Platinum Package */}
        <View style={styles.pkgCard}>
          <View style={styles.pkgHeader}>
            <View>
              <Text style={styles.pkgName}>CoolBreeze Platinum</Text>
              <Text style={styles.pkgSub}>Best for multiple AC units & AMC coverage</Text>
            </View>
            <Text style={styles.price}>₹1,999/yr</Text>
          </View>
          <TouchableOpacity 
            style={[styles.pkgBtn, user.membership === 'Platinum' ? styles.pkgBtnActive : null]}
            onPress={() => handleUpgrade('Platinum')}
            disabled={user.membership === 'Platinum'}
          >
            <Text style={styles.pkgBtnText}>{user.membership === 'Platinum' ? 'Active Package' : 'Upgrade to Platinum'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  statusCard: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.md,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
    marginBottom: SPACING.md,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  membershipTier: {
    fontSize: 26,
    fontWeight: '900',
    color: '#D4AF37', // Gold color
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
  },
  statusDesc: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  benefitsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.sm,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  benefitDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  pkgCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  pkgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  pkgName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pkgSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  pkgBtn: {
    backgroundColor: COLORS.primary,
    height: 40,
    borderRadius: ROUNDED.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pkgBtnActive: {
    backgroundColor: COLORS.success,
  },
  pkgBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
