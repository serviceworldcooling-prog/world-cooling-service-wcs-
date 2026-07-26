import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput as RNTextInput, Alert,
  ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import { getServices, Service } from '../../api/serviceApi';

const TIME_SLOTS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];

// ─── Icon helper ──────────────────────────────────────────────────────────────
function SvcIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const Comp = (Icons as any)[name] ?? Icons.Wrench;
  return <Comp size={size} color={color} />;
}

// ─── Service Dropdown ─────────────────────────────────────────────────────────
function ServiceDropdown({
  services, selected, onSelect, loading, colors,
}: {
  services: Service[];
  selected: Service | null;
  onSelect: (s: Service) => void;
  loading: boolean;
  colors: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !loading && setOpen(true)}
        style={[
          dd.trigger,
          {
            backgroundColor: colors.card,
            borderColor: selected ? colors.primary : colors.border,
            borderWidth: selected ? 2 : 1,
          },
        ]}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[dd.placeholder, { color: colors.textSecondary }]}>Loading services…</Text>
          </>
        ) : selected ? (
          <>
            <View style={[dd.iconBox, { backgroundColor: colors.primary + '18' }]}>
              <SvcIcon name={selected.icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[dd.selectedTitle, { color: colors.text }]} numberOfLines={1}>{selected.title}</Text>
              <Text style={[dd.selectedMeta, { color: colors.textSecondary }]}>
                ₹{selected.basePrice}  ·  {selected.estimatedTime || '1-2 hours'}
              </Text>
            </View>
            <Icons.CheckCircle size={18} color={colors.primary} />
          </>
        ) : (
          <>
            <Icons.ListChecks size={18} color={colors.textSecondary} />
            <Text style={[dd.placeholder, { color: colors.textSecondary }]}>Tap to select a service…</Text>
          </>
        )}
        <Icons.ChevronDown size={16} color={selected ? colors.primary : colors.textSecondary} style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={[dd.sheet, { backgroundColor: colors.background }]}>

          {/* Sheet header */}
          <View style={[dd.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[dd.sheetTitle, { color: colors.text }]}>Select a Service</Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={[dd.closeBtn, { backgroundColor: colors.card }]}>
              <Icons.X size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* List of services */}
          <FlatList
            data={services}
            keyExtractor={item => item._id}
            contentContainerStyle={dd.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selected?._id === item._id;
              return (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => { onSelect(item); setOpen(false); }}
                  style={[
                    dd.item,
                    {
                      backgroundColor: isSelected ? colors.primary + '10' : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {/* Icon */}
                  <View style={[dd.itemIconBox, { backgroundColor: isSelected ? colors.primary + '20' : colors.background }]}>
                    <SvcIcon name={item.icon} size={20} color={isSelected ? colors.primary : colors.textSecondary} />
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[dd.itemTitle, { color: colors.text }]}>{item.title}</Text>
                    <View style={dd.itemMetaRow}>
                      <Icons.Clock size={11} color={colors.textSecondary} />
                      <Text style={[dd.itemMeta, { color: colors.textSecondary }]}>
                        {' '}{item.estimatedTime || '1-2 hrs'}
                      </Text>
                      {item.inclusions?.length > 0 && (
                        <Text style={[dd.itemMeta, { color: colors.textSecondary }]}>
                          {' · '}{item.inclusions.length} inclusions
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Price */}
                  <View style={[dd.pricePill, { backgroundColor: isSelected ? colors.primary : colors.primary + '12' }]}>
                    <Text style={[dd.priceText, { color: isSelected ? '#fff' : colors.primary }]}>
                      ₹{item.basePrice}
                    </Text>
                  </View>

                  {/* Radio */}
                  <View style={[dd.radio, { borderColor: isSelected ? colors.primary : colors.border }]}>
                    {isSelected && <View style={[dd.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const dd = StyleSheet.create({
  // Trigger
  trigger:       { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, padding: 14, minHeight: 58 },
  iconBox:       { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  placeholder:   { flex: 1, fontSize: 14, fontWeight: '500' },
  selectedTitle: { fontSize: 14, fontWeight: '800' },
  selectedMeta:  { fontSize: 12, marginTop: 1 },

  // Modal
  overlay:    { flex: 1, backgroundColor: '#00000040' },
  sheet:      { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '75%', paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20 },
  sheetHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  sheetTitle: { fontSize: 17, fontWeight: '800' },
  closeBtn:   { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  list:       { paddingHorizontal: 16, paddingTop: 12, gap: 10, paddingBottom: 16 },

  // Item
  item:        { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1.5, padding: 14 },
  itemIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemTitle:   { fontSize: 14, fontWeight: '800' },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  itemMeta:    { fontSize: 12 },
  pricePill:   { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginHorizontal: 8 },
  priceText:   { fontSize: 14, fontWeight: '800' },
  radio:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot:    { width: 10, height: 10, borderRadius: 5 },
});


export default function RequestServiceScreen() {
  const { themeMode, addresses, loadAddresses, createBooking } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  // ── Form state
  const [selectedSvc, setSelectedSvc]         = useState<Service | null>(null);
  const [problemDesc, setProblemDesc]          = useState('');
  const [selectedAddr, setSelectedAddr]        = useState('');
  const [date, setDate]                        = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime]                        = useState('10:00 AM');
  const [timePickerOpen, setTimePickerOpen]    = useState(false);
  const [liveLocationEnabled, setLiveLocation] = useState(false);
  const [locLoading, setLocLoading]            = useState(false);
  const [coords, setCoords]                    = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting]            = useState(false);

  // ── Services list state
  const [services, setServices]   = useState<Service[]>([]);
  const [svcLoading, setSvcLoading] = useState(true);
  const [svcError, setSvcError]   = useState('');

  // Load addresses + all services on mount
  useEffect(() => { loadAddresses(); }, []);
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddr) setSelectedAddr(addresses[0]._id);
  }, [addresses]);

  useEffect(() => {
    setSvcLoading(true);
    setSvcError('');
    getServices()
      .then(list => setServices(list ?? []))
      .catch(() => setSvcError('Could not load services. Pull to refresh.'))
      .finally(() => setSvcLoading(false));
  }, []);

  const handleEnableLiveLocation = async () => {
    setLocLoading(true);
    try {
      // 1. Check if location services are enabled on the device
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Disabled',
          'Please enable Location Services on your device (Settings → Location), then try again.',
          [{ text: 'OK' }]
        );
        setLocLoading(false);
        return;
      }

      // 2. Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to share your live location with the technician. Please allow it in Settings.',
          [{ text: 'OK' }]
        );
        setLocLoading(false);
        return;
      }

      // 3. Get current position (high accuracy)
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lng: longitude });
      setLiveLocation(true);
    } catch (err: any) {
      Alert.alert('Location Error', err.message || 'Could not get your location. Please try again.');
    } finally {
      setLocLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSvc) {
      Alert.alert('Select Service', 'Please select a service from the list.');
      return;
    }
    if (!selectedAddr && !liveLocationEnabled) {
      Alert.alert('Add Location', 'Please select a saved address or share your live location.');
      return;
    }
    const addrObj = addresses.find(a => a._id === selectedAddr);
    const addressStr = liveLocationEnabled
      ? `Live Location (${coords?.lat}, ${coords?.lng})`
      : addrObj?.address || '';

    setSubmitting(true);
    try {
      await createBooking({
        serviceType: selectedSvc.category,
        problemDescription: problemDesc,
        preferredDate: date,
        preferredTime: time,
        address: addressStr,
        lat: liveLocationEnabled ? coords?.lat : null,
        lng: liveLocationEnabled ? coords?.lng : null,
        isLiveLocation: liveLocationEnabled,
        price: selectedSvc.basePrice,
      });
      Alert.alert(
        '✅ Request Submitted!',
        'Your AC service request has been sent. A technician will be assigned shortly.',
        [{ text: 'View My Bookings', onPress: () => router.replace('/(tabs)/bookings') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Icons.ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>Request AC Service</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Info banner */}
        <View style={[s.banner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
          <Icons.Info size={15} color={colors.primary} />
          <Text style={[s.bannerText, { color: colors.primary }]}>
            Pick a service — admin will assign a certified technician and confirm pricing.
          </Text>
        </View>

        {/* ── Services Dropdown ────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Select a Service *</Text>
        <ServiceDropdown
          services={services}
          selected={selectedSvc}
          onSelect={setSelectedSvc}
          loading={svcLoading}
          colors={colors}
        />
        {svcError ? (
          <Text style={[s.errorText, { color: '#EF4444' }]}>{svcError}</Text>
        ) : null}

        {/* Selected service detail card */}
        {selectedSvc && (
          <View style={[s.detailCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '25' }]}>
            {!!selectedSvc.description && (
              <Text style={[s.detailDesc, { color: colors.textSecondary }]}>{selectedSvc.description}</Text>
            )}
            {selectedSvc.inclusions?.length > 0 && (
              <View style={{ marginTop: selectedSvc.description ? 10 : 0 }}>
                <Text style={[s.inclusionsTitle, { color: colors.text }]}>What's included</Text>
                {selectedSvc.inclusions.map((item, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Icons.CheckCircle size={13} color={colors.primary} />
                    <Text style={[s.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Problem Description ──────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          Describe the Problem
          <Text style={{ fontWeight: '500', fontSize: 13, color: colors.textSecondary }}> (Optional)</Text>
        </Text>
        <RNTextInput
          placeholder="E.g. AC not cooling, making loud noise..."
          placeholderTextColor={colors.textSecondary}
          value={problemDesc}
          onChangeText={setProblemDesc}
          multiline
          numberOfLines={4}
          style={[s.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        {/* ── Date & Time ──────────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Preferred Date & Time</Text>
        <View style={s.dateRow}>
          <TouchableOpacity
            style={[s.dateBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert('Select Date', 'Date picker — coming soon')}
          >
            <Icons.Calendar size={16} color={colors.primary} />
            <Text style={[s.dateBtnText, { color: colors.text }]}>{date}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.dateBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setTimePickerOpen(v => !v)}
          >
            <Icons.Clock size={16} color={colors.primary} />
            <Text style={[s.dateBtnText, { color: colors.text }]}>{time}</Text>
            <Icons.ChevronDown size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {timePickerOpen && (
          <View style={[s.timeGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {TIME_SLOTS.map(slot => (
              <TouchableOpacity
                key={slot}
                onPress={() => { setTime(slot); setTimePickerOpen(false); }}
                style={[
                  s.timeSlot,
                  { borderColor: time === slot ? colors.primary : colors.border },
                  time === slot && { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Text style={[s.timeSlotText, { color: time === slot ? colors.primary : colors.text }]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Location ─────────────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Service Location *</Text>
        <View style={[s.liveCard, {
          backgroundColor: liveLocationEnabled ? '#ECFDF5' : colors.card,
          borderColor: liveLocationEnabled ? '#10B981' : colors.border,
        }]}>
          <View style={s.liveLeft}>
            <View style={[s.liveIconBox, { backgroundColor: liveLocationEnabled ? '#D1FAE5' : colors.primary + '15' }]}>
              <Icons.Navigation size={20} color={liveLocationEnabled ? '#10B981' : colors.primary} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[s.liveTitle, { color: liveLocationEnabled ? '#065F46' : colors.text }]}>
                {liveLocationEnabled ? '📍 Live Location Active' : 'Share Live Location'}
              </Text>
              <Text style={[s.liveSub, { color: liveLocationEnabled ? '#059669' : colors.textSecondary }]}>
                {liveLocationEnabled
                  ? `${coords?.lat.toFixed(5)}, ${coords?.lng.toFixed(5)}`
                  : 'Tap Enable — technician navigates to you'}
              </Text>
            </View>
          </View>

          {locLoading ? (
            <View style={s.liveAction}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[s.locLoadText, { color: colors.textSecondary }]}>Locating…</Text>
            </View>
          ) : liveLocationEnabled ? (
            <View style={s.liveActions}>
              {/* Refresh */}
              <TouchableOpacity
                onPress={handleEnableLiveLocation}
                style={[s.refreshBtn, { borderColor: '#10B981' }]}
              >
                <Icons.RefreshCw size={14} color="#10B981" />
              </TouchableOpacity>
              {/* Remove */}
              <TouchableOpacity
                onPress={() => { setLiveLocation(false); setCoords(null); }}
                style={[s.removeBtn, { backgroundColor: '#FEE2E2' }]}
              >
                <Icons.XCircle size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleEnableLiveLocation}
              style={[s.enableBtn, { backgroundColor: colors.primary }]}
            >
              <Icons.MapPin size={13} color="#FFF" />
              <Text style={s.enableText}>Enable</Text>
            </TouchableOpacity>
          )}
        </View>

        {!liveLocationEnabled && (
          <>
            <View style={s.orRow}>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <Text style={[s.orText, { color: colors.textSecondary }]}>OR use saved address</Text>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
            </View>
            {addresses.length === 0 ? (
              <TouchableOpacity onPress={() => router.push('/screens/saved-addresses')} style={[s.addAddrBtn, { borderColor: colors.primary }]}>
                <Icons.PlusCircle size={18} color={colors.primary} />
                <Text style={[s.addAddrText, { color: colors.primary }]}>Add New Address</Text>
              </TouchableOpacity>
            ) : addresses.map(addr => (
              <TouchableOpacity
                key={addr._id}
                onPress={() => setSelectedAddr(addr._id)}
                style={[s.addrCard, {
                  backgroundColor: colors.card,
                  borderColor: selectedAddr === addr._id ? colors.primary : colors.border,
                  borderWidth: selectedAddr === addr._id ? 2 : 1,
                }]}
              >
                <Icons.MapPin size={16} color={selectedAddr === addr._id ? colors.primary : colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[s.addrLabel, { color: colors.text }]}>{addr.label}</Text>
                  <Text style={[s.addrText, { color: colors.textSecondary }]} numberOfLines={2}>{addr.address}</Text>
                </View>
                {selectedAddr === addr._id && <Icons.CheckCircle size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── Submit ───────────────────────────────────────────────────────── */}
        <View style={{ marginTop: 32 }}>
          {/* Booking summary strip */}
          {selectedSvc && (
            <View style={[s.summaryStrip, { backgroundColor: colors.primary }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.summaryTitle} numberOfLines={1}>{selectedSvc.title}</Text>
                <Text style={s.summaryMeta}>{selectedSvc.estimatedTime} · {time} · {date}</Text>
              </View>
              <View style={s.summaryPriceBox}>
                <Text style={s.summaryPriceLabel}>Est. Price</Text>
                <Text style={s.summaryPrice}>₹{selectedSvc.basePrice}</Text>
              </View>
            </View>
          )}
          <PrimaryButton
            title={submitting ? 'Submitting…' : 'Submit Service Request'}
            onPress={handleSubmit}
            loading={submitting}
          />
          <Text style={[s.submitNote, { color: colors.textSecondary }]}>
            Admin will review and assign a certified technician.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '800' },
  scroll:       { paddingHorizontal: 20, paddingBottom: 52 },

  banner:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  bannerText:   { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },

  sectionTitle: { fontSize: 15, fontWeight: '800', marginTop: 24, marginBottom: 10 },

  centerRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  loadingText:  { fontSize: 14 },
  errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, padding: 14 },
  errorText:    { fontSize: 13, flex: 1 },

  // Service list
  svcList:      { gap: 10 },
  svcCard:      { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  svcRow:       { flexDirection: 'row', alignItems: 'center', padding: 14 },
  svcIconBox:   { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  svcTitle:     { fontSize: 14, fontWeight: '800' },
  metaRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  metaText:     { fontSize: 12 },
  priceCol:     { alignItems: 'flex-end', marginRight: 10 },
  priceAmt:     { fontSize: 18, fontWeight: '900' },
  priceLabel:   { fontSize: 10, fontWeight: '600', marginTop: 1 },
  radioOuter:   { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner:   { width: 10, height: 10, borderRadius: 5 },

  // Selected service detail card (below dropdown)
  detailCard:      { borderWidth: 1.5, borderRadius: 18, padding: 14, marginTop: 10 },
  detailDesc:      { fontSize: 13, lineHeight: 19 },
  inclusionsTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  bulletRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 5 },
  bulletText:      { fontSize: 13, flex: 1, lineHeight: 18 },
  textarea:     { borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 14, minHeight: 100, textAlignVertical: 'top' },

  // Date / time
  dateRow:      { flexDirection: 'row', gap: 12 },
  dateBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 16, padding: 14 },
  dateBtnText:  { flex: 1, fontWeight: '600', fontSize: 14 },
  timeGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, borderWidth: 1, borderRadius: 16, padding: 12 },
  timeSlot:     { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  timeSlotText: { fontSize: 13, fontWeight: '700' },

  // Live location
  liveCard:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 20, padding: 16 },
  liveLeft:     { flex: 1, flexDirection: 'row', alignItems: 'center' },
  liveIconBox:  { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  liveTitle:    { fontSize: 14, fontWeight: '800' },
  liveSub:      { fontSize: 12, marginTop: 2 },
  liveAction:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveActions:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locLoadText:  { fontSize: 11, fontWeight: '600' },
  refreshBtn:   { width: 32, height: 32, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  removeBtn:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  enableBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  enableText:   { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Address
  orRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  divider:      { flex: 1, height: 1 },
  orText:       { fontSize: 12, fontWeight: '700' },
  addAddrBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 16, padding: 16, borderStyle: 'dashed' },
  addAddrText:  { fontWeight: '700' },
  addrCard:     { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 20, padding: 16, marginBottom: 10 },
  addrLabel:    { fontSize: 13, fontWeight: '800' },
  addrText:     { fontSize: 12, marginTop: 2, lineHeight: 16 },

  // Summary + submit
  summaryStrip:      { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, marginBottom: 14, gap: 12 },
  summaryTitle:      { color: '#fff', fontSize: 14, fontWeight: '800' },
  summaryMeta:       { color: '#ffffff99', fontSize: 12, marginTop: 2 },
  summaryPriceBox:   { alignItems: 'flex-end' },
  summaryPriceLabel: { color: '#ffffff99', fontSize: 10, fontWeight: '700' },
  summaryPrice:      { color: '#fff', fontSize: 22, fontWeight: '900' },
  submitNote:        { fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
