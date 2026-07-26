import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { getMyPlan, MyPlanResponse } from '../../api/amcApi';
import * as Icons from 'lucide-react-native';

export default function AMCDetailsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [planData, setPlanData] = useState<MyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPlan()
      .then(setPlanData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AMC Contract Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!planData?.hasMembership || !planData.plan ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icons.Crown size={40} color={colors.textSecondary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>No Active Membership</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              Subscribe to an AMC plan to unlock annual benefits.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/screens/membership-plans')}
              style={[styles.viewPlansBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>View Plans</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{planData.plan.name}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Active Contract • ${planData.plan.price}
            </Text>
            <Text style={[styles.expiryText, { color: colors.success }]}>
              Valid until: {planData.expiresAt ? new Date(planData.expiresAt).toDateString() : 'N/A'}
            </Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Plan Inclusions</Text>
            {planData.plan.inclusions.map((item, i) => (
              <View key={i} style={styles.inclusionRow}>
                <Icons.CheckCircle size={14} color={colors.primary} />
                <Text style={[styles.listItem, { color: colors.textSecondary }]}> {item}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 24, padding: 20 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  expiryText: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  divider: { height: 1, marginVertical: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  inclusionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  listItem: { fontSize: 13, lineHeight: 18, flex: 1 },
  viewPlansBtn: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});
