import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';

export const DeleteAccountScreen = ({ navigation }: any) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDelete = () => {
    if (!password) {
      setError('Please input your password to authorize this action.');
      return;
    }
    
    Alert.alert(
      'Confirm Deletion',
      'This action is irreversible. All your transaction history, saved addresses, and gold memberships will be permanently wiped out.',
      [
        { text: 'Cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account and personal data were purged successfully.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer title="Delete Account" onBack={() => navigation.goBack()}>
      <View style={styles.card}>
        <View style={styles.warningBox}>
          <MaterialIcons name="warning" size={28} color={COLORS.danger} />
          <Text style={styles.warningTitle}>Critical Actions Policy</Text>
        </View>
        <Text style={styles.desc}>
          By deleting your CoolBreeze profile:
        </Text>
        <View style={styles.list}>
          <Text style={styles.item}>• All booking references and active AMC plans will expire instantly.</Text>
          <Text style={styles.item}>• Unused promotional credits and referrals will be forfeited.</Text>
          <Text style={styles.item}>• Historical transaction invoices will be removed from your profile database.</Text>
        </View>

        <View style={styles.divider} />

        <AppInput
          label="ENTER PASSWORD TO AUTHORIZE"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          secureTextEntry
          placeholder="Password"
          error={error}
        />

        <AppButton
          title="Delete My Profile Data"
          onPress={handleDelete}
          variant="danger"
          icon="delete-forever"
          style={styles.deleteBtn}
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.danger,
    marginLeft: 6,
  },
  desc: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  list: {
    marginVertical: SPACING.md,
  },
  item: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  deleteBtn: {
    height: 48,
    marginTop: SPACING.xl,
  },
});
