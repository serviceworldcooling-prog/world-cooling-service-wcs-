import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, FlatList, Dimensions, Image, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { SearchBar } from '../../components/CustomUI';
import { ServiceCard } from '../../components/Cards';
import { getServices, getCategories, Service, ServiceCategory } from '../../api/serviceApi';
import { getOffers, Offer } from '../../api/offerApi';
import { getMyBookings, Booking } from '../../api/bookingApi';
import * as Icons from 'lucide-react-native';
import * as Location from 'expo-location';
import { getNotifications } from '../../api/notificationApi';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '../../api/client';

const { width } = Dimensions.get('window');
const responsivePadding = Math.max(16, width * 0.05);
const bannerWidth = Math.min(width * 0.84, 360);

export default function HomeDashboard() {
  const { themeMode, user, userLocation, setUserLocation } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    const origin = BASE_URL.replace('/api/v1', '');
    return `${origin}${avatar}`;
  };

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Weather advisory advice list
  const weatherTips = [
    "High outdoor heat detected. Set your AC to 24°C to save up to 15% on electricity bills.",
    "Is your AC blowing warm air? Dust inside filters restricts airflow. Book a standard filter clean.",
    "Smart tip: Keep curtains closed during peak afternoon sun to lower AC workload by 20%.",
    "Running AC for over 6 hours? We recommend checking compressor status to avoid sudden breakdowns."
  ];
  const [tipIndex, setTipIndex] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await getNotifications();
      setUnreadCount(res.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchActiveBooking = async () => {
    try {
      const list = await getMyBookings();
      const active = list.find(b => b.status !== 'Completed' && b.status !== 'Cancelled');
      setActiveBooking(active || null);
    } catch (err) {
      console.log('Error fetching active booking:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchActiveBooking();
    }, [])
  );

  const handleLocationPress = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const addressString = `${geocode.name || geocode.street || ''}, ${geocode.city || ''}, ${geocode.region || ''}`.replace(/^,\s*|,\s*$/g, '') || `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
        
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          addressString,
        });
      } else {
        router.push({ pathname: '/(auth)/permissions', params: { from: 'settings' } });
      }
    } catch (err: any) {
      router.push({ pathname: '/(auth)/permissions', params: { from: 'settings' } });
    }
  };

  useEffect(() => {
    if (offers.length <= 1) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % offers.length;
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [offers]);

  // Rotate weather advice tip every 8 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % weatherTips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, svcs, activeOffers] = await Promise.all([
          getCategories(),
          getServices({ featured: true }),
          getOffers(),
        ]);
        setCategories(cats);
        setServices(svcs);
        setOffers(activeOffers);
      } catch {
        // silently fall back
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredServices = search
    ? services.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    )
    : services;

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[
        styles.header, 
        { 
          borderBottomColor: colors.primary + '30', 
          backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF',
          paddingTop: Math.max(12, insets.top),
        }
      ]}>
        <View style={styles.headerLeftContainer}>
          <Text style={[styles.logoText, { color: colors.primary }]}>W  C  S</Text>
          <View style={[styles.headerDividerVertical, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity
            style={styles.headerLocationSelector}
            onPress={handleLocationPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>LOCATION</Text>
            <View style={styles.locationRow}>
              <Icons.MapPin size={12} color={colors.primary} />
              <Text numberOfLines={1} style={[styles.locationText, { color: colors.text }]}>
                {userLocation ? userLocation.addressString : (user?.addressString || user?.address || user?.city || 'Set Location')}
              </Text>
              <Icons.ChevronDown size={12} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(tabs)/notifications')}
          activeOpacity={0.7}
        >
          <Icons.Bell size={18} color={colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Welcome Section */}
        <MotiView 
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.welcomeRow}
        >
          <View style={styles.welcomeLeft}>
            <Text style={[styles.brandHeader, { color: colors.primary }]}>EST. 2026</Text>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome, {user?.name || 'Patron'}
            </Text>
            <View style={[styles.greetingLine, { backgroundColor: colors.primary + '30' }]} />
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              SELECT A PROFESSIONAL COOLING SERVICE FROM OUR TRUSTED EXPERTS
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/screens/edit-profile')} activeOpacity={0.8}>
            <View style={[styles.avatarBorder, { borderColor: colors.primary + '40' }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileImg} />
              ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: colors.card }]}>
                  <Icons.User size={22} color={colors.primary} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </MotiView>

        {/* Dynamic Active Booking Tracker */}
        {activeBooking && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.activeBookingCard, { backgroundColor: colors.card, borderColor: colors.primary }]}
          >
            <View style={styles.activeBookingHeader}>
              <View style={styles.activeBadgeWrapper}>
                <View style={[styles.activeDotPulse, { backgroundColor: colors.success }]} />
                <Text style={[styles.activeBookingTitle, { color: colors.primary }]}>ACTIVE SERVICE TRACKER</Text>
              </View>
              <TouchableOpacity onPress={() => router.push(`/screens/live-tracking?id=${activeBooking._id}`)}>
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>DETAILS</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.activeBookingService, { color: colors.text }]}>{activeBooking.serviceType}</Text>
            <Text style={[styles.activeBookingDetail, { color: colors.textSecondary }]}>
              Status: <Text style={{ color: colors.primary, fontWeight: '700' }}>{activeBooking.status}</Text> | Scheduled: {activeBooking.preferredDate} ({activeBooking.preferredTime})
            </Text>
            {activeBooking.technicianName && activeBooking.technicianName !== 'Assigning...' ? (
              <View style={styles.assignedTechRow}>
                {activeBooking.techAvatar ? (
                  <Image source={{ uri: getAvatarUrl(activeBooking.techAvatar) }} style={styles.techAvatarMin} />
                ) : (
                  <View style={[styles.techAvatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                    <Icons.User size={12} color={colors.primary} />
                  </View>
                )}
                <Text style={[styles.techNameMin, { color: colors.text }]}>Technician: {activeBooking.technicianName}</Text>
              </View>
            ) : (
              <Text style={[styles.assigningText, { color: colors.textSecondary }]}>⏳ Assigning best technician shortly...</Text>
            )}
          </MotiView>
        )}

        {/* Search */}
        <View style={[styles.searchSection, { borderColor: colors.border }]}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* Weather & Dynamic Advisory Widget */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.weatherWidget, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.weatherLeft}>
            <Icons.Sun size={26} color={themeMode === 'dark' ? '#F59E0B' : '#D97706'} />
            <Text style={[styles.tempText, { color: colors.text }]}>34°C</Text>
            <Text style={[styles.conditionText, { color: colors.textSecondary }]}>SUNNY</Text>
          </View>
          <View style={[styles.widgetDivider, { backgroundColor: colors.border }]} />
          <View style={styles.weatherRight}>
            <Text style={[styles.weatherTipTitle, { color: colors.primary }]}>COOLING RECOMMENDATION</Text>
            <Text style={[styles.weatherTipText, { color: colors.text }]} numberOfLines={3}>
              {weatherTips[tipIndex]}
            </Text>
          </View>
        </MotiView>

        {/* Offers Section */}
        {offers.length > 0 && (
          <MotiView 
            from={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 200 }}
            style={styles.bannerSection}
          >
            <FlatList
              ref={flatListRef}
              data={offers}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offerList}
              getItemLayout={(_, index) => (
                { length: bannerWidth + 16, offset: (bannerWidth + 16) * index, index }
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push('/screens/offers')}
                  style={[styles.offerBanner, { width: bannerWidth, backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} />
                  ) : null}
                  <View style={[styles.offerOverlay, { backgroundColor: item.imageUrl ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.05)' }]} />
                  <View style={styles.offerContent}>
                    <Text style={[styles.bannerPromo, { color: colors.accent || '#D4AF37' }]}>
                      PROMO: {item.code}
                    </Text>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text numberOfLines={2} style={styles.bannerSubtitle}>
                      {item.description || `Get ${item.discountType === 'percent' ? `${item.discount}%` : `₹${item.discount}`} off!`}
                    </Text>
                  </View>
                  {!item.imageUrl && (
                    <View style={styles.bannerIconWrap}>
                      <Icons.Sparkles size={32} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </MotiView>
        )}

        {/* Emergency Breakdown */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/emergency')}
          style={[styles.emergencyBanner, { backgroundColor: colors.card, borderColor: colors.error + '40' }]}
        >
          <View style={styles.emergencyLeft}>
            <View style={[styles.emergencyIconWrapper, { backgroundColor: colors.error + '10' }]}>
              <Icons.Flame size={18} color={colors.error} />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.emergencyTitle, { color: colors.error }]}>EMERGENCY BREAKDOWN</Text>
              <Text numberOfLines={1} style={[styles.emergencyDesc, { color: colors.textSecondary }]}>
                Instant dispatch for urgent cooling problems
              </Text>
            </View>
          </View>
          <Icons.ChevronRight size={16} color={colors.error} />
        </TouchableOpacity>

        {/* Service Categories */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>OUR SERVICES</Text>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
          </View>
          <TouchableOpacity onPress={() => router.push('/screens/categories')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>SEE ALL</Text>
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
                image: item.image,
              }}
              onPress={() => router.push(`/screens/service-details?id=${item._id}`)}
            />
          ))
        )}

        {/* AMC Club Membership Banner */}
        <MotiView
          from={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={[styles.membershipCard, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
        >
          <View style={styles.membershipLeft}>
            <View style={[styles.membershipShieldWrap, { backgroundColor: colors.primary + '10' }]}>
              <Icons.ShieldCheck size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.membershipTitle, { color: colors.text }]}>WCS SHIELD MEMBERSHIP</Text>
              <Text style={[styles.membershipDesc, { color: colors.textSecondary }]}>
                Get unlimited free repairs, priority dispatch & 15% off spare parts. Plans start at ₹99/yr.
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.membershipBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/screens/membership-plans')}
            activeOpacity={0.8}
          >
            <Text style={styles.membershipBtnText}>JOIN</Text>
          </TouchableOpacity>
        </MotiView>

        {/* Book Now CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/screens/request-service')}
          style={[styles.requestCard, { backgroundColor: colors.primary, borderColor: colors.primary }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.requestTitle}>BOOK SERVICE REQUEST</Text>
            <Text style={styles.requestDesc}>
              Submit request & have a technician assigned instantly
            </Text>
          </View>
          <Icons.ArrowRight size={18} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: responsivePadding, 
    paddingTop: 12, 
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  headerLocationSelector: { 
    flex: 1,
    justifyContent: 'center',
  },
  locationLabel: { 
    fontSize: 8, 
    fontWeight: '900', 
    letterSpacing: 1.5,
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 2 
  },
  locationText: { 
    fontSize: 12, 
    fontWeight: '700',
    marginLeft: 3,
    maxWidth: width * 0.42,
  },
  menuButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 8, 
    borderWidth: 1.5, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -3,
    top: -3,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  scroll: { 
    paddingHorizontal: responsivePadding, 
    paddingBottom: 40 
  },
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 4,
  },
  welcomeRow: { 
    marginVertical: 24, 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between', 
    gap: 12 
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeText: { 
    fontSize: 22, 
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  greetingLine: {
    width: 40,
    height: 1.5,
    marginVertical: 10,
    borderRadius: 1,
  },
  subText: { 
    fontSize: 11, 
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  avatarBorder: {
    borderWidth: 1.5,
    padding: 2,
    borderRadius: 25,
  },
  profileImg: { 
    width: 42, 
    height: 42, 
    borderRadius: 21,
  },
  profilePlaceholder: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  searchSection: {
    marginBottom: 20,
  },
  bannerSection: { 
    marginVertical: 12 
  },
  offerList: { 
    paddingRight: 8 
  },
  offerBanner: { 
    borderRadius: 12, 
    marginRight: 16, 
    overflow: 'hidden', 
    minHeight: 145, 
    justifyContent: 'space-between',
    borderWidth: 1.5,
    padding: 16,
  },
  offerOverlay: { 
    ...StyleSheet.absoluteFillObject 
  },
  offerContent: { 
    position: 'absolute', 
    left: 16, 
    right: 40, 
    top: 16, 
    zIndex: 1 
  },
  bannerPromo: { 
    fontSize: 9, 
    fontWeight: '800', 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
  },
  bannerTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    marginTop: 6,
    color: '#FFF',
    letterSpacing: -0.3,
  },
  bannerSubtitle: { 
    fontSize: 11, 
    marginTop: 6, 
    lineHeight: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  bannerIconWrap: { 
    position: 'absolute', 
    right: 12, 
    bottom: 12, 
    opacity: 0.25, 
    zIndex: 1 
  },
  emergencyBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    marginVertical: 18,
  },
  emergencyLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  emergencyIconWrapper: { 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  emergencyTitle: { 
    fontSize: 11, 
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  emergencyDesc: { 
    fontSize: 11, 
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 24, 
    marginBottom: 16 
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '900',
    letterSpacing: 2,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyText: { 
    textAlign: 'center', 
    fontSize: 13, 
    marginVertical: 16 
  },
  requestCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 12, 
    marginTop: 24,
    borderWidth: 1,
  },
  requestTitle: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '800',
    letterSpacing: 2,
  },
  requestDesc: { 
    color: 'rgba(255,255,255,0.85)', 
    fontSize: 11, 
    marginTop: 4,
    fontWeight: '500',
  },
  activeBookingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeBookingTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  activeBookingService: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  activeBookingDetail: {
    fontSize: 11,
    fontWeight: '600',
  },
  assignedTechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 8,
  },
  techAvatarMin: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  techNameMin: {
    fontSize: 11,
    fontWeight: '700',
  },
  assigningText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  weatherLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 14,
    minWidth: 70,
  },
  tempText: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  conditionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  widgetDivider: {
    width: 1,
    height: 40,
    marginRight: 14,
  },
  weatherRight: {
    flex: 1,
    justifyContent: 'center',
  },
  weatherTipTitle: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  weatherTipText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  membershipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 10,
  },
  membershipShieldWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  membershipDesc: {
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  membershipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  membershipBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  techAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
});
