import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { BookingCard } from '../../components/Cards';
import { EmptyState } from '../../components/CustomUI';
import { BookingStatus } from '../../api/bookingApi';

const TABS: { key: BookingStatus; label: string }[] = [
  { key: 'Pending',    label: 'Pending' },
  { key: 'Upcoming',   label: 'Upcoming' },
  { key: 'Completed',  label: 'Completed' },
  { key: 'Cancelled',  label: 'Cancelled' },
];

export default function BookingsScreen() {
  const { themeMode, bookings, loadBookings, bookingsLoading } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<BookingStatus>('Pending');
  const [refreshing, setRefreshing] = useState(false);

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

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabItem, activeTab === tab.key && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#FFFFFF' : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
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
              }}
              onPress={() => router.push(`/screens/booking-details?id=${item._id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={`No ${activeTab.toLowerCase()} bookings`}
              subtitle="Book a professional service from our home screen."
              icon="Calendar"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  tabBar: { flexDirection: 'row', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, padding: 4, marginBottom: 16 },
  tabItem: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },
  list: { paddingHorizontal: 24, paddingBottom: 40 },
});
