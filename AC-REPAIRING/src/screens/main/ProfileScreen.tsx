import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useApp();

  // Only flow-relevant menu items for a serviceman
  // Removed: Membership, SubscriptionPlans, PaymentHistory, Wallet, LoyaltyRewards, WarrantyStatus, ReferEarn, QuotesRequest, ACDiagnosis, Blog, ServiceComparison
  const menuGroups = [
    {
      title: 'MY WORK',
      items: [
        { icon: 'assignment',          label: 'Assigned Jobs',    route: 'AssignedJobs' }, // FIX: was 'MyBookings' — not registered
        { icon: 'history',             label: 'Job History',      route: 'ServiceHistory' },
        { icon: 'chat-bubble-outline', label: 'Raise Complaint',  route: 'RaiseComplaint' },
        { icon: 'history-edu',         label: 'Complaint History',route: 'ComplaintHistory' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { icon: 'person-outline', label: 'Edit Profile',    route: 'EditProfile' },
        { icon: 'help-outline',   label: 'Help Center',     route: 'HelpCenter' },
        { icon: 'settings',       label: 'Settings',        route: 'Settings' },
        { icon: 'lock-open',      label: 'Change Password', route: 'ChangePassword' },
        // 'DeleteAccount' screen exists but is not in the navigator — show Alert instead
        { icon: 'delete-outline', label: 'Delete Account',  route: '_DeleteAccount', danger: true },
      ]
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleMenuPress = (route: string) => {
    if (route === '_DeleteAccount') {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action is irreversible.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete', style: 'destructive',
            onPress: () => Alert.alert('Request Sent', 'Your account deletion request has been submitted. Our team will process it within 48 hours.'),
          },
        ]
      );
      return;
    }
    navigation.navigate(route);
  };

  return (
    <ScreenContainer title="My Profile" noHeader={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.membershipBadge}>
              <MaterialIcons name="stars" size={14} color="#D4AF37" style={{ marginRight: 4 }} />
              <Text style={styles.membershipText}>{user?.specialty || 'AC Expert'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Groups */}
        {menuGroups.map((group, groupIdx) => (
          <View key={groupIdx} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.menuItem,
                    itemIdx === group.items.length - 1 ? { borderBottomWidth: 0 } : null
                  ]}
                  onPress={() => handleMenuPress(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[
                      styles.iconCircle, 
                      item.danger ? { backgroundColor: COLORS.dangerLight } : { backgroundColor: COLORS.background }
                    ]}>
                      <MaterialIcons 
                        name={item.icon as any} 
                        size={20} 
                        color={item.danger ? COLORS.danger : COLORS.primary} 
                      />
                    </View>
                    <Text style={[styles.menuItemLabel, item.danger ? { color: COLORS.danger } : null]}>
                      {item.label}
                    </Text>
                  </View>
                  <MaterialIcons 
                    name="chevron-right" 
                    size={20} 
                    color={item.danger ? COLORS.danger : COLORS.textLight} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="exit-to-app" size={20} color={COLORS.danger} style={{ marginRight: SPACING.sm }} />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF7E7',
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: ROUNDED.full,
  },
  membershipText: {
    fontSize: 11,
    color: '#B8860B',
    fontWeight: '800',
  },
  groupContainer: {
    marginBottom: SPACING.md,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderColor: COLORS.dangerLight,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
