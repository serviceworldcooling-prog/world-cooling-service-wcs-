import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import { getTrackingInfo, confirmComplete, TrackingInfo } from '../../api/trackingApi';
import * as Icons from 'lucide-react-native';

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(25);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTrackingInfo(id)
      .then(data => {
        setTracking(data);
        setEta(data.estimatedArrivalMinutes || 25);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Count down ETA
  useEffect(() => {
    const timer = setInterval(() => setEta(prev => (prev > 1 ? prev - 1 : 1)), 4000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmServiceComplete = async () => {
    if (!id) return;
    setCompleting(true);
    try {
      await confirmComplete(id);
      Alert.alert(
        'Service Completed',
        'Thank you! Please rate your technician.',
        [{ text: 'Leave Review', onPress: () => router.push('/screens/add-review') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Live Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: colors.border }]}>
        <Icons.MapPin size={48} color={colors.primary} style={styles.pin} />
        <Text style={[styles.mapPlaceholderText, { color: colors.textSecondary }]}>
          🗺️ Live GPS Map
        </Text>
        <View style={[styles.etaBox, { backgroundColor: colors.glass || colors.card }]}>
          <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>ESTIMATED ARRIVAL</Text>
          <Text style={[styles.etaVal, { color: colors.text }]}>{eta} Mins</Text>
        </View>
      </View>

      {/* Technician card */}
      <View style={[styles.detailBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statusText, { color: colors.primary }]}>
          ● {eta <= 1 ? 'Technician has arrived at your address' : 'Technician is traveling to your location'}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.techRow}>
          <Image
            source={{ uri: tracking?.techAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' }}
            style={styles.avatar}
          />
          <View style={styles.techInfo}>
            <Text style={[styles.techName, { color: colors.text }]}>
              {tracking?.technicianName || 'Assigning...'}
            </Text>
            <Text style={[styles.special, { color: colors.textSecondary }]}>Master AC Mechanic</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Calling', `Connecting to ${tracking?.technicianName}...`)}
            >
              <Icons.Phone size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#64748B' }]}
              onPress={() => Alert.alert('Chat', 'Live chat is active with technician.')}
            >
              <Icons.MessageSquare size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* OTP verify shortcut */}
        {!tracking?.isOtpVerified && (
          <TouchableOpacity
            onPress={() => router.push(`/screens/verify-otp?id=${id}`)}
            style={[styles.otpRow, { borderColor: colors.border }]}
          >
            <Icons.ShieldCheck size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 8 }}>
              Verify Start OTP with Technician
            </Text>
          </TouchableOpacity>
        )}

        <PrimaryButton
          title={completing ? 'Completing...' : 'Confirm Service Completion'}
          onPress={handleConfirmServiceComplete}
          loading={completing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  mapContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  pin: { position: 'absolute', top: '40%' },
  mapPlaceholderText: { fontSize: 14, fontWeight: '600' },
  etaBox: { position: 'absolute', top: 20, left: 20, right: 20, borderRadius: 16, padding: 16, alignItems: 'center' },
  etaLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  etaVal: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  detailBox: { padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1 },
  statusText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  divider: { height: 1, marginVertical: 16 },
  techRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  techInfo: { flex: 1, marginLeft: 12 },
  techName: { fontSize: 15, fontWeight: '700' },
  special: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  otpRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 16 },
});
