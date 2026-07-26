import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';

export const WarrantyStatusScreen = ({ navigation }: any) => {
  const warranties = [
    {
      id: 'w1',
      partName: 'AC Run Capacitor (50 MFD)',
      bookingId: 'AC-0982',
      status: 'Active',
      issuedOn: '28 June 2026',
      expiryOn: '28 Dec 2026',
      daysLeft: 165,
    },
    {
      id: 'w2',
      partName: 'AC Service Warranty (Cooling Protection)',
      bookingId: 'AC-1029',
      status: 'Active',
      issuedOn: '16 July 2026',
      expiryOn: '16 August 2026',
      daysLeft: 30,
    },
    {
      id: 'w3',
      partName: 'Outdoor Blower Fan Motor',
      bookingId: 'AC-0524',
      status: 'Expired',
      issuedOn: '10 Dec 2025',
      expiryOn: '10 June 2026',
      daysLeft: 0,
    },
  ];

  return (
    <ScreenContainer title="Warranty Status" onBack={() => navigation.goBack()} scroll>
      <Text style={styles.intro}>
        Below is the record of parts replaced and active workmanship warranties linked to your profile:
      </Text>

      {warranties.map((item) => {
        const isActive = item.status === 'Active';
        return (
          <View key={item.id} style={[styles.warrantyCard, !isActive && styles.expiredCard]}>
            <View style={styles.headerRow}>
              <Text style={styles.partName}>{item.partName}</Text>
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: isActive ? COLORS.successLight : COLORS.dangerLight },
                ]}
              >
                <Text style={[styles.statusText, { color: isActive ? COLORS.success : COLORS.danger }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailsBlock}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Linked Booking:</Text>
                <Text style={styles.val}>#{item.bookingId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Issued On:</Text>
                <Text style={styles.val}>{item.issuedOn}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Expiry Date:</Text>
                <Text style={styles.val}>{item.expiryOn}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.footerRow}>
              <MaterialIcons
                name="info-outline"
                size={16}
                color={isActive ? COLORS.success : COLORS.textLight}
              />
              <Text style={[styles.footerText, { color: isActive ? COLORS.success : COLORS.textLight }]}>
                {isActive ? `${item.daysLeft} days of protection remaining` : 'Warranty period elapsed'}
              </Text>
            </View>
          </View>
        );
      })}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  intro: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  warrantyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  expiredCard: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  partName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDED.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailsBlock: {
    backgroundColor: COLORS.divider,
    padding: SPACING.sm,
    borderRadius: ROUNDED.md,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  val: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
