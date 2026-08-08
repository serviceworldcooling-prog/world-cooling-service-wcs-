import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import { getPlans, subscribePlan, AMCPlan } from '../../api/amcApi';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MembershipPlansScreen() {
  const { themeMode, user, updateWalletBalance } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState<AMCPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = (plan: AMCPlan) => {
    Alert.alert(
      `Subscribe to ${plan.name}`,
      `Cost: ₹${plan.price} • Duration: ${plan.duration}\n\nPay from wallet balance (₹${user?.walletBalance.toFixed(2) || '0.00'})?`,
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
      <SafeAreaView style={[styles.container, bgStyle, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <View style={[
        styles.header, 
        { 
          borderBottomColor: colors.primary + '30', 
          backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF',
          paddingTop: Math.max(12, insets.top),
        }
      ]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>CLUB MEMBERSHIPS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Save thousands in annual AC maintenance and repairs by enrolling in our customized plans.
        </Text>

        {plans.map(plan => (
          <View key={plan._id} style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.primary + '20' }]}>
            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                <Text style={[styles.duration, { color: colors.textSecondary }]}>{plan.duration}</Text>
              </View>
              <Text style={[styles.price, { color: colors.primary }]}>₹{plan.price}</Text>
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingBottom: 16,
    borderBottomWidth: 1.5,
  },
  backButton: {
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
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  subtitle: { 
    fontSize: 13, 
    lineHeight: 18, 
    marginBottom: 20,
    fontWeight: '600',
  },
  planCard: { 
    borderWidth: 1.5, 
    borderRadius: 12, 
    padding: 20, 
    marginBottom: 20 
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 16, fontWeight: '900' },
  duration: { fontSize: 11, marginTop: 2, fontWeight: '700' },
  price: { fontSize: 20, fontWeight: '900' },
  desc: { fontSize: 12, lineHeight: 16, marginVertical: 12, fontWeight: '500' },
  inclusionsList: { marginBottom: 8 },
  inclusionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  inclusionText: { fontSize: 12, flex: 1, fontWeight: '600', marginLeft: 6 },
  divider: { height: 1.5, marginBottom: 16, opacity: 0.1 },
  buyBtn: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buyText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
});
