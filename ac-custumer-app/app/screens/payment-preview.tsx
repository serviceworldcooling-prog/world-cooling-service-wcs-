import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import { getPaymentPreview, processPayment, PaymentPreview } from '../../api/paymentApi';
import * as Icons from 'lucide-react-native';

type PayMethod = 'upi' | 'card' | 'wallet' | 'cash';

const PAYMENT_OPTIONS: { id: PayMethod; title: string; icon: string }[] = [
  { id: 'upi',    title: 'UPI (GPay / PhonePe)', icon: 'Sparkles' },
  { id: 'card',   title: 'Credit or Debit Card',  icon: 'CreditCard' },
  { id: 'wallet', title: 'Digital Wallet',         icon: 'Wallet' },
  { id: 'cash',   title: 'Cash on Service Delivery', icon: 'Coins' },
];

export default function PaymentPreviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { themeMode, user } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [preview, setPreview] = useState<PaymentPreview | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>('upi');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    getPaymentPreview(bookingId)
      .then(setPreview)
      .catch(err => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    if (!bookingId) return;
    if (paymentMethod === 'wallet' && user && user.walletBalance < (preview?.total || 0)) {
      Alert.alert('Insufficient Balance', `Wallet balance $${user.walletBalance.toFixed(2)} is less than $${preview?.total.toFixed(2)}. Please add money or choose another method.`);
      return;
    }
    setPaying(true);
    try {
      await processPayment(bookingId, paymentMethod);
      Alert.alert(
        'Payment Successful',
        `Your booking has been confirmed.`,
        [{ text: 'Track Booking', onPress: () => router.push(`/screens/live-tracking?id=${bookingId}`) }]
      );
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Could not process payment. Try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {preview && (
          <View style={[styles.invoiceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.invoiceHeader, { color: colors.textSecondary }]}>BOOKING INVOICE PREVIEW</Text>
            <View style={styles.invoiceRow}>
              <Text style={{ color: colors.text }}>Service:</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{preview.serviceType}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={{ color: colors.text }}>Technician:</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{preview.technicianName}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={{ color: colors.text }}>Scheduled:</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{preview.date} | {preview.time}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.invoiceRow}>
              <Text style={{ color: colors.text }}>Base Amount:</Text>
              <Text style={{ color: colors.text }}>${preview.baseAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={{ color: colors.text }}>GST (5%):</Text>
              <Text style={{ color: colors.text }}>${preview.tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.invoiceRow}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Total:</Text>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>${preview.total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Wallet Balance hint */}
        {paymentMethod === 'wallet' && user && (
          <View style={[styles.walletHint, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Icons.Wallet size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '600', marginLeft: 8 }}>
              Wallet Balance: ${user.walletBalance.toFixed(2)}
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Options</Text>
        {PAYMENT_OPTIONS.map(opt => {
          const IconComponent = (Icons as any)[opt.icon] || Icons.CheckCircle;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setPaymentMethod(opt.id)}
              style={[
                styles.methodCard,
                { backgroundColor: colors.card },
                paymentMethod === opt.id
                  ? { borderColor: colors.primary, borderWidth: 2 }
                  : { borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <View style={styles.methodLeft}>
                <IconComponent size={20} color={colors.primary} />
                <Text style={[styles.methodTitle, { color: colors.text }]}>  {opt.title}</Text>
              </View>
              <View style={[
                styles.radio,
                { borderColor: colors.border },
                paymentMethod === opt.id && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]} />
            </TouchableOpacity>
          );
        })}

        <PrimaryButton
          title={paying ? 'Processing...' : `Pay $${preview?.total.toFixed(2) || '0.00'}`}
          onPress={handlePay}
          loading={paying}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  invoiceBox: { borderWidth: 1, borderRadius: 24, padding: 20, marginVertical: 16 },
  invoiceHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 16 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  divider: { height: 1, marginVertical: 12 },
  walletHint: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, marginTop: 8 },
  methodCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12 },
  methodLeft: { flexDirection: 'row', alignItems: 'center' },
  methodTitle: { fontSize: 15, fontWeight: '600' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5 },
});
