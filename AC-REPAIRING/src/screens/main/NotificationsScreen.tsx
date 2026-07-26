import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

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
    notifications,
    notifLoading,
    unreadCount,
    loadNotifications,
    markNotificationRead,
    clearNotifications,
  } = useApp();

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleClear = () => {
    clearNotifications();
  };

  const handleNotifPress = (id: string) => {
    markNotificationRead(id);
  };

  const headerRight = notifications.length > 0 ? (
    <TouchableOpacity onPress={handleClear}>
      <Text style={styles.clearText}>Mark All Read</Text>
    </TouchableOpacity>
  ) : null;

  return (
    <ScreenContainer
      title="Notifications"
      onBack={() => navigation.goBack()}
      headerRight={headerRight}
    >
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
          // FIX: was item.id — API returns _id
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              // FIX: was item.read — API field is isRead
              style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
              onPress={() => handleNotifPress(item._id)}
              activeOpacity={0.8}
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
                  // FIX: was item.read — API field is isRead
                  color={item.isRead ? COLORS.textSecondary : COLORS.secondary}
                />
              </View>
              <View style={styles.contentCol}>
                <View style={styles.titleRow}>
                  {/* FIX: was item.read — API field is isRead */}
                  <Text style={[styles.title, item.isRead ? styles.textRead : styles.textUnread]}>
                    {item.title}
                  </Text>
                  {/* FIX: was item.time — API field is createdAt */}
                  <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                </View>
                {/* FIX: was item.body — API field is message */}
                <Text style={styles.body}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: { paddingBottom: 20 },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
    borderWidth: 1,
  },
  cardRead: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  cardUnread: {
    backgroundColor: '#FAFDFD',
    borderColor: COLORS.secondaryLight,
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
