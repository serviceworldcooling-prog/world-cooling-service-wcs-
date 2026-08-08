import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { themeMode, setThemeMode, language, setLanguage } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLanguageChange = () => {
    Alert.alert(
      "Choose Language",
      "Select your preferred language",
      [
        { text: "English", onPress: () => setLanguage("English") },
        { text: "Spanish", onPress: () => setLanguage("Spanish") },
        { text: "French", onPress: () => setLanguage("French") }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "WARNING: Deleting your account is permanent. All bookings and wallet balance will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Permanently", style: "destructive", onPress: () => Alert.alert("Account Deleted", "Your account has been deleted.") }
      ]
    );
  };

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>APP SETTINGS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>

          <View style={styles.row}>
            <Text style={[styles.rowText, { color: colors.text }]}>DARK MODE</Text>
            <Switch 
              value={themeMode === 'dark'}
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <TouchableOpacity style={styles.row} onPress={handleLanguageChange} activeOpacity={0.7}>
            <Text style={[styles.rowText, { color: colors.text }]}>APP LANGUAGE</Text>
            <View style={styles.rowRight}>
              <Text style={{ color: colors.primary, marginRight: 8, fontWeight: '700', fontSize: 12 }}>{language.toUpperCase()}</Text>
              <Icons.ChevronRight size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & LEGAL</Text>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Alert.alert("Change Password", "Verification email sent to change password.")}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowText, { color: colors.text }]}>CHANGE PASSWORD</Text>
            <Icons.ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Alert.alert("Privacy Policy", "Showing privacy guidelines details.")}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowText, { color: colors.text }]}>PRIVACY POLICY</Text>
            <Icons.ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Alert.alert("Terms & Conditions", "Showing terms of usage.")}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowText, { color: colors.text }]}>TERMS & CONDITIONS</Text>
            <Icons.ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderColor: colors.border, borderBottomWidth: 0 }]}>
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount} activeOpacity={0.7}>
            <Text style={[styles.rowText, { color: colors.error, fontWeight: '900' }]}>DELETE ACCOUNT</Text>
            <Icons.ChevronRight size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
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
  backBtn: {
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
  section: {
    borderBottomWidth: 1.5,
    paddingBottom: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
