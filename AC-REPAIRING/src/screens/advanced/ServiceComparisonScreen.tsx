import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const ServiceComparisonScreen = ({ navigation }: any) => {
  const comparisonData = {
    services: [
      {
        name: 'Standard Clean',
        price: 399,
        pressure: 'Low (Hand Spray)',
        depth: 'Surface level filters & tray',
        guarantee: 'No Warranty',
        suitability: 'Regular dusting / maintenance',
        color: COLORS.textSecondary,
      },
      {
        name: 'Power Jet Wash',
        price: 599,
        pressure: 'High (Jet Pump)',
        depth: 'Deep coils, fins, drain lines',
        guarantee: '30-Day Service Warranty',
        suitability: 'Strong cooling restoration',
        color: COLORS.secondary,
      },
      {
        name: 'Eco Foam Clean',
        price: 899,
        pressure: 'Jet Pump + Eco Foam',
        depth: 'Complete sterilization & deodorization',
        guarantee: '45-Day Service Warranty',
        suitability: 'Allergy relief / Musty smells',
        color: COLORS.success,
      },
    ],
  };

  return (
    <ScreenContainer title="Compare Service Types" onBack={() => navigation.goBack()} scroll>
      <Text style={styles.subHeader}>Choose the ideal cleaning depth for your Air Conditioner:</Text>

      {comparisonData.services.map((item, idx) => (
        <View key={idx} style={styles.compareCard}>
          <View style={[styles.cardHeader, { borderLeftColor: item.color }]}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.servicePrice}>₹{item.price}</Text>
          </View>

          <View style={styles.specsContainer}>
            <View style={styles.specRow}>
              <MaterialIcons name="speed" size={16} color={COLORS.textLight} />
              <Text style={styles.specLabel}>Pressure Level:</Text>
              <Text style={styles.specVal}>{item.pressure}</Text>
            </View>

            <View style={styles.specRow}>
              <MaterialIcons name="layers" size={16} color={COLORS.textLight} />
              <Text style={styles.specLabel}>Cleaning Scope:</Text>
              <Text style={styles.specVal}>{item.depth}</Text>
            </View>

            <View style={styles.specRow}>
              <MaterialIcons name="verified" size={16} color={COLORS.textLight} />
              <Text style={styles.specLabel}>Guarantee:</Text>
              <Text style={[styles.specVal, { fontWeight: '700', color: item.color }]}>{item.guarantee}</Text>
            </View>

            <View style={styles.specRow}>
              <MaterialIcons name="info-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.specLabel}>Best For:</Text>
              <Text style={styles.specVal}>{item.suitability}</Text>
            </View>
          </View>

          <AppButton
            title={`Select ${item.name}`}
            onPress={() => {
              navigation.navigate('BookService', {
                category: { name: item.name, price: item.price },
              });
            }}
            variant={item.name === 'Power Jet Wash' ? 'secondary' : 'primary'}
            style={styles.selectBtn}
          />
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  compareCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: SPACING.sm,
    borderLeftWidth: 4,
    marginBottom: SPACING.md,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  specsContainer: {
    backgroundColor: COLORS.divider,
    padding: SPACING.sm,
    borderRadius: ROUNDED.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    width: 100,
    marginLeft: 6,
  },
  specVal: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  selectBtn: {
    height: 40,
  },
});
