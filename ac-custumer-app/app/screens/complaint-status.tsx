import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { getMyComplaints, getComplaintByTicket, Complaint } from '../../api/complaintApi';
import * as Icons from 'lucide-react-native';

export default function ComplaintStatusScreen() {
  const { ticketNumber } = useLocalSearchParams<{ ticketNumber?: string }>();
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {complaint ? complaint.ticketNumber : 'Complaint Status'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {!complaint ? (
        <View style={styles.emptyCenter}>
          <Icons.Inbox size={48} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14 }}>
            No complaints filed yet.
          </Text>
          <TouchableOpacity onPress={() => router.push('/screens/support')} style={[styles.raiseBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Raise a Complaint</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Other Complaints</Text>
              {complaints.filter(c => c._id !== complaint._id).map(c => (
                <TouchableOpacity
                  key={c._id}
                  onPress={() => setComplaint(c)}
                  style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{c.ticketNumber}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{c.subject}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Timeline */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resolution Timeline</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 28 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  statusBadge: { fontSize: 11, fontWeight: '800', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  desc: { fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  miniCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  stepRow: { flexDirection: 'row', minHeight: 70 },
  stepLeft: { alignItems: 'center', marginRight: 16 },
  circle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginVertical: 4 },
  stepRight: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepDesc: { fontSize: 12, marginTop: 2 },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  raiseBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
});
