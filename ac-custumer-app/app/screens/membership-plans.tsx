import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import { getPlans, subscribePlan, AMCPlan } from '../../api/amcApi';
import * as Icons from 'lucide-react-native';

export default function MembershipPlansScreen() {
  const { themeMode, user, updateWalletBalance } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [plans, setPlans] = useState<AMCPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = (plan: AMCPlan) => {
    Alert.alert(
      `Subscribe to ${plan.name}`,
      `Cost: $${plan.price} • Duration: ${plan.duration}\n\nPay from wallet balance ($${user?.walletBalance.toFixed(2) || '0.00'})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe Now',
          onPress: async () => {
            setSubscribing(plan._id);
            try {
              const res = await subscribePlan(plan._id, 'wallet');
              updateWalletBalance(res.membership.walletBalance);
              Alert.alert('Subscribed!', `You are now enrolled in ${plan.name}. Valid until ${new Date(res.membership.expiresAt).toDateString()}.`);
            } catch (err: any) {
              Alert.alert('Subscription Failed', err.message);
            } finally {
              setSubscribing(null);
            }
          },
        },
      ]
    );
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>AC Club Membership</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Save thousands in annual AC maintenance and repairs by enrolling in our customized plans.
        </Text>

        {plans.map(plan => (
          <View key={plan._id} style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                <Text style={[styles.duration, { color: colors.textSecondary }]}>{plan.duration}</Text>
              </View>
              <Text style={[styles.price, { color: colors.primary }]}>${plan.price}</Text>
            </View>

            <Text style={[styles.desc, { color: colors.textSecondary }]}>{plan.description}</Text>

            {plan.inclusions.length > 0 && (
              <View style={styles.inclusionsList}>
                {plan.inclusions.map((item, i) => (
                  <View key={i} style={styles.inclusionRow}>
                    <Icons.CheckCircle size={14} color={colors.primary} />
                    <Text style={[styles.inclusionText, { color: colors.textSecondary }]}> {item}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[styles.buyBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleBuy(plan)}
              disabled={subscribing === plan._id}
            >
              {subscribing === plan._id
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Text style={styles.buyText}>Subscribe Now</Text>
              }
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  planCard: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 20 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 18, fontWeight: '800' },
  duration: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 24, fontWeight: '900' },
  desc: { fontSize: 13, lineHeight: 18, marginVertical: 12 },
  inclusionsList: { marginBottom: 8 },
  inclusionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  inclusionText: { fontSize: 13, flex: 1 },
  divider: { height: 1, marginBottom: 16 },
  buyBtn: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  buyText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
