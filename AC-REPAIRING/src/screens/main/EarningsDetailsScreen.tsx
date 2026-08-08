import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Alert, LayoutAnimation, Platform, RefreshControl } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export const EarningsDetailsScreen = ({ navigation }: any) => {
  const { user, jobs, unreadCount, updateTechStatus, loadJobs } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (loadJobs) {
        await loadJobs();
      }
    } catch (err: any) {
      Alert.alert('Reload Failed', err.message || 'Could not fetch latest earnings data.');
    } finally {
      setRefreshing(false);
    }
  }, [loadJobs]);

  // ── Compute earnings from real completed jobs ──────────────────────────
  const completedJobs = (jobs || []).filter(j => j.status === 'Completed');

  const getJobPayout = (j: any) => (j && typeof j.finalPrice === 'number' && j.finalPrice > 0) ? j.finalPrice : (j?.price || 0);

  const totalEarned = (jobs || [])
    .filter(j => j.status !== 'Cancelled')
    .reduce((sum, j) => sum + getJobPayout(j), 0);

  const onlineEarnings = completedJobs
    .filter(j => j.isPaid)
    .reduce((sum, j) => sum + getJobPayout(j), 0);

  const cashEarnings = completedJobs
    .filter(j => !j.isPaid)
    .reduce((sum, j) => sum + getJobPayout(j), 0);

  const completedCount = completedJobs.length;
  const incentiveBonus = completedCount >= 5 ? 500 : 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

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

      {/* Header */}
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
            <Text style={styles.dutyLabel}>DUTY STATUS</Text>
            <View style={styles.dutyRow}>
              <View style={[
                styles.dutyDotActive,
                {
                  backgroundColor:
                    user?.technicianStatus === 'Available' ? COLORS.success :
                      user?.technicianStatus === 'On Job' ? '#EAB308' :
                        COLORS.textLight,
                }
              ]} />
              <Text style={styles.dutyText}>{user?.technicianStatus || 'Offline'}</Text>
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >

        {/* ── Main Earnings Card ───────────────────────────────────────── */}
        <View style={[styles.mainCard, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.cardHeader}>TOTAL EARNINGS — COMPLETED JOBS</Text>
          <Text style={styles.cardAmount}>
            ₹{(totalEarned + incentiveBonus).toLocaleString('en-IN')}.00
          </Text>
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardSubText}>
              {completedCount} job{completedCount !== 1 ? 's' : ''} completed
            </Text>
            {incentiveBonus > 0 ? (
              <View style={styles.settleBadge}>
                <Text style={styles.settleBadgeText}>🎯 BONUS UNLOCKED</Text>
              </View>
            ) : (
              <View style={styles.settleBadge}>
                <Text style={styles.settleBadgeText}>
                  {5 - completedCount > 0 ? `${5 - completedCount} MORE FOR BONUS` : 'GREAT WORK!'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Stats Chips ─────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: COLORS.success + '40', backgroundColor: COLORS.success + '08' }]}>
            <MaterialIcons name="check-circle" size={22} color={COLORS.success} />
            <Text style={[styles.statVal, { color: COLORS.success }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed Jobs</Text>
          </View>
          <View style={[styles.statBox, { borderColor: '#EAB308' + '40', backgroundColor: '#EAB308' + '08' }]}>
            <MaterialIcons name="account-balance-wallet" size={22} color="#EAB308" />
            <Text style={[styles.statVal, { color: '#EAB308' }]}>
              ₹{cashEarnings.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Cash Collected</Text>
          </View>
        </View>

        {/* ── Breakdown ───────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>COLLECTION & EARNING BREAKDOWN</Text>
        <View style={styles.breakdownGroup}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Online Payments (Client Direct)</Text>
            <Text style={[styles.breakdownVal, { color: COLORS.success }]}>
              ₹{onlineEarnings.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Cash Collected (Needs Deposition)</Text>
            <Text style={[styles.breakdownVal, { color: '#EAB308' }]}>
              ₹{cashEarnings.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.breakdownLabel}>Weekly Target Incentive Bonus</Text>
            <Text style={[styles.breakdownVal, { color: COLORS.secondary }]}>
              {incentiveBonus > 0
                ? `+ ₹${incentiveBonus} (Unlocked 🎯)`
                : `₹0 (Need ${Math.max(0, 5 - completedCount)} more jobs)`}
            </Text>
          </View>
        </View>

        {/* ── Completed Job History ────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>COMPLETED JOB HISTORY</Text>

        {completedJobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="account-balance-wallet" size={44} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No completed jobs yet</Text>
            <Text style={styles.emptyDesc}>
              Your earnings will appear here once you complete assigned bookings.
            </Text>
          </View>
        ) : (
          <View style={styles.cardGroup}>
            {completedJobs.map((job, idx) => {
              const amount = getJobPayout(job);
              const paymentMode = job.isPaid ? 'Online' : 'Cash';
              const paymentColor = job.isPaid ? COLORS.success : '#EAB308';
              return (
                <TouchableOpacity
                  key={job._id}
                  style={[styles.logRow, idx < completedJobs.length - 1 && styles.borderBottom]}
                  onPress={() => navigation.navigate('JobDetails', { job })}
                  activeOpacity={0.85}
                >
                  <View style={styles.logLeft}>
                    <View style={[styles.logIconBox, { backgroundColor: COLORS.success + '12' }]}>
                      <MaterialIcons name="build" size={15} color={COLORS.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logId} numberOfLines={1}>
                        {job.serviceType || 'AC Service'}
                      </Text>
                      <Text style={styles.logMeta}>
                        {job.customerId?.name || 'Customer'}  ·  {job.preferredDate || formatDate(job.createdAt)}
                      </Text>
                      <Text style={styles.logMeta} numberOfLines={1}>
                        {job.address?.split(',')[0] || '—'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.logAmount}>₹{amount.toLocaleString('en-IN')}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: paymentColor + '18' }]}>
                      <View style={[styles.successDot, { backgroundColor: paymentColor }]} />
                      <Text style={[styles.statusText, { color: paymentColor }]}>{paymentMode}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
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
  logoText: { fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  headerDividerVertical: { width: 1, height: 24, marginHorizontal: 12 },
  headerDutyStatus: { flex: 1, justifyContent: 'center' },
  dutyLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.5, color: COLORS.textSecondary },
  dutyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dutyDotActive: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  dutyText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  menuButton: {
    width: 38, height: 38, borderRadius: 8, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', right: -3, top: -3, borderRadius: 7,
    minWidth: 14, height: 14, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 2,
  },
  badgeText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  scroll: { padding: 16, paddingBottom: 110 },

  // Main card
  mainCard: {
    borderRadius: ROUNDED.md, padding: 20, marginBottom: 20,
    borderWidth: 1.5, borderColor: COLORS.primary, ...SHADOWS.medium,
  },
  cardHeader: {
    color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5,
  },
  cardAmount: {
    color: '#ffffff', fontSize: 34, fontWeight: '900', marginTop: 8, letterSpacing: -0.5,
  },
  cardInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16,
  },
  cardSubText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  settleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
  },
  settleBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '900' },

  // Stats row
  statsRow: {
    flexDirection: 'row', gap: 12, marginBottom: 24,
  },
  statBox: {
    flex: 1, borderRadius: ROUNDED.md, borderWidth: 1.5,
    padding: 16, alignItems: 'center', backgroundColor: '#FFFFFF',
    borderColor: 'rgba(11, 30, 63, 0.08)',
    ...SHADOWS.small,
  },
  statVal: { fontSize: 18, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginTop: 4 },

  // Breakdown
  sectionTitle: {
    fontSize: 12, fontWeight: '900', color: COLORS.primary,
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 12, marginLeft: 4,
  },
  breakdownGroup: {
    backgroundColor: '#ffffff', borderRadius: ROUNDED.md,
    borderWidth: 1.5, borderColor: 'rgba(11, 30, 63, 0.08)',
    paddingHorizontal: 16, marginBottom: 28, ...SHADOWS.small,
  },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1.5, borderBottomColor: COLORS.divider,
  },
  breakdownLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  breakdownVal: { fontSize: 14, fontWeight: '800' },

  // History list
  cardGroup: {
    backgroundColor: '#ffffff', borderRadius: ROUNDED.md,
    borderWidth: 1.5, borderColor: 'rgba(11, 30, 63, 0.08)',
    overflow: 'hidden', ...SHADOWS.small,
  },
  logRow: {
    flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'space-between',
  },
  logLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  logIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  borderBottom: { borderBottomWidth: 1.5, borderBottomColor: 'rgba(11, 30, 63, 0.05)' },
  logId: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  logMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  logAmount: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: ROUNDED.full,
  },
  successDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Empty state
  emptyBox: {
    alignItems: 'center', paddingVertical: 64,
    backgroundColor: '#ffffff', borderRadius: ROUNDED.md,
    borderWidth: 1.5, borderColor: 'rgba(11, 30, 63, 0.08)', ...SHADOWS.small,
  },
  emptyTitle: {
    fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginTop: 14,
  },
  emptyDesc: {
    fontSize: 13, color: COLORS.textSecondary, textAlign: 'center',
    marginTop: 8, paddingHorizontal: 32, lineHeight: 20,
  },
});
