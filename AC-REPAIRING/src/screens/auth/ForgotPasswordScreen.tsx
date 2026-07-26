import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton, AppInput } from '../../components/Common';
import * as authApi from '../../api/authApi';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail]                   = useState('');
  const [step, setStep]                     = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp]                       = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken]         = useState('');
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      Alert.alert(
        'OTP Sent',
        `A 4-digit OTP has been sent to ${email}. Please check your inbox.`,
        [{ text: 'OK', onPress: () => setStep('otp') }]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email.trim().toLowerCase(), otp);
      setResetToken(res.resetToken);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(newPassword, resetToken);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated. Please log in with your new password.',
        [{ text: 'Login Now', onPress: () => navigation.replace('Login') }]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepsRow}>
            {['Email', 'OTP', 'Reset'].map((label, idx) => {
              const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;
              const isDone = idx < stepIndex;
              const isActive = idx === stepIndex;
              return (
                <View key={label} style={styles.stepItem}>
                  <View style={[
                    styles.stepCircle,
                    isActive ? styles.stepCircleActive : isDone ? styles.stepCircleDone : null
                  ]}>
                    {isDone ? (
                      <MaterialIcons name="check" size={14} color="#fff" />
                    ) : (
                      <Text style={[styles.stepNum, isActive ? styles.stepNumActive : null]}>{idx + 1}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, isActive ? styles.stepLabelActive : null]}>{label}</Text>
                </View>
              );
            })}
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {step === 'email' && (
              <>
                <View style={styles.iconBox}>
                  <MaterialIcons name="email" size={40} color={COLORS.secondary} />
                </View>
                <Text style={styles.cardTitle}>Enter Registered Email</Text>
                <Text style={styles.cardSubtitle}>
                  We'll send a one-time password (OTP) to your registered email address.
                </Text>
                <AppInput
                  label="EMAIL ADDRESS"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  placeholder="technician@example.com"
                  keyboardType="email-address"
                  icon="email"
                  error={error}
                  style={{ marginTop: SPACING.md }}
                />
                <AppButton
                  title={loading ? 'Sending...' : 'Send OTP'}
                  onPress={handleSendOtp}
                  icon="send"
                  style={styles.actionBtn}
                  disabled={loading}
                />
              </>
            )}

            {step === 'otp' && (
              <>
                <View style={styles.iconBox}>
                  <MaterialIcons name="lock-clock" size={40} color={COLORS.secondary} />
                </View>
                <Text style={styles.cardTitle}>Verify OTP</Text>
                <Text style={styles.cardSubtitle}>
                  Enter the 4-digit OTP sent to {email}
                </Text>
                <AppInput
                  label="4-DIGIT OTP CODE"
                  value={otp}
                  onChangeText={(t) => { setOtp(t); setError(''); }}
                  placeholder="• • • •"
                  keyboardType="number-pad"
                  icon="dialpad"
                  error={error}
                  style={{ marginTop: SPACING.md }}
                />
                <TouchableOpacity style={styles.resendRow} onPress={handleSendOtp}>
                  <Text style={styles.resendText}>Didn't receive OTP? <Text style={styles.resendLink}>Resend OTP</Text></Text>
                </TouchableOpacity>
                <AppButton
                  title={loading ? 'Verifying...' : 'Verify OTP'}
                  onPress={handleVerifyOtp}
                  icon="verified"
                  style={styles.actionBtn}
                  disabled={loading}
                />
              </>
            )}

            {step === 'reset' && (
              <>
                <View style={styles.iconBox}>
                  <MaterialIcons name="lock-reset" size={40} color={COLORS.success} />
                </View>
                <Text style={styles.cardTitle}>Create New Password</Text>
                <Text style={styles.cardSubtitle}>
                  Your new password must be at least 6 characters long.
                </Text>
                <AppInput
                  label="NEW PASSWORD"
                  value={newPassword}
                  onChangeText={(t) => { setNewPassword(t); setError(''); }}
                  placeholder="Enter new password"
                  secureTextEntry
                  icon="lock-outline"
                  error={error}
                  style={{ marginTop: SPACING.md }}
                />
                <AppInput
                  label="CONFIRM NEW PASSWORD"
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                  placeholder="Re-enter new password"
                  secureTextEntry
                  icon="lock-outline"
                  style={{ marginTop: SPACING.sm }}
                />
                <AppButton
                  title={loading ? 'Resetting...' : 'Reset My Password'}
                  onPress={handleResetPassword}
                  icon="done-all"
                  style={styles.actionBtn}
                  disabled={loading}
                />
              </>
            )}
          </View>

          {/* Back to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login Here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 0,
  },
  backBtn: {
    padding: SPACING.xs,
    borderRadius: ROUNDED.full,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.xl,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginBottom: 4,
  },
  stepCircleActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  stepCircleDone: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  stepNumActive: {
    color: COLORS.secondary,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  stepLabelActive: {
    color: COLORS.secondary,
    fontWeight: '800',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  resendRow: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-end',
  },
  resendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resendLink: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  actionBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    height: 50,
    marginTop: SPACING.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});