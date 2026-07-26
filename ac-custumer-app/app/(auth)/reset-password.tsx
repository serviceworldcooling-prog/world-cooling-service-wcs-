import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import { resetPassword } from '../../api/authApi';
import { removeToken } from '../../api/client';

export default function ResetPasswordScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const newErrors: typeof errors = {};
    let hasError = false;

    if (!newPassword || newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      hasError = true;
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }
    if (hasError) { setErrors(newErrors); return; }
    setErrors({});

    setLoading(true);
    try {
      await resetPassword(newPassword);
      // Clear the reset token — user must login fresh
      await removeToken();
      Alert.alert(
        'Password Reset',
        'Your password has been updated successfully. Please log in.',
        [{ text: 'Log In', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>New Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose a strong password for your account.
        </Text>

        <TextInput
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          error={errors.newPassword}
        />
        <TextInput
          label="Confirm Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <PrimaryButton title="Reset Password" onPress={handleReset} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 48 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 32 },
});
