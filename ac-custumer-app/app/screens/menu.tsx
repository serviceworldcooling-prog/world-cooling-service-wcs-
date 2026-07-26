import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function MenuPage() {
  const { themeMode, user, logout } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => {
          logout();
          router.replace('/(auth)/login');
        }}
      ]
    );
  };

  // Only flow-relevant nav groups kept
  // Removed: booking-estimator, offers, membership-plans, amc-details, rewards, wallet-transactions, live-chat (not part of core flow)
  const navGroups = [
    {
      title: 'AC Services',
      items: [
        { label: 'Book a Service', icon: 'Wrench', route: '/screens/categories' },
        { label: 'My Addresses', icon: 'MapPin', route: '/screens/saved-addresses' },
      ]
    },
    {
      title: 'My Account',
      items: [
        { label: 'Edit Profile Info', icon: 'UserPen', route: '/screens/edit-profile' },
        { label: 'Complaint Status', icon: 'ShieldAlert', route: '/screens/complaint-status' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'FAQ Center & Search', icon: 'HelpCircle', route: '/screens/help-faq-search' },
        { label: 'App Settings', icon: 'Settings', route: '/screens/settings' }
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Menu Navigation</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { borderColor: colors.border }]}>
          <Icons.X size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.userLeft}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{user?.name?.substring(0, 1) || 'C'}</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Customer'}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'customer@example.com'}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Groups */}
        {navGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.groupContainer}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>{group.title.toUpperCase()}</Text>
            <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {group.items.map((item, itemIdx) => {
                const IconComponent = (Icons as any)[item.icon] || Icons.ChevronRight;
                return (
                  <TouchableOpacity
                    key={itemIdx}
                    activeOpacity={0.8}
                    onPress={() => router.push(item.route as any)}
                    style={[
                      styles.itemRow, 
                      itemIdx < group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <IconComponent size={20} color={colors.primary} />
                      <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                    </View>
                    <Icons.ChevronRight size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.logoutBtn, { borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <Icons.LogOut size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out of Account</Text>
        </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: '900',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  userBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  }
});
