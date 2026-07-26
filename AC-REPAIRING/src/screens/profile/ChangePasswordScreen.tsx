import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errors, setErrors] = useState<any>({});

  const handleUpdate = () => {
    const newErrors: any = {};
    if (!oldPass) newErrors.old = 'Current password is required';
    if (!newPass) newErrors.new = 'New password is required';
    if (newPass !== confirmPass) newErrors.confirm = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    Alert.alert('Password Updated', 'Your account password has been changed successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScreenContainer title="Change Password" onBack={() => navigation.goBack()}>
      <View style={styles.card}>
        <AppInput
          label="CURRENT PASSWORD"
          value={oldPass}
          onChangeText={setOldPass}
          secureTextEntry
          placeholder="Enter current password"
          error={errors.old}
        />

        <AppInput
          label="NEW PASSWORD"
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry
          placeholder="Enter new password"
          error={errors.new}
          style={{ marginTop: SPACING.md }}
        />

        <AppInput
          label="CONFIRM NEW PASSWORD"
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry
          placeholder="Confirm new password"
          error={errors.confirm}
          style={{ marginTop: SPACING.md }}
        />

        <AppButton
          title="Update Account Password"
          onPress={handleUpdate}
          icon="vpn-key"
          style={styles.updateBtn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  updateBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    marginTop: SPACING.xl,
  },
});
