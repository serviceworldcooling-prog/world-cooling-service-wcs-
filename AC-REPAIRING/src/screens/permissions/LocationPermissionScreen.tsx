import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton } from '../../components/Common';

export const LocationPermissionScreen = ({ navigation }: any) => {
  const handleAllow = () => {
    navigation.replace('NotificationPermission');
  };

  const handleSkip = () => {
    navigation.replace('NotificationPermission');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <View style={styles.circleBg}>
            <MaterialIcons name="my-location" size={64} color={COLORS.secondary} />
          </View>
          <View style={styles.pinMini}>
            <MaterialIcons name="pin-drop" size={24} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.title}>Enable Location Services</Text>
        <Text style={styles.description}>
          To book an AC technician, we need to know where you are. This allows us to find the closest certified technician, show accurate arrival estimates, and guide them directly to your home.
        </Text>

        <View style={styles.privacyCard}>
          <MaterialIcons name="security" size={20} color={COLORS.success} />
          <Text style={styles.privacyText}>
            Your location data is encrypted and only shared with the assigned technician during active service.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Allow Location Access"
          onPress={handleAllow}
          icon="near-me"
          style={styles.primaryBtn}
        />
        <AppButton
          title="Not Now"
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
  pinMini: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...SHADOWS.small,
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
    marginBottom: SPACING.xl,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    width: '100%',
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    lineHeight: 16,
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
