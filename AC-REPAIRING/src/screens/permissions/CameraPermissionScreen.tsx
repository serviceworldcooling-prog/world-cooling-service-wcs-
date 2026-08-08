import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ImageBackground, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton } from '../../components/Common';
import { Camera } from 'expo-camera';

export const CameraPermissionScreen = ({ navigation }: any) => {
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCameraRequest = async () => {
    setLoading(true);
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setCameraAllowed(true);
      } else {
        Alert.alert("Permission Denied", "Camera permission is required to capture photos of AC units for work reports.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to request camera permission");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!cameraAllowed) {
      Alert.alert(
        '📷 Permission Required',
        'You must allow Camera access before continuing. Tap the ALLOW button above.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.replace('MediaPermission');
  };

  return (
    <ImageBackground
      source={require('../../../assets/permissions_camera.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />
      
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>APP ACCESS</Text>
        </View>

        <View style={styles.content}>
          {/* Top Decorative Camera Icon */}
          <View style={styles.iconWrapper}>
            <MaterialIcons name="photo-camera" size={48} color={COLORS.primary} />
          </View>

          {/* Heading Section */}
          <View style={styles.titleSection}>
            <Text style={styles.brandText}>WORK REPORTS</Text>
            <Text style={styles.title}>Camera Access</Text>
            <View style={styles.headerDivider} />
            <Text style={styles.subtitle}>
              Enable camera access to capture and upload photos of repaired AC units, damage proof, and parts before completing jobs.
            </Text>
          </View>

          {/* Light Glassmorphic Camera Card */}
          <View style={styles.glassCard}>
            <View style={styles.row}>
              <View style={styles.textCol}>
                <Text style={styles.cardTitle}>📷 Camera Permission</Text>
                <Text style={styles.cardDesc}>
                  Used to take snapshots of job progress and attach visual verification to work reports.
                </Text>
              </View>
              {cameraAllowed ? (
                <View style={styles.allowedHighlightBadge}>
                  <Text style={styles.allowedHighlightText}>ALLOWED</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.allowBtn, { backgroundColor: COLORS.primary }]} 
                  onPress={handleCameraRequest}
                  disabled={loading}
                >
                  <Text style={styles.allowBtnText}>{loading ? '...' : 'ALLOW'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <AppButton
            title={cameraAllowed ? 'CONTINUE →' : 'ALLOW TO CONTINUE'}
            onPress={handleContinue}
            style={[
              styles.actionBtn,
              !cameraAllowed && styles.actionBtnDisabled
            ]}
            disabled={false}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.70)', // Light theme clean overlay
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.primary,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
    color: COLORS.textPrimary,
  },
  headerDivider: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.primary + '30',
    marginVertical: 12,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
  },
  glassCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    backgroundColor: '#ffffff',
    ...SHADOWS.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    color: COLORS.textPrimary,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 8,
  },
  allowedHighlightBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  allowedHighlightText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  allowBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  actionBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.md,
  },
  actionBtnDisabled: {
    backgroundColor: COLORS.border,
  },
});
