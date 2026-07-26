import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function RewardsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.pointBox, { backgroundColor: colors.primary }]}>
          <Icons.Sparkles size={36} color={colors.accent} />
          <Text style={styles.pointLabel}>AVAILABLE REWARD POINTS</Text>
          <Text style={styles.pointVal}>2,450 pts</Text>
          <Text style={styles.pointDesc}>Equates to $24.50 worth of wallet top-ups.</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Scratch Cards</Text>
        <View style={styles.scratchRow}>
          <TouchableOpacity 
            style={[styles.scratchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert("Scratch Card Unlocked", "Congratulations! You won $10.00 Cashback added to wallet!")}
          >
            <Icons.Gift size={32} color={colors.accent} />
            <Text style={[styles.scratchTitle, { color: colors.text }]}>Tap to scratch</Text>
          </TouchableOpacity>

          <View style={[styles.scratchCard, { backgroundColor: colors.border, borderColor: colors.border, opacity: 0.5 }]}>
            <Icons.Lock size={32} color={colors.textSecondary} />
            <Text style={[styles.scratchTitle, { color: colors.textSecondary }]}>Unlocks on next job</Text>
          </View>
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
    paddingBottom: 40,
  },
  pointBox: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  pointLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 12,
  },
  pointVal: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  pointDesc: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  scratchRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scratchCard: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scratchTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  }
});
