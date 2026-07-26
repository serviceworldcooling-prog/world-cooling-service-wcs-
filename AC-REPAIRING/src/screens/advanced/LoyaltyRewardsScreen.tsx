import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const LoyaltyRewardsScreen = ({ navigation }: any) => {
  const rewards = {
    points: 450,
    tier: 'Gold Tier Member',
    nextTierPoints: 1000,
    benefits: [
      '5% extra cashback on all services automatically',
      'Priority technician dispatch within 2 hours',
      'Free AC health checkups twice a year',
    ],
    vouchers: [
      { id: 'v1', title: '₹100 Off on Next Wet Servicing', points: 200, claimed: false },
      { id: 'v2', title: 'Free Gas Top-up (worth ₹500)', points: 600, claimed: false },
      { id: 'v3', title: 'Free Capacitor Replacement', points: 400, claimed: false },
    ],
  };

  return (
    <ScreenContainer title="Cool Rewards Loyalty" onBack={() => navigation.goBack()} scroll>
      {/* Loyalty Header */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <View>
            <Text style={styles.pointsTitle}>Your Balance</Text>
            <View style={styles.pointsRow}>
              <MaterialIcons name="stars" size={32} color={COLORS.secondary} />
              <Text style={styles.pointsVal}>{rewards.points}</Text>
              <Text style={styles.pointsUnit}> pts</Text>
            </View>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{rewards.tier}</Text>
          </View>
        </View>

        {/* Progress bar to next tier */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(rewards.points / rewards.nextTierPoints) * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{rewards.points} pts</Text>
            <Text style={styles.progressText}>Next Tier: {rewards.nextTierPoints} pts</Text>
          </View>
        </View>
      </View>

      {/* Tier Benefits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exclusive Tier Benefits</Text>
        <View style={styles.benefitsCard}>
          {rewards.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <MaterialIcons name="check-circle" size={18} color={COLORS.secondary} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Redeemable Vouchers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redeem Points for Vouchers</Text>
        {rewards.vouchers.map((voucher) => {
          const canRedeem = rewards.points >= voucher.points;
          return (
            <View key={voucher.id} style={styles.voucherCard}>
              <View style={styles.voucherLeft}>
                <MaterialIcons name="card-giftcard" size={24} color={canRedeem ? COLORS.secondary : COLORS.textLight} />
                <View style={styles.voucherMeta}>
                  <Text style={styles.voucherTitle}>{voucher.title}</Text>
                  <Text style={styles.voucherCost}>{voucher.points} Points Needed</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, !canRedeem && styles.redeemDisabled]}
                disabled={!canRedeem}
                onPress={() => alert(`Successfully redeemed: ${voucher.title}!`)}
              >
                <Text style={styles.redeemBtnText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  pointsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  pointsVal: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 6,
  },
  pointsUnit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
  tierBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: ROUNDED.full,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: ROUNDED.full,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
  },
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
  benefitsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  benefitIcon: {
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: '600',
  },
  voucherCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherMeta: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  voucherTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  voucherCost: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  redeemBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: ROUNDED.xs,
  },
  redeemDisabled: {
    backgroundColor: COLORS.border,
  },
  redeemBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
