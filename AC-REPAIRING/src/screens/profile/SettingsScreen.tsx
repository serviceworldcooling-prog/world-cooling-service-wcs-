import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';

export const SettingsScreen = ({ navigation }: any) => {
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
    <ScreenContainer title="App Settings" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
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
    fontWeight: '700',
    color: COLORS.primary,
  },
  desc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1,
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
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
