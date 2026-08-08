import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';

export const ReferEarnScreen = ({ navigation }: any) => {
  const referCode = 'COOLFAYYAS12';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hey! Use my code ${referCode} to get ₹150 off on your first AC service at CoolBreeze. Download now!`,
      });
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const handleCopy = () => {
    Alert.alert('Copied to Clipboard', `Promo Code ${referCode} copied successfully. Share it with your friends!`);
  };

  return (
    <ScreenContainer title="Refer & Earn Credits" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Gift Banner */}
        <View style={styles.bannerCard}>
          <MaterialIcons name="card-giftcard" size={60} color="#ffffff" />
          <Text style={styles.bannerTitle}>Earn 5% Points + FREE Service 🎁</Text>
          <Text style={styles.bannerSubtitle}>Invite customers or technicians to try AC Service! When a friend completes their 1st booking, you earn 5% points, they get 2% welcome bonus. Reaching 100% milestone unlocks a FREE AC Service!</Text>
        </View>

        {/* Share Code Box */}
        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>YOUR UNIQUE REFERRAL CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referCode}</Text>
            <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
              <MaterialIcons name="content-copy" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>₹450</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>3</Text>
            <Text style={styles.statLabel}>Successful Invites</Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <MaterialIcons name="share" size={20} color="#ffffff" style={{ marginRight: SPACING.sm }} />
          <Text style={styles.shareBtnText}>Share Invitation Link</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  bannerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.md,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
    marginBottom: SPACING.md,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: SPACING.sm,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  codeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  codeTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: ROUNDED.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  shareBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    height: 48,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
