import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, Alert, StatusBar, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';

export const SettingsScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();

  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleResetData = () => {
    Alert.alert(
      'Reset App Cache',
      'Are you sure you want to clear app cache? This will reset all simulated state data.',
      [
        { text: 'Cancel' },
        { text: 'Reset', onPress: () => Alert.alert('Reset Complete', 'App cache was cleared successfully.') }
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

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        
        {/* Alerts & Notifications */}
        <Text style={styles.groupTitle}>NOTIFICATIONS & ALERTS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.labelCol}>
              <Text style={styles.label}>Push Notifications</Text>
              <Text style={styles.desc}>Receive status alerts and offers on screen</Text>
            </View>
            <Switch
              value={notifsEnabled}
              onValueChange={setNotifsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={notifsEnabled ? COLORS.secondary : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.labelCol}>
              <Text style={styles.label}>SMS Booking Alerts</Text>
              <Text style={styles.desc}>Get SMS updates when technician starts travel</Text>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={smsEnabled ? COLORS.secondary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Display Settings */}
        <Text style={styles.groupTitle}>THEME & PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.labelCol}>
              <Text style={styles.label}>Dark Mode (Beta)</Text>
              <Text style={styles.desc}>Switch app styles to low contrast theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={darkMode ? COLORS.secondary : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.row, { paddingVertical: 12 }]}
            onPress={() => navigation.navigate('LanguageSelection')}
            activeOpacity={0.7}
          >
            <View style={styles.labelCol}>
              <Text style={styles.label}>Language Choice</Text>
              <Text style={styles.desc}>English (Selected)</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Security Settings */}
        <Text style={styles.groupTitle}>SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuRow}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.menuLabel}>Change Account Password</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuRow}
            onPress={handleResetData}
          >
            <Text style={styles.menuLabel}>Reset App Data & Cache</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <Text style={styles.groupTitle}>DANGER ZONE</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuRow}
            onPress={() => navigation.navigate('DeleteAccount')}
          >
            <Text style={[styles.menuLabel, { color: COLORS.danger }]}>Permanently Delete Account</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.danger} />
          </TouchableOpacity>
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
  groupTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelCol: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  desc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
