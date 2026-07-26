import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

interface Question {
  id: number;
  question: string;
  options: { label: string; nextQuestion?: number; recommendation?: string; serviceCategory?: string }[];
}

export const ACDiagnosisScreen = ({ navigation }: any) => {
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [history, setHistory] = useState<number[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [serviceCategory, setServiceCategory] = useState<string | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      question: 'What is the primary issue with your Air Conditioner?',
      options: [
        { label: 'AC is not cooling at all', nextQuestion: 2 },
        { label: 'Cooling is weak / insufficient', nextQuestion: 3 },
        { label: 'Water is leaking from indoor unit', recommendation: 'Your AC drain pipe is likely clogged or blocked. We recommend a high-pressure AC Jet Wet Servicing to clear the line.', serviceCategory: 'AC Wet Servicing' },
        { label: 'Making strange loud noises', recommendation: 'Loud noises usually mean a loose blower fan, compressor issue, or debris in the outdoor unit. We recommend booking an AC Repairing checkup.', serviceCategory: 'AC Repairing' },
        { label: 'Won\'t turn on / No power', recommendation: 'This points to an electrical issue (blown capacitor, relay defect, or circuit board failure). We recommend a certified AC Repairing checkup.', serviceCategory: 'AC Repairing' },
      ],
    },
    {
      id: 2,
      question: 'Is the outdoor unit running/humming?',
      options: [
        { label: 'Yes, running, but only blowing room-temp air', recommendation: 'This is likely a refrigerant gas leakage or compressor capacitor failure. We recommend our Gas Charging & Leak Detection service.', serviceCategory: 'Gas Charging' },
        { label: 'No, outdoor unit is completely silent', recommendation: 'The compressor might have tripped, or there is an electrical control/board wiring issue. We recommend registering an AC Repairing ticket.', serviceCategory: 'AC Repairing' },
        { label: 'Unsure / Cannot access outdoor unit', recommendation: 'We recommend starting with a general AC Repairing inspection to locate the fault safely.', serviceCategory: 'AC Repairing' },
      ],
    },
    {
      id: 3,
      question: 'When was the last time the AC was fully serviced?',
      options: [
        { label: 'More than 6 months ago (or never)', recommendation: 'Dirty cooling coils are restricting airflow. A comprehensive AC Wet Servicing will restore full cooling performance.', serviceCategory: 'AC Wet Servicing' },
        { label: 'Recently serviced, but still cooling weakly', recommendation: 'This indicates minor gas depreciation or a clogged cabin filter. We recommend booking an AC Repairing diagnostic visit.', serviceCategory: 'AC Repairing' },
      ],
    },
  ];

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  const handleOptionSelect = (option: typeof questions[0]['options'][0]) => {
    if (option.recommendation) {
      setRecommendation(option.recommendation);
      setServiceCategory(option.serviceCategory || null);
    } else if (option.nextQuestion) {
      setHistory([...history, currentQuestionId]);
      setCurrentQuestionId(option.nextQuestion);
    }
  };

  const handleBackStep = () => {
    if (recommendation) {
      setRecommendation(null);
      setServiceCategory(null);
      return;
    }
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentQuestionId(prev);
    } else {
      navigation.goBack();
    }
  };

  const resetDiagnostic = () => {
    setCurrentQuestionId(1);
    setHistory([]);
    setRecommendation(null);
    setServiceCategory(null);
  };

  return (
    <ScreenContainer title="AC Smart Diagnosis" onBack={handleBackStep}>
      {recommendation ? (
        <View style={styles.card}>
          <View style={styles.successIconHeader}>
            <MaterialIcons name="analytics" size={48} color={COLORS.secondary} />
          </View>
          <Text style={styles.heading}>Diagnosis Result</Text>
          <Text style={styles.recommendationText}>{recommendation}</Text>

          <View style={styles.divider} />

          {serviceCategory && (
            <View style={styles.actionContainer}>
              <Text style={styles.actionLabel}>Recommended Booking:</Text>
              <Text style={styles.actionSub}>{serviceCategory}</Text>
              <AppButton
                title="Book Recommended Service"
                onPress={() => navigation.navigate('BookService', { categoryName: serviceCategory })}
                variant="secondary"
                icon="check-circle"
                style={styles.bookBtn}
              />
            </View>
          )}

          <AppButton
            title="Start Over"
            onPress={resetDiagnostic}
            variant="outline"
            icon="replay"
            style={styles.resetBtn}
          />
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.stepIndicator}>
            Step {history.length + 1} of 3
          </Text>
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>

          <View style={styles.optionsList}>
            {currentQuestion?.options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                activeOpacity={0.7}
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  successIconHeader: {
    width: 80,
    height: 80,
    borderRadius: ROUNDED.full,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionSub: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
    marginVertical: 4,
  },
  bookBtn: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  resetBtn: {
    width: '100%',
  },
});
