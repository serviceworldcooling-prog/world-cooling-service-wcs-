import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function WalletTransactionsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const statements = [
    { id: '1', title: 'Topup via Apple Pay', ref: 'TXN-93211', val: '+$50.00', date: 'July 15, 2026', desc: 'Added money' },
    { id: '2', title: 'Debit for Booking B002', ref: 'TXN-92100', val: '-$49.00', date: 'July 10, 2026', desc: 'Paid AC Service' },
    { id: '3', title: 'Refund for Booking B004', ref: 'TXN-82011', val: '+$99.00', date: 'July 05, 2026', desc: 'Cancelled AC Repair' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction Statement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {statements.map((txn) => (
          <View key={txn.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>{txn.title}</Text>
                <Text style={[styles.ref, { color: colors.textSecondary }]}>Ref: {txn.ref}</Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>{txn.date} | {txn.desc}</Text>
              </View>
              <Text 
                style={[
                  styles.valueText, 
                  { color: txn.val.startsWith('+') ? colors.success : colors.error }
                ]}
              >
                {txn.val}
              </Text>
            </View>
          </View>
        ))}
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
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  ref: {
    fontSize: 11,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '800',
  }
});
