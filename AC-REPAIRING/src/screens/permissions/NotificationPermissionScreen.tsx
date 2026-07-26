import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton } from '../../components/Common';

export const NotificationPermissionScreen = ({ navigation }: any) => {
  const handleAllow = () => {
    navigation.replace('MainTabs');
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <View style={styles.circleBg}>
            <MaterialIcons name="notifications-active" size={64} color={COLORS.secondary} />
          </View>
          <View style={styles.badgeMini}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </View>

        <Text style={styles.title}>Never Miss a Status Update</Text>
        <Text style={styles.description}>
          Enable push notifications to receive real-time notifications when:
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.featureText}>A technician is assigned to your job</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.featureText}>Technician starts travelling (GPS tracking active)</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.featureText}>Service is completed & your invoice is ready</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Enable Push Notifications"
          onPress={handleAllow}
          icon="notifications"
          style={styles.primaryBtn}
        />
        <AppButton
          title="Skip for Now"
          onPress={handleSkip}
          variant="outline"
          style={styles.secondaryBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  illustrationBox: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  circleBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  badgeMini: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...SHADOWS.small,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  featuresList: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    ...SHADOWS.small,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  footer: {
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    marginBottom: SPACING.sm,
  },
  secondaryBtn: {
    height: 52,
    borderColor: COLORS.primary,
  },
});
