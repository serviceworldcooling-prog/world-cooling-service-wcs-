import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { Category, Technician, Booking } from '../constants/mocks';
import { IconHelper } from './CustomUI';
import * as Icons from 'lucide-react-native';

export const ServiceCard: React.FC<{ category: Category; onPress: () => void }> = ({ category, onPress }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.secondary + '20' }]}>
        <IconHelper name={category.icon} color={colors.primary} size={28} />
      </View>
      <View style={styles.cardDetails}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{category.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {category.description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Starts from</Text>
          <Text style={[styles.priceVal, { color: colors.primary }]}>${category.basePrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const TechnicianCard: React.FC<{ 
  technician: Technician; 
  selected: boolean; 
  onPress: () => void 
}> = ({ technician, selected, onPress }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card },
        selected ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: colors.border, borderWidth: 1 }
      ]}
    >
      <Image source={{ uri: technician.avatar }} style={styles.avatar} />
      <View style={styles.cardDetails}>
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{technician.name}</Text>
          <View style={styles.ratingRow}>
            <Icons.Star size={14} color={colors.accent} fill={colors.accent} />
            <Text style={[styles.ratingText, { color: colors.text }]}> {technician.rating}</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{technician.specialty}</Text>
        <Text style={[styles.jobsText, { color: colors.textSecondary }]}>
          💼 {technician.completedJobs}+ Jobs completed
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const BookingCard: React.FC<{ booking: Booking; onPress: () => void }> = ({ booking, onPress }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return colors.secondary;
      case 'Completed': return colors.success;
      case 'Cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.bookingLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
          <Icons.Calendar color={colors.primary} size={24} />
        </View>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{booking.categoryTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>{booking.status}</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          📅 {booking.date} | ⏰ {booking.time}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.headerRow}>
          <Text style={[styles.jobsText, { color: colors.textSecondary }]}>Technician: {booking.technicianName}</Text>
          <Text style={[styles.priceVal, { color: colors.primary, fontSize: 16 }]}>${booking.price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  jobsText: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookingLeft: {
    marginRight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  }
});
