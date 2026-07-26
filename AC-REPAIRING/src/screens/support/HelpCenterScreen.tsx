import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { MOCK_FAQS } from '../../constants/mockData';

export const HelpCenterScreen = ({ navigation }: any) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleCallSupport = () => {
    Alert.alert('Call Support', 'Connecting to CoolBreeze toll-free support: 1800-123-COOL...', [{ text: 'Cancel' }]);
  };

  return (
    <ScreenContainer title="Help Center & FAQs" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Support Options Header Cards */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optCard} onPress={handleCallSupport} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="phone-in-talk" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.optTitle}>Call Us 24/7</Text>
            <Text style={styles.optSub}>1800-123-COOL</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optCard} 
            onPress={() => navigation.navigate('RaiseComplaint')} 
            activeOpacity={0.8}
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  optCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
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
    borderTopWidth: 1,
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
