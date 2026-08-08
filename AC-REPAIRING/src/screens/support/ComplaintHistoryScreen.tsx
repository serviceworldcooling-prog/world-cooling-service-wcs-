import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, StatusBar, Alert, LayoutAnimation, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';

export const ComplaintHistoryScreen = ({ navigation }: any) => {
  const { user, complaints, unreadCount, updateTechStatus, loadComplaints } = useApp();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadComplaints();
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Resolved': return { bg: COLORS.successLight, text: COLORS.success };
      case 'Closed':   return { bg: '#F1F5F9',           text: '#64748B' };
      case 'In Progress': return { bg: COLORS.warningLight ?? '#FEF3C7', text: '#92400E' };
      default:         return { bg: '#E0F2FE',           text: '#0284C7' }; // Open
    }
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

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={18} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {complaints.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="history" size={60} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyTitle}>No complaint history</Text>
          <Text style={styles.emptyDesc}>You have not raised any support complaints yet.</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.id}>{item.ticketNumber || item._id}</Text>
                    <Text style={styles.subject}>{item.subject}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.desc}>{item.description}</Text>
                <View style={styles.footer}>
                  <MaterialIcons name="event" size={14} color={COLORS.textLight} />
                  <Text style={styles.date}>Filed on: {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
      <BottomTabBar navigation={navigation} activeRoute="Profile" />
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
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -3,
    top: -3,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  scroll: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.sm,
  },
  id: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  subject: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginVertical: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  date: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: '500',
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
