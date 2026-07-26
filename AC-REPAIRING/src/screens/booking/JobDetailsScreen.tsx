import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import type { Job } from '../../api/jobsApi';

const STATUS_FLOW: Record<string, { next: string; nextLabel: string; nextColor: string; icon: string }> = {
  Pending:       { next: 'Upcoming',     nextLabel: 'Accept Job',         nextColor: '#1E40AF', icon: 'thumb-up' },
  Upcoming:      { next: 'In Progress',  nextLabel: 'Start Service',      nextColor: COLORS.secondary, icon: 'build' },
  'In Progress': { next: 'WorkReport',   nextLabel: 'Submit Work Report', nextColor: COLORS.success, icon: 'assignment-turned-in' },
  Completed:     { next: '',             nextLabel: 'Completed',          nextColor: COLORS.success, icon: 'check-circle' },
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Pending:       { bg: '#FEF9C3', text: '#854D0E' },
  Upcoming:      { bg: '#FEF3C7', text: '#92400E' },
  'In Progress': { bg: '#E0F2FE', text: '#0369A1' },
  Completed:     { bg: '#ECFDF5', text: '#065F46' },
  Cancelled:     { bg: '#FEE2E2', text: '#991B1B' },
};

export const JobDetailsScreen = ({ route, navigation }: any) => {
  const { job } = route.params as { job: Job };
  const { acceptJob, startJob } = useApp();

  const [status, setStatus]   = useState<string>(job?.status ?? 'Upcoming');
  const [loading, setLoading] = useState(false);

  if (!job) {
    return (
      <ScreenContainer title="Job Details" onBack={() => navigation.goBack()}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary }}>Job not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const flow        = STATUS_FLOW[status];
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE['Upcoming'];
  const customer    = job.customerId;

  const handleCallCustomer = () => {
    if (customer?.phone) Linking.openURL(`tel:${customer.phone}`);
  };

  const handleNavigate = () => {
    if (!job.lat || !job.lng) return;
    const lat = job.lat;
    const lng = job.lng;

    // Google Maps navigation intent (Android) / universal fallback
    const googleMapsUrl = `google.navigation:q=${lat},${lng}`;
    const appleMapsUrl  = `maps://?daddr=${lat},${lng}&dirflg=d`;
    const universalUrl  = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    Linking.canOpenURL(googleMapsUrl)
      .then(supported => {
        if (supported) return Linking.openURL(googleMapsUrl);
        return Linking.canOpenURL(appleMapsUrl).then(iosOk => {
          if (iosOk) return Linking.openURL(appleMapsUrl);
          return Linking.openURL(universalUrl);
        });
      })
      .catch(() => Linking.openURL(universalUrl));
  };

  const handlePrimaryAction = () => {
    if (!flow?.next) return;

    // If In Progress → navigate to work report screen
    if (status === 'In Progress') {
      navigation.navigate('WorkReport', { job: { ...job, status } });
      return;
    }

    const actionLabel = flow.nextLabel;
    const confirmMsg  =
      status === 'Pending'
        ? `Accept this job from ${customer?.name || 'customer'}?`
        : `Start service for ${customer?.name || 'customer'}?`;

    Alert.alert(actionLabel, confirmMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setLoading(true);
          try {
            if (status === 'Pending') {
              await acceptJob(job._id);
              setStatus('Upcoming');
            } else if (status === 'Upcoming') {
              await startJob(job._id);
              setStatus('In Progress');
            }
            Alert.alert('Updated!', `Job status changed to "${flow.next}".`);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not update job status.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const steps = ['Pending', 'Upcoming', 'In Progress', 'Completed'];

  return (
    <ScreenContainer title="Job Details" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Status header */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <Text style={styles.bookingRef}>Booking #{job.bookingId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{job.serviceType}</Text>
          <View style={styles.dateRow}>
            <MaterialIcons name="event" size={14} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>{job.preferredDate}  ·  {job.preferredTime}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerCard}>
            <Image source={{ uri: customer?.avatar || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer?.name || 'Customer'}</Text>
              <Text style={styles.customerPhone}>{customer?.phone || '—'}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallCustomer}>
              <MaterialIcons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <View style={styles.infoBox}>
            <MaterialIcons name="room" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.infoText}>{job.address}</Text>
          </View>
          {job.isLiveLocation && job.lat && job.lng && (
            <View style={styles.liveLocBox}>
              <MaterialIcons name="gps-fixed" size={16} color={COLORS.success} />
              <Text style={styles.liveLocText}>
                GPS: {job.lat.toFixed(4)}, {job.lng.toFixed(4)}
              </Text>
              <TouchableOpacity
                onPress={handleNavigate}
                style={styles.navigateBtn}
              >
                <MaterialIcons name="navigation" size={13} color="#fff" />
                <Text style={styles.navigateBtnText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Problem */}
        {job.problemDescription ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Issue</Text>
            <View style={styles.infoBox}>
              <MaterialIcons name="notes" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.infoText}>{job.problemDescription}</Text>
            </View>
          </View>
        ) : null}

        {/* Job Progress Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Progress</Text>
          <View style={styles.timelineCard}>
            {steps.map((step, idx) => {
              const currentIdx = steps.indexOf(status);
              const done     = idx <= currentIdx;
              const isActive = idx === currentIdx;
              return (
                <View key={step} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, done ? styles.dotDone : styles.dotPending, isActive && styles.dotActive]}>
                      {done && !isActive && <MaterialIcons name="check" size={12} color="#fff" />}
                      {isActive && <View style={styles.dotInner} />}
                    </View>
                    {idx < steps.length - 1 && (
                      <View style={[styles.timelineLine, done && idx < currentIdx ? styles.lineDone : styles.linePending]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.stepLabel, isActive && { color: COLORS.secondary, fontWeight: '800' }]}>
                      {step}
                    </Text>
                    {isActive && <Text style={styles.activeLabel}>← Current Status</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Job Amount</Text>
          <Text style={styles.priceValue}>₹{(job.finalPrice || job.price || 0).toLocaleString()}</Text>
        </View>

        {/* Primary action */}
        {status !== 'Completed' && status !== 'Cancelled' && (
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: flow?.nextColor || COLORS.primary }]}
            onPress={handlePrimaryAction}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name={flow?.icon as any} size={20} color="#fff" style={{ marginRight: SPACING.sm }} />
                <Text style={styles.primaryActionText}>{flow?.nextLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {status === 'Completed' && (
          <View style={styles.completedBox}>
            <MaterialIcons name="check-circle" size={28} color={COLORS.success} />
            <Text style={styles.completedText}>Job completed successfully!</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: SPACING.xxl || 40 },
  statusCard: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.small },
  statusHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bookingRef: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: ROUNDED.full },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  serviceName: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  dateText: { fontSize: 13, color: COLORS.textSecondary },
  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  customerCard: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', ...SHADOWS.small },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.sm },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  customerPhone: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  callBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
  infoBox: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'flex-start', ...SHADOWS.small },
  infoText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  liveLocBox: { backgroundColor: COLORS.successLight, borderRadius: ROUNDED.sm, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 6 },
  liveLocText: { flex: 1, fontSize: 12, color: COLORS.success, fontWeight: '600' },
  navigateBtn: { backgroundColor: COLORS.success, paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: ROUNDED.sm, flexDirection: 'row', alignItems: 'center', gap: 4 },
  navigateBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  timelineCard: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, ...SHADOWS.small },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', marginRight: SPACING.sm },
  timelineDot: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dotDone: { backgroundColor: COLORS.primary },
  dotPending: { backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.secondary, borderWidth: 3, borderColor: `${COLORS.secondary}40` },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineLine: { width: 2, height: 24, marginVertical: 2 },
  lineDone: { backgroundColor: COLORS.primary },
  linePending: { backgroundColor: COLORS.border },
  timelineContent: { paddingTop: 2 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  activeLabel: { fontSize: 10, color: COLORS.secondary, fontWeight: '700', marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.small },
  priceLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  priceValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  primaryAction: { flexDirection: 'row', height: 52, borderRadius: ROUNDED.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.small },
  primaryActionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  completedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.successLight, borderRadius: ROUNDED.md, padding: SPACING.md, gap: SPACING.sm },
  completedText: { fontSize: 16, fontWeight: '700', color: COLORS.success },
});
