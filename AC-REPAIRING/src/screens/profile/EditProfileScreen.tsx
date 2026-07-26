import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [errors, setErrors] = useState<any>({});

  const handleSave = () => {
    const newErrors: any = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!phone) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateProfile({ name, phone, avatar });
    Alert.alert('Profile Updated', 'Your profile details have been saved successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleChangeAvatar = () => {
    // Pick standard pre-defined mock avatars
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    ];
    // Cycle avatar
    const currentIndex = avatars.indexOf(avatar);
    const nextIndex = (currentIndex + 1) % avatars.length;
    setAvatar(avatars[nextIndex]);
  };

  return (
    <ScreenContainer title="Edit Profile" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Avatar Pick */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraBtn} onPress={handleChangeAvatar} activeOpacity={0.8}>
            <MaterialIcons name="photo-camera" size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.avatarText}>Tap camera to change photo</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
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
        </View>

        <AppButton
          title="Save Profile Changes"
          onPress={handleSave}
          icon="save"
          style={styles.saveBtn}
        />

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
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
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.lg,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
});
