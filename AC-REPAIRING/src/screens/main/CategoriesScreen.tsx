import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { MOCK_CATEGORIES } from '../../constants/mockData';

export const CategoriesScreen = ({ navigation }: any) => {
  const handleCategoryPress = (category: any) => {
    navigation.navigate('BookService', { category });
  };

  return (
    <ScreenContainer title="Service Categories" onBack={() => navigation.goBack()}>
      <FlatList
        data={MOCK_CATEGORIES}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCategoryPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name={item.icon as any} size={28} color={COLORS.secondary} />
            </View>
            <View style={styles.infoCol}>
              <View style={styles.titleRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.bookRow}>
                <Text style={styles.startText}>Starting Price</Text>
                <View style={styles.bookBtn}>
                  <Text style={styles.bookText}>Book Now</Text>
                  <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  startText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
