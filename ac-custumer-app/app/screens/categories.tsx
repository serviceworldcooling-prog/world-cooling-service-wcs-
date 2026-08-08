import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { CATEGORIES } from '../../constants/mocks';
import { ServiceCard } from '../../components/Cards';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>BOOK A SERVICE</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introBlock}>
          <Text style={[styles.introTitle, { color: colors.primary }]}>WORLD COOLING SELECTION</Text>
          <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
            Select from our catalog of heritage cooling services, performed by licensed master technicians.
          </Text>
        </View>

        {CATEGORIES.map((item) => (
          <ServiceCard
            key={item.id}
            category={item}
            onPress={() => router.push(`/screens/service-details?id=${item.id}`)}
          />
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  introBlock: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  introTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  introDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
  },
});
