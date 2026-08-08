import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton, AppInput } from '../../components/Common';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: any) => {
  const { login, authLoading } = useApp();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState<{ mobile?: string; password?: string }>({});

  const handleLogin = async () => {
    const newErrors: typeof errors = {};
    if (!mobileNumber) {
      newErrors.mobile = 'Mobile number is required';
    } else if (mobileNumber.length < 10) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await login(mobileNumber.trim(), password);
      // Success goes to permission or tabs (managed by AppNavigator / context, but we trigger standard navigation if needed)
      // Actually client login returns token and triggers redirect. AppNavigator has logic to handle this, let's keep navigation.replace('LocationPermission') or let standard flow run.
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
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Soft Background Accents */}
      <View style={[styles.bgCircleTop, { backgroundColor: COLORS.primary + '05' }]} />
      <View style={[styles.bgCircleBottom, { backgroundColor: COLORS.primary + '03' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Logo & Header */}
            <View style={styles.header}>
              <View style={[styles.logoCircle, { backgroundColor: COLORS.primary + '10' }]}>
                <MaterialIcons name="toys" size={36} color={COLORS.primary} />
              </View>
              <Text style={[styles.brandText, { color: COLORS.primary }]}>W C S</Text>
              <Text style={[styles.title, { color: COLORS.textPrimary }]}>Welcome Back</Text>
              <View style={[styles.headerDivider, { backgroundColor: COLORS.primary + '20' }]} />
              <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>
                Log in to access your technician portal and manage job updates
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
              <View style={[styles.mobileInputRow, errors.mobile ? styles.inputRowError : null]}>
                <View style={styles.countryPicker}>
                  <Text style={styles.countryCode}>+91</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={16} color={COLORS.textSecondary} />
                </View>
                <View style={styles.dividerLine} />
                <AppInput
                  value={mobileNumber}
                  onChangeText={(t) => {
                    setMobileNumber(t);
                    if (errors.mobile) setErrors(p => ({ ...p, mobile: undefined }));
                  }}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  style={[styles.inlineInput, { flex: 1, borderWidth: 0 }]}
                />
              </View>
              {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

              <View style={{ height: SPACING.md }} />

              <AppInput
                label="PASSWORD"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors(p => ({ ...p, password: undefined }));
                }}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                icon="lock-outline"
                rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
              />

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={[styles.forgotText, { color: COLORS.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <AppButton 
                title="LOG IN" 
                onPress={handleLogin} 
                loading={authLoading}
                disabled={authLoading}
                style={styles.loginBtn}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgCircleTop: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -50,
    right: -50,
  },
  bgCircleBottom: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    bottom: -100,
    left: -100,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  brandText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerDivider: {
    width: 40,
    height: 2,
    marginVertical: 16,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    paddingHorizontal: 16,
    letterSpacing: 0.2,
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  mobileInputRow: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.sm,
    backgroundColor: '#ffffff',
  },
  inputRowError: {
    borderColor: COLORS.danger,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.sm,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 2,
  },
  dividerLine: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  inlineInput: {
    flex: 1,
    height: '100%',
    marginVertical: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  forgotBtn: {
    alignItems: 'flex-end',
    marginVertical: 16,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.md,
  },
  footerDivider: {
    height: 1,
    width: '100%',
    marginVertical: 24,
    opacity: 0.5,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
