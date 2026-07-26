import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';

export const QuotesRequestScreen = ({ navigation }: any) => {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);

  const handleSubmit = () => {
    if (!description || !address) {
      alert('Please fill out the issue description and your address.');
      return;
    }
    alert('Quote request submitted! Technicians will review your photos and send bids/quotes directly to your dashboard.');
    navigation.goBack();
  };

  return (
    <ScreenContainer title="Request Custom Quote" onBack={() => navigation.goBack()} scroll>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Describe the issue</Text>
        <AppInput
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Copper coil has a major rust leak, or indoor fan is making squeaking sounds. Please provide details."
          style={styles.textArea}
        />

        <Text style={styles.sectionTitle}>Upload Photos / Video (Optional)</Text>
        <TouchableOpacity
          style={[styles.uploadBox, photoSelected && styles.uploadedBox]}
          onPress={() => {
            setPhotoSelected(true);
            alert('Mock Photo Attachment Selected Successfully.');
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={photoSelected ? 'check-circle' : 'add-a-photo'}
            size={36}
            color={photoSelected ? COLORS.success : COLORS.secondary}
          />
          <Text style={[styles.uploadText, photoSelected && { color: COLORS.success }]}>
            {photoSelected ? '1 Photo attached successfully' : 'Snap photo or select from gallery'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Your Location</Text>
        <AppInput
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. Flat 402, Block B, Silver Oak Residency, Noida"
        />

        <AppButton
          title="Submit Quote Request"
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  textArea: {
    height: 80,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  uploadedBox: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: SPACING.lg,
  },
});
