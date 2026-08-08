import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { AppButton, AppInput, BottomTabBar } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus, updateProfile } = useApp();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [address, setAddress] = useState(user?.address || '');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleStatusChange = async (newStatus: 'Available' | 'On Job' | 'Off Duty') => {
    try {
      await updateTechStatus(newStatus);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert('Status Updated', `Your status has been updated to "${newStatus}"`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update status.');
    }
  };

  const showStatusOptions = () => {
    Alert.alert(
      'Update Duty Status',
      'Select your current status:',
      [
        { text: '🟢 Available', onPress: () => handleStatusChange('Available') },
        { text: '🟡 On Job', onPress: () => handleStatusChange('On Job') },
        { text: '🔴 Off Duty', onPress: () => handleStatusChange('Off Duty') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadMediaToCloudinary = async (fileUri: string) => {
    // 1. Fetch Cloudinary signature from backend
    const sigResponse = await api.get('/auth/cloudinary-signature');
    const { signature, timestamp, apiKey, cloudName, uploadPreset } = sigResponse.data;

    // 2. Build FormData for signed upload
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);
    data.append('api_key', apiKey);
    data.append('timestamp', String(timestamp));
    data.append('signature', signature);
    data.append('upload_preset', uploadPreset);
    
    // 3. Post to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const resData = await response.json();
    if (resData.secure_url) {
      return resData.secure_url;
    } else {
      throw new Error(resData.error?.message || 'Cloudinary upload failed');
    }
  };

  const handleUpload = async (uri: string) => {
    setUploading(true);
    try {
      const url = await uploadMediaToCloudinary(uri);
      setAvatar(url);
      Alert.alert('Success', 'Profile photo uploaded successfully!');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload image to Cloudinary.');
    } finally {
      setUploading(false);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Profile Photo',
      'Select image source:',
      [
        {
          text: 'Take Photo (Camera)',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled && result.assets?.length) {
              handleUpload(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Media library permission is required to select photos.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled && result.assets?.length) {
              handleUpload(result.assets[0].uri);
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!phone) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name, phone, avatar, specialty, city, state, pincode, address });
      Alert.alert('Profile Updated', 'Your profile details have been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header exactly matching Dashboard style */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: COLORS.primary }]}>W  C  S</Text>
          <View style={[styles.headerDividerVertical, { backgroundColor: COLORS.border }]} />
          
          <TouchableOpacity 
            style={styles.headerDutyStatus}
            onPress={showStatusOptions}
            activeOpacity={0.8}
          >
            <Text style={dutyLabelStyle}>DUTY STATUS</Text>
            <View style={styles.dutyRow}>
              <View style={[
                styles.dutyDotActive, 
                { 
                  backgroundColor: 
                    user?.technicianStatus === 'Available' ? COLORS.success :
                    user?.technicianStatus === 'On Job' ? '#EAB308' :
                    COLORS.textLight 
                }
              ]} />
              <Text style={styles.dutyText}>
                {user?.technicianStatus || 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={18} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        
        {/* Avatar Pick */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <MaterialIcons name="person" size={50} color={COLORS.primary} />
              </View>
            )}
            {uploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#ffffff" size="small" />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleChangeAvatar} activeOpacity={0.8} disabled={uploading}>
            <MaterialIcons name="photo-camera" size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.avatarText}>Tap camera to upload custom photo</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <AppInput
            label="FULL NAME"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev: any) => ({ ...prev, name: undefined }));
            }}
            placeholder="John Doe"
            icon="person-outline"
            error={errors.name}
          />

          <AppInput
            label="SPECIALTY"
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="AC Service, Gas Charging"
            icon="construction"
            style={{ marginTop: SPACING.md }}
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
            style={{ marginTop: SPACING.md }}
          />

          <AppInput
            label="MOBILE NUMBER"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) setErrors((prev: any) => ({ ...prev, phone: undefined }));
            }}
            placeholder="9876543210"
            keyboardType="phone-pad"
            icon="phone-iphone"
            error={errors.phone}
            style={{ marginTop: SPACING.md }}
          />

          <View style={[styles.divider, { backgroundColor: COLORS.border }]} />

          <Text style={styles.sectionTitle}>Location & Address</Text>

          <AppInput
            label="STREET ADDRESS"
            value={address}
            onChangeText={setAddress}
            placeholder="House/Shop No., Street Name"
            icon="home"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppInput
                label="CITY"
                value={city}
                onChangeText={setCity}
                placeholder="City"
                icon="location-city"
                style={{ marginTop: SPACING.md }}
              />
            </View>
            <View style={{ width: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <AppInput
                label="STATE"
                value={state}
                onChangeText={setState}
                placeholder="State"
                icon="map"
                style={{ marginTop: SPACING.md }}
              />
            </View>
          </View>

          <AppInput
            label="PINCODE"
            value={pincode}
            onChangeText={setPincode}
            placeholder="Pincode"
            keyboardType="numeric"
            icon="pin-drop"
            style={{ marginTop: SPACING.md }}
          />
        </View>

        <AppButton
          title={saving ? "Saving Changes..." : "Save Profile Changes"}
          onPress={handleSave}
          icon="save"
          style={styles.saveBtn}
          disabled={saving || uploading}
        />

      </ScrollView>
      <BottomTabBar navigation={navigation} activeRoute="Profile" />
    </View>
  );
};

const dutyLabelStyle = {
  fontSize: 8,
  fontWeight: '900' as const,
  letterSpacing: 1.5,
  color: COLORS.textSecondary,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(11, 30, 63, 0.1)',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  headerDutyStatus: {
    flex: 1,
    justifyContent: 'center',
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dutyDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -3,
    top: -3,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  scroll: { padding: 16, paddingBottom: 100 },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  placeholderAvatar: {
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 22,
    right: '37%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...SHADOWS.small,
  },
  avatarText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1.5,
    marginVertical: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    height: 50,
    ...SHADOWS.small,
  },
});
