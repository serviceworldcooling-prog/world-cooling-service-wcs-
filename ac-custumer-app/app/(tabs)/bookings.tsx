import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { BookingCard } from '../../components/Cards';
import { EmptyState } from '../../components/CustomUI';
import { BookingStatus } from '../../api/bookingApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/CustomUI';

const TABS: { key: BookingStatus; label: string }[] = [
  { key: 'Pending',    label: 'Pending' },
  { key: 'Confirmed',  label: '🚨 Emergency' },
  { key: 'Upcoming',   label: 'Upcoming' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Completed',  label: 'Completed' },
  { key: 'Cancelled',  label: 'Cancelled' },
];

export default function BookingsScreen() {
  const { themeMode, bookings, loadBookings, bookingsLoading } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<BookingStatus>('Pending');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Reload every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const activeCount = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Upcoming' || b.status === 'In Progress').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const totalCount = bookings.length;

  const filteredBookings = bookings
    .filter(b => b.status === activeTab)
    .filter(b => 
      b.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      (b.problemDescription && b.problemDescription.toLowerCase().includes(search.toLowerCase())) ||
      (b.technicianName && b.technicianName.toLowerCase().includes(search.toLowerCase()))
    );

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <Text style={[styles.brandHeader, { color: colors.primary }]}>SERVICE ARCHIVES</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>MY BOOKINGS</Text>
        <View style={[styles.headerDivider, { backgroundColor: colors.primary + '30' }]} />
      </View>

      {/* Stats Widget */}
      <View style={styles.statsRow}>
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statsNum, { color: colors.primary }]}>{totalCount}</Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>TOTAL JOBS</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statsNum, { color: colors.secondary }]}>{activeCount}</Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>ONGOING</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statsNum, { color: colors.success }]}>{completedCount}</Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>ARCHIVED</Text>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabItem, 
                activeTab === tab.key && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === tab.key ? '#FFFFFF' : colors.textSecondary }
              ]}>
                {tab.label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {bookingsLoading && !refreshing ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <BookingCard
              booking={{
                id: item._id,
                categoryTitle: item.serviceType,
                technicianName: item.technicianName,
                date: item.preferredDate,
                time: item.preferredTime,
                status: item.status as any,
                price: item.price,
                address: item.address,
                description: item.problemDescription,
                techAvatar: item.techAvatar,
                isEmergency: item.isEmergency,
              }}
              onPress={() => router.push(`/screens/booking-details?id=${item._id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={search ? "No archives match search" : `No ${activeTab.toLowerCase()} bookings`}
              subtitle={search ? "Try refining your search terms." : "Book a professional service from our home screen."}
              icon="Calendar"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    letterSpacing: 1.5,
  },
  headerDivider: {
    width: 24,
    height: 2,
    marginTop: 10,
    borderRadius: 1,
  },
  tabBarContainer: { 
    borderWidth: 1.5,
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 4,
  },
  tabScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  tabItem: { 
    paddingHorizontal: 14,
    paddingVertical: 8, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: { 
    fontSize: 10, 
    fontWeight: '800',
    letterSpacing: 1,
  },
  list: { 
    paddingHorizontal: 16, 
    paddingBottom: 40 
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statsCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  statsLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
