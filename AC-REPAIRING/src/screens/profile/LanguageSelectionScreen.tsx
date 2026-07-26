import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';

export const LanguageSelectionScreen = ({ navigation }: any) => {
  const languages = [
    { id: 'en', name: 'English', nativeName: 'English' },
    { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { id: 'es', name: 'Spanish', nativeName: 'Español' },
    { id: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { id: 'fr', name: 'French', nativeName: 'Français' },
  ];

  const [selectedLang, setSelectedLang] = useState('en');

  const handleSave = () => {
    const langObj = languages.find(l => l.id === selectedLang);
    Alert.alert(
      'Language Selected',
      `App language has been changed to ${langObj?.name}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScreenContainer title="Language Choice" onBack={() => navigation.goBack()}>
      <View style={styles.flex}>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedLang === item.id;
            return (
              <TouchableOpacity
                style={[styles.card, isSelected ? styles.cardActive : null]}
                onPress={() => setSelectedLang(item.id)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.langName}>{item.name}</Text>
                  <Text style={styles.nativeName}>{item.nativeName}</Text>
                </View>
                <MaterialIcons
                  name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={22}
                  color={isSelected ? COLORS.primary : COLORS.textLight}
                />
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveText}>Apply Language Choice</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  langName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  nativeName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.small,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
