import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function EditProfileScreen() {
  const { themeMode, user, updateProfile } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      updateProfile(name, email, phone);
      setLoading(false);
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }, 1200);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TextInput 
          label="Full Name" 
          placeholder="John Doe" 
          value={name} 
          onChangeText={setName}
        />
        <TextInput 
          label="Email Address" 
          placeholder="your.email@example.com" 
          value={email} 
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput 
          label="Phone Number" 
          placeholder="+1 555-0155" 
          value={phone} 
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <PrimaryButton title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
  }
});
