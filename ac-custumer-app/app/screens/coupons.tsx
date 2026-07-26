import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { getCoupons, Coupon } from '../../api/couponApi';
import * as Icons from 'lucide-react-native';

export default function CouponsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoupons()
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Copied!', `Code ${code} copied to clipboard!`);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Available Coupons</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {coupons.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No active coupons at the moment.
          </Text>
        ) : (
          coupons.map(coupon => (
            <View key={coupon._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.topRow}>
                <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{coupon.code}</Text>
                </View>
                <Text style={[styles.discountText, { color: colors.accent }]}>
                  {coupon.discountType === 'percent'
                    ? `${coupon.discount}% OFF`
                    : `Save $${coupon.discount}`
                  }
                </Text>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>{coupon.title}</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{coupon.subtitle}</Text>
              {coupon.minOrderAmount > 0 && (
                <Text style={[styles.minOrder, { color: colors.textSecondary }]}>
                  Min. order: ${coupon.minOrderAmount}
                </Text>
              )}
              <Text style={[styles.expiry, { color: colors.textSecondary }]}>
                Expires: {new Date(coupon.validUntil).toLocaleDateString()}
              </Text>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleCopy(coupon.code)}
              >
                <Icons.Copy size={16} color="#FFF" />
                <Text style={styles.applyBtnText}> Copy & Apply</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  discountText: { fontSize: 15, fontWeight: '800' },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 4 },
  minOrder: { fontSize: 12, marginTop: 4 },
  expiry: { fontSize: 11, marginTop: 4, opacity: 0.7 },
  divider: { height: 1, marginVertical: 14 },
  applyBtn: { flexDirection: 'row', height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
