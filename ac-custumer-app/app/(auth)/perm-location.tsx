import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function PermLocationScreen() {
  const { themeMode, setUserLocation, userLocation } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check real permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          setIsAllowed(true);
          // Pre-fetch location if already allowed so live track shows up instantly
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
        }
      } catch (err) {
        console.log('Error checking location permission:', err);
      } finally {
        setLoading(false);
      }
    };
    checkPermission();
  }, []);

  const handleRequest = async () => {
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
        setIsAllowed(true);
        Alert.alert("Granted", "Location access has been successfully granted.");
      } else {
        Alert.alert("Permission Denied", "Location permission was denied.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to request location permission");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full-Page Background Illustration */}
      <Image
        source={require('../../assets/permissions_location_bg.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(248, 250, 252, 0.90)' }]} />

      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>STEP 1 OF 4</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          <Text style={[styles.brandText, { color: colors.primary }]}>LOCATION SERVICES</Text>
          <Text style={[styles.title, { color: colors.text }]}>Enable Location Services</Text>
          <View style={[styles.headerDivider, { backgroundColor: colors.primary + '20' }]} />
          
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            We use your location to find the nearest certified AC technicians, provide accurate arrival estimates, and track servicing status in real-time.
          </Text>

          {!loading && isAllowed && userLocation ? (
            <MotiView 
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={[styles.liveTrackingCard, { backgroundColor: colors.card, borderColor: colors.primary + '40' }]}
            >
              <Text style={[styles.liveTrackingTitle, { color: colors.primary }]}>📡 Live Location Tracked</Text>
              <Text style={[styles.liveTrackingAddr, { color: colors.text }]}>🏠 {userLocation.addressString}</Text>
              <Text style={[styles.liveTrackingCoords, { color: colors.textSecondary }]}>
                Coordinates: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
              </Text>
            </MotiView>
          ) : (
            <Text style={[styles.errorDesc, { color: colors.error }]}>
              ⚠️ Permission required to proceed. Please grant access.
            </Text>
          )}

          <View style={styles.indicatorContainer}>
            <View style={[styles.dot, { backgroundColor: colors.primary, width: 24 }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!loading && isAllowed ? (
          <PrimaryButton 
            title="Next Permission" 
            onPress={() => router.push('/(auth)/perm-camera')} 
          />
        ) : (
          <PrimaryButton 
            title="Allow Location Access" 
            onPress={handleRequest} 
          />
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 10,
  },
  contentCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
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
  },
  headerDivider: {
    width: 32,
    height: 2,
    marginVertical: 14,
    borderRadius: 1,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveTrackingCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  liveTrackingTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  liveTrackingAddr: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  liveTrackingCoords: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 10,
  }
});
