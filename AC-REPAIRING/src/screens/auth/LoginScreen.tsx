import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton, AppInput } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const LoginScreen = ({ navigation }: any) => {
  const { login, authLoading } = useApp();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState<{ mobile?: string; password?: string }>({});

  const handleLogin = async () => {
    const newErrors: typeof errors = {};
    if (!mobileNumber) newErrors.mobile   = 'Mobile number is required';
    if (!password)     newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      // Pass phone number — authApi.login sends { phone, password }
      await login(mobileNumber.trim(), password);
      navigation.replace('LocationPermission');
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err.message || 'Invalid credentials. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <MaterialIcons name="ac-unit" size={40} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>CoolBreeze</Text>
            <Text style={styles.subLogoText}>AC Service & Maintenance Portal</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Mobile Input */}
            <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
            <View style={[styles.mobileInputRow, errors.mobile ? styles.inputRowError : null]}>
              <TouchableOpacity style={styles.countryPicker}>
                <Text style={styles.countryCode}>+91</Text>
                <MaterialIcons name="keyboard-arrow-down" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <View style={styles.dividerLine} />
              <AppInput
                value={mobileNumber}
                onChangeText={(t) => {
                  setMobileNumber(t);
                  if (errors.mobile) setErrors(p => ({ ...p, mobile: undefined }));
                }}
                placeholder="000 000 0000"
                keyboardType="phone-pad"
                style={styles.inlineInput}
              />
            </View>
            {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

            {/* Password */}
            <AppInput
              label="PASSWORD"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors(p => ({ ...p, password: undefined }));
              }}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              icon="lock-outline"
              rightIcon={showPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
              style={{ marginTop: SPACING.md }}
            />

            {/* Options row */}
            <View style={styles.optionsRow}>
              <View />
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <AppButton
              title={authLoading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              icon="arrow-forward"
              style={styles.loginBtn}
              disabled={authLoading}
            />
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.noAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  scrollContent:   { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  logoSection:     { alignItems: 'center', marginBottom: SPACING.xl },
  logoBox:         { width: 60, height: 60, backgroundColor: COLORS.primary, borderRadius: ROUNDED.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm, ...SHADOWS.small },
  logoText:        { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  subLogoText:     { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  card:            { backgroundColor: COLORS.surface, borderRadius: ROUNDED.lg, padding: SPACING.md, elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10 },
  inputLabel:      { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  mobileInputRow:  { height: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: ROUNDED.md, flexDirection: 'row', alignItems: 'center', paddingLeft: SPACING.sm, backgroundColor: COLORS.surface },
  inputRowError:   { borderColor: COLORS.danger },
  countryPicker:   { flexDirection: 'row', alignItems: 'center', paddingRight: SPACING.sm },
  countryCode:     { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginRight: 2 },
  dividerLine:     { width: 1, height: 24, backgroundColor: COLORS.border },
  inlineInput:     { flex: 1, height: '100%', marginVertical: 0, borderWidth: 0, backgroundColor: 'transparent', paddingLeft: SPACING.sm },
  errorText:       { color: COLORS.danger, fontSize: 11, marginTop: SPACING.xs },
  optionsRow:      { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.lg },
  forgotText:      { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  loginBtn:        { backgroundColor: COLORS.primary, height: 50 },
  registerRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  noAccountText:   { fontSize: 14, color: COLORS.textSecondary },
  registerText:    { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
});
