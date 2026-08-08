import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const BookingDetailsScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params || { bookingId: 'AC-1029' };
  const { bookings } = useApp();

  const booking = bookings.find(b => b.id === bookingId) || bookings[0];

  const handleDownloadInvoice = () => {
    Alert.alert('Invoice Saved', 'Your AC service invoice has been saved to your downloads folder as a PDF.', [{ text: 'OK' }]);
  };

  return (
    <ScreenContainer title="Booking Details" onBack={() => navigation.goBack()} navigation={navigation} activeRoute="AssignedJobs">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Status Header */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.bookingId}>Reference Booking ID: #{booking.id}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{booking.serviceName}</Text>
          <Text style={styles.timeText}>{booking.date} • {booking.time}</Text>
        </View>

        {/* Technician info */}
        {booking.technicianName && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Assigned Service Expert</Text>
            <View style={styles.techRow}>
              <Image source={{ uri: booking.technicianAvatar }} style={styles.techAvatar} />
              <View style={styles.techInfo}>
                <Text style={styles.techName}>{booking.technicianName}</Text>
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.rating}>{booking.technicianRating}</Text>
                </View>
              </View>
              <View style={styles.techActions}>
                <TouchableOpacity 
                  style={styles.chatCircle} 
                  onPress={() => navigation.navigate('Chat', { technicianName: booking.technicianName })}
                >
                  <MaterialIcons name="chat" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Location</Text>
          <View style={styles.rowAlign}>
            <MaterialIcons name="room" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.addressText}>{booking.address}</Text>
          </View>
        </View>

        {/* Billing details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Standard Service Rate</Text>
            <Text style={styles.billVal}>₹{booking.price}</Text>
          </View>
          {booking.discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: COLORS.success }]}>Promo Discount</Text>
              <Text style={[styles.billVal, { color: COLORS.success }]}>-₹{booking.discount}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & Convenience Fee</Text>
            <Text style={styles.billVal}>₹{booking.tax}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.totalVal}>₹{booking.totalPrice}</Text>
          </View>
        </View>

        {/* Navigation Action Buttons depending on status */}
        {booking.status === 'Completed' ? (
          <View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleDownloadInvoice}>
              <MaterialIcons name="file-download" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Download Service Invoice PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryBtn} 
              onPress={() => navigation.navigate('RatingsReviews', { bookingId: booking.id })}
            >
              <MaterialIcons name="star-rate" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>Write Feedback Rating</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={() => navigation.navigate('TrackTechnician', { bookingId: booking.id })}
            >
              <MaterialIcons name="my-location" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Track Technician GPS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryBtn} 
              onPress={() => navigation.navigate('ServiceTimeline', { bookingId: booking.id })}
            >
              <MaterialIcons name="timeline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>View Service Progress Timeline</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bookingId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  statusBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  timeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.xs,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.sm,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginLeft: 2,
  },
  techActions: {
    flexDirection: 'row',
  },
  chatCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  billVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
    marginBottom: SPACING.sm,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    height: 48,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
