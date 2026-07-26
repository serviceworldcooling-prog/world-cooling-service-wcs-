import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function ReviewsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const reviewsList = [
    { id: '1', name: 'Sophia Miller', rating: 5, date: 'July 14, 2026', comment: 'Alex Johnson was amazing! Clean work, wore shoe covers, and resolved the low cooling in 30 minutes.' },
    { id: '2', name: 'Ryan Martinez', rating: 4, date: 'July 11, 2026', comment: 'Very professional. Detected a tiny leak in the gas charging valve and fixed it quickly.' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reviews & Feedback</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {reviewsList.map((review) => (
          <View key={review.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.topRow}>
              <Text style={[styles.reviewerName, { color: colors.text }]}>{review.name}</Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>{review.date}</Text>
            </View>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Icons.Star 
                  key={idx} 
                  size={14} 
                  color={idx < review.rating ? colors.accent : colors.border} 
                  fill={idx < review.rating ? colors.accent : 'transparent'} 
                />
              ))}
            </View>
            <Text style={[styles.comment, { color: colors.textSecondary }]}>{review.comment}</Text>
          </View>
        ))}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  comment: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  }
});
