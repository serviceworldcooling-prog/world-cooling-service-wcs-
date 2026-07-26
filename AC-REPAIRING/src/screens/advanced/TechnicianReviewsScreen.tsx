import React from 'react';
import { StyleSheet, Text, View, Image, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';

export const TechnicianReviewsScreen = ({ route, navigation }: any) => {
  const ratingData = {
    average: 4.8,
    totalReviews: 142,
    stars: [
      { count: 5, percentage: 85 },
      { count: 4, percentage: 10 },
      { count: 3, percentage: 3 },
      { count: 2, percentage: 1 },
      { count: 1, percentage: 1 },
    ],
  };

  const reviews = [
    {
      id: 'r1',
      userName: 'Suresh Kumar',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
      rating: 5,
      date: '14 July 2026',
      comment: 'Very professional! Rahul quickly detected the leak, welded the pipe, and filled the gas. AC is working beautifully now.',
      verified: true,
    },
    {
      id: 'r2',
      userName: 'Ananya Roy',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
      rating: 5,
      date: '10 July 2026',
      comment: 'Cleanest AC service I have ever had. He used a proper service bag so there were no water splashes on the bedroom wall.',
      verified: true,
    },
    {
      id: 'r3',
      userName: 'Vikram Singh',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
      rating: 4,
      date: '02 July 2026',
      comment: 'Arrived a bit late due to traffic, but did a thorough job checking gas pressure and cleaning filters.',
      verified: true,
    },
  ];

  return (
    <ScreenContainer title="Technician Reviews" onBack={() => navigation.goBack()}>
      {/* Summary Score Card */}
      <View style={styles.summaryCard}>
        <View style={styles.scoreCol}>
          <Text style={styles.scoreVal}>{ratingData.average}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <MaterialIcons
                key={i}
                name={i <= Math.floor(ratingData.average) ? 'star' : 'star-outline'}
                size={16}
                color={COLORS.warning}
              />
            ))}
          </View>
          <Text style={styles.subText}>{ratingData.totalReviews} Ratings</Text>
        </View>

        <View style={styles.dividerCol} />

        {/* Stars bars */}
        <View style={styles.barsCol}>
          {ratingData.stars.map((star) => (
            <View key={star.count} style={styles.barRow}>
              <Text style={styles.barLabel}>{star.count}★</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${star.percentage}%` }]} />
              </View>
              <Text style={styles.barPercent}>{star.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
              <View style={styles.userMeta}>
                <Text style={styles.userName}>{item.userName}</Text>
                <View style={styles.ratingDateRow}>
                  <View style={styles.starsSmall}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <MaterialIcons
                        key={i}
                        name={i <= item.rating ? 'star' : 'star-outline'}
                        size={12}
                        color={COLORS.warning}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>{item.date}</Text>
                </View>
              </View>
              {item.verified && (
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified-user" size={12} color={COLORS.success} />
                  <Text style={styles.verifiedText}>Verified Job</Text>
                </View>
              )}
            </View>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  scoreCol: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scoreVal: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  subText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  dividerCol: {
    width: 1,
    height: 70,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },
  barsCol: {
    flex: 2,
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    width: 18,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: ROUNDED.full,
    marginHorizontal: SPACING.xs,
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.full,
  },
  barPercent: {
    fontSize: 9,
    color: COLORS.textLight,
    fontWeight: '700',
    width: 26,
    textAlign: 'right',
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: ROUNDED.full,
    marginRight: SPACING.sm,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ratingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starsSmall: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDED.xs,
    gap: 2,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.success,
  },
  commentText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
