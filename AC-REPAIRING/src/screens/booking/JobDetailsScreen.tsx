import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, Alert, Linking, ActivityIndicator, LayoutAnimation,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { BottomTabBar } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import type { Job } from '../../api/jobsApi';
import * as Location from 'expo-location';

const STATUS_FLOW: Record<string, { next: string; nextLabel: string; nextColor: string; icon: string }> = {
  Pending: { next: 'Upcoming', nextLabel: 'Accept Job', nextColor: '#1E40AF', icon: 'thumb-up' },
  Upcoming: { next: 'In Progress', nextLabel: 'Start Service', nextColor: COLORS.secondary, icon: 'build' },
  'In Progress': { next: 'WorkReport', nextLabel: 'Submit Work Report', nextColor: COLORS.success, icon: 'assignment-turned-in' },
  Completed: { next: '', nextLabel: 'Completed', nextColor: COLORS.success, icon: 'check-circle' },
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Pending: { bg: '#FEF9C3', text: '#854D0E' },
  Upcoming: { bg: '#FEF3C7', text: '#92400E' },
  'In Progress': { bg: '#E0F2FE', text: '#0369A1' },
  Completed: { bg: '#ECFDF5', text: '#065F46' },
  Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

export const JobDetailsScreen = ({ route, navigation }: any) => {
  const { job } = route.params as { job: Job };
  const { acceptJob, startJob, shareLocation, user, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<string>(job?.status ?? 'Upcoming');
  const [loading, setLoading] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const startLocationWatcher = async () => {
      try {
        const { status: permStatus } = await Location.getForegroundPermissionsAsync();
        if (permStatus !== 'granted') return;

        if (locationSubscription.current) {
          locationSubscription.current.remove();
          locationSubscription.current = null;
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          async (loc) => {
            try {
              await shareLocation(job._id, {
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
              });
            } catch (err) {
              console.error('Error updating live location:', err);
            }
          }
        );
      } catch (err) {
        console.error('Watcher startup error:', err);
      }
    };

    if (status === 'Upcoming' && job.isLiveLocation) {
      startLocationWatcher();
    }

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [status, job.isLiveLocation, job._id]);

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

  if (!job) {
    return (
      <ScreenContainer noHeader={true} backgroundColor="#FAF9F6">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary }}>Job not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const flow = STATUS_FLOW[status];
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE['Upcoming'];
  const customer = job.customerId;

  const handleCallCustomer = () => {
    if (customer?.phone) Linking.openURL(`tel:${customer.phone}`);
  };

  const handleNavigate = () => {
    if (!job.lat || !job.lng) return;
    const lat = job.lat;
    const lng = job.lng;

    const googleMapsUrl = `google.navigation:q=${lat},${lng}`;
    const appleMapsUrl = `maps://?daddr=${lat},${lng}&dirflg=d`;
    const universalUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

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

  const handleShareLocation = async () => {
    setLoading(true);
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permissions are required to share your live route with the customer.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await shareLocation(job._id, {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
      Alert.alert(
        'Sharing Started',
        'Live location sharing is active. The customer can now view your live location map!'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not start location sharing.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryAction = () => {
    if (!flow?.next) return;

    if (status === 'In Progress') {
      navigation.navigate('WorkReport', { job: { ...job, status } });
      return;
    }

    const actionLabel = flow.nextLabel;
    const confirmMsg =
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
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
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
            <Text style={styles.dutyLabel}>DUTY STATUS</Text>
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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Status header card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <Text style={styles.bookingRef}>Booking #{job.bookingId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{job.serviceType}</Text>

          {(job.isFreeReferralService || job.price === 0) && (
            <View style={{ backgroundColor: '#0f766e15', borderColor: '#0f766e', borderWidth: 1, padding: 10, borderRadius: 14, marginTop: 8, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="stars" size={18} color="#0f766e" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#0f766e', flex: 1 }}>
                🎉 100% Referral Free Service Job — Fully Sponsored by AC Service Admin
              </Text>
            </View>
          )}

          <View style={styles.dateRow}>
            <MaterialIcons name="event" size={14} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>{job.preferredDate}  ·  {job.preferredTime}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.customerCard}>
            {customer?.avatar ? (
              <Image source={{ uri: customer.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <MaterialIcons name="person" size={24} color={COLORS.primary} />
              </View>
            )}
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer?.name || 'Customer'}</Text>
              <Text style={styles.customerPhone}>{customer?.phone || '—'}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallCustomer}>
              <MaterialIcons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Address Details */}
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

        {/* Problem Description */}
        {job.problemDescription ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Issue Note</Text>
            <View style={styles.infoBox}>
              <MaterialIcons name="notes" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.infoText}>{job.problemDescription}</Text>
            </View>
          </View>
        ) : null}

        {/* Job Progress Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Progress Tracker</Text>
          <View style={styles.timelineCard}>
            {steps.map((step, idx) => {
              const currentIdx = steps.indexOf(status);
              const done = idx <= currentIdx;
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

        {/* Invoice Price Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice & Amount</Text>
          <View style={styles.infoBoxWrapper}>
            <View style={[styles.priceRow, { borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: 10 }]}>
              <Text style={styles.priceLabel}>Base Service Charge</Text>
              <Text style={[styles.priceValue, { fontWeight: '700' }]}>₹{(job.price || 0).toLocaleString()}</Text>
            </View>
            {!!job.extraMaterialCharges && job.extraMaterialCharges > 0 && (
              <View style={[styles.priceRow, { borderBottomWidth: 1, borderColor: COLORS.border, paddingVertical: 10 }]}>
                <Text style={styles.priceLabel}>Extra Material Charges</Text>
                <Text style={[styles.priceValue, { color: COLORS.success }]}>+ ₹{job.extraMaterialCharges.toLocaleString()}</Text>
              </View>
            )}
            {!!job.extraAmountTaken && job.extraAmountTaken > 0 && (
              <View style={[styles.priceRow, { borderBottomWidth: 1, borderColor: COLORS.border, paddingVertical: 10 }]}>
                <Text style={styles.priceLabel}>Extra Amount/Labor Taken</Text>
                <Text style={[styles.priceValue, { color: COLORS.secondary }]}>+ ₹{job.extraAmountTaken.toLocaleString()}</Text>
              </View>
            )}
            <View style={[styles.priceRow, { paddingTop: 10 }]}>
              <Text style={[styles.priceLabel, { fontWeight: '900', color: COLORS.primary }]}>Total Amount</Text>
              <Text style={[styles.priceValue, { fontSize: 18, fontWeight: '900', color: COLORS.primary }]}>
                ₹{((job.finalPrice && job.finalPrice > 0) ? job.finalPrice : (job.price + (job.extraMaterialCharges || 0) + (job.extraAmountTaken || 0))).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Warranty Card Info (If Active) */}
        {job.warrantyStatus === 'Active' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Warranty Card</Text>
            <View style={[styles.infoBox, { backgroundColor: '#FFFDF5', borderColor: '#EAB308', borderWidth: 1.5 }]}>
              <MaterialIcons name="verified" size={18} color="#EAB308" style={{ marginRight: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#854D0E' }}>
                  Warranty Period: {job.warrantyPeriod || '3 Months'}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                  {job.warrantyDetails || 'Covers parts replacement and service defects.'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons (scrolling with content) */}
        {status === 'Upcoming' && (
          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: COLORS.secondary, marginBottom: 12, marginTop: 12 }]}
            onPress={handleShareLocation}
            activeOpacity={0.85}
            disabled={loading}
          >
            <MaterialIcons name="gps-fixed" size={20} color="#fff" style={{ marginRight: SPACING.sm }} />
            <Text style={styles.primaryActionText}>Next Task (Share Location)</Text>
          </TouchableOpacity>
        )}

        {status !== 'Completed' && status !== 'Cancelled' && (
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: flow?.nextColor || COLORS.primary, marginBottom: 12, marginTop: status === 'Upcoming' ? 0 : 12 }]}
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
          <View style={[styles.completedBox, { marginTop: 16 }]}>
            <MaterialIcons name="check-circle" size={28} color={COLORS.success} />
            <Text style={styles.completedText}>Job completed successfully!</Text>
          </View>
        )}
      </ScrollView>
      <BottomTabBar navigation={navigation} activeRoute="AssignedJobs" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    letterSpacing: 2,
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
  dutyLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
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
  scroll: { paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 },
  statusCard: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small },
  statusHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bookingRef: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: ROUNDED.full },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  serviceName: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  dateText: { fontSize: 13, color: COLORS.textSecondary },
  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: SPACING.sm },
  customerCard: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.sm },
  placeholderAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.sm, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  customerPhone: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  callBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
  infoBox: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small },
  infoText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  liveLocBox: { backgroundColor: COLORS.successLight, borderRadius: ROUNDED.sm, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 6 },
  liveLocText: { flex: 1, fontSize: 12, color: COLORS.success, fontWeight: '600' },
  navigateBtn: { backgroundColor: COLORS.success, paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: ROUNDED.sm, flexDirection: 'row', alignItems: 'center', gap: 4 },
  navigateBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  timelineCard: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small },
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
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  infoBoxWrapper: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small },
  primaryAction: { flexDirection: 'row', height: 52, borderRadius: ROUNDED.md, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  secondaryAction: { flexDirection: 'row', height: 52, borderRadius: ROUNDED.md, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  primaryActionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  completedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.successLight, borderRadius: ROUNDED.md, padding: SPACING.md, gap: SPACING.sm },
  completedText: { fontSize: 16, fontWeight: '700', color: COLORS.success },
});
