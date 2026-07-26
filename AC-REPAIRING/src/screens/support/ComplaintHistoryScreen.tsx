import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const ComplaintHistoryScreen = ({ navigation }: any) => {
  const { complaints, loadComplaints } = useApp();

  useEffect(() => {
    loadComplaints();
  }, []);

  const getStatusStyle = (status: string) => {
    // FIX: was 'in review' — actual API statuses are 'Open' | 'In Progress' | 'Resolved' | 'Closed'
    switch (status) {
      case 'Resolved': return { bg: COLORS.successLight, text: COLORS.success };
      case 'Closed':   return { bg: '#F1F5F9',           text: '#64748B' };
      case 'In Progress': return { bg: COLORS.warningLight ?? '#FEF3C7', text: '#92400E' };
      default:         return { bg: '#E0F2FE',           text: '#0284C7' }; // Open
    }
  };

  return (
    <ScreenContainer title="Complaint Tickets" onBack={() => navigation.goBack()}>
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
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.header}>
                  <View>
                    <Text style={styles.id}>{item.ticketNumber || item._id}</Text>
                    <Text style={styles.subject}>{item.subject}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
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
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: ROUNDED.full,
  },
  badgeText: {
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
