import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Alert, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';

// Relative time helper
const formatTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const NotificationsScreen = ({ navigation }: any) => {
  const {
    user,
    notifications,
    notifLoading,
    unreadCount,
    loadNotifications,
    markNotificationRead,
    clearNotifications,
    updateTechStatus,
  } = useApp();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleStatusChange = async (newStatus: 'Available' | 'On Job' | 'Off Duty') => {
    try {
      await updateTechStatus(newStatus);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert('Status Updated', `Your status has been updated to "${newStatus}"`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update status.');
    }
  };

  const showStatusOptions = () => {
    Alert.alert(
      'Update Duty Status',
      'Select your current status:',
      [
        { text: '🟢 Available', onPress: () => handleStatusChange('Available') },
        { text: '🟡 On Job', onPress: () => handleStatusChange('On Job') },
        { text: '🔴 Off Duty', onPress: () => handleStatusChange('Off Duty') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClear = () => {
    clearNotifications();
  };

  const handleNotifPress = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header exactly matching Dashboard style */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: COLORS.primary }]}>W  C  S</Text>
          <View style={[styles.headerDividerVertical, { backgroundColor: COLORS.border }]} />
          
          <TouchableOpacity 
            style={styles.headerDutyStatus}
            onPress={showStatusOptions}
            activeOpacity={0.8}
          >
            <Text style={dutyLabelStyle}>DUTY STATUS</Text>
            <View style={styles.dutyRow}>
              <View style={[
                styles.dutyDotActive, 
                { 
                  backgroundColor: 
                    user?.technicianStatus === 'Available' ? COLORS.success :
                    user?.technicianStatus === 'On Job' ? '#EAB308' :
                    COLORS.textLight 
                }
              ]} />
              <Text style={styles.dutyText}>
                {user?.technicianStatus || 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7} style={styles.clearBtn}>
            <Text style={styles.clearText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="notifications-none"
            size={60}
            color={COLORS.textLight}
            style={{ marginBottom: SPACING.md }}
          />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyDesc}>You have no notifications at the moment.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card, 
                item.isRead ? styles.cardRead : styles.cardUnread,
                { borderWidth: 1.5 }
              ]}
              onPress={() => handleNotifPress(item._id)}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name={
                    item.type === 'booking'
                      ? 'assignment'
                      : item.type === 'payment'
                      ? 'payment'
                      : 'notifications'
                  }
                  size={20}
                  color={item.isRead ? COLORS.textSecondary : COLORS.secondary}
                />
              </View>
              <View style={styles.contentCol}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, item.isRead ? styles.textRead : styles.textUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.body}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <BottomTabBar navigation={navigation} />
    </View>
  );
};

const dutyLabelStyle = {
  fontSize: 8,
  fontWeight: '900' as const,
  letterSpacing: 1.5,
  color: COLORS.textSecondary,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(11, 30, 63, 0.1)',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  headerDutyStatus: {
    flex: 1,
    justifyContent: 'center',
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dutyDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: ROUNDED.sm,
    backgroundColor: '#ffffff',
  },
  clearText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  scroll: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  cardRead: {
    backgroundColor: '#ffffff',
    borderColor: COLORS.border,
  },
  cardUnread: {
    backgroundColor: '#FAFDFD',
    borderColor: COLORS.secondary + '30',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  contentCol: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 14, flex: 1, paddingRight: SPACING.xs },
  textUnread: { fontWeight: '800', color: COLORS.primary },
  textRead:   { fontWeight: '600', color: COLORS.textPrimary },
  time: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  body: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
