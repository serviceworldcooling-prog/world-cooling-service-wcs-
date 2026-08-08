import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { getTechnicians, Technician } from '../../api/technicianApi';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TechnicianDirectoryScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [preferredTechId, setPreferredTechId] = useState<string | null>(null);

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  useEffect(() => {
    const loadTechs = async () => {
      try {
        const list = await getTechnicians();
        setTechs(list);
        
        const storedPref = await AsyncStorage.getItem('preferred_technician_id');
        if (storedPref) setPreferredTechId(storedPref);
      } catch (err) {
        // Fallback mock list if API fails
        setTechs([
          { _id: '1', name: 'Vikram Singh', specialty: 'Inverter AC Expert', rating: 4.9, reviewsCount: 142, avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' },
          { _id: '2', name: 'Amit Sharma', specialty: 'Gas Charge & Leakage Specialist', rating: 4.8, reviewsCount: 98, avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150' },
          { _id: '3', name: 'Rajesh Kumar', specialty: 'Compressor Repair Master', rating: 4.7, reviewsCount: 110, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
          { _id: '4', name: 'Sanjay Patel', specialty: 'Standard Servicing & Wet Clean', rating: 4.6, reviewsCount: 74, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadTechs();
  }, []);

  const handleSelectPreferred = async (tech: Technician) => {
    try {
      if (preferredTechId === tech._id) {
        await AsyncStorage.removeItem('preferred_technician_id');
        setPreferredTechId(null);
        Alert.alert("Preferences Updated", "Preferred technician preference removed.");
      } else {
        await AsyncStorage.setItem('preferred_technician_id', tech._id);
        setPreferredTechId(tech._id);
        Alert.alert(
          "Technician Selected",
          `${tech.name} has been set as your preferred technician. We will prioritize assigning him to your next cooling service booking!`
        );
      }
    } catch {
      Alert.alert("Error", "Could not save preferences.");
    }
  };

  const specialties = ['All', 'Inverter AC', 'Gas Charge', 'Compressor', 'Servicing'];

  const filteredTechs = techs.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (tech.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || 
                             (tech.specialty || '').toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>EXPERT TECHNICIANS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBlock}>
          <Text style={[styles.brandHeader, { color: colors.primary }]}>LICENSED MASTER TECHNICIANS</Text>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Choose Your Preferred Expert</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          <Icons.Search size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search by name or specialty..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Specialty Filter Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {specialties.map(spec => (
            <TouchableOpacity
              key={spec}
              style={[
                styles.filterPill,
                { borderColor: colors.primary + '30', backgroundColor: colors.card },
                selectedSpecialty === spec && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedSpecialty(spec)}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: selectedSpecialty === spec ? '#FFF' : colors.text }}>
                {spec.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Technician Cards */}
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : filteredTechs.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No matching technicians found.</Text>
        ) : (
          filteredTechs.map(tech => {
            const isPreferred = preferredTechId === tech._id;
            return (
              <View key={tech._id} style={[styles.techCard, { backgroundColor: colors.card, borderColor: isPreferred ? colors.primary : colors.primary + '20' }]}>
                <Image 
                  source={{ uri: tech.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' }} 
                  style={[styles.avatar, { borderColor: colors.primary + '30' }]} 
                />
                <View style={styles.techInfo}>
                  <View style={styles.techHeader}>
                    <Text style={[styles.techName, { color: colors.text }]}>{tech.name}</Text>
                    {isPreferred && (
                      <View style={[styles.prefBadge, { backgroundColor: colors.primary + '15' }]}>
                        <Icons.Check size={10} color={colors.primary} />
                        <Text style={[styles.prefBadgeText, { color: colors.primary }]}>PREFERRED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.techSpecialty, { color: colors.primary }]}>{tech.specialty || 'Cooling Expert'}</Text>
                  
                  <View style={styles.ratingsRow}>
                    <Icons.Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingVal, { color: colors.text }]}>{tech.rating || 4.8}</Text>
                    <Text style={[styles.reviewsCount, { color: colors.textSecondary }]}>({tech.reviewsCount || 45} reviews)</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.prefBtn, { borderColor: isPreferred ? '#EF4444' : colors.primary }, isPreferred && { backgroundColor: '#EF444408' }]}
                    onPress={() => handleSelectPreferred(tech)}
                  >
                    <Text style={[styles.prefBtnText, { color: isPreferred ? '#EF4444' : colors.primary }]}>
                      {isPreferred ? 'Remove Preference' : 'Select as Preferred'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  techCard: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
  },
  techInfo: {
    flex: 1,
  },
  techHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techName: {
    fontSize: 14,
    fontWeight: '900',
  },
  prefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  prefBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  techSpecialty: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  reviewsCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  prefBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  prefBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 30,
  }
});
