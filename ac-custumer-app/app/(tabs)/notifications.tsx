import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { IconHelper } from '../../components/CustomUI';
import { getNotifications, markAllRead, markOneRead, Notification } from '../../api/notificationApi';
import { useFocusEffect } from 'expo-router';

export default function NotificationsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { notifications: data } = await getNotifications();
      setNotifications(data);
    } catch { /* silent */ }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkOne = async (id: string) => {
    await markOneRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'Calendar';
      case 'offer': return 'Tag';
      case 'payment': return 'CreditCard';
      default: return 'Bell';
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
              No notifications yet.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => !item.isRead && handleMarkOne(item._id)}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                !item.isRead && { borderLeftColor: colors.primary, borderLeftWidth: 4 },
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
                <IconHelper name={getIcon(item.type)} color={colors.primary} size={22} />
              </View>
              <View style={styles.details}>
                <View style={styles.row}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(item.createdAt)}</Text>
                </View>
                <Text style={[styles.msg, { color: colors.textSecondary }]}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  list: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { flexDirection: 'row', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  details: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '700', flex: 1 },
  time: { fontSize: 11 },
  msg: { fontSize: 13, marginTop: 4, lineHeight: 18 },
});
