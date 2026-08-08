import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { getOffers, Offer } from '../../api/offerApi';
import * as Icons from 'lucide-react-native';

export default function OffersScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getOffers();
        setOffers(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const defaultBanner = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Seasonal Offers</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : offers.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Icons.Tag size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
            No Offers Available
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            Check back later for seasonal promotions and coupon upgrades.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {offers.map((offer) => {
            const discountLabel = offer.discountType === 'percent' 
              ? `${offer.discount}% Off` 
              : `₹${offer.discount} Off`;

            return (
              <View key={offer._id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image 
                  source={{ uri: offer.imageUrl || defaultBanner }} 
                  style={styles.banner} 
                />
                <View style={styles.info}>
                  <View style={styles.topRow}>
                    <Text style={[styles.title, { color: colors.text }]}>{offer.title}</Text>
                    <Text style={[styles.discount, { color: colors.accent }]}>{discountLabel}</Text>
                  </View>
                  <Text style={[styles.desc, { color: colors.textSecondary }]}>
                    {offer.description || `Use coupon code ${offer.code} at checkout to claim this offer.`}
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => Alert.alert("Coupon Copied", `Coupon code "${offer.code}" has been copied! Use it at checkout.`)}
                  >
                    <Text style={styles.actionText}>Copy Code: {offer.code}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  banner: {
    width: '100%',
    height: 220,
  },
  info: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  discount: {
    fontSize: 14,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontWeight: '700',
  }
});
