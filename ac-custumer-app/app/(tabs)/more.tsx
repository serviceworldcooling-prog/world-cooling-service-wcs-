import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '../../api/client';

export default function MoreTab() {
  const { themeMode, user, logout } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('data:image')) return avatar;
    const origin = BASE_URL.replace('/api/v1', '');
    return `${origin}${avatar}`;
  };

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

  const navGroups = [
    {
      title: 'AC Services',
      items: [
        { label: 'BOOK A SERVICE', icon: 'Wrench', route: '/screens/categories' },
        { label: 'ENERGY & DIAGNOSTICS ADVISOR', icon: 'Sparkles', route: '/screens/ac-advisor' },
        { label: 'CUSTOM AMC CONTRACT BUILDER', icon: 'FileText', route: '/screens/amc-builder' },
        { label: 'MY ADDRESSES', icon: 'MapPin', route: '/screens/saved-addresses' },
        { label: 'BUY & SELL ACS', icon: 'ShoppingBag', route: '/screens/product-market' },
      ]
    },
    {
      title: 'My Account',
      items: [
        { label: 'EXPERT TECHNICIANS DIRECTORY', icon: 'Users', route: '/screens/technician-directory' },
        { label: 'COMPLAINT STATUS', icon: 'ShieldAlert', route: '/screens/complaint-status' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'FAQ CENTER & SEARCH', icon: 'HelpCircle', route: '/screens/help-faq-search' },
        { label: 'APP SETTINGS', icon: 'Settings', route: '/screens/settings' }
      ]
    }
  ];

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.headerPanel, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <Text style={[styles.brandHeader, { color: colors.primary }]}>PATRON CONSOLE</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>MORE OPTIONS</Text>
        <View style={[styles.headerDivider, { backgroundColor: colors.primary + '30' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user?.avatar ? (
            <Image source={{ uri: getAvatarUrl(user.avatar) }} style={[styles.profileAvatar, { borderColor: colors.primary + '30' }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
              <Icons.User size={22} color={colors.primary} />
            </View>
          )}
          <View style={{ marginLeft: 14, flex: 1 }}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user?.name?.toUpperCase() || 'PATRON'}
              </Text>
              {user?.hasMembership ? (
                <View style={[styles.membershipBadge, { backgroundColor: '#F59E0B' + '15', borderColor: '#F59E0B' + '50' }]}>
                  <Icons.Crown size={10} color="#D97706" fill="#D97706" />
                  <Text style={[styles.membershipBadgeText, { color: '#D97706' }]}>GOLD SHIELD</Text>
                </View>
              ) : (
                <View style={[styles.membershipBadge, { backgroundColor: colors.textSecondary + '10', borderColor: colors.border }]}>
                  <Icons.User size={8} color={colors.textSecondary} />
                  <Text style={[styles.membershipBadgeText, { color: colors.textSecondary }]}>STANDARD</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'patron@wcs.com'}</Text>
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
                      itemIdx < group.items.length - 1 && { borderBottomWidth: 1.5, borderBottomColor: colors.border }
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View style={[styles.itemIconBox, { backgroundColor: colors.primary + '08' }]}>
                        <IconComponent size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                    </View>
                    <Icons.ChevronRight size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.logoutBtn, { borderColor: '#EF4444' + '30', backgroundColor: '#EF444408' }]}
          onPress={handleLogout}
        >
          <Icons.LogOut size={16} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>LOG OUT OF ACCOUNT</Text>
        </TouchableOpacity>

        {/* Heritage Brand Signature Footer */}
        <View style={styles.footerSignature}>
          <Text style={[styles.signatureText, { color: colors.textSecondary }]}>WORLD COOLING SERVICE</Text>
          <View style={[styles.signatureLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>EST. 2026  •  VERSION 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPanel: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    letterSpacing: 1.5,
  },
  headerDivider: {
    width: 24,
    height: 2,
    marginTop: 10,
    borderRadius: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  userBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  membershipBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerSignature: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  signatureText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
  },
  signatureLine: {
    width: 24,
    height: 1.5,
    marginVertical: 10,
    borderRadius: 1,
    opacity: 0.3,
  },
  versionText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
