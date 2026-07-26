import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function LanguageSettingsScreen() {
  const { themeMode, language, setLanguage } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const options = ['English', 'Spanish', 'French', 'German', 'Arabic'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>App Language</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {options.map((lang) => (
          <TouchableOpacity
            key={lang}
            onPress={() => {
              setLanguage(lang);
              Alert.alert("Success", `Language updated to ${lang}.`);
              router.back();
            }}
            style={[styles.row, { borderColor: colors.border }]}
          >
            <Text style={[styles.langText, { color: colors.text }]}>{lang}</Text>
            {language === lang && <Icons.Check size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
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
  content: {
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  langText: {
    fontSize: 15,
    fontWeight: '600',
  }
});
