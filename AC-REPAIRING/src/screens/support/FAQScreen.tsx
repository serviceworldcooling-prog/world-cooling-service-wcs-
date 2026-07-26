import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppInput } from '../../components/Common';

export const FAQScreen = ({ navigation }: any) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', 'Servicing', 'Payments', 'Warranty'];

  const faqs = [
    {
      id: 'f1',
      category: 'Servicing',
      question: 'How often should I service my AC?',
      answer: 'It is recommended to service your air conditioner at least twice a year (before summer starts and after the monsoon season) to ensure optimal cooling and air quality.',
    },
    {
      id: 'f2',
      category: 'Servicing',
      question: 'What is included in AC Wet Servicing?',
      answer: 'AC Wet Servicing includes deep cleaning of the cooling coils, condenser coils, drain tray, outer panel, and air filters with a high-pressure water jet machine, followed by checkup of current, gas pressure, and fan motor.',
    },
    {
      id: 'f3',
      category: 'Warranty',
      question: 'Do you offer a warranty on repairs?',
      answer: 'Yes! We provide a 30-day service warranty on all AC repairs and installations done through our platform. Any issue related to the service will be resolved free of cost.',
    },
    {
      id: 'f4',
      category: 'Payments',
      question: 'How does the CoolBreeze Wallet work?',
      amount: 1,
      answer: 'You can load funds securely into your in-app wallet via UPI, credit/debit cards, or net banking. Any refunds, referrals, or promo cashbacks are instantly credited to your wallet.',
    },
    {
      id: 'f5',
      category: 'Warranty',
      question: 'What happens if the compressor breaks down under AMC?',
      answer: 'Under our standard AMC, electrical parts (capacitors, relays, thermistors) are covered. Compressor breakdowns or core structural changes may require an additional charge, but with a 20% AMC discount.',
    },
  ];

  const filteredFaqs = activeCategory === 'All'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScreenContainer title="FAQ & Help Center" onBack={() => navigation.goBack()}>
      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.tabBtn, isActive && styles.tabActive]}
              onPress={() => {
                setActiveCategory(cat);
                setExpandedId(null);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* FAQs List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                <MaterialIcons
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: ROUNDED.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  tabActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  answerContainer: {
    backgroundColor: COLORS.divider,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  answerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
  },
});
