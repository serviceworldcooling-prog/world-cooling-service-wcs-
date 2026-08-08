import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, Alert, TextInput, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const OPTIONS = [
  "AC Unit Releasing Smoke / Burning Smell",
  "Severe Water Leakage near Electrical Outlets",
  "Refrigerant Gas Leak (Hissing Noise)",
  "Total System Power Short Circuit / Voltage Surge",
  "Other breakdown (Specify below)",
];

export default function EmergencyScreen() {
  const { themeMode, createEmergencyBooking, user, userLocation } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bookingLoading, setBookingLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [selectedOption, setSelectedOption] = useState(OPTIONS[0]);
  const [customDescription, setCustomDescription] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  // Sync user location on load
  useEffect(() => {
    const defaultAddr = userLocation?.addressString || user?.addressString || user?.address || user?.city || '';
    setAddress(defaultAddr);
    if (defaultAddr) {
      setHasLocation(true);
    }
  }, [userLocation, user]);

  const [gpsCoords, setGpsCoords] = useState<{lat: number, lng: number} | null>(null);

  const handleFetchLiveLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied. Please allow location access in your device settings.');
        setLocLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setGpsCoords({ lat: latitude, lng: longitude });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = [
          addr.name,
          addr.street,
          addr.district,
          addr.city,
          addr.subregion,
          addr.region,
          addr.postalCode,
          addr.country
        ].filter(Boolean).join(', ');

        setAddress(formattedAddress || `GPS Coordinates: Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`);
      } else {
        setAddress(`GPS Coordinates: Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`);
      }

      setHasLocation(true);
      Alert.alert("Location Resolved", "Successfully obtained your precise live location.");
    } catch (err: any) {
      Alert.alert("Location Error", err.message || "Failed to resolve live location.");
    } finally {
      setLocLoading(false);
    }
  };

  const triggerEmergencyBooking = async () => {
    if (!address.trim()) {
      Alert.alert("Address Required", "Please specify where the dispatch team should go.");
      return;
    }

    setBookingLoading(true);
    try {
      const finalDesc = `EMERGENCY: [${selectedOption}] ${customDescription ? ' - ' + customDescription : ''}`;
      const res = await createEmergencyBooking({
        address: address,
        description: finalDesc,
        lat: gpsCoords ? gpsCoords.lat : null,
        lng: gpsCoords ? gpsCoords.lng : null,
      });
      setBookingLoading(false);
      Alert.alert(
        "Technician Dispatched",
        "Your emergency technician is on the way! ETA is 25 minutes.",
        [
          { text: "Track Live Location", onPress: () => router.push(`/screens/live-tracking?id=${res.bookingId || res._id}`) }
        ]
      );
    } catch (err: any) {
      setBookingLoading(false);
      Alert.alert("Emergency Booking Failed", err.message || "Could not dispatch technician.");
    }
  };

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.headerPanel, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.error + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <Text style={[styles.brandHeader, { color: colors.error }]}>CRITICAL DISPATCH</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>EMERGENCY HELPLINE</Text>
        <View style={[styles.headerDivider, { backgroundColor: colors.error }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introHeader}>
          <View style={[styles.alertIcon, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
            <Icons.AlertTriangle size={36} color={colors.error} />
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Emergency dispatches bypass all standard queues. A master technician is routed to your location instantly with hazard gear.
          </Text>
        </View>

        {/* Dispatch Fee Details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.error + '30' }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🚨 AC Breakdown Support</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Includes instant route priority allocation, full emergency leak check, and power safety isolating.
          </Text>
          <View style={[styles.priceRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>FLAT DISPATCH FEE:</Text>
            <Text style={[styles.priceVal, { color: colors.error }]}>₹149.00</Text>
          </View>
        </View>

        {/* Dispatch Address */}
        <View style={styles.inputSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>DISPATCH ADDRESS</Text>
            <TouchableOpacity 
              onPress={handleFetchLiveLocation} 
              disabled={locLoading}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            >
              {locLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Icons.Navigation size={12} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary }}>LIVE LOCATION</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icons.MapPin size={16} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              value={address}
              onChangeText={(txt) => {
                setAddress(txt);
                if (txt.trim()) {
                  setHasLocation(true);
                } else {
                  setHasLocation(false);
                }
              }}
              placeholder="Enter complete dispatch address"
              placeholderTextColor={colors.textSecondary + '80'}
              style={[styles.textInput, { color: colors.text }]}
              multiline
            />
          </View>
        </View>

        {/* Breakdown Type */}
        <View style={styles.inputSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SELECT BREAKDOWN TYPE</Text>
          <View style={styles.optionsList}>
            {OPTIONS.map(opt => {
              const isSelected = selectedOption === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setSelectedOption(opt)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionItem,
                    { 
                      backgroundColor: colors.card, 
                      borderColor: isSelected ? colors.error : colors.border 
                    }
                  ]}
                >
                  <View style={[styles.radioCircle, { borderColor: isSelected ? colors.error : colors.textSecondary }]}>
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.error }]} />}
                  </View>
                  <Text style={[styles.optionText, { color: isSelected ? colors.text : colors.textSecondary }]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Description */}
        <View style={styles.inputSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ADDITIONAL DETAILS (OPTIONAL)</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, minHeight: 80 }]}>
            <TextInput
              value={customDescription}
              onChangeText={setCustomDescription}
              placeholder="Provide context like unit model, floor height, or safety warnings..."
              placeholderTextColor={colors.textSecondary + '80'}
              style={[styles.textInput, { color: colors.text, textAlignVertical: 'top', paddingTop: 8 }]}
              multiline
            />
          </View>
        </View>

        {hasLocation ? (
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={triggerEmergencyBooking}
            disabled={bookingLoading}
            style={[styles.submitBtn, { backgroundColor: colors.error, opacity: bookingLoading ? 0.6 : 1 }]}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>DISPATCH EMERGENCY TEAM NOW</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <View style={styles.supportRow}>
          <TouchableOpacity 
            style={[styles.callBtn, { borderColor: colors.border }]}
            onPress={() => Alert.alert("Calling hotline...", "+91 1800-555-COOL")}
          >
            <Icons.PhoneCall size={18} color={colors.primary} />
            <Text style={[styles.callBtnText, { color: colors.primary }]}> CALL HELPLINE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPanel: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    letterSpacing: 1.5,
  },
  headerDivider: {
    width: 24,
    height: 2,
    marginTop: 10,
    borderRadius: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 52,
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
    fontWeight: '600',
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  supportRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  submitBtn: {
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
