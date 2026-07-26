import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, Image, ActivityIndicator, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { submitWorkReport } from '../../api/workReportApi';
import type { Job } from '../../api/jobsApi';

const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300',
];

const WORK_TYPES = [
  'Filter Cleaning', 'Gas Charging / Refill', 'Coil Cleaning',
  'Fan Motor Replacement', 'PCB / Board Repair', 'Capacitor Replacement',
  'Gas Leak Repair', 'Drain Pipe Cleaning', 'Compressor Service',
  'Thermostat Check', 'Full Service & Checkup',
];

export const WorkReportScreen = ({ route, navigation }: any) => {
  const { job } = route.params as { job: Job };

  const [workDone, setWorkDone]             = useState('');
  const [techNote, setTechNote]             = useState('');
  const [selectedWorks, setSelectedWorks]   = useState<string[]>([]);
  const [photos, setPhotos]                 = useState<string[]>([]);
  const [submitting, setSubmitting]         = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);

  // Post-submit OTP state
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [generatedOtp, setGeneratedOtp]       = useState('');
  const [customerOtp, setCustomerOtp]         = useState(['', '', '', '']);
  const [otpError, setOtpError]               = useState('');
  const [otpVerified, setOtpVerified]         = useState(false);

  const otpRefs = [
    useRef<TextInput>(null), useRef<TextInput>(null),
    useRef<TextInput>(null), useRef<TextInput>(null),
  ];

  const toggleWork = (item: string) =>
    setSelectedWorks(prev =>
      prev.includes(item) ? prev.filter(w => w !== item) : [...prev, item]
    );

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(status === 'granted');
    })();
  }, []);

  const handlePickPhoto = async () => {
    let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permission.granted) {
      setHasGalleryPermission(false);
      Alert.alert(
        'Permission required',
        'Please allow gallery access in your device settings so you can attach photos.',
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        ...(Platform.OS === 'ios' ? { allowsMultipleSelection: true, presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER } : {}),
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedUris = result.assets.map(asset => asset.uri).filter(uri => !photos.includes(uri));
      if (selectedUris.length === 0) {
        return;
      }

      setPhotos(prev => [...prev, ...selectedUris].slice(0, 6));
    } catch (error) {
      console.error('ImagePicker error:', error);
      Alert.alert('Gallery Error', 'Could not open gallery. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (selectedWorks.length === 0 && !workDone.trim()) {
      Alert.alert('Describe Work Done', 'Please select or describe what work was performed.');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Add Photos', 'Please add at least one photo of the completed work.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitWorkReport({
        bookingId:    job._id,
        workDone:     workDone || selectedWorks.join(', '),
        selectedWorks,
        techNote:     techNote || '',
        photos,
      });

      // Backend returns endOtp to show to customer
      setGeneratedOtp(result.endOtp || '');
      setReportSubmitted(true);
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Could not submit report. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...customerOtp];
    updated[index] = digit;
    setCustomerOtp(updated);
    setOtpError('');
    if (digit && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !customerOtp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const entered = customerOtp.join('');
    if (entered.length < 4) { setOtpError('Please enter the complete 4-digit OTP.'); return; }
    if (entered === generatedOtp) {
      setOtpVerified(true);
      setOtpError('');
      Alert.alert('✅ OTP Verified', 'Service confirmed by customer. Job complete!');
    } else {
      setOtpError('Incorrect OTP. Ask the customer to re-enter.');
      setCustomerOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    }
  };

  return (
    <ScreenContainer title="Work Report" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Job reference */}
        <View style={styles.jobRef}>
          <MaterialIcons name="assignment" size={18} color={COLORS.primary} />
          <Text style={styles.jobRefText}>
            Job #{job.bookingId}  ·  {job.serviceType}  ·  {(job.customerId as any)?.name || 'Customer'}
          </Text>
        </View>

        {/* Work checklist */}
        <Text style={styles.sectionTitle}>What Work Was Performed? *</Text>
        <Text style={styles.sectionSub}>Select all that apply</Text>
        <View style={styles.checkGrid}>
          {WORK_TYPES.map(item => {
            const checked = selectedWorks.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggleWork(item)}
                style={[styles.checkChip, checked && styles.checkChipActive]}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={checked ? 'check-box' : 'check-box-outline-blank'}
                  size={16}
                  color={checked ? '#fff' : COLORS.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.checkChipText, checked && styles.checkChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Additional details */}
        <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
        <TextInput
          placeholder="Describe any additional work, parts replaced..."
          placeholderTextColor={COLORS.textLight}
          value={workDone}
          onChangeText={setWorkDone}
          multiline numberOfLines={4}
          style={styles.textarea}
        />

        {/* Note to admin */}
        <Text style={styles.sectionTitle}>Note to Admin *</Text>
        <TextInput
          placeholder="E.g. Unit restored. No leaks detected. Customer satisfied."
          placeholderTextColor={COLORS.textLight}
          value={techNote}
          onChangeText={setTechNote}
          multiline numberOfLines={3}
          style={styles.textarea}
        />

        {/* Photos */}
        <View style={styles.photoHeader}>
          <Text style={styles.sectionTitle}>Job Photos *</Text>
          <Text style={styles.photoCount}>{photos.length} added</Text>
        </View>
        <View style={styles.photoGrid}>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickPhoto}>
            <MaterialIcons name="add-a-photo" size={28} color={COLORS.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
          {photos.map(uri => (
            <View key={uri} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.thumbImg} />
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => setPhotos(p => p.filter(x => x !== uri))}
              >
                <MaterialIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit / OTP section */}
        <View style={styles.submitSection}>
          {submitting ? (
            <View style={styles.submittingBox}>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.submittingText}>Sending report to admin...</Text>
            </View>
          ) : reportSubmitted ? (
            <View style={styles.otpSection}>
              {/* Success banner */}
              <View style={styles.otpSuccessBanner}>
                <MaterialIcons name="check-circle" size={22} color={COLORS.success} />
                <Text style={styles.otpSuccessText}>Report sent to admin!</Text>
              </View>

              <Text style={styles.otpInstruction}>
                Show this OTP to the customer. They need to enter it in their app to confirm completion.
              </Text>

              {/* OTP display */}
              <View style={styles.otpDisplayBox}>
                <Text style={styles.otpLabel}>COMPLETION OTP</Text>
                <Text style={styles.otpDigits}>{generatedOtp}</Text>
                <Text style={styles.otpSubLabel}>
                  Show to: {(job.customerId as any)?.name || 'Customer'}
                </Text>
              </View>

              {/* Verify OTP from customer */}
              {!otpVerified ? (
                <View style={styles.verifySection}>
                  <Text style={styles.verifyTitle}>Ask customer to confirm their OTP</Text>
                  <View style={styles.otpRow}>
                    {customerOtp.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        ref={otpRefs[idx]}
                        value={digit}
                        onChangeText={t => handleOtpChange(t, idx)}
                        onKeyPress={e => handleOtpKeyPress(e, idx)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        selectTextOnFocus
                        style={styles.otpInput}
                      />
                    ))}
                  </View>
                  {otpError ? (
                    <Text style={styles.otpErrorText}>{otpError}</Text>
                  ) : null}
                  <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyOtp}>
                    <MaterialIcons name="verified-user" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.verifyBtnText}>Verify Customer OTP</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.verifiedBanner}>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                  <Text style={styles.verifiedText}>Customer OTP verified. Job complete!</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
              >
                <Text style={styles.backBtnText}>Back to My Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
                <MaterialIcons name="send" size={20} color="#fff" style={{ marginRight: SPACING.sm }} />
                <Text style={styles.submitBtnText}>Send Work Report to Admin</Text>
              </TouchableOpacity>
              <Text style={styles.submitNote}>
                Once submitted, an OTP will be generated to send to the customer.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: 60 },
  jobRef: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#EFF6FF', borderRadius: ROUNDED.sm, padding: SPACING.sm, marginBottom: SPACING.md },
  jobRefText: { fontSize: 13, fontWeight: '700', color: '#1E40AF', flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginTop: SPACING.md, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  checkChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 8, borderRadius: ROUNDED.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  checkChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  checkChipTextActive: { color: '#fff' },
  textarea: { borderWidth: 1, borderColor: COLORS.border, borderRadius: ROUNDED.md, padding: SPACING.sm, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.surface, textAlignVertical: 'top', minHeight: 90, marginBottom: SPACING.sm },
  photoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  photoCount: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, backgroundColor: `${COLORS.secondary}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: ROUNDED.full },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  addPhotoBtn: { width: 100, height: 100, borderRadius: ROUNDED.md, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF6FF' },
  addPhotoText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  photoThumb: { width: 100, height: 100, borderRadius: ROUNDED.md, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: '100%', height: '100%' },
  removePhotoBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  submitSection: { marginTop: SPACING.sm },
  submittingBox: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
  submittingText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  submitBtn: { flexDirection: 'row', height: 54, borderRadius: ROUNDED.md, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  submitNote: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 18 },
  otpSection: { gap: SPACING.sm },
  otpSuccessBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: ROUNDED.md, padding: SPACING.md },
  otpSuccessText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.success },
  otpInstruction: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  otpDisplayBox: { alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: ROUNDED.md, padding: SPACING.lg, marginVertical: SPACING.sm, ...SHADOWS.small },
  otpLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  otpDigits: { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: 12, marginVertical: SPACING.sm },
  otpSubLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  verifySection: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: ROUNDED.md, padding: SPACING.md, gap: SPACING.sm },
  verifyTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
  otpInput: { flex: 1, height: 52, borderWidth: 1.5, borderRadius: ROUNDED.sm, borderColor: COLORS.border, backgroundColor: '#fff', fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  otpErrorText: { fontSize: 12, fontWeight: '700', color: COLORS.danger },
  verifyBtn: { flexDirection: 'row', height: 48, borderRadius: ROUNDED.md, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  verifiedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: ROUNDED.md, padding: SPACING.md },
  verifiedText: { fontSize: 14, fontWeight: '700', color: COLORS.success },
  backBtn: { alignItems: 'center', paddingVertical: SPACING.md },
  backBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
