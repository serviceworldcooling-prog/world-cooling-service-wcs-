
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const { themeMode, register, authLoading } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    const newErrors: typeof errors = {};
    let hasError = false;

    if (!name) { newErrors.name = 'Full Name is required'; hasError = true; }
    if (!email) { newErrors.email = 'Email address is required'; hasError = true; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Enter a valid email'; hasError = true; }
    if (!phone) { newErrors.phone = 'Phone number is required'; hasError = true; }
    if (!password) { newErrors.password = 'Password is required'; hasError = true; }
    else if (password.length < 6) { newErrors.password = 'Password must be at least 6 characters'; hasError = true; }

    if (hasError) { setErrors(newErrors); return; }
    setErrors({});

    try {
      await register(name, email, phone, password);
      router.replace('/(auth)/perm-location');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not create account. Try again.');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.brandText, { color: colors.primary }]}>W C S</Text>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <View style={[styles.headerDivider, { backgroundColor: colors.primary + '20' }]} />
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join us to get premium home maintenance services
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="FULL NAME"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            <TextInput
              label="EMAIL ADDRESS"
              placeholder="john.doe@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />
            <TextInput
              label="PHONE NUMBER"
              placeholder="+1 555-0155"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <TextInput
              label="PASSWORD"
              placeholder="Choose password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <PrimaryButton title="REGISTER" onPress={handleRegister} loading={authLoading} />

            <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

            <View style={styles.loginRow}>
              <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.5 }}>Log In</Text>
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
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  footerDivider: {
    height: 1,
    width: '100%',
    marginVertical: 24,
    opacity: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
