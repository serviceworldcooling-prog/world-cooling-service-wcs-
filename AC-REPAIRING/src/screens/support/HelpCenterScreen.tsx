import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, StatusBar, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';
import { MOCK_FAQS } from '../../constants/mockData';

export const HelpCenterScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleStatusChange = async (newStatus: 'Available' | 'On Job' | 'Off Duty') => {
    try {
      await updateTechStatus(newStatus);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert('Status Updated', `Your status has been updated to "${newStatus}"`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update status.');
    }
  };

  const showStatusOptions = () => {
    Alert.alert(
      'Update Duty Status',
      'Select your current status:',
      [
        { text: '🟢 Available', onPress: () => handleStatusChange('Available') },
        { text: '🟡 On Job', onPress: () => handleStatusChange('On Job') },
        { text: '🔴 Off Duty', onPress: () => handleStatusChange('Off Duty') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCallSupport = () => {
    Alert.alert('Call Support', 'Connecting to CoolBreeze toll-free support: 1800-123-COOL...', [{ text: 'Cancel' }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header exactly matching Dashboard style */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: COLORS.primary }]}>W  C  S</Text>
          <View style={[styles.headerDividerVertical, { backgroundColor: COLORS.border }]} />
          
          <TouchableOpacity 
            style={styles.headerDutyStatus}
            onPress={showStatusOptions}
            activeOpacity={0.8}
          >
            <Text style={dutyLabelStyle}>DUTY STATUS</Text>
            <View style={styles.dutyRow}>
              <View style={[
                styles.dutyDotActive, 
                { 
                  backgroundColor: 
                    user?.technicianStatus === 'Available' ? COLORS.success :
                    user?.technicianStatus === 'On Job' ? '#EAB308' :
                    COLORS.textLight 
                }
              ]} />
              <Text style={styles.dutyText}>
                {user?.technicianStatus || 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={18} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        
        {/* Support Options Header Cards */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optCard} onPress={handleCallSupport} activeOpacity={0.85}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="phone-in-talk" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.optTitle}>Call Us 24/7</Text>
            <Text style={styles.optSub}>1800-123-COOL</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optCard} 
            onPress={() => navigation.navigate('RaiseComplaint')} 
            activeOpacity={0.85}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.secondaryLight }]}>
              <MaterialIcons name="bug-report" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.optTitle}>File Dispute</Text>
            <Text style={styles.optSub}>Raise Complaint</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {MOCK_FAQS.map((faq) => {
          const isOpen = openFaqId === faq.id;
          return (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity 
                style={styles.faqHeader} 
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <MaterialIcons 
                  name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={22} 
                  color={COLORS.primary} 
                />
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.faqAnswerBox}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Help banner info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Still need help with an active booking?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ComplaintHistory')}>
            <Text style={styles.historyLink}>View Complaint History</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <BottomTabBar navigation={navigation} activeRoute="Profile" />
    </View>
  );
};

const dutyLabelStyle = {
  fontSize: 8,
  fontWeight: '900' as const,
  letterSpacing: 1.5,
  color: COLORS.textSecondary,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(11, 30, 63, 0.1)',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  headerDutyStatus: {
    flex: 1,
    justifyContent: 'center',
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dutyDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -3,
    top: -3,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  scroll: { padding: 16, paddingBottom: 100 },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  optCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  optTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  optSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    marginLeft: 4,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  faqAnswerBox: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.divider,
  },
  faqAnswer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  historyLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 4,
  },
});
