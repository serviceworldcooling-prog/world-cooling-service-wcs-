import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, StatusBar, LayoutAnimation, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton, AppInput, BottomTabBar } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const RaiseComplaintScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus, addComplaint } = useApp();
  const insets = useSafeAreaInsets();

  const [subject, setSubject]   = useState('');
  const [bookingId, setBookingId] = useState('');
  const [desc, setDesc]         = useState('');
  const [errors, setErrors]     = useState<any>({});
  const [loading, setLoading]   = useState(false);

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

  const handleSubmit = async () => {
    const newErrors: any = {};
    if (!subject) newErrors.subject = 'Subject is required';
    if (!desc)    newErrors.desc    = 'Complaint description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const complaint = await addComplaint(subject, desc, bookingId || undefined);
      Alert.alert(
        'Complaint Registered',
        `Ticket ${complaint.ticketNumber} raised. Our team will respond within 24 hours.`,
        [{ text: 'View History', onPress: () => navigation.replace('ComplaintHistory') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not submit. Try again.');
    } finally {
      setLoading(false);
    }
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

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <AppInput
            label="COMPLAINT SUBJECT"
            value={subject}
            onChangeText={(t: string) => { setSubject(t); if (errors.subject) setErrors((p: any) => ({ ...p, subject: undefined })); }}
            placeholder="Water leaking / Booking delayed / Wrong billing"
            icon="report-problem"
            error={errors.subject}
          />
          <AppInput
            label="BOOKING REFERENCE ID (OPTIONAL)"
            value={bookingId}
            onChangeText={setBookingId}
            placeholder="e.g. BKG-001234"
            icon="receipt"
            style={{ marginTop: SPACING.md }}
          />
          <AppInput
            label="COMPLAINT DETAILS"
            value={desc}
            onChangeText={(t: string) => { setDesc(t); if (errors.desc) setErrors((p: any) => ({ ...p, desc: undefined })); }}
            placeholder="Describe your issue so our support team can assist immediately."
            icon="edit"
            error={errors.desc}
            style={{ marginTop: SPACING.md }}
          />
          <AppButton
            title={loading ? 'Submitting...' : 'Submit Complaint Ticket'}
            onPress={handleSubmit}
            icon="send"
            style={styles.submitBtn}
            disabled={loading}
          />
        </View>
      </ScrollView>
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
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: ROUNDED.md, 
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md, 
    ...SHADOWS.small 
  },
  submitBtn: { backgroundColor: COLORS.secondary, height: 50, marginTop: SPACING.xl, ...SHADOWS.small },
});
