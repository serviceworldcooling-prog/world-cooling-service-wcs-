import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, OTPInput } from '../../components/CustomUI';
import { verifyOtp, resendOtp } from '../../api/authApi';

export default function OTPScreen() {
  const { themeMode, forgotPasswordEmail } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    try {
      await verifyOtp(forgotPasswordEmail, otp);
      // verifyOtp stores the resetToken via saveToken internally
      router.push('/(auth)/reset-password');
    } catch (err: any) {
      Alert.alert('Invalid OTP', err.message || 'Incorrect or expired OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!forgotPasswordEmail) return;
    setResendLoading(true);
    try {
      await resendOtp(forgotPasswordEmail);
      Alert.alert('Sent', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>Enter Code</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We sent a 4-digit code to {forgotPasswordEmail || 'your email'}. Enter it below.
        </Text>

        <OTPInput value={otp} onChange={setOtp} />

        <PrimaryButton
          title="Verify Code"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length < 4}
        />

        <View style={styles.resendRow}>
          <Text style={{ color: colors.textSecondary }}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              {resendLoading ? 'Sending...' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 48 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 32 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
