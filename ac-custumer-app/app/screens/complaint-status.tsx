import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { getMyComplaints, getComplaintByTicket, Complaint } from '../../api/complaintApi';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ComplaintStatusScreen() {
  const { ticketNumber } = useLocalSearchParams<{ ticketNumber?: string }>();
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (ticketNumber) {
          const c = await getComplaintByTicket(ticketNumber);
          setComplaint(c);
        } else {
          const all = await getMyComplaints();
          setComplaints(all);
          if (all.length > 0) setComplaint(all[0]);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketNumber]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {complaint ? complaint.ticketNumber : 'COMPLAINT STATUS'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {!complaint ? (
        <View style={styles.emptyCenter}>
          <Icons.Inbox size={48} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 12, fontWeight: '700' }}>
            No complaints filed yet.
          </Text>
          <TouchableOpacity onPress={() => router.push('/screens/support')} style={[styles.raiseBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 }}>RAISE A COMPLAINT</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Complaint Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{complaint.subject}</Text>
            <Text style={[styles.statusBadge, { color: colors.primary, borderColor: colors.primary }]}>
              STATUS: {complaint.status.toUpperCase()}
            </Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{complaint.description}</Text>
          </View>

          {/* Multiple complaints list */}
          {complaints.length > 1 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>OTHER COMPLAINTS</Text>
              {complaints.filter(c => c._id !== complaint._id).map(c => (
                <TouchableOpacity
                  key={c._id}
                  onPress={() => setComplaint(c)}
                  style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.text, fontWeight: '900', fontSize: 12 }}>{c.ticketNumber}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 }}>{c.subject}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Timeline */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>RESOLUTION TIMELINE</Text>
          {complaint.timeline.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={[styles.circle, { backgroundColor: step.done ? colors.primary : colors.border }]}>
                  {step.done && <Icons.Check size={12} color="#FFF" />}
                </View>
                {idx < complaint.timeline.length - 1 && (
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={styles.stepRight}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{step.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: 14, 
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  card: { borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 14, fontWeight: '900', marginBottom: 8, letterSpacing: 0.5 },
  statusBadge: { fontSize: 10, fontWeight: '900', borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10, letterSpacing: 0.5 },
  desc: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 14, marginTop: 4 },
  miniCard: { borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 10 },
  stepRow: { flexDirection: 'row', minHeight: 70 },
  stepLeft: { alignItems: 'center', marginRight: 16 },
  circle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginVertical: 4 },
  stepRight: { flex: 1 },
  stepTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  stepDesc: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  raiseBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
});
