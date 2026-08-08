import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Alert, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';

const REVIEWS = [
  { id: '1', client: 'Aarav Mehta', rating: 5, date: 'Jul 28, 2026', comment: 'Extremely professional work. Cleaned up the filters and compressor perfectly, AC is freezing now! Highly recommended.', service: 'Split AC Deep Clean' },
  { id: '2', client: 'Priya Sharma', rating: 4, date: 'Jul 25, 2026', comment: 'Came on time and resolved the capacitor wiring issue. Polite behaviour.', service: 'AC Repair Service' },
  { id: '3', client: 'Karan Malhotra', rating: 5, date: 'Jul 19, 2026', comment: 'Excellent installation. Installed the bracket safely on 3rd floor. Very careful.', service: 'AC Installation' },
];

export const FeedbackRatingsScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();

  const handleStatusChange = async (newStatus: 'Available' | 'On Job' | 'Off Duty') => {
    try {
      await updateTechStatus(newStatus);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert('Status Updated', `Your status has been updated to "${newStatus}"`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update status.');
    }
  };

  const showStatusOptions = () => {
    Alert.alert(
      'Update Duty Status',
      'Select your current status:',
      [
        { text: '🟢 Available', onPress: () => handleStatusChange('Available') },
        { text: '🟡 On Job', onPress: () => handleStatusChange('On Job') },
        { text: '🔴 Off Duty', onPress: () => handleStatusChange('Off Duty') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header exactly matching Dashboard style */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: COLORS.primary }]}>W  C  S</Text>
          <View style={[styles.headerDividerVertical, { backgroundColor: COLORS.border }]} />
          
          <TouchableOpacity 
            style={styles.headerDutyStatus}
            onPress={showStatusOptions}
            activeOpacity={0.8}
          >
            <Text style={dutyLabelStyle}>DUTY STATUS</Text>
            <View style={styles.dutyRow}>
              <View style={[
                styles.dutyDotActive, 
                { 
                  backgroundColor: 
                    user?.technicianStatus === 'Available' ? COLORS.success :
                    user?.technicianStatus === 'On Job' ? '#EAB308' :
                    COLORS.textLight 
                }
              ]} />
              <Text style={styles.dutyText}>
                {user?.technicianStatus || 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={18} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Rating Metrics Card */}
        <View style={styles.ratingStatsCard}>
          <View style={styles.starsBox}>
            <Text style={styles.statsBigNum}>4.9</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <MaterialIcons key={s} name="star" size={16} color="#F59E0B" />
              ))}
            </View>
            <Text style={styles.ratingCount}>Based on 48 customer ratings</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statDetail}>
            <Text style={styles.statDetailHeader}>COMPLIMENTS</Text>
            <Text style={styles.complimentText}>🚀 10x On Time Delivery</Text>
            <Text style={styles.complimentText}>🛠️ 18x Flawless Repair</Text>
            <Text style={styles.complimentText}>💬 20x Polite Behaviour</Text>
          </View>
        </View>

        {/* List of Reviews */}
        <Text style={styles.sectionTitle}>RECENT CUSTOMER FEEDBACK</Text>
        <View style={{ gap: 16 }}>
          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.clientName}>{review.client}</Text>
                  <Text style={styles.reviewService}>{review.service}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.starsRow}>
                    {[...Array(review.rating)].map((_, i) => (
                      <MaterialIcons key={i} name="star" size={12} color="#F59E0B" />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomTabBar navigation={navigation} />
    </View>
  );
};

const dutyLabelStyle = {
  fontSize: 8,
  fontWeight: '900' as const,
  letterSpacing: 1.5,
  color: COLORS.textSecondary,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(11, 30, 63, 0.1)',
    backgroundColor: '#FFFFFF',
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
  backBtn: {
    marginRight: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  headerDutyStatus: {
    flex: 1,
    justifyContent: 'center',
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dutyDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  scroll: { padding: 16, paddingBottom: 100 },
  ratingStatsCard: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.small,
  },
  starsBox: { flex: 1.2, alignItems: 'center', justifyContent: 'center' },
  statsBigNum: { fontSize: 44, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  starsRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  ratingCount: { fontSize: 9, color: COLORS.textSecondary, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  verticalDivider: { width: 1.5, height: 75, backgroundColor: COLORS.border, marginHorizontal: 12 },
  statDetail: { flex: 1.5, gap: 4, paddingLeft: 4 },
  statDetailHeader: { fontSize: 9, fontWeight: '900', color: COLORS.textLight, letterSpacing: 1, marginBottom: 2 },
  complimentText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: COLORS.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14, marginLeft: 4 },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    ...SHADOWS.small,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 },
  clientName: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  reviewService: { fontSize: 10, color: COLORS.secondary, fontWeight: '800', marginTop: 2 },
  reviewDate: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  reviewText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, fontWeight: '500' },
});
