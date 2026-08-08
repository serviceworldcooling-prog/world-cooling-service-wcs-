import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { themeMode, login, authLoading } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    let hasError = false;
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email address is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (hasError) { setErrors(newErrors); return; }
    setErrors({});

    try {
      await login(email, password);
      router.replace('/(auth)/perm-location');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Soft Background Accents */}
      <View style={[styles.bgCircleTop, { backgroundColor: colors.primary + '05' }]} />
      <View style={[styles.bgCircleBottom, { backgroundColor: colors.primary + '03' }]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 1200 }}
          style={styles.formContainer}
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <MotiView
              from={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 1500, delay: 100 }}
              style={[styles.logoCircle, { backgroundColor: colors.primary + '10' }]}
            >
              <Icons.Wind size={36} color={colors.primary} />
            </MotiView>
            <Text style={[styles.brandText, { color: colors.primary }]}>W C S</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <View style={[styles.headerDivider, { backgroundColor: colors.primary + '20' }]} />
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Log in to access your premium cooling service portal
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="EMAIL ADDRESS"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />
            <TextInput
              label="PASSWORD"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton title="LOG IN" onPress={handleLogin} loading={authLoading} />

            <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

            <View style={styles.registerRow}>
              <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.5 }}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  forgotBtn: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
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
