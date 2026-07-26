import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const RatingsReviewsScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params || { bookingId: 'AC-0982' };

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const reviewTags = ['On Time', 'Polite', 'Clean Workspace', 'Fast Repair', 'Genuine Parts', 'Highly Recommended'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    Alert.alert(
      'Review Submitted',
      'Thank you for your feedback! It helps us maintain top-tier service quality.',
      [{ text: 'OK', onPress: () => navigation.popToTop() }]
    );
  };

  return (
    <ScreenContainer title="Ratings & Reviews" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Rating Header */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate Your AC Technician</Text>
          <Text style={styles.cardDesc}>How was the wet jet cleaning service by Amit Verma?</Text>
          
          {/* Star selector */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <MaterialIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={42}
                  color={star <= rating ? '#F59E0B' : COLORS.textLight}
                  style={{ marginHorizontal: SPACING.xs }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback tags */}
        <Text style={styles.sectionTitle}>What did you like the most?</Text>
        <View style={styles.tagsRow}>
          {reviewTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, isSelected ? styles.tagActive : null]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, isSelected ? styles.tagTextActive : null]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detailed feedback text */}
        <Text style={styles.sectionTitle}>Write Detailed Feedback</Text>
        <View style={styles.commentContainer}>
          <TextInput
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your service experience here... e.g. technician arrived on time and fixed the split AC noise issue."
            placeholderTextColor={COLORS.textLight}
            style={styles.textInput}
          />
        </View>

        <AppButton
          title="Submit Feedback Review"
          onPress={handleSubmit}
          icon="rate-review"
          style={styles.submitBtn}
        />

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: ROUNDED.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    ...SHADOWS.small,
  },
  tagActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tagTextActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  commentContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 100,
    ...SHADOWS.small,
    marginBottom: SPACING.xl,
  },
  textInput: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
});
