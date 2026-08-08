import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useApp();
  const insets = useSafeAreaInsets();

  const menuGroups = [
    {
      title: 'TECHNICIAN UTILITIES',
      items: [
        { icon: 'shopping-basket',     label: 'PARTS & INVENTORY REQUESTS', route: 'PartsRequest' },
        { icon: 'security',            label: 'SAFETY COMPLIANCE SOP',    route: 'SafetyChecklist' },
        { icon: 'star-half',           label: 'CUSTOMER FEEDBACK & REVIEWS', route: 'FeedbackRatings' },
        { icon: 'history',             label: 'JOB HISTORY LOG',          route: 'ServiceHistory' },
      ]
    },
    {
      title: 'COMPLAINTS & TICKETS',
      items: [
        { icon: 'feedback',            label: 'RAISE SUPPORT TICKET',     route: 'RaiseComplaint' },
        { icon: 'history-edu',         label: 'TICKET HISTORY',           route: 'ComplaintHistory' },
      ]
    },
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        { icon: 'person-outline',      label: 'EDIT TECHNICIAN PROFILE',  route: 'EditProfile' },
        { icon: 'help-outline',        label: 'HELP & KNOWLEDGE CENTER',  route: 'HelpCenter' },
        { icon: 'settings',            label: 'APP PREFERENCE SETTINGS',  route: 'Settings' },
        { icon: 'lock-open',           label: 'CHANGE SECURITY PASSWORD', route: 'ChangePassword' },
        { icon: 'delete-outline',      label: 'REQUEST ACCOUNT DELETION', route: '_DeleteAccount', danger: true },
      ]
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out of WCS technician portal?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      ]
    );
  };

  const handleMenuPress = (route: string) => {
    if (route === '_DeleteAccount') {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your technician account? This action is irreversible and requires admin clearance.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Request', style: 'destructive',
            onPress: () => Alert.alert('Request Sent', 'Your account deletion request has been submitted. Our compliance team will contact you within 48 hours.'),
          },
        ]
      );
      return;
    }
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Classical Header */}
      <View style={[styles.headerPanel, { paddingTop: Math.max(16, insets.top), backgroundColor: '#FFFFFF', borderBottomColor: COLORS.primary + '20' }]}>
        <Text style={[styles.brandHeader, { color: COLORS.secondary }]}>TECHNICIAN CONSOLE</Text>
        <Text style={[styles.headerTitle, { color: COLORS.primary }]}>MORE OPTIONS</Text>
        <View style={[styles.headerDivider, { backgroundColor: COLORS.secondary + '40' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userBox, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={[styles.profileAvatar, { borderColor: COLORS.secondary + '30' }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}>
              <MaterialIcons name="person" size={24} color={COLORS.primary} />
            </View>
          )}
          <View style={{ marginLeft: 14, flex: 1 }}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: COLORS.primary }]} numberOfLines={1}>
                {user?.name?.toUpperCase() || 'TECHNICIAN'}
              </Text>
              <View style={[styles.specialtyBadge, { backgroundColor: COLORS.secondary + '15', borderColor: COLORS.secondary + '40' }]}>
                <MaterialIcons name="verified" size={10} color={COLORS.secondary} />
                <Text style={[styles.specialtyBadgeText, { color: COLORS.secondary }]}>{user?.specialty || 'AC EXPERT'}</Text>
              </View>
            </View>
            <Text style={[styles.userEmail, { color: COLORS.textSecondary }]}>{user?.email || 'tech@wcs.com'}</Text>
            <Text style={[styles.userPhone, { color: COLORS.textLight }]}>{user?.phone || '—'}</Text>
          </View>
        </View>

        {/* Dynamic Groups */}
        {menuGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.groupContainer}>
            <Text style={[styles.groupTitle, { color: COLORS.textSecondary }]}>{group.title}</Text>
            <View style={[styles.groupCard, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}>
              {group.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  activeOpacity={0.8}
                  onPress={() => handleMenuPress(item.route)}
                  style={[
                    styles.itemRow, 
                    itemIdx < group.items.length - 1 && { borderBottomWidth: 1.5, borderBottomColor: COLORS.divider }
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.itemIconBox, { backgroundColor: item.danger ? COLORS.dangerLight : COLORS.primary + '08' }]}>
                      <MaterialIcons name={item.icon as any} size={16} color={item.danger ? COLORS.danger : COLORS.primary} />
                    </View>
                    <Text style={[styles.itemLabel, { color: item.danger ? COLORS.danger : COLORS.textPrimary }]}>{item.label}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={16} color={item.danger ? COLORS.danger : COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.logoutBtn, { borderColor: '#EF4444' + '30', backgroundColor: '#EF444408' }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="exit-to-app" size={16} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>LOG OUT OF CONSOLE</Text>
        </TouchableOpacity>

        {/* Heritage Brand Signature Footer */}
        <View style={styles.footerSignature}>
          <Text style={[styles.signatureText, { color: COLORS.textSecondary }]}>WORLD COOLING SERVICE</Text>
          <View style={[styles.signatureLine, { backgroundColor: COLORS.border }]} />
          <Text style={[styles.versionText, { color: COLORS.textLight }]}>EST. 2026  •  TECHNICIAN VERSION 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    ...SHADOWS.small,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
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
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  specialtyBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 11,
    marginTop: 2,
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
    ...SHADOWS.small,
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
    ...SHADOWS.small,
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
