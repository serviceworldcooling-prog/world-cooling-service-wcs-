import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar, Alert, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';

export const ServiceHistoryScreen = ({ navigation }: any) => {
  const { user, jobs, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();
  const pastJobs = jobs.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  const handleStatusChange = async (newStatus: 'Available' | 'On Job' | 'Off Duty') => {
    try {
      await updateTechStatus(newStatus);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert('Status Updated', `Your status has been updated to "${newStatus}"`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update status.');
    }
  };

  const showStatusOptions = () => {
    Alert.alert(
      'Update Duty Status',
      'Select your current status:',
      [
        { text: '🟢 Available', onPress: () => handleStatusChange('Available') },
        { text: '🟡 On Job', onPress: () => handleStatusChange('On Job') },
        { text: '🔴 Off Duty', onPress: () => handleStatusChange('Off Duty') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header exactly matching Dashboard style */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: COLORS.primary }]}>W  C  S</Text>
          <View style={[styles.headerDividerVertical, { backgroundColor: COLORS.border }]} />
          
          <TouchableOpacity 
            style={styles.headerDutyStatus}
            onPress={showStatusOptions}
            activeOpacity={0.8}
          >
            <Text style={dutyLabelStyle}>DUTY STATUS</Text>
            <View style={styles.dutyRow}>
              <View style={[
                styles.dutyDotActive, 
                { 
                  backgroundColor: 
                    user?.technicianStatus === 'Available' ? COLORS.success :
                    user?.technicianStatus === 'On Job' ? '#EAB308' :
                    COLORS.textLight 
                }
              ]} />
              <Text style={styles.dutyText}>
                {user?.technicianStatus || 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={18} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
          contentContainerStyle={styles.scroll}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('JobDetails', { job: item })}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.id}>#{item.bookingId}</Text>
                  <Text style={styles.name}>{item.serviceType}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  item.status === 'Completed' ? styles.badgeSuccess : styles.badgeDanger
                ]}>
                  <Text style={[
                    styles.statusBadgeText, 
                    item.status === 'Completed' ? styles.badgeTextSuccess : styles.badgeTextDanger
                  ]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="event" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.detailText}>{item.preferredDate} • {item.preferredTime}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="person" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={styles.detailText}>Customer: {item.customerId?.name || 'Customer'}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.priceLabel}>Paid Amount</Text>
                <Text style={styles.priceVal}>₹{(item.finalPrice && item.finalPrice > 0) ? item.finalPrice : item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <BottomTabBar navigation={navigation} activeRoute="Profile" />
    </View>
  );
};

const dutyLabelStyle = {
  fontSize: 8,
  fontWeight: '900' as const,
  letterSpacing: 1.5,
  color: COLORS.textSecondary,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(11, 30, 63, 0.1)',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  headerDutyStatus: {
    flex: 1,
    justifyContent: 'center',
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dutyDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -3,
    top: -3,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  scroll: { padding: 16, paddingBottom: 100 },
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
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
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
  statusBadge: {
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
  statusBadgeText: {
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
    borderTopWidth: 1.5,
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
