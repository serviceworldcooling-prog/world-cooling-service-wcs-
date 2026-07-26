import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';

export const CommercialServiceScreen = ({ navigation }: any) => {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [acType, setAcType] = useState('');
  const [unitsCount, setUnitsCount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!companyName || !contactName || !phone || !acType) {
      alert('Please fill in all the required details.');
      return;
    }
    alert('Thank you! Our Commercial Accounts Manager will call you back within 30 minutes with a customized quote.');
    navigation.goBack();
  };

  return (
    <ScreenContainer title="Commercial AC Solutions" onBack={() => navigation.goBack()} scroll>
      <View style={styles.headerBanner}>
        <MaterialIcons name="business" size={32} color="#fff" />
        <Text style={styles.bannerTitle}>Enterprise & Office AC Services</Text>
        <Text style={styles.bannerDesc}>
          Tailored servicing packages, VRF/Central plant repairs, and rapid corporate support.
        </Text>
      </View>

      <View style={styles.formCard}>
        <AppInput
          label="COMPANY / BUSINESS NAME *"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="e.g. Acme Corp India Pvt Ltd"
        />

        <AppInput
          label="CONTACT PERSON *"
          value={contactName}
          onChangeText={setContactName}
          placeholder="e.g. Rahul Verma"
        />

        <AppInput
          label="CONTACT NUMBER *"
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. +91 99887 76655"
          keyboardType="phone-pad"
        />

        <AppInput
          label="TYPE OF AC SYSTEM *"
          value={acType}
          onChangeText={setAcType}
          placeholder="e.g. VRF, Cassette, Central Chiller, Ductable"
        />

        <AppInput
          label="NUMBER OF UNITS (ESTIMATED)"
          value={unitsCount}
          onChangeText={setUnitsCount}
          placeholder="e.g. 15 units"
          keyboardType="number-pad"
        />

        <AppInput
          label="DESCRIBE REQUIREMENTS OR FAULTS"
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe cooling load issues, servicing schedule requirements..."
          style={styles.notesInput}
        />

        <AppButton
          title="Submit Corporate Request"
          onPress={handleSubmit}
          variant="secondary"
          icon="send"
          style={styles.submitBtn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  bannerDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  notesInput: {
    marginBottom: SPACING.md,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
});
