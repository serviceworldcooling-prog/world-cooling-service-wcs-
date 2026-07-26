import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, SecondaryButton } from '../../components/CustomUI';
import { getBookingById } from '../../api/bookingApi';
import { getInvoice } from '../../api/paymentApi';
import type { Booking } from '../../api/bookingApi';
import * as Icons from 'lucide-react-native';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeMode, cancelBooking, rescheduleBooking } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getBookingById(id)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await cancelBooking(id!, 'Customer cancelled');
            setBooking(prev => prev ? { ...prev, status: 'Cancelled' } : prev);
            Alert.alert('Cancelled', 'Booking cancelled successfully.');
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Confirm rescheduling to tomorrow 10:00 AM?', [
      { text: 'Cancel' },
      {
        text: 'Confirm', onPress: async () => {
          try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const newDate = tomorrow.toISOString().split('T')[0];
            await rescheduleBooking(id!, newDate, '10:00 AM');
            setBooking(prev => prev ? { ...prev, preferredDate: newDate, preferredTime: '10:00 AM' } : prev);
            Alert.alert('Rescheduled', 'Service rescheduled successfully.');
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleDownloadInvoice = async () => {
    try {
      const invoice = await getInvoice(id!);
      Alert.alert(
        `Invoice ${invoice.invoiceNumber}`,
        `Total: $${invoice.total.toFixed(2)}\nPaid: ${invoice.isPaid ? 'Yes' : 'No'}\nMethod: ${invoice.paymentMethod || 'Pending'}`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not fetch invoice.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>Booking not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Booking Info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {booking.bookingId}</Text>
            <Text style={[styles.statusText, { color: colors.primary }]}>{booking.status}</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{booking.serviceType}</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            📅 {booking.preferredDate} | ⏰ {booking.preferredTime}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SERVICE ADDRESS</Text>
          <Text style={[styles.descVal, { color: colors.text }]}>{booking.address}</Text>

          {booking.problemDescription ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROBLEM DETAILS</Text>
              <Text style={[styles.descVal, { color: colors.text }]}>{booking.problemDescription}</Text>
            </>
          ) : null}
        </View>

        {/* Technician */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ASSIGNED TECHNICIAN</Text>
          <Text style={[styles.title, { color: colors.text, fontSize: 16, marginTop: 4 }]}>
            {booking.technicianName || 'Being assigned...'}
          </Text>
          <Text style={[styles.descVal, { color: colors.textSecondary }]}>Expert Cooling Engineer</Text>
        </View>

        {/* Payment */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PAYMENT SUMMARY</Text>
          <View style={styles.invoiceRow}>
            <Text style={{ color: colors.textSecondary }}>Service Charge</Text>
            <Text style={{ color: colors.text }}>${booking.price.toFixed(2)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.invoiceRow}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {booking.isPaid ? 'Paid' : 'Due Amount'}
            </Text>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>${booking.price.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.invoiceBtn, { borderColor: colors.primary }]}
            onPress={handleDownloadInvoice}
          >
            <Icons.Download size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 8 }}>View Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        {['Pending', 'Confirmed', 'Upcoming'].includes(booking.status) && (
          <View style={{ gap: 8, marginVertical: 12 }}>
            <PrimaryButton
              title="Live Tracking & Details"
              onPress={() => router.push(`/screens/live-tracking?id=${booking._id}`)}
            />
            <SecondaryButton title="Reschedule Service" onPress={handleReschedule} />
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.error }]}
              onPress={handleCancel}
            >
              <Text style={{ color: colors.error, fontWeight: '700', textAlign: 'center' }}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OTP Verify */}
        {['Confirmed', 'Upcoming'].includes(booking.status) && (
          <TouchableOpacity
            style={[styles.otpVerifyBtn, { backgroundColor: '#0B1E3F' }]}
            onPress={() => router.push(`/screens/verify-otp?id=${booking._id}&technicianName=${encodeURIComponent(booking.technicianName || 'Technician')}`)}
          >
            <Icons.ShieldCheck size={20} color="#fff" />
            <Text style={styles.otpVerifyText}>Enter OTP from Technician</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  idText: { fontSize: 12, fontWeight: '700' },
  statusText: { fontSize: 12, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '800' },
  dateText: { fontSize: 13, marginTop: 4 },
  divider: { height: 1, marginVertical: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  descVal: { fontSize: 14, marginTop: 4, lineHeight: 18 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  invoiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 16, padding: 12, marginTop: 16 },
  cancelBtn: { borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 8 },
  otpVerifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, padding: 16, marginTop: 8 },
  otpVerifyText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
