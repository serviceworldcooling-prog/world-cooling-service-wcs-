import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const SubscriptionPlansScreen = ({ navigation }: any) => {
  const plans = [
    {
      id: 'sub-1',
      name: 'Lite Care Plan',
      price: 1999,
      period: 'Yearly',
      color: COLORS.primary,
      features: [
        '2 Premium Wet Jet Servicings',
        '1 Free Breakdown Inspection visit',
        '10% discount on all spare parts replacement',
        '30-day service warranty after each job',
      ],
      popular: false,
    },
    {
      id: 'sub-2',
      name: 'CoolShield Premium',
      price: 3499,
      period: 'Yearly',
      color: COLORS.secondary,
      features: [
        '4 Premium Wet Jet Servicings',
        'Unlimited free breakdown visits',
        'Free gas refilling up to 500g',
        'Free capacitor & relay replacement',
        'Priority dispatch (within 4 hours)',
      ],
      popular: true,
    },
    {
      id: 'sub-3',
      name: 'Commercial Max',
      price: 7999,
      period: 'Yearly',
      color: '#3A0CA3',
      features: [
        'Quarterly comprehensive services',
        'Dedicated senior technician assigned',
        'Unlimited gas refilling & spares coverage',
        'Priority 2-hour SLA response',
        'Digital maintenance records & reports',
      ],
      popular: false,
    },
  ];

  return (
    <ScreenContainer title="Annual Maintenance (AMC)" onBack={() => navigation.goBack()} scroll>
      <Text style={styles.intro}>
        Protect your air conditioners and save up to 40% on repairs with our comprehensive annual maintenance plans.
      </Text>

      {plans.map((plan) => (
        <View key={plan.id} style={[styles.planCard, plan.popular && styles.planCardPopular]}>
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
          )}

          <View style={[styles.planHeader, { borderLeftColor: plan.color }]}>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPeriod}>{plan.period} Subscription</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.planPrice}>₹{plan.price}</Text>
              <Text style={styles.priceSub}>/ year</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresList}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <MaterialIcons name="done" size={16} color={plan.color} style={{ marginRight: 8 }} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <AppButton
            title="Subscribe Now"
            onPress={() => {
              navigation.navigate('PaymentMethod', {
                bookingDetails: {
                  serviceName: `AMC: ${plan.name}`,
                  totalPrice: plan.price,
                },
              });
            }}
            variant={plan.popular ? 'secondary' : 'primary'}
            style={styles.actionBtn}
          />
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  intro: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  planCardPopular: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ROUNDED.xs,
    position: 'absolute',
    top: -12,
    left: SPACING.md,
    zIndex: 10,
  },
  popularText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: SPACING.sm,
    borderLeftWidth: 4,
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  planPeriod: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '700',
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceSub: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  featuresList: {
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionBtn: {
    height: 44,
  },
});
