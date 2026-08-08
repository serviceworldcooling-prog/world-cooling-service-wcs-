import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import * as Icons from 'lucide-react-native';

export default function TabsLayout() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        }
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icons.Home size={22} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Icons.CalendarRange size={22} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="emergency" 
        options={{
          title: 'Emergency',
          tabBarIcon: ({ color }) => <Icons.AlertTriangle size={22} color={colors.accent} />
        }} 
      />
      <Tabs.Screen 
        name="notifications" 
        options={{
          title: 'Alerts',
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icons.User size={22} color={color} />,
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="more" 
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Icons.LayoutGrid size={22} color={color} />,
        }} 
      />
    </Tabs>
  );
}
