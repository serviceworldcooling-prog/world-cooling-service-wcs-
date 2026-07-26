import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, FlatList, Dimensions, Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { SearchBar } from '../../components/CustomUI';
import { ServiceCard } from '../../components/Cards';
import { getServices, getCategories, Service, ServiceCategory } from '../../api/serviceApi';
import { getCoupons, Coupon } from '../../api/couponApi';
import * as Icons from 'lucide-react-native';

const { width } = Dimensions.get('window');
const responsivePadding = Math.max(16, width * 0.05);
const bannerWidth = Math.min(width * 0.84, 360);

export default function HomeDashboard() {
  const { themeMode, user } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, svcs, coupons] = await Promise.all([
          getCategories(),
          getServices({ featured: true }),
          getCoupons(),
        ]);
        setCategories(cats);
        setServices(svcs);
        setOffers(coupons);
      } catch {
        // silently fall back — screens still render with empty state
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter services by search text
  const filteredServices = search
    ? services.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
      )
    : services;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Current Location</Text>
          <View style={styles.locationRow}>
            <Icons.MapPin size={16} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.text }]}> My Location</Text>
            <Icons.ChevronDown size={14} color={colors.textSecondary} />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.menuButton, { borderColor: colors.border }]}
          onPress={() => router.push('/screens/menu')}
        >
          <Icons.Menu size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcomeRow}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Hello, {user?.name || 'Customer'} 👋
          </Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Which AC service do you need today?
          </Text>
        </View>

        {/* Search */}
        <SearchBar value={search} onChangeText={setSearch} />

        {/* Offers Banner — from real API */}
        {offers.length > 0 && (
          <View style={styles.bannerSection}>
            <FlatList
              data={offers}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offerList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push('/screens/coupons')}
                  style={[styles.offerBanner, { width: bannerWidth, backgroundColor: colors.primary }]}
                >
                  <View style={[styles.offerOverlay, { backgroundColor: colors.offerOverlay }]} />
                  <View style={styles.offerContent}>
                    <Text style={[styles.bannerPromo, { color: colors.offerText }]}>
                      PROMO: {item.code}
                    </Text>
                    <Text style={[styles.bannerTitle, { color: colors.offerText }]}>{item.title}</Text>
                    <Text style={[styles.bannerSubtitle, { color: colors.offerText }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <View style={styles.bannerIconWrap}>
                    <Icons.Sparkles size={40} color={colors.accent} />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Emergency */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/emergency')}
          style={[styles.emergencyBanner, { backgroundColor: colors.error + '12', borderColor: colors.error }]}
        >
          <View style={styles.emergencyLeft}>
            <View style={[styles.emergencyIconWrapper, { backgroundColor: colors.error }]}>
              <Icons.Flame size={20} color="#FFF" />
            </View>
            <View>
              <Text style={[styles.emergencyTitle, { color: colors.error }]}>Emergency Breakdown?</Text>
              <Text style={[styles.emergencyDesc, { color: colors.textSecondary }]}>
                Instant booking with 30-min technician dispatch.
              </Text>
            </View>
          </View>
          <Icons.ChevronRight size={20} color={colors.error} />
        </TouchableOpacity>

        {/* Service Categories */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Categories</Text>
          <TouchableOpacity onPress={() => router.push('/screens/categories')}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : filteredServices.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No services found. Pull to refresh.
          </Text>
        ) : (
          filteredServices.slice(0, 4).map(item => (
            <ServiceCard
              key={item._id}
              category={{
                id: item._id,
                title: item.title,
                icon: item.icon,
                description: item.description,
                basePrice: item.basePrice,
              }}
              onPress={() => router.push(`/screens/service-details?id=${item._id}`)}
            />
          ))
        )}

        {/* Book Now CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/screens/request-service')}
          style={[styles.requestCard, { backgroundColor: colors.primary }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.requestTitle}>Book AC Repair Now</Text>
            <Text style={styles.requestDesc}>
              Submit your request — admin assigns a technician to you
            </Text>
          </View>
          <Icons.ArrowRight size={22} color="#FFF" />
        </TouchableOpacity>

        {/* Membership */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/screens/membership-plans')}
          style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.memberLeft}>
            <Icons.Crown size={28} color={colors.accent} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.memberTitle, { color: colors.text }]}>AC Club Membership</Text>
              <Text style={[styles.memberDesc, { color: colors.textSecondary }]}>
                Save up to 25% on every booking & priority support.
              </Text>
            </View>
          </View>
          <Icons.ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: responsivePadding, paddingTop: 12, paddingBottom: 8 },
  headerLeft: { flex: 1 },
  locationLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 15, fontWeight: '700' },
  menuButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: responsivePadding, paddingBottom: 40 },
  welcomeRow: { marginVertical: 16 },
  welcomeText: { fontSize: 22, fontWeight: '800' },
  subText: { fontSize: 14, marginTop: 4 },
  bannerSection: { marginVertical: 12 },
  offerList: { paddingRight: 8 },
  offerBanner: { borderRadius: 24, marginRight: 16, overflow: 'hidden', minHeight: 170, justifyContent: 'space-between' },
  offerOverlay: { ...StyleSheet.absoluteFillObject },
  offerContent: { position: 'absolute', left: 18, right: 72, top: 18, zIndex: 1 },
  bannerPromo: { fontSize: 10, fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerTitle: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  bannerSubtitle: { fontSize: 12, marginTop: 4, opacity: 0.95, lineHeight: 18 },
  bannerIconWrap: { position: 'absolute', right: 14, bottom: 14, opacity: 0.55, zIndex: 1 },
  emergencyBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1.5, marginVertical: 16 },
  emergencyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emergencyIconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  emergencyTitle: { fontSize: 15, fontWeight: '800' },
  emergencyDesc: { fontSize: 11, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { textAlign: 'center', fontSize: 13, marginVertical: 16 },
  requestCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginTop: 16 },
  requestTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  requestDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  memberCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, marginTop: 24 },
  memberLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  memberTitle: { fontSize: 15, fontWeight: '700' },
  memberDesc: { fontSize: 11, marginTop: 2, width: '90%' },
});
