import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const RaiseComplaintScreen = ({ navigation }: any) => {
  const { addComplaint } = useApp();

  const [subject, setSubject]   = useState('');
  const [bookingId, setBookingId] = useState('');
  const [desc, setDesc]         = useState('');
  const [errors, setErrors]     = useState<any>({});
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    const newErrors: any = {};
    if (!subject) newErrors.subject = 'Subject is required';
    if (!desc)    newErrors.desc    = 'Complaint description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const complaint = await addComplaint(subject, desc, bookingId || undefined);
      Alert.alert(
        'Complaint Registered',
        `Ticket ${complaint.ticketNumber} raised. Our team will respond within 24 hours.`,
        [{ text: 'View History', onPress: () => navigation.replace('ComplaintHistory') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer title="Raise a Dispute" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <AppInput
            label="COMPLAINT SUBJECT"
            value={subject}
            onChangeText={(t: string) => { setSubject(t); if (errors.subject) setErrors((p: any) => ({ ...p, subject: undefined })); }}
            placeholder="Water leaking / Booking delayed / Wrong billing"
            icon="report-problem"
            error={errors.subject}
          />
          <AppInput
            label="BOOKING REFERENCE ID (OPTIONAL)"
            value={bookingId}
            onChangeText={setBookingId}
            placeholder="e.g. BKG-001234"
            icon="receipt"
            style={{ marginTop: SPACING.md }}
          />
          <AppInput
            label="COMPLAINT DETAILS"
            value={desc}
            onChangeText={(t: string) => { setDesc(t); if (errors.desc) setErrors((p: any) => ({ ...p, desc: undefined })); }}
            placeholder="Describe your issue so our support team can assist immediately."
            icon="edit"
            error={errors.desc}
            style={{ marginTop: SPACING.md }}
          />
          <AppButton
            title={loading ? 'Submitting...' : 'Submit Complaint Ticket'}
            onPress={handleSubmit}
            icon="send"
            style={styles.submitBtn}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: SPACING.xl },
  card: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, padding: SPACING.md, ...SHADOWS.small },
  submitBtn: { backgroundColor: COLORS.primary, height: 50, marginTop: SPACING.xl },
});
