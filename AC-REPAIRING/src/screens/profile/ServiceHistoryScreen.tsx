import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const ServiceHistoryScreen = ({ navigation }: any) => {
  const { jobs } = useApp();
  const pastJobs = jobs.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  return (
    <ScreenContainer title="Service History" onBack={() => navigation.goBack()}>
      {pastJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="history" size={60} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyTitle}>No past services found</Text>
          <Text style={styles.emptyDesc}>You have no completed or cancelled jobs in your history yet.</Text>
        </View>
      ) : (
        <FlatList
          data={pastJobs}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('JobDetails', { job: item })}
              activeOpacity={0.8}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.id}>#{item.bookingId}</Text>
                  <Text style={styles.name}>{item.serviceType}</Text>
                </View>
                <View style={[
                  styles.badge, 
                  item.status === 'Completed' ? styles.badgeSuccess : styles.badgeDanger
                ]}>
                  <Text style={[
                    styles.badgeText, 
                    item.status === 'Completed' ? styles.badgeTextSuccess : styles.badgeTextDanger
                  ]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="event" size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>{item.preferredDate} • {item.preferredTime}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="person" size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>Customer: {item.customerId?.name}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.priceLabel}>Paid Amount</Text>
                <Text style={styles.priceVal}>₹{item.finalPrice || item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.sm,
  },
  id: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
  },
  badgeSuccess: {
    backgroundColor: COLORS.successLight,
  },
  badgeDanger: {
    backgroundColor: COLORS.dangerLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  badgeTextSuccess: {
    color: COLORS.success,
  },
  badgeTextDanger: {
    color: COLORS.danger,
  },
  details: {
    marginVertical: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
