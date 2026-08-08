import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribePlan } from '../../api/amcApi';

export default function AMCBuilderScreen() {
  const { themeMode, user, updateWalletBalance, updateProfile } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [units, setUnits] = useState<number>(1);
  const [frequency, setFrequency] = useState<2 | 4>(2); // 2 services/year vs 4 services/year
  
  // Custom Addon Coverages
  const [gasCover, setGasCover] = useState(false);
  const [partsCover, setPartsCover] = useState(false);
  const [priorityDispatch, setPriorityDispatch] = useState(false);

  const [buying, setBuying] = useState(false);

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  // Calculate customized price
  const calculateTotal = () => {
    let basePricePerAc = frequency === 2 ? 1999 : 3499;
    let totalBase = basePricePerAc * units;

    let addonCost = 0;
    if (gasCover) addonCost += 1500 * units;
    if (partsCover) addonCost += 2000 * units;
    if (priorityDispatch) addonCost += 799;

    return totalBase + addonCost;
  };

  const totalCost = calculateTotal();

  const handlePurchase = async () => {
    const currentBalance = user?.walletBalance ?? 0;
    if (currentBalance < totalCost) {
      Alert.alert(
        "Insufficient Balance",
        `Your wallet balance is ₹${currentBalance.toFixed(2)}, but the custom contract costs ₹${totalCost.toFixed(2)}.\n\nPlease top up your wallet.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Wallet", onPress: () => router.push('/screens/wallet') }
        ]
      );
      return;
    }

    Alert.alert(
      "Confirm AMC Purchase",
      `Are you sure you want to purchase this customized AMC contract for ₹${totalCost.toFixed(2)}? This will be deducted from your wallet balance.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purchase & Activate",
          onPress: async () => {
            setBuying(true);
            try {
              // Deduct balance and update store profile state
              const newBalance = currentBalance - totalCost;
              updateWalletBalance(newBalance);
              
              // Mock success update for membership status locally
              if (user) {
                // If there's an API subscription call, we can call it or update the local user info
                await updateProfile(user.name, user.email, user.phone, user.avatar, user.city, user.state, user.pincode, user.address);
                // Force hasMembership to true in state
                useAppStore.setState((state) => {
                  if (state.user) {
                    return { user: { ...state.user, hasMembership: true, walletBalance: newBalance } };
                  }
                  return state;
                });
              }

              Alert.alert(
                "Subscription Active!",
                `Your customized AC Club Membership is now active.\n\nCovered Units: ${units} ACs\nService Frequency: ${frequency} times/yr.\nEnjoy priority support!`,
                [
                  { text: "View Contract Details", onPress: () => router.push('/screens/amc-details') }
                ]
              );
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to create custom AMC contract.");
            } finally {
              setBuying(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>CUSTOM AMC BUILDER</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBlock}>
          <Text style={[styles.brandHeader, { color: colors.primary }]}>ANNUAL MAINTENANCE CONTRACTS</Text>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Design Your Cooling Coverage</Text>
        </View>

        {/* Builder Panel */}
        <View style={[styles.builderCard, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          
          {/* Stepper for AC Counts */}
          <View style={styles.stepRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.builderLabel, { color: colors.text }]}>NUMBER OF COVERED ACS</Text>
              <Text style={[styles.builderDesc, { color: colors.textSecondary }]}>Select total cooling units to cover</Text>
            </View>
            <View style={styles.stepperContainer}>
              <TouchableOpacity 
                style={[styles.stepBtn, { borderColor: colors.border }]} 
                onPress={() => setUnits(u => Math.max(1, u - 1))}
              >
                <Icons.Minus size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.stepVal, { color: colors.text }]}>{units}</Text>
              <TouchableOpacity 
                style={[styles.stepBtn, { borderColor: colors.border }]} 
                onPress={() => setUnits(u => Math.min(10, u + 1))}
              >
                <Icons.Plus size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

          {/* Maintenance Frequency */}
          <Text style={[styles.builderLabel, { color: colors.text, marginBottom: 4 }]}>SERVICING FREQUENCY</Text>
          <Text style={[styles.builderDesc, { color: colors.textSecondary, marginBottom: 12 }]}>Choose periodic maintenance visits per year</Text>
          <View style={styles.freqRow}>
            <TouchableOpacity
              style={[
                styles.freqPill, 
                { borderColor: colors.primary + '30', backgroundColor: colors.card },
                frequency === 2 && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFrequency(2)}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: frequency === 2 ? '#FFF' : colors.text }}>2 VISITS / YEAR</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: frequency === 2 ? '#FFF' : colors.textSecondary, marginTop: 2 }}>₹1999 / AC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.freqPill, 
                { borderColor: colors.primary + '30', backgroundColor: colors.card },
                frequency === 4 && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFrequency(4)}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: frequency === 4 ? '#FFF' : colors.text }}>4 VISITS / YEAR</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: frequency === 4 ? '#FFF' : colors.textSecondary, marginTop: 2 }}>₹3499 / AC</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

          {/* Coverages Checkboxes */}
          <Text style={[styles.builderLabel, { color: colors.text, marginBottom: 4 }]}>ADDITIONAL COVERAGE & SHIELD</Text>
          <Text style={[styles.builderDesc, { color: colors.textSecondary, marginBottom: 16 }]}>Toggle options to add premium covers</Text>

          {/* Gas Cover */}
          <TouchableOpacity 
            style={[styles.addonRow, { borderColor: gasCover ? colors.primary : colors.border }]}
            onPress={() => setGasCover(!gasCover)}
            activeOpacity={0.8}
          >
            <Icons.Droplet size={18} color={gasCover ? colors.primary : colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.addonName, { color: colors.text }]}>Gas Charging Cover</Text>
              <Text style={[styles.addonDesc, { color: colors.textSecondary }]}>Free unlimited coolant/gas refills</Text>
            </View>
            <View style={styles.addonPriceWrapper}>
              <Text style={[styles.addonPrice, { color: colors.primary }]}>+₹1,500/AC</Text>
              <Icons.CheckCircle size={16} color={gasCover ? colors.primary : colors.textSecondary} fill={gasCover ? colors.primary + '20' : 'transparent'} />
            </View>
          </TouchableOpacity>

          {/* Parts Cover */}
          <TouchableOpacity 
            style={[styles.addonRow, { borderColor: partsCover ? colors.primary : colors.border }]}
            onPress={() => setPartsCover(!partsCover)}
            activeOpacity={0.8}
          >
            <Icons.Cpu size={18} color={partsCover ? colors.primary : colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.addonName, { color: colors.text }]}>Condenser & Spare Cover</Text>
              <Text style={[styles.addonDesc, { color: colors.textSecondary }]}>Zero cost replacement for electrical parts</Text>
            </View>
            <View style={styles.addonPriceWrapper}>
              <Text style={[styles.addonPrice, { color: colors.primary }]}>+₹2,000/AC</Text>
              <Icons.CheckCircle size={16} color={partsCover ? colors.primary : colors.textSecondary} fill={partsCover ? colors.primary + '20' : 'transparent'} />
            </View>
          </TouchableOpacity>

          {/* Priority dispatch */}
          <TouchableOpacity 
            style={[styles.addonRow, { borderColor: priorityDispatch ? colors.primary : colors.border }]}
            onPress={() => setPriorityDispatch(!priorityDispatch)}
            activeOpacity={0.8}
          >
            <Icons.ShieldAlert size={18} color={priorityDispatch ? colors.primary : colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.addonName, { color: colors.text }]}>Priority Dispatch (2-Hour)</Text>
              <Text style={[styles.addonDesc, { color: colors.textSecondary }]}>Priority emergency queuing & dispatch</Text>
            </View>
            <View style={styles.addonPriceWrapper}>
              <Text style={[styles.addonPrice, { color: colors.primary }]}>+₹799 Flat</Text>
              <Icons.CheckCircle size={16} color={priorityDispatch ? colors.primary : colors.textSecondary} fill={priorityDispatch ? colors.primary + '20' : 'transparent'} />
            </View>
          </TouchableOpacity>

        </View>

        {/* Pricing Summary */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AMC PRICING SUMMARY</Text>
          </View>
        </View>

        <View style={[styles.pricingSummaryBox, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          <View style={styles.priceRowItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Base Maintenance ({frequency} visits x {units} ACs)</Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>₹{(frequency === 2 ? 1999 : 3499) * units}</Text>
          </View>

          {gasCover && (
            <View style={styles.priceRowItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Gas Charging Add-on</Text>
              <Text style={[styles.summaryVal, { color: colors.text }]}>₹{1500 * units}</Text>
            </View>
          )}

          {partsCover && (
            <View style={styles.priceRowItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Spare Parts Shield Add-on</Text>
              <Text style={[styles.summaryVal, { color: colors.text }]}>₹{2000 * units}</Text>
            </View>
          )}

          {priorityDispatch && (
            <View style={styles.priceRowItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Priority 2-Hour Dispatch</Text>
              <Text style={[styles.summaryVal, { color: colors.text }]}>₹799</Text>
            </View>
          )}

          <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

          <View style={styles.priceRowItem}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>Total Contract Price</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.primary }}>₹{totalCost.toFixed(2)}</Text>
          </View>

          <View style={[styles.walletStatusPanel, { backgroundColor: colors.border + '20' }]}>
            <Icons.Wallet size={14} color={colors.primary} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginLeft: 6 }}>
              Wallet Balance: <Text style={{ color: colors.text, fontWeight: '800' }}>₹{user?.walletBalance.toFixed(2) || '0.00'}</Text>
            </Text>
          </View>
        </View>

        {/* Purchase CTA */}
        <TouchableOpacity
          style={[styles.purchaseBtn, { backgroundColor: colors.primary }]}
          onPress={handlePurchase}
          disabled={buying}
        >
          <Icons.Crown size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.purchaseBtnText}>Subscribe & Activate Contract</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  introBlock: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  builderCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  builderLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  builderDesc: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  stepVal: {
    fontSize: 16,
    fontWeight: '900',
    width: 24,
    textAlign: 'center',
  },
  horizontalDivider: {
    height: 1.5,
    marginVertical: 18,
    opacity: 0.1,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 10,
  },
  freqPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 10,
  },
  addonName: {
    fontSize: 12,
    fontWeight: '800',
  },
  addonDesc: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  addonPriceWrapper: {
    alignItems: 'flex-end',
    gap: 4,
  },
  addonPrice: {
    fontSize: 11,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  pricingSummaryBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  priceRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  walletStatusPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  purchaseBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  }
});
