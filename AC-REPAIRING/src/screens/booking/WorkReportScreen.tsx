import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, Image, ActivityIndicator, Platform, LayoutAnimation,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';
import { BottomTabBar } from '../../components/Common';
import { useApp } from '../../context/AppContext';
import { submitWorkReport } from '../../api/workReportApi';
import type { Job } from '../../api/jobsApi';
import api from '../../api/client';

const DEFAULT_WORK_TYPES = [
  'Filter Cleaning', 'Gas Charging / Refill', 'Coil Cleaning',
  'Fan Motor Replacement', 'PCB / Board Repair', 'Capacitor Replacement',
  'Gas Leak Repair', 'Drain Pipe Cleaning', 'Compressor Service',
  'Thermostat Check', 'Full Service & Checkup',
];

export const WorkReportScreen = ({ route, navigation }: any) => {
  const { job } = route.params as { job: Job };
  const { user, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();

  const [workDone, setWorkDone] = useState('');
  const [techNote, setTechNote] = useState('');
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [workTypes, setWorkTypes] = useState<string[]>(DEFAULT_WORK_TYPES);

  useEffect(() => {
    api.get('/work-checklist')
      .then((res: any) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const titles = res.data.data.map((item: any) => item.title);
          if (titles.length > 0) setWorkTypes(titles);
        }
      })
      .catch(() => {});
  }, []);
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Post-submit OTP state
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [customerOtp, setCustomerOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Optional Warranty Card & Extra Charges state
  const [warrantyActive, setWarrantyActive] = useState(false);
  const [warrantyPeriod, setWarrantyPeriod] = useState('3 Months');
  const [warrantyDetails, setWarrantyDetails] = useState('');
  const [acNo, setAcNo] = useState('');
  const [modelNo, setModelNo] = useState('');
  const [warrantyReason, setWarrantyReason] = useState('');
  const [extraMaterialCharges, setExtraMaterialCharges] = useState('');
  const [extraAmountTaken, setExtraAmountTaken] = useState('');

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
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
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

  const handleCapturePhoto = async () => {
    if (!hasCameraPermission) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take photos of completed work.');
        return;
      }
      setHasCameraPermission(true);
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.2, // low quality to start
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const compressed = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400 } }],
          { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG }
        );
        setPhotos(prev => [...prev, compressed.uri]);
      } catch (err) {
        Alert.alert('Error', 'Failed to compress photo.');
      }
    }
  };

  const handleCaptureVideo = async () => {
    if (!hasCameraPermission) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to record video.');
        return;
      }
      setHasCameraPermission(true);
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      videoMaxDuration: 15,
      quality: Platform.OS === 'ios' ? 0.2 : 0,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setVideo(result.assets[0].uri);
    }
  };

  const uploadMediaToCloudinary = async (fileUri: string, resourceType: 'image' | 'video') => {
    // 1. Fetch signature and credentials from backend
    const sigRes = await api.get('/auth/cloudinary-signature');
    if (!sigRes.data?.success) {
      throw new Error(sigRes.data?.message || 'Could not fetch upload signature');
    }
    const { signature, timestamp, apiKey, cloudName, uploadPreset } = sigRes.data;

    // 2. Prepare FormData
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: resourceType === 'video' ? 'video/mp4' : 'image/jpeg',
      name: resourceType === 'video' ? 'video.mp4' : 'photo.jpg',
    } as any);
    data.append('api_key', apiKey);
    data.append('timestamp', String(timestamp));
    data.append('signature', signature);
    data.append('upload_preset', uploadPreset);
    
    // 3. Post to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const resData = await response.json();
    if (resData.secure_url) {
      return resData.secure_url;
    } else {
      throw new Error(resData.error?.message || 'Cloudinary upload failed');
    }
  };

  const handleSubmit = async () => {
    if (selectedWorks.length === 0 && !workDone.trim()) {
      Alert.alert('Describe Work Done', 'Please select or describe what work was performed.');
      return;
    }
    if (photos.length !== 4) {
      Alert.alert('Add Photos', `Please capture exactly 4 photos of the completed work. (Current: ${photos.length}/4)`);
      return;
    }
    if (!video) {
      Alert.alert('Record Video', 'Please record exactly 1 video demonstrating the completed work.');
      return;
    }
    if (warrantyActive && !warrantyReason.trim()) {
      Alert.alert('Reason of Warranty Required', 'Please enter the Reason of Warranty before creating the guarantee certificate.');
      return;
    }

    setSubmitting(true);
    try {
      const uploadedPhotos: string[] = [];
      
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of 4 to Cloudinary...`);
        const url = await uploadMediaToCloudinary(photos[i], 'image');
        uploadedPhotos.push(url);
      }

      setUploadProgress('Uploading video to Cloudinary...');
      const uploadedVideoUrl = await uploadMediaToCloudinary(video, 'video');

      setUploadProgress('Saving report...');
      await submitWorkReport({
        bookingId: job._id,
        workDone: workDone || selectedWorks.join(', '),
        selectedWorks,
        techNote: techNote || '',
        photos: uploadedPhotos,
        video: uploadedVideoUrl,
        warrantyActive,
        warrantyPeriod: warrantyActive ? warrantyPeriod : '',
        warrantyDetails: warrantyActive ? warrantyDetails : '',
        acNo: warrantyActive ? acNo : '',
        modelNo: warrantyActive ? modelNo : '',
        warrantyReason: warrantyActive ? warrantyReason : '',
        extraMaterialCharges: Number(extraMaterialCharges) || 0,
        extraAmountTaken: Number(extraAmountTaken) || 0,
      });

      setReportSubmitted(true);
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Could not submit report. Try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
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

  const handleVerifyOtp = async () => {
    const entered = customerOtp.join('');
    if (entered.length < 4) { setOtpError('Please enter the complete 4-digit OTP.'); return; }

    setSubmitting(true);
    setUploadProgress('Verifying OTP...');
    try {
      await api.post('/service-otp/verify-end-tech', {
        bookingId: job._id,
        otp: entered,
      });
      setOtpVerified(true);
      setOtpError('');
      Alert.alert('✅ OTP Verified', 'Service confirmed by customer. Job complete!');
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect OTP. Ask the customer to re-enter.');
      setCustomerOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleResendOtp = async () => {
    setSubmitting(true);
    setUploadProgress('Regenerating OTP...');
    try {
      await api.post(`/service-otp/generate-end/${job._id}`);
      Alert.alert('✅ OTP Resent', 'A fresh completion OTP has been generated and sent to the customer.');
      setCustomerOtp(['', '', '', '']);
      setOtpError('');
      otpRefs[0].current?.focus();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not resend OTP.');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      {/* Header exactly matching Dashboard style */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: COLORS.primary }]}>W  C  S</Text>
          <View style={[styles.headerDividerVertical, { backgroundColor: COLORS.border }]} />
          
          <TouchableOpacity 
            style={styles.headerDutyStatus}
            onPress={showStatusOptions}
            activeOpacity={0.8}
          >
            <Text style={styles.dutyLabel}>DUTY STATUS</Text>
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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

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
          {workTypes.map(item => {
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

        {/* ── Optional Extra Billing Charges ── */}
        <Text style={styles.sectionTitle}>Extra Billing Details (Optional)</Text>
        <View style={styles.extraChargesWrapper}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Extra Material Charges (₹)</Text>
            <TextInput
              placeholder="e.g. 1200"
              placeholderTextColor={COLORS.textLight}
              value={extraMaterialCharges}
              onChangeText={setExtraMaterialCharges}
              keyboardType="number-pad"
              style={styles.simpleInput}
            />
          </View>
          <View style={[styles.inputLabelRow, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>Extra Labor/Amount Taken (₹)</Text>
            <TextInput
              placeholder="e.g. 500"
              placeholderTextColor={COLORS.textLight}
              value={extraAmountTaken}
              onChangeText={setExtraAmountTaken}
              keyboardType="number-pad"
              style={styles.simpleInput}
            />
          </View>
          {((Number(extraMaterialCharges) || 0) > 0 || (Number(extraAmountTaken) || 0) > 0) && (
            <View style={styles.totalPreviewRow}>
              <Text style={styles.totalPreviewLabel}>Updated Total Bill Amount:</Text>
              <Text style={styles.totalPreviewVal}>
                ₹{( ((job.finalPrice && job.finalPrice > 0) ? job.finalPrice : (job.price || 0)) + (Number(extraMaterialCharges) || 0) + (Number(extraAmountTaken) || 0) ).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* ── Optional Warranty Card ── */}
        <Text style={styles.sectionTitle}>Guarantee / Warranty Card (Optional)</Text>
        <View style={styles.warrantyCardWrapper}>
          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setWarrantyActive(!warrantyActive)}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={warrantyActive ? "check-box" : "check-box-outline-blank"} 
              size={20} 
              color={warrantyActive ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={styles.checkboxLabel}>Issue Guarantee/Warranty Card to Customer</Text>
          </TouchableOpacity>

          {warrantyActive && (
            <View style={{ marginTop: 12, gap: 10 }}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>AC Serial / Unit No (AC No)</Text>
                <TextInput
                  placeholder="e.g. DK-IN-902184"
                  placeholderTextColor={COLORS.textLight}
                  value={acNo}
                  onChangeText={setAcNo}
                  style={styles.simpleInput}
                />
              </View>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>AC Model No / Brand</Text>
                <TextInput
                  placeholder="e.g. Daikin 1.5 Ton 5-Star Inverter AC"
                  placeholderTextColor={COLORS.textLight}
                  value={modelNo}
                  onChangeText={setModelNo}
                  style={styles.simpleInput}
                />
              </View>
              <View style={styles.inputLabelRow}>
                <Text style={[styles.inputLabel, { fontWeight: '700', color: COLORS.textPrimary }]}>Reason of Warranty *</Text>
                <TextInput
                  placeholder="e.g. PCB Chipset Replacement & R-32 Gas Pressure Seal Guarantee"
                  placeholderTextColor={COLORS.textLight}
                  value={warrantyReason}
                  onChangeText={setWarrantyReason}
                  multiline
                  numberOfLines={2}
                  style={[styles.simpleInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>Warranty Period</Text>
                <TextInput
                  placeholder="e.g. 3 Months / 6 Months"
                  placeholderTextColor={COLORS.textLight}
                  value={warrantyPeriod}
                  onChangeText={setWarrantyPeriod}
                  style={styles.simpleInput}
                />
              </View>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>Warranty Coverage Details</Text>
                <TextInput
                  placeholder="e.g. Warranty on replaced fan motor or cooling gas refilled."
                  placeholderTextColor={COLORS.textLight}
                  value={warrantyDetails}
                  onChangeText={setWarrantyDetails}
                  multiline
                  numberOfLines={2}
                  style={[styles.simpleInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={styles.photoHeader}>
          <Text style={styles.sectionTitle}>Job Photos *</Text>
          <Text style={styles.photoCount}>{photos.length}/4 added (Max 5KB each)</Text>
        </View>
        <View style={styles.photoGrid}>
          {photos.length < 4 && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleCapturePhoto}>
              <MaterialIcons name="add-a-photo" size={28} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Capture Photo</Text>
            </TouchableOpacity>
          )}
          {photos.map((uri, index) => (
            <View key={uri} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.thumbImg} />
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>#{index + 1}</Text>
              </View>
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => setPhotos(p => p.filter(x => x !== uri))}
              >
                <MaterialIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Video */}
        <View style={styles.photoHeader}>
          <Text style={styles.sectionTitle}>Job Video *</Text>
          <Text style={styles.photoCount}>{video ? '1' : '0'}/1 added (Max 10MB)</Text>
        </View>
        <View style={{ marginBottom: SPACING.md }}>
          {!video ? (
            <TouchableOpacity style={styles.addVideoBtn} onPress={handleCaptureVideo}>
              <MaterialIcons name="videocam" size={28} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Record Video</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.videoContainer}>
              <MaterialIcons name="play-circle-filled" size={48} color={COLORS.secondary} />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={styles.videoTitle} numberOfLines={1}>Job Video Recorded</Text>
                <Text style={styles.videoSubTitle}>Ready to upload to Cloudinary</Text>
              </View>
              <TouchableOpacity
                style={styles.removeVideoBtn}
                onPress={() => setVideo('')}
              >
                <MaterialIcons name="delete" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit / OTP section */}
        <View style={styles.submitSection}>
          {submitting ? (
            <View style={styles.submittingBox}>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.submittingText}>{uploadProgress || 'Sending report to admin...'}</Text>
            </View>
          ) : reportSubmitted ? (
            <View style={styles.otpSection}>
              {/* Success banner */}
              <View style={styles.otpSuccessBanner}>
                <MaterialIcons name="check-circle" size={22} color={COLORS.success} />
                <Text style={styles.otpSuccessText}>Report submitted! Waiting for OTP verification.</Text>
              </View>

              <Text style={styles.otpInstruction}>
                Ask the customer for the verification OTP. It has been sent to their in-app notifications.
              </Text>

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
                        style={styles.otpInput}
                      />
                    ))}
                  </View>
                  {otpError ? (
                    <Text style={styles.otpErrorText}>{otpError}</Text>
                  ) : null}

                  <View style={styles.resendRow}>
                    <Text style={styles.resendText}>Didn't receive the OTP?</Text>
                    <TouchableOpacity onPress={handleResendOtp} disabled={submitting}>
                      <Text style={styles.resendBtnText}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>

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
      <BottomTabBar navigation={navigation} activeRoute="AssignedJobs" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  backBtnHeader: {
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
    letterSpacing: 2,
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
  dutyLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
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
  scroll: { paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 },
  jobRef: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#EFF6FF', borderRadius: ROUNDED.sm, padding: SPACING.sm, marginBottom: SPACING.md, borderWidth: 1.5, borderColor: '#DBEAFE' },
  jobRefText: { fontSize: 13, fontWeight: '700', color: '#1E40AF', flex: 1 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: COLORS.primary, marginTop: SPACING.md, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1.2 },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  checkChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 8, borderRadius: ROUNDED.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  checkChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  checkChipTextActive: { color: '#fff' },
  textarea: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: ROUNDED.md, padding: SPACING.sm, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.surface, textAlignVertical: 'top', minHeight: 90, marginBottom: SPACING.sm },
  photoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md },
  photoCount: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, backgroundColor: `${COLORS.secondary}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: ROUNDED.full },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm, marginTop: 8 },
  addPhotoBtn: { width: 100, height: 100, borderRadius: ROUNDED.md, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF6FF' },
  addPhotoText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  photoThumb: { width: 100, height: 100, borderRadius: ROUNDED.md, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: '100%', height: '100%' },
  photoBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  photoBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  removePhotoBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  addVideoBtn: { height: 100, borderRadius: ROUNDED.md, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF6FF', marginTop: 8 },
  videoContainer: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: ROUNDED.md, backgroundColor: COLORS.surface, marginTop: 8 },
  videoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  videoSubTitle: { fontSize: 12, color: COLORS.textSecondary },
  removeVideoBtn: { padding: SPACING.sm },
  submitSection: { marginTop: SPACING.sm },
  submittingBox: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
  submittingText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  submitBtn: { flexDirection: 'row', height: 54, borderRadius: ROUNDED.md, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  submitNote: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 18 },
  otpSection: { gap: SPACING.sm },
  otpSuccessBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: ROUNDED.md, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.success },
  otpSuccessText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.success },
  otpInstruction: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  verifySection: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: ROUNDED.md, padding: SPACING.md, gap: SPACING.sm },
  verifyTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
  otpInput: { flex: 1, height: 52, borderWidth: 1.5, borderRadius: ROUNDED.sm, borderColor: COLORS.border, backgroundColor: '#fff', fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  otpErrorText: { fontSize: 12, fontWeight: '700', color: COLORS.danger },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: SPACING.xs, gap: 6 },
  resendText: { fontSize: 13, color: COLORS.textSecondary },
  resendBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.secondary },
  verifyBtn: { flexDirection: 'row', height: 48, borderRadius: ROUNDED.md, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  verifiedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.successLight, borderRadius: ROUNDED.md, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.success },
  verifiedText: { fontSize: 14, fontWeight: '700', color: COLORS.success },
  backBtn: { alignItems: 'center', paddingVertical: SPACING.md },
  backBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  extraChargesWrapper: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, borderWidth: 1.5, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm },
  warrantyCardWrapper: { backgroundColor: COLORS.surface, borderRadius: ROUNDED.md, borderWidth: 1.5, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  simpleInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: ROUNDED.sm, paddingHorizontal: 12, height: 40, fontSize: 14, color: COLORS.textPrimary, backgroundColor: '#fff', width: 140, textAlign: 'right' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  totalPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1.5, borderTopColor: COLORS.divider, marginTop: 14, paddingTop: 10 },
  totalPreviewLabel: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  totalPreviewVal: { fontSize: 16, fontWeight: '900', color: COLORS.secondary },
});
