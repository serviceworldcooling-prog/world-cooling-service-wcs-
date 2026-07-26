import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function SettingsScreen() {
  const { themeMode, setThemeMode, language, setLanguage } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

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
      "WARNING: Deleting your account is permanent. All historical bookings and wallet balance will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Permanently", style: "destructive", onPress: () => Alert.alert("Account Deleted", "Your account has been deleted.") }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>

          <View style={styles.row}>
            <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
            <Switch 
              value={themeMode === 'dark'}
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <TouchableOpacity style={styles.row} onPress={handleLanguageChange}>
            <Text style={[styles.rowText, { color: colors.text }]}>App Language</Text>
            <View style={styles.rowRight}>
              <Text style={{ color: colors.primary, marginRight: 8 }}>{language}</Text>
              <Icons.ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & LEGAL</Text>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Alert.alert("Change Password", "Verification email sent to change password.")}
          >
            <Text style={[styles.rowText, { color: colors.text }]}>Change Password</Text>
            <Icons.ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Alert.alert("Privacy Policy", "Showing privacy guidelines details.")}
          >
            <Text style={[styles.rowText, { color: colors.text }]}>Privacy Policy</Text>
            <Icons.ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Alert.alert("Terms & Conditions", "Showing terms of usage.")}
          >
            <Text style={[styles.rowText, { color: colors.text }]}>Terms & Conditions</Text>
            <Icons.ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <Text style={[styles.rowText, { color: colors.error, fontWeight: '700' }]}>Delete Account</Text>
            <Icons.ChevronRight size={18} color={colors.error} />
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  section: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
