import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { Colors } from '../theme/colors';
import * as Icons from 'lucide-react-native';

export default function BottomTabBar() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.includes('/home') || pathname.includes('/screens/categories') || pathname.includes('/screens/service-details')) {
      return 'home';
    }
    if (pathname.includes('/bookings') || pathname.includes('/screens/booking-details') || pathname.includes('/screens/live-tracking')) {
      return 'bookings';
    }
    if (pathname.includes('/emergency') || pathname.includes('/screens/emergency-status')) {
      return 'emergency';
    }
    return 'more'; // default / fallback for other screens
  };

  const activeTab = getActiveTab();

  const handlePress = (tab: string) => {
    if (tab === 'home') router.push('/(tabs)/home');
    else if (tab === 'bookings') router.push('/(tabs)/bookings');
    else if (tab === 'emergency') router.push('/(tabs)/emergency');
    else if (tab === 'more') router.push('/(tabs)/more');
  };

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handlePress('home')}
        activeOpacity={0.7}
      >
        <Icons.Home size={22} color={activeTab === 'home' ? colors.primary : colors.textSecondary} />
        <Text style={[styles.tabLabel, { color: activeTab === 'home' ? colors.primary : colors.textSecondary }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handlePress('bookings')}
        activeOpacity={0.7}
      >
        <Icons.CalendarRange size={22} color={activeTab === 'bookings' ? colors.primary : colors.textSecondary} />
        <Text style={[styles.tabLabel, { color: activeTab === 'bookings' ? colors.primary : colors.textSecondary }]}>Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handlePress('emergency')}
        activeOpacity={0.7}
      >
        <Icons.AlertTriangle size={22} color={colors.accent} />
        <Text style={[styles.tabLabel, { color: activeTab === 'emergency' ? colors.primary : colors.textSecondary }]}>Emergency</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handlePress('more')}
        activeOpacity={0.7}
      >
        <Icons.LayoutGrid size={22} color={activeTab === 'more' ? colors.primary : colors.textSecondary} />
        <Text style={[styles.tabLabel, { color: activeTab === 'more' ? colors.primary : colors.textSecondary }]}>More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1.5,
    paddingBottom: 8,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
