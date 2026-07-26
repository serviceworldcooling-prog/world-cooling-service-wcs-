import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function EmergencyScreen() {
  const { themeMode, createEmergencyBooking } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [bookingLoading, setBookingLoading] = useState(false);

  const triggerEmergencyBooking = async () => {
    setBookingLoading(true);
    try {
      const emergencyBooking = await createEmergencyBooking({
        address: '124 Ocean Drive, Apt 4B, Miami, FL',
        description: 'EMERGENCY: Total AC breakdown. Gas leak / high voltage surge protection issue.',
      });
      setBookingLoading(false);
      Alert.alert(
        "Technician Dispatched",
        "Your emergency technician is on the way! ETA is 25 minutes.",
        [
          { text: "Track Live Location", onPress: () => router.push(`/screens/live-tracking?id=${emergencyBooking.bookingId || emergencyBooking._id}`) }
        ]
      );
    } catch (err: any) {
      setBookingLoading(false);
      Alert.alert("Emergency Booking Failed", err.message || "Could not dispatch technician.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.alertIcon, { backgroundColor: colors.error + '15' }]}>
            <Icons.AlertOctagon size={48} color={colors.error} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Emergency Helpline</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Is your AC releasing smoke, leaking hazardous fluid, or experiencing electrical issues? We dispatch instantly.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🚨 AC Breakdown Support</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Emergency bookings bypass normal queues. A master technician is dispatched immediately with priority equipment.
          </Text>
          <View style={styles.priceRow}>
            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Flat Dispatch Fee:</Text>
            <Text style={{ color: colors.error, fontSize: 18, fontWeight: '800' }}>$149.00</Text>
          </View>
        </View>

        <PrimaryButton 
          title="Book Emergency Technician" 
          onPress={triggerEmergencyBooking} 
          loading={bookingLoading}
        />

        <View style={styles.supportRow}>
          <TouchableOpacity 
            style={[styles.callBtn, { borderColor: colors.border }]}
            onPress={() => Alert.alert("Calling support...", "+1 800-555-COOL")}
          >
            <Icons.PhoneCall size={20} color={colors.primary} />
            <Text style={[styles.callBtnText, { color: colors.primary }]}> Call Helpline</Text>
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  alertIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  supportRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  callBtnText: {
    fontSize: 15,
    fontWeight: '700',
  }
});
