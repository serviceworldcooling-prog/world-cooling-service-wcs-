import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function NotificationSettingsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [promos, setPromos] = useState(false);
  const [chats, setChats] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notification Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={[styles.title, { color: colors.text }]}>Booking Updates</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>Get notified when technician is assigned or arrives.</Text>
          </View>
          <Switch 
            value={bookingAlerts} 
            onValueChange={setBookingAlerts} 
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={[styles.title, { color: colors.text }]}>Offers & Promos</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>Receive alerts about seasonal discounts and coupons.</Text>
          </View>
          <Switch 
            value={promos} 
            onValueChange={setPromos} 
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={[styles.title, { color: colors.text }]}>Technician Chat Messages</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>Sound alerts when dispatcher sends active chat messages.</Text>
          </View>
          <Switch 
            value={chats} 
            onValueChange={setChats} 
            trackColor={{ false: colors.border, true: colors.primary }}
          />
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  textCol: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    marginTop: 4,
  }
});
