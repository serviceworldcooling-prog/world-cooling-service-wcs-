import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function InvoiceDetailsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Invoice Receipt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.receiptBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>AC Service Center, Inc.</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Tax Invoice: #INV-9210</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>Date: July 15, 2026</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.itemRow}>
            <Text style={{ color: colors.text }}>AC Jet Cleaning Service</Text>
            <Text style={{ color: colors.text }}>$49.00</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={{ color: colors.textSecondary }}>State Tax (5%)</Text>
            <Text style={{ color: colors.text }}>$2.45</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.itemRow}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Paid Total</Text>
            <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16 }}>$51.45</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert("Download Completed", "Invoice PDF saved to local storage.")}
        >
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Download PDF Copy</Text>
        </TouchableOpacity>
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
  receiptBox: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  downloadBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
