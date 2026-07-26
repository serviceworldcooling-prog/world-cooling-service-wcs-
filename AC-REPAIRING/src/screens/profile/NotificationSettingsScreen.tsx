import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const NotificationSettingsScreen = ({ navigation }: any) => {
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [technicianTracking, setTechnicianTracking] = useState(true);
  const [promos, setPromos] = useState(false);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const handleSave = () => {
    alert('Notification preferences updated successfully!');
    navigation.goBack();
  };

  const SettingSwitchRow = ({
    title,
    desc,
    value,
    onValueChange,
  }: {
    title: string;
    desc: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.textCol}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.secondaryLight }}
        thumbColor={value ? COLORS.secondary : COLORS.textLight}
      />
    </View>
  );

  return (
    <ScreenContainer title="Notification Alerts" onBack={() => navigation.goBack()}>
      <View style={styles.card}>
        <SettingSwitchRow
          title="Booking Confirmations"
          desc="Receive alerts when technicians accept, start, or finish a job request."
          value={bookingAlerts}
          onValueChange={setBookingAlerts}
        />

        <View style={styles.divider} />

        <SettingSwitchRow
          title="Real-time Tracking"
          desc="Get notified when technician is on their way with live GPS links."
          value={technicianTracking}
          onValueChange={setTechnicianTracking}
        />

        <View style={styles.divider} />

        <SettingSwitchRow
          title="Offers & Cashbacks"
          desc="Receive seasonal deals, service discounts, and AMC launch details."
          value={promos}
          onValueChange={setPromos}
        />

        <View style={styles.divider} />

        <SettingSwitchRow
          title="Email Tax Invoices"
          desc="Send duplicate billing statements to your registered email address."
          value={emailInvoices}
          onValueChange={setEmailInvoices}
        />

        <View style={styles.divider} />

        <SettingSwitchRow
          title="SMS Dispatch Updates"
          desc="Receive text notifications for key technician dispatches."
          value={smsAlerts}
          onValueChange={setSmsAlerts}
        />
      </View>

      <AppButton
        title="Save Alert Settings"
        onPress={handleSave}
        variant="secondary"
        icon="save"
        style={styles.saveBtn}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  textCol: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  saveBtn: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
});
