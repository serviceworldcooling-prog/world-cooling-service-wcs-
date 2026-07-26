import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../constants/mockData';

export const MyBookingsScreen = ({ navigation }: any) => {
  const { bookings } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const activeBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Accepted' || b.status === 'In Progress');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  const currentList = activeTab === 'active' ? activeBookings : pastBookings;

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'Pending': return { bg: COLORS.warningLight, text: COLORS.warning };
      case 'Accepted': return { bg: COLORS.secondaryLight, text: COLORS.secondary };
      case 'In Progress': return { bg: '#E0F2FE', text: '#0284C7' };
      case 'Completed': return { bg: COLORS.successLight, text: COLORS.success };
      case 'Cancelled': return { bg: COLORS.dangerLight, text: COLORS.danger };
      default: return { bg: COLORS.border, text: COLORS.textSecondary };
    }
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  return (
    <ScreenContainer title="My Bookings" noHeader={false}>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' ? styles.tabActive : null]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' ? styles.tabTextActive : null]}>
            Active ({activeBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' ? styles.tabActive : null]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' ? styles.tabTextActive : null]}>
            History ({pastBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {currentList.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="receipt" size={60} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptyDesc}>You have no {activeTab} service bookings currently.</Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);
            return (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => handleBookingPress(item)}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.serviceCol}>
                    <Text style={styles.bookingId}>#{item.id}</Text>
                    <Text style={styles.serviceName}>{item.serviceName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="event" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.detailText}>{item.date} • {item.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="room" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
                  </View>
                </View>

                {item.technicianName && (
                  <View style={styles.techBar}>
                    <Image source={{ uri: item.technicianAvatar }} style={styles.techAvatar} />
                    <View style={styles.techInfo}>
                      <Text style={styles.techLabel}>Assigned Technician</Text>
                      <Text style={styles.techName}>{item.technicianName}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.actionBtn}
                      onPress={() => {
                        if (item.status === 'Completed') {
                          navigation.navigate('RatingsReviews', { bookingId: item.id });
                        } else {
                          navigation.navigate('TrackTechnician', { bookingId: item.id });
                        }
                      }}
                    >
                      <Text style={styles.actionBtnText}>
                        {item.status === 'Completed' ? 'Rate Service' : 'Track'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.totalLabel}>Total Price</Text>
                  <Text style={styles.totalVal}>₹{item.totalPrice}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: 4,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: ROUNDED.sm,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  list: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.sm,
  },
  serviceCol: {
    flex: 1,
  },
  bookingId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: ROUNDED.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDetails: {
    marginVertical: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  techBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: ROUNDED.sm,
    marginVertical: SPACING.xs,
  },
  techAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  techInfo: {
    flex: 1,
  },
  techLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  techName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: ROUNDED.sm,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
