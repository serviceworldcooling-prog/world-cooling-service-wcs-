import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function ReferralHistoryScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const history = [
    { id: '1', name: 'Robert Jenkins', status: 'Completed', reward: '+$50.00', date: 'July 12, 2026' },
    { id: '2', name: 'Emily Watson', status: 'Pending', reward: 'Pending first order', date: 'July 10, 2026' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Referral History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {history.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>Invited on {item.date}</Text>
                <Text 
                  style={[
                    styles.statusBadge, 
                    { color: item.status === 'Completed' ? colors.success : colors.warning }
                  ]}
                >
                  ● {item.status}
                </Text>
              </View>
              <Text 
                style={[
                  styles.rewardVal, 
                  { color: item.status === 'Completed' ? colors.success : colors.textSecondary }
                ]}
              >
                {item.reward}
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
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  rewardVal: {
    fontSize: 15,
    fontWeight: '800',
  }
});
