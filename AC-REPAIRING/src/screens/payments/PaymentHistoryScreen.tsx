import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';

export const PaymentHistoryScreen = ({ navigation }: any) => {
  const transactions = [
    { id: 'TXN-9018', bookingId: 'AC-0982', service: 'Gas Charging & Leak Fix', amount: 2240, status: 'Success', date: '28 June 2026', method: 'UPI (Google Pay)' },
    { id: 'TXN-8812', bookingId: 'AC-0451', service: 'AC Installation', amount: 1499, status: 'Success', date: '12 May 2026', method: 'Credit Card' },
    { id: 'TXN-7612', bookingId: 'AC-0231', service: 'AC Wet Servicing (x2)', amount: 1198, status: 'Success', date: '10 April 2026', method: 'Cash on Delivery' },
  ];

  const handleDownloadInvoice = (txnId: string) => {
    Alert.alert(
      'Invoice Downloaded',
      `Invoice pdf for transaction ID ${txnId} has been saved to your device.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScreenContainer title="Payment History" onBack={() => navigation.goBack()}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.txnId}>{item.id}</Text>
                <Text style={styles.serviceName}>{item.service}</Text>
              </View>
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <View style={styles.details}>
              <View style={styles.row}>
                <Text style={styles.label}>Booking ID</Text>
                <Text style={styles.val}>#{item.bookingId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date & Time</Text>
                <Text style={styles.val}>{item.date}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Paid Via</Text>
                <Text style={styles.val}>{item.method}</Text>
              </View>
              <View style={[styles.row, styles.amountRow]}>
                <Text style={styles.totalLabel}>Amount Paid</Text>
                <Text style={styles.amount}>₹{item.amount}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.invoiceBtn}
              onPress={() => handleDownloadInvoice(item.id)}
            >
              <MaterialIcons name="file-download" size={16} color={COLORS.secondary} />
              <Text style={styles.invoiceBtnText}>Download Receipt PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
  txnId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  statusBox: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  details: {
    marginVertical: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  val: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  amountRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryLight,
    borderRadius: ROUNDED.sm,
    paddingVertical: 8,
    marginTop: SPACING.xs,
  },
  invoiceBtnText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
