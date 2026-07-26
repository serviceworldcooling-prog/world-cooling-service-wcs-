import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import { MOCK_CATEGORIES, MOCK_COUPONS } from '../../constants/mockData';

export const HomeScreen = ({ navigation }: any) => {
  const { user, bookings, notifications } = useApp();

  const activeBooking = bookings.find(b => b.status === 'In Progress' || b.status === 'Accepted' || b.status === 'Pending');
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const handleCategoryPress = (category: any) => {
    navigation.navigate('BookService', { category });
  };

  return (
    <ScreenContainer noHeader backgroundColor={COLORS.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Top Profile & Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            </TouchableOpacity>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingText}>Hello, {user.name.split(' ')[0]} 👋</Text>
              <TouchableOpacity 
                style={styles.locationSelector}
                onPress={() => navigation.navigate('SavedAddresses')}
              >
                <MaterialIcons name="room" size={14} color={COLORS.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {user.addresses[0]?.label || 'Set Location'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.notifIcon}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
            {unreadNotifCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Promo Banner Card */}
        <TouchableOpacity 
          style={styles.promoCard}
          onPress={() => navigation.navigate('Coupons')}
        >
          <View style={styles.promoTextCol}>
            <View style={styles.membershipTag}>
              <MaterialIcons name="star" size={12} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.membershipTagName}>{user.membership} Member</Text>
            </View>
            <Text style={styles.promoTitle}>Summer Cooling Sale</Text>
            <Text style={styles.promoSubtitle}>Get Flat ₹300 off on gas leak recharge & maintenance services</Text>
            <Text style={styles.promoCode}>Use Code: SUMMERDRY</Text>
          </View>
          <View style={styles.promoIconCol}>
            <MaterialIcons name="ac-unit" size={80} color="rgba(255, 255, 255, 0.15)" />
          </View>
        </TouchableOpacity>

        {/* Active Booking Live Banner */}
        {activeBooking && (
          <TouchableOpacity 
            style={styles.activeBookingCard}
            onPress={() => navigation.navigate('BookingDetails', { bookingId: activeBooking.id })}
          >
            <View style={styles.activeBookingHeader}>
              <View style={styles.activeTag}>
                <View style={styles.activeDot} />
                <Text style={styles.activeTagText}>ACTIVE SERVICE</Text>
              </View>
              <Text style={styles.activeBookingId}>#{activeBooking.id}</Text>
            </View>
            <Text style={styles.activeBookingName}>{activeBooking.serviceName}</Text>
            <Text style={styles.activeBookingTime}>{activeBooking.date} • {activeBooking.time}</Text>
            
            <View style={styles.activeBookingFooter}>
              <View style={styles.techCol}>
                <MaterialIcons name="person" size={16} color={COLORS.primary} />
                <Text style={styles.techNameText}>
                  {activeBooking.technicianName || 'Assigning Technician...'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.trackBtn}
                onPress={() => navigation.navigate('TrackTechnician', { bookingId: activeBooking.id })}
              >
                <Text style={styles.trackBtnText}>Track Live</Text>
                <MaterialIcons name="gps-fixed" size={14} color="#ffffff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Service Categories Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AC Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {MOCK_CATEGORIES.slice(0, 4).map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryCell}
              onPress={() => handleCategoryPress(cat)}
            >
              <View style={styles.categoryIconCircle}>
                <MaterialIcons name={cat.icon as any} size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
              <Text style={styles.categoryPrice}>From ₹{cat.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Cooling Service banner */}
        <TouchableOpacity 
          style={styles.emergencyCard}
          onPress={() => navigation.navigate('EmergencyBooking')}
        >
          <View style={styles.emergencyIconCircle}>
            <MaterialIcons name="warning" size={24} color="#ffffff" />
          </View>
          <View style={styles.emergencyTextCol}>
            <Text style={styles.emergencyTitle}>Emergency Cooling Service</Text>
            <Text style={styles.emergencyDesc}>AC breakdown in peak summer? Get a technician within 45 mins.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.danger} />
        </TouchableOpacity>

        {/* Coupons & Offers Slider */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coupons & Offers</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.couponSlider}>
          {MOCK_COUPONS.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <Text style={styles.couponCodeText}>{coupon.code}</Text>
                <Text style={styles.couponDiscText}>Save ₹{coupon.discount}</Text>
              </View>
              <Text style={styles.couponDescText}>{coupon.description}</Text>
              <Text style={styles.couponMinText}>Min booking value ₹{coupon.minCartValue}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Referral banner */}
        <TouchableOpacity 
          style={styles.referCard}
          onPress={() => navigation.navigate('ReferEarn')}
        >
          <View style={styles.referLeft}>
            <MaterialIcons name="card-giftcard" size={32} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <View>
              <Text style={styles.referTitle}>Refer Friends, Get ₹150</Text>
              <Text style={styles.referDesc}>Get free service credits on every referral</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  greetingCol: {
    marginLeft: SPACING.sm,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    maxWidth: 200,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginHorizontal: 2,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  promoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.medium,
  },
  promoTextCol: {
    flex: 1,
    zIndex: 2,
  },
  membershipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  membershipTagName: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  promoSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
    lineHeight: 16,
  },
  promoCode: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  promoIconCol: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
  },
  activeBookingCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.secondaryLight,
    borderWidth: 2,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.small,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginRight: 6,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  activeBookingId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeBookingName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  activeBookingTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeBookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  techCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: ROUNDED.full,
  },
  trackBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  categoryCell: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  categoryPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  emergencyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
  },
  emergencyDesc: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  couponSlider: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.md,
  },
  couponCard: {
    width: 240,
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginRight: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  couponCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: ROUNDED.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  couponDiscText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  couponDescText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginVertical: SPACING.xs,
  },
  couponMinText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  referCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOWS.small,
  },
  referLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  referDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
