import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';

export const WalletScreen = ({ navigation }: any) => {
  const [balance, setBalance] = useState(1250);
  const [topUpAmount, setTopUpAmount] = useState('');

  const transactions = [
    { id: 't1', title: 'Wallet Topup Successful', type: 'credit', amount: 500, date: '14 July 2026' },
    { id: 't2', title: 'Paid for Booking #AC-0982', type: 'debit', amount: 2240, date: '28 June 2026' },
    { id: 't3', title: 'Referral Bonus Received', type: 'credit', amount: 200, date: '20 June 2026' },
    { id: 't4', title: 'Service Cashback Credited', type: 'credit', amount: 150, date: '10 June 2026' },
  ];

  const handleTopUp = (amountToAdd?: number) => {
    const val = amountToAdd || parseInt(topUpAmount);
    if (!val || isNaN(val)) {
      alert('Please enter or select a valid amount.');
      return;
    }
    setBalance(balance + val);
    setTopUpAmount('');
    alert(`Successfully loaded ₹${val} into your CoolBreeze Wallet!`);
  };

  return (
    <ScreenContainer title="My Pay Wallet" onBack={() => navigation.goBack()}>
      {/* Wallet Balance Card */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <Text style={styles.walletLabel}>COOLBREEZE BALANCE</Text>
          <MaterialIcons name="account-balance-wallet" size={24} color="#fff" />
        </View>
        <Text style={styles.balanceVal}>₹{balance}</Text>
        <Text style={styles.subtext}>Safe, secure, and instant payments & refunds</Text>
      </View>

      {/* Top up block */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Money to Wallet</Text>
        <View style={styles.topUpInputRow}>
          <AppInput
            value={topUpAmount}
            onChangeText={setTopUpAmount}
            placeholder="Enter Amount (e.g. ₹500)"
            keyboardType="number-pad"
            style={{ flex: 1, marginVertical: 0 }}
          />
          <AppButton
            title="Load"
            onPress={() => handleTopUp()}
            variant="secondary"
            style={styles.loadBtn}
          />
        </View>

        {/* Quick select buttons */}
        <View style={styles.quickAddRow}>
          {[500, 1000, 2000].map((amt) => (
            <TouchableOpacity key={amt} style={styles.quickBtn} onPress={() => handleTopUp(amt)}>
              <Text style={styles.quickText}>+₹{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Transaction Statements</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.txnRow}>
              <View style={styles.txnLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: item.type === 'credit' ? COLORS.successLight : COLORS.dangerLight },
                  ]}
                >
                  <MaterialIcons
                    name={item.type === 'credit' ? 'call-received' : 'call-made'}
                    size={18}
                    color={item.type === 'credit' ? COLORS.success : COLORS.danger}
                  />
                </View>
                <View style={styles.txnMeta}>
                  <Text style={styles.txnTitle}>{item.title}</Text>
                  <Text style={styles.txnDate}>{item.date}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  { color: item.type === 'credit' ? COLORS.success : COLORS.textPrimary },
                ]}
              >
                {item.type === 'credit' ? '+' : '-'}₹{item.amount}
              </Text>
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  walletCard: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
  },
  balanceVal: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginVertical: SPACING.xs,
  },
  subtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  topUpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadBtn: {
    height: 48,
    paddingHorizontal: SPACING.lg,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  historySection: {
    flex: 1,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnMeta: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  txnDate: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
});
