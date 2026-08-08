import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, TextInput, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { getWalletBalance, getWalletTransactions, addMoneyToWallet, WalletTransaction } from '../../api/paymentApi';

export default function WalletScreen() {
  const { themeMode, user, updateWalletBalance } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [bal, txData] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(),
      ]);
      setBalance(bal);
      updateWalletBalance(bal);
      setTransactions(txData.transactions);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    setAddLoading(true);
    try {
      const newBalance = await addMoneyToWallet(amount);
      setBalance(newBalance);
      updateWalletBalance(newBalance);
      setAddAmount('');
      await fetchData();
      Alert.alert('Success', `₹${amount.toFixed(2)} added to your wallet!`);
    } catch (err: any) {
      Alert.alert('Failed', err.message);
    } finally {
      setAddLoading(false);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.cardLabel}>WALLET BALANCE</Text>
          <Text style={styles.balanceVal}>₹{balance.toFixed(2)}</Text>
        </View>

        {/* Add Money */}
        <View style={[styles.addMoneyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Add Money</Text>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.amountInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={addAmount}
              onChangeText={setAddAmount}
            />
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddMoney}
              disabled={addLoading}
            >
              {addLoading
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Text style={styles.addBtnText}>Add</Text>
              }
            </TouchableOpacity>
          </View>
          <View style={styles.quickAmounts}>
            {[50, 100, 200, 500].map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => setAddAmount(amt.toString())}
                style={[styles.quickBtn, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.primary, fontWeight: '700' }}>+${amt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>

        {transactions.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
            No transactions yet.
          </Text>
        ) : (
          transactions.map(tx => (
            <View key={tx._id} style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.txDesc, { color: colors.text }]}>{tx.description}</Text>
                <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                  {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'credit' ? colors.success : colors.error }]}>
                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  balanceCard: { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20 },
  cardLabel: { color: '#FFF', fontSize: 11, fontWeight: '800', opacity: 0.8 },
  balanceVal: { color: '#FFF', fontSize: 36, fontWeight: '900', marginTop: 8 },
  addMoneyBox: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 24 },
  addRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  amountInput: { flex: 1, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  addBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  quickAmounts: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  txCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  txDesc: { fontSize: 14, fontWeight: '700' },
  txDate: { fontSize: 12, marginTop: 4 },
  txAmount: { fontSize: 15, fontWeight: '800' },
});
