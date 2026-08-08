import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function ReferEarnScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const referralCode = "AC-REF-7041";
  const [progress, setProgress] = useState(65); // 65% progress toward 100% Free Service
  const [freeServices, setFreeServices] = useState(0);

  const handleCopy = () => {
    Alert.alert("Code Copied! 📋", `Referral code ${referralCode} copied to clipboard.`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code ${referralCode} on AC Service app to get 2% welcome bonus on your 1st AC booking! Download now: https://acservice.com/ref=${referralCode}`,
      });
    } catch (e) {
      Alert.alert("Share Code", `Referral code ${referralCode} ready to share.`);
    }
  };

  const handleClaimFreeService = () => {
    Alert.alert(
      "Claim FREE AC Service 🎁",
      "You have reached 100% Referral Progress! Your 100% Free Service Voucher (FREE-AC-2026-9041) has been added to your account for your next booking!",
      [{ text: "Book Free Service Now", onPress: () => router.push('/(tabs)/services') }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Icons.ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Refer & Earn Free Service</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={[styles.heroCard, { backgroundColor: '#0f766e' }]}>
          <View style={styles.badgeRow}>
            <Icons.Sparkles size={14} color="#fef08a" />
            <Text style={styles.heroBadgeText}>VIRAL REFERRAL PROGRAM</Text>
          </View>

          <Text style={styles.heroTitle}>Invite Friends, Earn 5% + FREE AC Service 🎁</Text>
          <Text style={styles.heroDesc}>
            When a friend signs up with your code & completes their 1st booking, you earn 5% points & they get 2% welcome points!
          </Text>

          {/* 100% Milestone Progress Box */}
          <View style={styles.milestoneBox}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneLabel}>FREE AC Service Milestone Progress</Text>
              <Text style={styles.milestoneVal}>{progress}% / 100%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.milestoneNote}>
              {progress >= 100 ? "🎉 100% Reached! Claim your FREE Service now!" : "Reach 100% to unlock a 100% FREE AC Service Voucher"}
            </Text>

            {progress >= 100 && (
              <TouchableOpacity style={styles.claimBtn} onPress={handleClaimFreeService}>
                <Text style={styles.claimBtnText}>Claim FREE AC Service 🎁</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Referral Rules Breakdown */}
        <View style={styles.rulesGrid}>
          <View style={[styles.ruleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.ruleIconBox, { backgroundColor: '#0f766e20' }]}>
              <Icons.Percent size={20} color="#0f766e" />
            </View>
            <Text style={[styles.ruleValue, { color: colors.text }]}>5% Points</Text>
            <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>Referrer Earning on 1st Job</Text>
          </View>

          <View style={[styles.ruleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.ruleIconBox, { backgroundColor: '#3b82f620' }]}>
              <Icons.Gift size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.ruleValue, { color: colors.text }]}>2% Bonus</Text>
            <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>New User Welcome Points</Text>
          </View>
        </View>

        {/* Unique Referral Code Box */}
        <View style={[styles.codeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>YOUR UNIQUE REFERRAL CODE</Text>
          <View style={styles.codeRow}>
            <Text style={[styles.codeVal, { color: '#0f766e' }]}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Icons.Copy size={16} color="#0f766e" />
              <Text style={styles.copyText}>Copy Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Icons.Share2 size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.shareBtnText}>Share Referral Link to Friends</Text>
        </TouchableOpacity>

        {/* Friends Referred Activity */}
        <View style={styles.activityBox}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Referred Friends</Text>
          
          <View style={[styles.friendItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.friendInfo}>
              <Text style={[styles.friendName, { color: colors.text }]}>Rahul Joshi</Text>
              <Text style={[styles.friendStatus, { color: '#10b981' }]}>1st Booking Completed • +5% Earned</Text>
            </View>
            <Text style={[styles.friendPts, { color: '#10b981' }]}>+75 Pts</Text>
          </View>

          <View style={[styles.friendItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.friendInfo}>
              <Text style={[styles.friendName, { color: colors.text }]}>Sneha Kapur</Text>
              <Text style={[styles.friendStatus, { color: '#f59e0b' }]}>Registered • Pending 1st Booking</Text>
            </View>
            <Text style={[styles.friendPts, { color: colors.textSecondary }]}>Pending</Text>
          </View>
        </View>
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
    paddingVertical: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fef08a',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 26,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 12,
    color: '#ccfbf1',
    lineHeight: 18,
    marginBottom: 16,
  },
  milestoneBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  milestoneVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fef08a',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  milestoneNote: {
    fontSize: 10,
    color: '#e6fffa',
    fontWeight: '600',
  },
  claimBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  claimBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  rulesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  ruleCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  ruleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ruleValue: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  ruleLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  codeBox: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeVal: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f766e15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f766e',
  },
  shareBtn: {
    width: '100%',
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  activityBox: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  friendPts: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
});
