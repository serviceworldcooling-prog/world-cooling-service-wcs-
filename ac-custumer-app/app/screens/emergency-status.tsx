import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function EmergencyStatusScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [eta, setEta] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Dispatch</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.statusBox, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
          <Icons.Radio size={36} color={colors.error} />
          <Text style={[styles.statusText, { color: colors.error }]}>Technician is Dispatched</Text>
          <Text style={[styles.etaText, { color: colors.text }]}>ETA: {eta} Mins</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>SAFETY FIRST WARNING</Text>
          <Text style={[styles.warningMsg, { color: colors.text }]}>
            If you smell gas leaks or see electrical sparks around the AC compressor, please switch off the main circuit breaker and move to a safe room immediately.
          </Text>
        </View>

        <PrimaryButton 
          title="Emergency Help Call" 
          onPress={() => Alert.alert("Calling Emergency Center", "Connecting to safety supervisor...")} 
        />
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  statusBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  etaText: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  warningMsg: {
    fontSize: 13,
    lineHeight: 18,
  }
});
