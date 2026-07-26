import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppInput } from '../../components/Common';

export const BlogScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    {
      id: 'b1',
      title: '5 Smart Ways to Save Electricity on Your AC',
      excerpt: 'Learn how simple temperature tweaks and cleaning schedules can slash your power bill by up to 25% this summer.',
      category: 'Energy Tips',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200',
    },
    {
      id: 'b2',
      title: 'How Often Should You Service Your Split AC?',
      excerpt: 'Waiting for your AC to stop cooling before booking a service is a bad idea. Read the recommended servicing frequency here.',
      category: 'Maintenance',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200',
    },
    {
      id: 'b3',
      title: 'Signs Your AC is Leaking Refrigerant Gas',
      excerpt: 'From ice buildup on condenser coils to a high-pitched hissing noise, learn to spot refrigerant gas leaks early.',
      category: 'Troubleshooting',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200',
    },
  ];

  const filteredArticles = articles.filter((art) =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenContainer title="AC Care Knowledge Hub" onBack={() => navigation.goBack()}>
      {/* Search Input */}
      <AppInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search tips, tricks & guides..."
        icon="search"
        style={styles.searchBar}
      />

      {/* Blogs list */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.blogCard}
            onPress={() => alert(`Opening article: ${item.title}`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <View style={styles.tagRow}>
                <View style={styles.categoryTag}>
                  <Text style={styles.tagText}>{item.category}</Text>
                </View>
                <Text style={styles.readTime}>{item.readTime}</Text>
              </View>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.excerptText} numberOfLines={2}>
                {item.excerpt}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <MaterialIcons name="search-off" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No matching guides found</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  blogCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardImage: {
    height: 140,
    width: '100%',
    backgroundColor: COLORS.divider,
  },
  cardInfo: {
    padding: SPACING.md,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  categoryTag: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDED.xs,
  },
  tagText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  readTime: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  excerptText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
});
