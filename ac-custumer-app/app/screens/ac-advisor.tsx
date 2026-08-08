import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ACAdvisorScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [acType, setAcType] = useState<'Split' | 'Window' | 'Central'>('Split');
  const [acAge, setAcAge] = useState<'New' | 'Medium' | 'Old'>('New'); // New: 0-2 yrs, Medium: 2-5 yrs, Old: 5+ yrs
  const [dailyHours, setDailyHours] = useState<number>(6);
  const [lastServiced, setLastServiced] = useState<'recent' | 'mid' | 'old'>('recent'); // <3m, 3-6m, >6m
  const [roomSize, setRoomSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  // Advanced calculation based on parameters
  const calculateDiagnostics = () => {
    let baseLoadKwh = 1.2; // base tonnage usage per hour (approx 1.2 kWh for 1.5 Ton)
    if (acType === 'Window') baseLoadKwh = 1.4;
    if (acType === 'Central') baseLoadKwh = 2.8;

    let ageFactor = 1.0;
    if (acAge === 'Medium') ageFactor = 1.15;
    if (acAge === 'Old') ageFactor = 1.35;

    let roomFactor = 1.0;
    if (roomSize === 'Small') roomFactor = 0.85;
    if (roomSize === 'Large') roomFactor = 1.3;

    let serviceFactor = 1.0;
    if (lastServiced === 'mid') serviceFactor = 1.1;
    if (lastServiced === 'old') serviceFactor = 1.25;

    const monthlyKwh = baseLoadKwh * dailyHours * 30 * ageFactor * roomFactor * serviceFactor;
    const monthlyCost = monthlyKwh * 8.5; // Average tariff rate in ₹

    // Efficiency Index
    let efficiency = 95;
    if (acAge === 'Medium') efficiency -= 15;
    if (acAge === 'Old') efficiency -= 30;
    if (lastServiced === 'mid') efficiency -= 10;
    if (lastServiced === 'old') efficiency -= 25;
    efficiency = Math.max(35, efficiency);

    // Filter Health
    let filterHealth = 100;
    if (lastServiced === 'recent') filterHealth = 90 - dailyHours * 1.5;
    if (lastServiced === 'mid') filterHealth = 60 - dailyHours * 2.5;
    if (lastServiced === 'old') filterHealth = 30 - dailyHours * 3.5;
    filterHealth = Math.max(10, Math.round(filterHealth));

    // Recommendations
    const recs: string[] = [];
    if (filterHealth < 50) {
      recs.push("🚨 Air filters are heavily clogged. Dust build-up is restricting airflow by up to 25%. Standard Filter Clean required.");
    }
    if (acAge === 'Old') {
      recs.push("⚠️ Older compressor model detected. Annual preventive AMC tune-up is highly recommended to protect against sudden breakdowns.");
    }
    if (lastServiced === 'old') {
      recs.push("🔧 Your AC hasn't been serviced in over 6 months. Power consumption is elevated by approx 20%. Schedule standard wet servicing.");
    }
    if (dailyHours > 8) {
      recs.push("📈 High daily workload. Ensure compressor surroundings are clean and coil fins are straight to prevent over-heating.");
    }

    if (recs.length === 0) {
      recs.push("✅ Your cooling system is in optimal condition! Keep up standard scheduled cleanings.");
    }

    return {
      monthlyKwh: Math.round(monthlyKwh),
      monthlyCost: Math.round(monthlyCost),
      efficiency,
      filterHealth,
      recs,
    };
  };

  const diag = calculateDiagnostics();

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>ENERGY & DIAGNOSTICS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBlock}>
          <Text style={[styles.brandHeader, { color: colors.primary }]}>SMART ENERGY ADVISOR</Text>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Calculate AC Consumption & Health</Text>
        </View>

        {/* Inputs */}
        <View style={[styles.panelCard, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          <Text style={[styles.panelHeader, { color: colors.primary }]}>1. INPUT AC PARAMETERS</Text>

          {/* AC Type */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>AC TYPE</Text>
          <View style={styles.row}>
            {(['Split', 'Window', 'Central'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.selectorBtn, acType === type && { backgroundColor: colors.primary }]}
                onPress={() => setAcType(type)}
              >
                <Text style={[styles.selectorText, { color: acType === type ? '#FFF' : colors.text }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AC Age */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>AC UNIT AGE</Text>
          <View style={styles.row}>
            {[
              { id: 'New', label: '0-2 Yrs' },
              { id: 'Medium', label: '2-5 Yrs' },
              { id: 'Old', label: '5+ Yrs' }
            ].map(age => (
              <TouchableOpacity
                key={age.id}
                style={[styles.selectorBtn, acAge === age.id && { backgroundColor: colors.primary }]}
                onPress={() => setAcAge(age.id as any)}
              >
                <Text style={[styles.selectorText, { color: acAge === age.id ? '#FFF' : colors.text }]}>{age.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Room Size */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>ROOM SIZE (COOLING ZONE)</Text>
          <View style={styles.row}>
            {[
              { id: 'Small', label: '< 120 sq ft' },
              { id: 'Medium', label: '120-180 sq ft' },
              { id: 'Large', label: '> 180 sq ft' }
            ].map(sz => (
              <TouchableOpacity
                key={sz.id}
                style={[styles.selectorBtn, roomSize === sz.id && { backgroundColor: colors.primary }]}
                onPress={() => setRoomSize(sz.id as any)}
              >
                <Text style={[styles.selectorText, { color: roomSize === sz.id ? '#FFF' : colors.text }]}>{sz.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Last Serviced */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>LAST SERVICE TIME</Text>
          <View style={styles.row}>
            {[
              { id: 'recent', label: '< 3 Months' },
              { id: 'mid', label: '3-6 Months' },
              { id: 'old', label: '> 6 Months' }
            ].map(srv => (
              <TouchableOpacity
                key={srv.id}
                style={[styles.selectorBtn, lastServiced === srv.id && { backgroundColor: colors.primary }]}
                onPress={() => setLastServiced(srv.id as any)}
              >
                <Text style={[styles.selectorText, { color: lastServiced === srv.id ? '#FFF' : colors.text }]}>{srv.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Daily Hours */}
          <View style={styles.sliderHeader}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>DAILY USAGE</Text>
            <Text style={[styles.sliderVal, { color: colors.primary }]}>{dailyHours} Hours/Day</Text>
          </View>
          <View style={styles.sliderWrapper}>
            {[2, 4, 6, 8, 10, 12, 14, 16, 18, 24].map((hr) => (
              <TouchableOpacity
                key={hr}
                style={[styles.hrBubble, dailyHours === hr && { backgroundColor: colors.primary }]}
                onPress={() => setDailyHours(hr)}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: dailyHours === hr ? '#FFF' : colors.text }}>{hr}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dynamic Outputs */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>DIAGNOSTIC ADVISORY REPORT</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { gap: 12 }]}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
            <Icons.Zap size={22} color="#EAB308" />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>POWER COST</Text>
            <Text style={[styles.statVal, { color: colors.text }]}>₹{diag.monthlyCost}/mo</Text>
            <Text style={[styles.statSubText, { color: colors.textSecondary }]}>{diag.monthlyKwh} kWh Estimated</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
            <Icons.Gauge size={22} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>EFFICIENCY</Text>
            <Text style={[styles.statVal, { color: colors.text }]}>{diag.efficiency}%</Text>
            <Text style={[styles.statSubText, { color: colors.textSecondary }]}>Compressor Health</Text>
          </View>
        </View>

        {/* Filter Health Tracker */}
        <View style={[styles.filterTrackerCard, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          <View style={styles.filterCardHeader}>
            <Icons.Activity size={18} color={colors.primary} />
            <Text style={[styles.filterTitle, { color: colors.text }]}>AIR FILTER HEALTH STATUS</Text>
            <Text style={[styles.filterPct, { color: diag.filterHealth > 50 ? colors.success : '#EF4444' }]}>{diag.filterHealth}%</Text>
          </View>
          <View style={[styles.healthBarBg, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.healthBarFill, 
                { 
                  width: `${diag.filterHealth}%`, 
                  backgroundColor: diag.filterHealth > 65 ? colors.success : diag.filterHealth > 40 ? '#EAB308' : '#EF4444' 
                }
              ]} 
            />
          </View>
          <Text style={[styles.healthDesc, { color: colors.textSecondary }]}>
            {diag.filterHealth > 65 
              ? "Your filters are relatively clean. Efficiency loss is low."
              : diag.filterHealth > 40
              ? "Medium filter buildup. Servicing recommended soon."
              : "Clogged filter alert! Restricting air inflow, causing high energy draw."}
          </Text>
        </View>

        {/* Custom Actions */}
        <View style={[styles.panelCard, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          <Text style={[styles.panelHeader, { color: colors.primary }]}>RECOMMENDED SERVICE ACTION</Text>
          {diag.recs.map((rec, idx) => (
            <View key={idx} style={styles.recItem}>
              <Text style={[styles.recText, { color: colors.text }]}>{rec}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              router.push({
                pathname: '/screens/categories',
              });
            }}
          >
            <Icons.Wrench size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.bookBtnText}>Book Optimal Tune-Up Now</Text>
          </TouchableOpacity>
        </View>
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
  panelCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  panelHeader: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sliderVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  sliderWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  hrBubble: {
    width: '18%',
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 4,
  },
  statSubText: {
    fontSize: 10,
    fontWeight: '600',
  },
  filterTrackerCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  filterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  filterTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  filterPct: {
    fontSize: 15,
    fontWeight: '900',
  },
  healthBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  healthBarFill: {
    height: '100%',
  },
  healthDesc: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  recItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  recText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  bookBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  }
});
