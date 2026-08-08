import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import * as ImagePicker from 'expo-image-picker';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '../../api/client';

export default function EditProfileScreen() {
  const { themeMode, user, updateProfile } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const getAvatarUrl = (avatarStr: string) => {
    if (!avatarStr) return '';
    if (avatarStr.startsWith('http') || avatarStr.startsWith('data:image')) return avatarStr;
    const origin = BASE_URL.replace('/api/v1', '');
    return `${origin}${avatarStr}`;
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your gallery to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setAvatar(base64Img);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile(name, email, phone, avatar, city, state, pincode, address);
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>EDIT PROFILE</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickImage} style={[styles.avatarWrapper, { borderColor: colors.primary + '30' }]}>
            {avatar ? (
              <Image source={{ uri: getAvatarUrl(avatar) }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '10' }]}>
                <Icons.User size={40} color={colors.primary} />
              </View>
            )}
            <View style={[styles.editIconWrapper, { backgroundColor: colors.primary }]}>
              <Icons.Camera size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>Tap to change avatar</Text>
        </View>

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
          editable={false}
        />
        <TextInput 
          label="Phone Number" 
          placeholder="+1 555-0155" 
          value={phone} 
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput 
          label="City" 
          placeholder="e.g. Mumbai" 
          value={city} 
          onChangeText={setCity}
        />
        <TextInput 
          label="State" 
          placeholder="e.g. Maharashtra" 
          value={state} 
          onChangeText={setState}
        />
        <TextInput 
          label="Pincode" 
          placeholder="e.g. 400001" 
          value={pincode} 
          onChangeText={setPincode}
          keyboardType="number-pad"
        />
        <TextInput 
          label="Street Address" 
          placeholder="e.g. Flat 101, building name, street" 
          value={address} 
          onChangeText={setAddress}
          multiline
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    position: 'relative',
    overflow: 'visible',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarHint: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  }
});
