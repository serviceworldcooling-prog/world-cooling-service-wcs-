import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, OTPInput } from '../../components/CustomUI';
import { verifyStartOtp } from '../../api/trackingApi';

export default function VerifyOtpScreen() {
  const { id, technicianName } = useLocalSearchParams<{ id: string; technicianName?: string }>();
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 4 || !id) return;
    setLoading(true);
    try {
      await verifyStartOtp(id, otp);
      Alert.alert(
        'OTP Verified ✅',
        'Service has started. Your technician is now working on your AC.',
        [{ text: 'View Tracking', onPress: () => router.push(`/screens/live-tracking?id=${id}`) }]
      );
    } catch (err: any) {
      Alert.alert('Incorrect OTP', err.message || 'The OTP entered is wrong. Check with your technician.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>Verify Technician OTP</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ask {decodeURIComponent(technicianName || 'your technician')} for the 4-digit OTP to start the service.
        </Text>

        <OTPInput value={otp} onChange={setOtp} />

        <PrimaryButton
          title="Verify & Start Service"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length < 4}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 32 },
});
