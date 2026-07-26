import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Image, Alert, ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import type { Job, JobStatus } from '../../api/jobsApi';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  Pending:      { bg: '#FEF9C3', text: '#854D0E', icon: 'schedule' },
  Upcoming:     { bg: '#FEF3C7', text: '#92400E', icon: 'thumb-up' },
  'In Progress':{ bg: '#E0F2FE', text: '#0369A1', icon: 'build' },
  Completed:    { bg: '#ECFDF5', text: '#065F46', icon: 'check-circle' },
  Cancelled:    { bg: '#FEE2E2', text: '#991B1B', icon: 'cancel' },
};

export const AssignedJobsScreen = ({ navigation }: any) => {
  const { user, jobs, jobsLoading, loadJobs, unreadCount } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'done'>('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }, [loadJobs]);

  const activeJobs    = jobs.filter(j => ['Pending', 'Upcoming', 'In Progress'].includes(j.status));
  const completedJobs = jobs.filter(j => ['Completed', 'Cancelled'].includes(j.status));
  const currentList   = activeTab === 'active' ? activeJobs : completedJobs;

  const renderJob = ({ item }: { item: Job }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['Upcoming'];
    const customer = item.customerId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('JobDetails', { job: item })}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.jobIdRow}>
            <Text style={styles.jobId}>#{item.bookingId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <MaterialIcons name={cfg.icon as any} size={11} color={cfg.text} style={{ marginRight: 3 }} />
              <Text style={[styles.statusText, { color: cfg.text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{item.serviceType}</Text>
          {item.isEmergency && (
            <View style={styles.emergencyBadge}>
              <MaterialIcons name="warning" size={12} color="#DC2626" />
              <Text style={styles.emergencyText}>EMERGENCY</Text>
            </View>
          )}
        </View>

        {/* Customer row */}
        <View style={styles.customerRow}>
          <Image
            source={{ uri: customer?.avatar || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer?.name || 'Customer'}</Text>
            <Text style={styles.customerPhone}>{customer?.phone || '—'}</Text>
          </View>
          {item.isLiveLocation && (
            <View style={styles.liveBadge}>
              <MaterialIcons name="gps-fixed" size={12} color={COLORS.success} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.preferredDate}  ·  {item.preferredTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="room" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
          </View>
          {item.problemDescription ? (
            <View style={styles.detailRow}>
              <MaterialIcons name="notes" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText} numberOfLines={2}>{item.problemDescription}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>₹{(item.finalPrice || item.price || 0).toLocaleString()}</Text>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('JobDetails', { job: item })}
          >
            <Text style={styles.viewBtnText}>
              {item.status === 'Completed' ? 'View Report' : 'View & Action'}
            </Text>
            <MaterialIcons name="chevron-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer noHeader backgroundColor={COLORS.background}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }}
            style={styles.userAvatar}
          />
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'Technician'} 👋</Text>
            <Text style={styles.subGreeting}>{user?.specialty || 'AC Repair Specialist'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
        contentContainerStyle={styles.summaryContent}
      >
        {[
          { label: 'Pending',     value: jobs.filter(j => j.status === 'Pending').length,       color: '#854D0E', bg: '#FEF9C3' },
          { label: 'Upcoming',    value: jobs.filter(j => j.status === 'Upcoming').length,      color: '#92400E', bg: '#FEF3C7' },
          { label: 'In Progress', value: jobs.filter(j => j.status === 'In Progress').length,   color: '#0369A1', bg: '#E0F2FE' },
          { label: 'Completed',   value: jobs.filter(j => j.status === 'Completed').length,     color: '#065F46', bg: '#ECFDF5' },
        ].map(s => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Jobs ({activeJobs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'done' && styles.tabActive]}
          onPress={() => setActiveTab('done')}
        >
          <Text style={[styles.tabText, activeTab === 'done' && styles.tabTextActive]}>
            Completed ({completedJobs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {jobsLoading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={item => item._id}
          renderItem={renderJob}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="assignment" size={56} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>
                No {activeTab === 'active' ? 'active' : 'completed'} jobs
              </Text>
              <Text style={styles.emptyDesc}>
                {activeTab === 'active'
                  ? 'Admin will assign new service requests here.'
                  : 'Your completed jobs will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.primary, marginRight: SPACING.sm },
  greeting: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  subGreeting: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small, position: 'relative' },
  notifBadge: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.danger, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  summaryScroll: { maxHeight: 90 },
  summaryContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  summaryCard: { borderRadius: ROUNDED.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center', minWidth: 90 },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 4, marginHorizontal: SPACING.md, marginVertical: SPACING.sm, borderRadius: ROUNDED.md, ...SHADOWS.small },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: ROUNDED.sm },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.small },
  cardHeader: { marginBottom: SPACING.sm },
  jobIdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  jobId: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: ROUNDED.full },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  serviceName: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  emergencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  emergencyText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: SPACING.sm },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  customerPhone: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.successLight, paddingHorizontal: 7, paddingVertical: 3, borderRadius: ROUNDED.full },
  liveText: { fontSize: 10, fontWeight: '700', color: COLORS.success, marginLeft: 3 },
  detailsBox: { backgroundColor: COLORS.background, borderRadius: ROUNDED.sm, padding: SPACING.sm, gap: 5, marginBottom: SPACING.sm },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  detailText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  priceText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  viewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: ROUNDED.sm },
  viewBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: SPACING.xl },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginTop: SPACING.md },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});
