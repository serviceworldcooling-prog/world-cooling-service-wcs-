import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { BASE_URL } from '../../api/client';

export default function ProfileScreen() {
  const { themeMode, user, logout, userLocation } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('data:image')) return avatar;
    const origin = BASE_URL.replace('/api/v1', '');
    return `${origin}${avatar}`;
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => {
          logout();
          router.replace('/(auth)/login');
        }}
      ]
    );
  };

  // Only flow-relevant menu items kept
  // Removed: wallet, refer-earn (not part of core flow)
  const menuItems: { title: string; icon: string; route: string; rightText?: string; }[] = [
    { title: 'Edit Profile', icon: 'UserPen', route: '/screens/edit-profile' },
    { title: 'Saved Addresses', icon: 'MapPin', route: '/screens/saved-addresses' },
    { title: 'Complaint Status', icon: 'ShieldAlert', route: '/screens/complaint-status' },
    { title: 'Help & Support', icon: 'HelpCircle', route: '/screens/support' },
    { title: 'Settings', icon: 'Settings', route: '/screens/settings' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user?.avatar ? (
            <Image source={{ uri: getAvatarUrl(user.avatar) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
              <Icons.User size={32} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Customer'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'customer@example.com'}</Text>
          
          {userLocation && (
            <View style={styles.locationContainer}>
              <Icons.MapPin size={14} color={colors.primary} />
              <View style={{ marginLeft: 6, alignItems: 'center' }}>
                <Text numberOfLines={2} style={[styles.locationText, { color: colors.textSecondary }]}>
                  {userLocation.addressString}
                </Text>
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '800', marginTop: 2 }}>
                  GPS: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu list */}
        <View style={styles.menuList}>
          {menuItems.map((item, idx) => {
            const IconComponent = (Icons as any)[item.icon] || Icons.ChevronRight;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => router.push(item.route as any)}
                style={[styles.menuItem, { borderColor: colors.border }]}
              >
                <View style={styles.menuLeft}>
                  <IconComponent size={20} color={colors.primary} />
                  <Text style={[styles.menuTitle, { color: colors.text }]}>  {item.title}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.rightText && <Text style={[styles.rightVal, { color: colors.primary }]}>{item.rightText} </Text>}
                  <Icons.ChevronRight size={18} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={[styles.menuItem, { borderColor: colors.border }]}
          >
            <View style={styles.menuLeft}>
              <Icons.LogOut size={20} color={colors.error} />
              <Text style={[styles.menuTitle, { color: colors.error }]}>  Logout</Text>
            </View>
            <Icons.ChevronRight size={18} color={colors.error} />
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    textAlign: 'center',
  },
  menuList: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightVal: {
    fontSize: 13,
    fontWeight: '700',
  }
});
