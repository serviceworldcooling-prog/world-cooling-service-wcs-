import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Alert, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';

const SAFETY_STEPS = [
  { id: '1', title: 'Power Isolation', desc: 'Verify mains power switch is turned off before touching internal wiring or terminals. Use tester.' },
  { id: '2', title: 'High Altitude Harness', desc: 'Secure body safety belt harness to concrete anchors before climbing outside for condenser installations.' },
  { id: '3', title: 'Grounding Verification', desc: 'Ensure AC metal body has proper grounding connection to prevent electrical shocks to customer.' },
  { id: '4', title: 'Refrigerant Ventilation', desc: 'Recover or purge gas only in well-ventilated open spaces to prevent R32/R410 inhalation.' },
  { id: '5', title: 'Insulated Footwear & Gloves', desc: 'Wear rubber gloves and non-slip insulated safety shoes throughout service execution.' },
];

export const SafetyChecklistScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  const handleVerifyAll = () => {
    const allChecked = SAFETY_STEPS.every(step => checkedItems[step.id]);
    if (allChecked) {
      Alert.alert(
        "Verification Successful",
        "You have verified all safety checklist protocols. Maintain compliance on all job sites today!",
        [{ text: "Back to Menu", onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        "Safety Incomplete",
        "Please read and confirm all five critical safety protocols before verifying checklist."
      );
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.brandTitle}>WCS SHIELD COMPLIANCE</Text>
          <Text style={styles.title}>Technician Safety Guideline</Text>
          <Text style={styles.desc}>
            Technicians are required to read and verify these essential safety steps. Zero-tolerance policy on safety violations.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>MANDATORY FIELD CHECKLIST</Text>
        <View style={styles.cardGroup}>
          {SAFETY_STEPS.map((step) => {
            const isChecked = !!checkedItems[step.id];
            return (
              <TouchableOpacity
                key={step.id}
                style={styles.stepRow}
                onPress={() => toggleItem(step.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={isChecked ? COLORS.success : COLORS.textLight}
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, isChecked && { textDecorationLine: 'line-through', color: COLORS.textSecondary }]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyAll} activeOpacity={0.85}>
          <MaterialIcons name="security" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.verifyBtnText}>VERIFY SAFETY COMPLIANCE</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar navigation={navigation} />
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
  introCard: {
    backgroundColor: '#FAF0E6',
    borderRadius: ROUNDED.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D97706' + '40',
    marginBottom: 24,
  },
  brandTitle: { color: '#D97706', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  title: { color: COLORS.primary, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  desc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: COLORS.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 8,
    marginBottom: 24,
    ...SHADOWS.small,
  },
  stepRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  stepTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  stepDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
  verifyBtn: {
    height: 48,
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  verifyBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
