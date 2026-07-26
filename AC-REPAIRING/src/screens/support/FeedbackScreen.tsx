import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';

export const FeedbackScreen = ({ route, navigation }: any) => {
  const [ratingSkill, setRatingSkill] = useState(0);
  const [ratingClean, setRatingClean] = useState(0);
  const [ratingTime, setRatingTime] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (ratingSkill === 0 || ratingClean === 0 || ratingTime === 0) {
      alert('Please rate all categories.');
      return;
    }
    alert('Thank you for your feedback! Your review helps us maintain high quality service standards.');
    navigation.goBack();
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <MaterialIcons
            name={star <= value ? 'star' : 'star-outline'}
            size={32}
            color={COLORS.warning}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenContainer title="Rate Service Quality" onBack={() => navigation.goBack()} scroll>
      <View style={styles.card}>
        <Text style={styles.subtitle}>
          Help us improve! Share your experience with the technician & service.
        </Text>

        <View style={styles.divider} />

        {/* Rating categories */}
        <View style={styles.ratingCategory}>
          <Text style={styles.categoryLabel}>Technician Knowledge & Skill</Text>
          <StarRating value={ratingSkill} onChange={setRatingSkill} />
        </View>

        <View style={styles.ratingCategory}>
          <Text style={styles.categoryLabel}>Cleanliness & Neatness</Text>
          <StarRating value={ratingClean} onChange={setRatingClean} />
        </View>

        <View style={styles.ratingCategory}>
          <Text style={styles.categoryLabel}>On-time Arrival & Punctuality</Text>
          <StarRating value={ratingTime} onChange={setRatingTime} />
        </View>

        <View style={styles.divider} />

        <AppInput
          label="ADDITIONAL COMMENTS"
          value={comment}
          onChangeText={setComment}
          placeholder="Share any special comments about the service..."
          style={styles.commentInput}
        />

        <AppButton
          title="Submit Review"
          onPress={handleSubmit}
          variant="secondary"
          icon="send"
          style={styles.submitBtn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  ratingCategory: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    marginBottom: SPACING.md,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
});
