import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';

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
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not create account. Try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join us to get premium home maintenance services
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} error={errors.name} />
          <TextInput label="Email Address" placeholder="john.doe@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
          <TextInput label="Phone Number" placeholder="+1 555-0155" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />
          <TextInput label="Password" placeholder="Choose password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />

          <PrimaryButton title="Register" onPress={handleRegister} loading={authLoading} />

          <View style={styles.loginRow}>
            <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  form: { flex: 1 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
