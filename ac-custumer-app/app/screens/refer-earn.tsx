import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function ReferEarnScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const code = "ACFREE50";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.illustration, { backgroundColor: colors.primary + '10' }]}>
          <Icons.Gift size={64} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Invite Friends, Get $50</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Share your referral code with friends. When they book their first service, you get $50 credited directly to your wallet.
        </Text>

        <View style={[styles.codeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeRow}>
            <Text style={[styles.codeVal, { color: colors.text }]}>{code}</Text>
            <TouchableOpacity onPress={() => Alert.alert("Copied!", "Referral code copied to clipboard.")}>
              <Icons.Copy size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton 
          title="Share Referral Link" 
          onPress={() => Alert.alert("Share Code", `Sending code ${code} to friends...`)} 
        />
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
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 40,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 32,
  },
  codeBox: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 12,
  },
  codeVal: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  }
});
