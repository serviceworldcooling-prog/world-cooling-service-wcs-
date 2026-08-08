import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function PermissionsScreen() {
  const { themeMode, setPermissions, setUserLocation, userLocation, locationPermissionGranted, notificationPermissionGranted, isAuthenticated } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromSettings = from === 'settings';

  const [locationOpt, setLocationOpt] = useState(locationPermissionGranted);
  const [notifyOpt, setNotifyOpt] = useState(notificationPermissionGranted);
  const [cameraOpt, setCameraOpt] = useState(false);
  const [videoOpt, setVideoOpt] = useState(false);
  const [microOpt, setMicroOpt] = useState(false);

  const handleLocationToggle = async (val: boolean) => {
    if (val) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const [geocode] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          const addressString = `${geocode.name || geocode.street || ''}, ${geocode.city || ''}, ${geocode.region || ''}`.replace(/^,\s*|,\s*$/g, '') || `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;

          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            addressString,
          });
          setLocationOpt(true);
        } else {
          Alert.alert("Permission Denied", "Location permission was denied. Please enable it in your device settings.");
          setLocationOpt(false);
        }
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to get location");
        setLocationOpt(false);
      }
    } else {
      setUserLocation(null);
      setLocationOpt(false);
    }
  };

  const handleCameraRequest = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setCameraOpt(true);
      } else {
        Alert.alert("Permission Denied", "Camera permission was denied.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to request camera permission");
    }
  };

  const handleVideoRequest = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        setVideoOpt(true);
      } else {
        Alert.alert("Permission Denied", "Media Library permission was denied.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to request media library permission");
    }
  };

  const handleMicroRequest = async () => {
    try {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      if (status === 'granted') {
        setMicroOpt(true);
      } else {
        Alert.alert("Permission Denied", "Microphone permission was denied.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to request microphone permission");
    }
  };

  const handleContinue = () => {
    setPermissions(locationOpt, notifyOpt);
    if (isFromSettings) {
      router.back();
    } else if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {isFromSettings ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icons.ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={[styles.headerTitle, { color: colors.text }]}>APP ACCESS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Illustration */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 1200 }}
          style={[styles.bannerContainer, { borderColor: colors.border }]}
        >
          <Image
            source={require('../../assets/permissions_banner.png')}
            style={styles.bannerImage}
            contentFit="cover"
          />
        </MotiView>

        {/* Heading Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.brandText, { color: colors.primary }]}>SECURITY & TRUST</Text>
          <Text style={[styles.title, { color: colors.text }]}>Permissions Required</Text>
          <View style={[styles.headerDivider, { backgroundColor: colors.primary + '20' }]} />
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enable these services to allow our HVAC technician dispatch and secure booking features to function seamlessly.
          </Text>
        </View>

        {/* Location Service Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>📍 Location Service</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary, marginBottom: locationOpt && userLocation ? 6 : 0 }]}>
                Used to automatically dispatch and navigate the nearest available service tech to your address.
              </Text>
              {locationOpt && userLocation && (
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationAddrText, { color: colors.text }]}>
                    🏠 {userLocation.addressString}
                  </Text>
                  <Text style={[styles.locationCoordsText, { color: colors.primary, marginBottom: 10 }]}>
                    🌐 Lat: {userLocation.latitude.toFixed(6)}, Lng: {userLocation.longitude.toFixed(6)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.mapBtn, { borderColor: colors.primary }]}
                    onPress={() => router.push('/screens/map-view')}
                  >
                    <Icons.MapPin size={14} color={colors.primary} />
                    <Text style={[styles.mapBtnText, { color: colors.primary }]}> View or set on map</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {locationOpt ? (
              <View style={styles.allowedHighlightBadge}>
                <Text style={styles.allowedHighlightText}>ALLOWED</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.allowBtn, { backgroundColor: colors.primary }]} onPress={() => handleLocationToggle(true)}>
                <Text style={styles.allowBtnText}>ALLOW</Text>
              </TouchableOpacity>
            )}
          </View>
        </MotiView>

        {/* Camera Permission Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>📷 Camera Access</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                To capture and upload snapshots of damaged AC units directly when scheduling service.
              </Text>
            </View>
            {cameraOpt ? (
              <View style={styles.allowedHighlightBadge}>
                <Text style={styles.allowedHighlightText}>ALLOWED</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.allowBtn, { backgroundColor: colors.primary }]} onPress={handleCameraRequest}>
                <Text style={styles.allowBtnText}>ALLOW</Text>
              </TouchableOpacity>
            )}
          </View>
        </MotiView>

        {/* Media Library Permission Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 300 }}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>🖼️ Media Library</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                To select pre-saved logs or visual records of system failures from your device.
              </Text>
            </View>
            {videoOpt ? (
              <View style={styles.allowedHighlightBadge}>
                <Text style={styles.allowedHighlightText}>ALLOWED</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.allowBtn, { backgroundColor: colors.primary }]} onPress={handleVideoRequest}>
                <Text style={styles.allowBtnText}>ALLOW</Text>
              </TouchableOpacity>
            )}
          </View>
        </MotiView>

        {/* Microphone Permission Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 400 }}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>🎙️ Microphone Access</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                To record diagnostic sound descriptions or initiate support calls through the app.
              </Text>
            </View>
            {microOpt ? (
              <View style={styles.allowedHighlightBadge}>
                <Text style={styles.allowedHighlightText}>ALLOWED</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.allowBtn, { backgroundColor: colors.primary }]} onPress={handleMicroRequest}>
                <Text style={styles.allowBtnText}>ALLOW</Text>
              </TouchableOpacity>
            )}
          </View>
        </MotiView>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={isFromSettings ? "SAVE CHANGES" : "CONTINUE"}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  bannerContainer: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
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
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerDivider: {
    width: 32,
    height: 2,
    marginVertical: 14,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
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
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  allowedHighlightBadge: {
    backgroundColor: '#10B98112',
    borderColor: '#10B98140',
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
  locationInfo: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#00000005',
    borderRadius: 8,
  },
  locationAddrText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 4,
  },
  locationCoordsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
