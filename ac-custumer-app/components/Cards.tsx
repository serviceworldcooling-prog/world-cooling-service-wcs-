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
      activeOpacity={0.95}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1.5,
          borderRadius: 12,
          padding: 14,
        }
      ]}
    >
      {category.image ? (
        <Image source={{ uri: category.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '10' }]}>
          <IconHelper name={category.icon} color={colors.primary} size={24} />
        </View>
      )}
      <View style={styles.cardDetails}>
        <Text style={[styles.cardTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13, fontWeight: '800' }]}>
          {category.title}
        </Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 16 }]} numberOfLines={2}>
          {category.description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary, fontSize: 11, letterSpacing: 0.5 }]}>ESTIMATED FROM</Text>
          <Text style={[styles.priceVal, { color: colors.primary, fontSize: 14, fontWeight: '900' }]}>₹{category.basePrice}</Text>
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

import { BASE_URL } from '../api/client';

export const BookingCard: React.FC<{ booking: Booking; onPress: () => void }> = ({ booking, onPress }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    const origin = BASE_URL.replace('/api/v1', '');
    return `${origin}${avatar}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return colors.error;
      case 'Upcoming': return colors.secondary;
      case 'Completed': return colors.success;
      case 'Cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const isAssigned = booking.technicianName && booking.technicianName !== 'Assigning...';

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: booking.isEmergency ? colors.error : colors.border,
          borderWidth: 1.5,
          borderRadius: 12,
          padding: 14,
        }
      ]}
    >
      <View style={styles.bookingLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: booking.isEmergency ? colors.error + '10' : colors.primary + '10' }]}>
          <Icons.Calendar color={booking.isEmergency ? colors.error : colors.primary} size={22} />
        </View>
      </View>
      <View style={styles.cardDetails}>
        {booking.isEmergency && (
          <View style={styles.emergencyLabelRow}>
            <Icons.Zap size={10} color={colors.error} fill={colors.error} />
            <Text style={[styles.emergencyLabelText, { color: colors.error }]}>EMERGENCY DISPATCH</Text>
          </View>
        )}
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 13, fontWeight: '800' }]}>
            {booking.categoryTitle}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '12', borderColor: getStatusColor(booking.status) + '40', borderWidth: 1, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status), fontSize: 9, letterSpacing: 0.5 }]}>
              {booking.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 4 }]}>
          📅 {booking.date}  |  ⏰ {booking.time}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border, height: 1, marginVertical: 10 }]} />
        <View style={styles.headerRow}>
          {isAssigned ? (
            <View style={styles.assignedTechRowCard}>
              {booking.techAvatar ? (
                <Image source={{ uri: getAvatarUrl(booking.techAvatar) }} style={styles.techAvatarMinCard} />
              ) : (
                <View style={[styles.techAvatarPlaceholderCard, { backgroundColor: colors.primary + '10' }]}>
                  <Icons.User size={10} color={colors.primary} />
                </View>
              )}
              <Text style={[styles.techNameMinCard, { color: colors.text }]}>{booking.technicianName}</Text>
            </View>
          ) : (
            <Text style={[styles.jobsText, { color: colors.textSecondary, fontSize: 11, fontWeight: '700' }]}>⏳ PENDING...</Text>
          )}
          <Text style={[styles.priceVal, { color: colors.primary, fontSize: 14, fontWeight: '900' }]}>₹{booking.price.toFixed(2)}</Text>
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
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
  },
  assignedTechRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  techAvatarMinCard: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  techAvatarPlaceholderCard: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  techNameMinCard: {
    fontSize: 11,
    fontWeight: '700',
  },
  emergencyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  emergencyLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
