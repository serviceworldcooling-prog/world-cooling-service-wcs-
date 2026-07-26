import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function OffersScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const seasonalOffers = [
    {
      id: '1',
      title: 'Summer Special Offer',
      desc: 'Upgrade your cooling setup with a limited-time summer discount on AC servicing and deep cleaning.',
      banner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
      discount: '20% Off'
    },
    {
      id: '2',
      title: 'Free Jet Upgrade',
      desc: 'Book installation and get a complimentary jet wash with your cooling equipment upgrade.',
      banner: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b7?auto=format&fit=crop&w=1200&q=80',
      discount: 'Free Upgrade'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Seasonal Offers</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {seasonalOffers.map((offer) => (
          <View key={offer.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: offer.banner }} style={styles.banner} />
            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={[styles.title, { color: colors.text }]}>{offer.title}</Text>
                <Text style={[styles.discount, { color: colors.accent }]}>{offer.discount}</Text>
              </View>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{offer.desc}</Text>
              
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => Alert.alert("Offer Activated", "This promotional offer has been saved to your profile details!")}
              >
                <Text style={styles.actionText}>Activate Campaign</Text>
              </TouchableOpacity>
            </View>
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
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  banner: {
    width: '100%',
    height: 220,
  },
  info: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  discount: {
    fontSize: 14,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontWeight: '700',
  }
});
