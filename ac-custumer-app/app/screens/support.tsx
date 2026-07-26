import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, TextInput as RNTextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import { getFaqs, createComplaint, FAQ } from '../../api/complaintApi';
import * as Icons from 'lucide-react-native';

export default function SupportScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [complaintText, setComplaintText] = useState('');
  const [loading, setLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(true);

  useEffect(() => {
    getFaqs()
      .then(setFaqs)
      .catch(() => {})
      .finally(() => setFaqLoading(false));
  }, []);

  const handleRaiseComplaint = async () => {
    if (!complaintText.trim()) {
      Alert.alert('Error', 'Please enter complaint details.');
      return;
    }
    setLoading(true);
    try {
      const complaint = await createComplaint({
        subject: 'Customer Support Request',
        description: complaintText,
      });
      setComplaintText('');
      Alert.alert(
        'Complaint Filed',
        `Ticket ID: ${complaint.ticketNumber}. Our representative will contact you in 2 hours.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Direct channels */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Direct Channels</Text>
        <View style={styles.channelsRow}>
          <TouchableOpacity
            style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert('Live Chat', 'Starting live chat with support advisor.')}
          >
            <Icons.MessageCircleHeart size={28} color={colors.primary} />
            <Text style={[styles.channelTitle, { color: colors.text }]}>Live Chat</Text>
            <Text style={[styles.channelDesc, { color: colors.textSecondary }]}>Available 24/7</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert('Calling Support', 'Connecting to +1 800-555-COOL')}
          >
            <Icons.PhoneCall size={28} color={colors.accent} />
            <Text style={[styles.channelTitle, { color: colors.text }]}>Call Support</Text>
            <Text style={[styles.channelDesc, { color: colors.textSecondary }]}>Toll Free Helpline</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        {faqLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : faqs.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>No FAQs available.</Text>
        ) : (
          faqs.map(faq => (
            <TouchableOpacity
              key={faq._id}
              activeOpacity={0.8}
              onPress={() => setExpandedFAQ(prev => prev === faq._id ? null : faq._id)}
              style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <Icons.ChevronDown size={18} color={colors.textSecondary} />
              </View>
              {expandedFAQ === faq._id && (
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Raise Complaint */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Raise a Complaint Ticket</Text>
        <View style={[styles.complaintBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <RNTextInput
            placeholder="Type your issue details here..."
            placeholderTextColor={colors.textSecondary}
            value={complaintText}
            onChangeText={setComplaintText}
            multiline
            numberOfLines={4}
            style={[styles.complaintInput, { color: colors.text, borderColor: colors.border }]}
          />
          <PrimaryButton title="Submit Ticket" onPress={handleRaiseComplaint} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  channelsRow: { flexDirection: 'row', gap: 16 },
  channelCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  channelTitle: { fontSize: 14, fontWeight: '700', marginTop: 10 },
  channelDesc: { fontSize: 11, marginTop: 2 },
  faqCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 12 },
  faqAnswer: { fontSize: 13, marginTop: 12, lineHeight: 18 },
  complaintBox: { borderWidth: 1, borderRadius: 24, padding: 16 },
  complaintInput: { borderWidth: 1, borderRadius: 16, padding: 12, fontSize: 14, height: 100, textAlignVertical: 'top', marginBottom: 12 },
});
