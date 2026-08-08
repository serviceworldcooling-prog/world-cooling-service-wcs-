import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton, AppInput } from '../../components/Common';

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleRegister = () => {
    const newErrors: any = {};
    if (!name) newErrors.name = 'Full name is required';
    if (!mobile) newErrors.mobile = 'Mobile number is required';
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) newErrors.terms = 'You must accept the terms and conditions';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Registration Error', 'Please fill all fields and accept the terms.');
      return;
    }

    setErrors({});
    // Go to Permissions Flow
    navigation.replace('LocationPermission');
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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <AppInput
              label="FULL NAME"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev: any) => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter your full name"
              icon="person-outline"
              error={errors.name}
            />

            <AppInput
              label="MOBILE NUMBER"
              value={mobile}
              onChangeText={(text) => {
                setMobile(text);
                if (errors.mobile) setErrors((prev: any) => ({ ...prev, mobile: undefined }));
              }}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              icon="phone-iphone"
              error={errors.mobile}
              style={{ marginTop: SPACING.sm }}
            />

            <AppInput
              label="EMAIL ADDRESS"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev: any) => ({ ...prev, email: undefined }));
              }}
              placeholder="john.doe@example.com"
              keyboardType="email-address"
              icon="mail-outline"
              error={errors.email}
              style={{ marginTop: SPACING.sm }}
            />

            <AppInput
              label="PASSWORD"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev: any) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              icon="lock-outline"
              rightIcon={showPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
              style={{ marginTop: SPACING.sm }}
            />

            <AppInput
              label="CONFIRM PASSWORD"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors((prev: any) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Re-enter password"
              secureTextEntry={!showPassword}
              icon="lock-outline"
              error={errors.confirmPassword}
              style={{ marginTop: SPACING.sm }}
            />

            {/* Terms checkbox */}
            <View style={{ marginTop: SPACING.md, marginBottom: SPACING.lg }}>
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.8}
              >
                <MaterialIcons 
                  name={termsAccepted ? 'check-box' : 'check-box-outline-blank'} 
                  size={20} 
                  color={termsAccepted ? COLORS.primary : COLORS.textLight} 
                />
                <Text style={styles.checkboxLabel}>
                  I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
            </View>

            {/* Register Button */}
            <AppButton
              title="REGISTER NOW"
              onPress={handleRegister}
              style={styles.registerBtn}
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.alreadyHaveText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Login Here</Text>
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
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.sm,
  },
  backBtn: {
    padding: SPACING.xs,
    borderRadius: ROUNDED.full,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: ROUNDED.md,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  alreadyHaveText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
