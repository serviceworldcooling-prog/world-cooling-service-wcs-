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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={[dd.sheet, { backgroundColor: colors.background }]}>
          <View style={[dd.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[dd.sheetTitle, { color: colors.text }]}>Select a Service</Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={[dd.closeBtn, { backgroundColor: colors.card }]}>
              <Icons.X size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

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
                  <View style={[dd.itemIconBox, { backgroundColor: isSelected ? colors.primary + '20' : colors.background }]}>
                    <SvcIcon name={item.icon} size={20} color={isSelected ? colors.primary : colors.textSecondary} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[dd.itemTitle, { color: colors.text }]}>{item.title}</Text>
                    <View style={dd.itemMetaRow}>
                      <Icons.Clock size={11} color={colors.textSecondary} />
                      <Text style={[dd.itemMeta, { color: colors.textSecondary }]}>
                        {' '}{item.estimatedTime || '1-2 hrs'}
                      </Text>
                    </View>
                  </View>

                  <View style={[dd.pricePill, { backgroundColor: isSelected ? colors.primary : colors.primary + '12' }]}>
                    <Text style={[dd.priceText, { color: isSelected ? '#fff' : colors.primary }]}>
                      ₹{item.basePrice}
                    </Text>
                  </View>

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
  trigger:       { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, minHeight: 58 },
  iconBox:       { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  placeholder:   { flex: 1, fontSize: 13, fontWeight: '600' },
  selectedTitle: { fontSize: 13, fontWeight: '800' },
  selectedMeta:  { fontSize: 11, marginTop: 1, fontWeight: '700' },
  overlay:    { flex: 1, backgroundColor: '#00000040' },
  sheet:      { borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '75%', paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20 },
  sheetHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  sheetTitle: { fontSize: 15, fontWeight: '800' },
  closeBtn:   { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  list:       { paddingHorizontal: 16, paddingTop: 12, gap: 10, paddingBottom: 16 },
  item:        { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, padding: 14 },
  itemIconBox: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemTitle:   { fontSize: 13, fontWeight: '800' },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  itemMeta:    { fontSize: 11, fontWeight: '600' },
  pricePill:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginHorizontal: 8 },
  priceText:   { fontSize: 13, fontWeight: '800' },
  radio:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot:    { width: 10, height: 10, borderRadius: 5 },
});

export default function RequestServiceScreen() {
  const { themeMode, addresses, loadAddresses, createBooking } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  // ── Form state
  const [selectedSvc, setSelectedSvc]         = useState<Service | null>(null);
  const [problemDesc, setProblemDesc]          = useState('');
  const [selectedAddr, setSelectedAddr]        = useState(addresses[0]?._id || 'live');
  const [addrDropdownOpen, setAddrDropdownOpen] = useState(false);
  const [liveLocationStr, setLiveLocationStr] = useState('');
  const [liveCoords, setLiveCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fetchingLive, setFetchingLive] = useState(false);

  // Custom Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Custom Time Picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  const [services, setServices]   = useState<Service[]>([]);
  const [svcLoading, setSvcLoading] = useState(true);
  const [svcError, setSvcError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAddresses(); }, []);
  useEffect(() => {
    if (addresses.length > 0 && selectedAddr === 'live' && !liveLocationStr) {
      setSelectedAddr(addresses[0]._id);
    }
  }, [addresses]);

  useEffect(() => {
    setSvcLoading(true);
    setSvcError('');
    getServices()
      .then(list => setServices(list ?? []))
      .catch(() => setSvcError('Could not load services.'))
      .finally(() => setSvcLoading(false));
  }, []);

  const handleFetchLiveLocation = async () => {
    setFetchingLive(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const addressString = `${geocode.name || geocode.street || ''}, ${geocode.city || ''}, ${geocode.region || ''}`.replace(/^,\s*|,\s*$/g, '') || `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
        
        setLiveLocationStr(addressString);
        setLiveCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        setSelectedAddr('live');
        setAddrDropdownOpen(false);
        Alert.alert("Success", "Live location fetched successfully!");
      } else {
        Alert.alert("Permission Denied", "Location permission is required.");
      }
    } catch (err: any) {
      Alert.alert('Location Error', err.message || 'Could not get location.');
    } finally {
      setFetchingLive(false);
    }
  };

  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.getDate()).padStart(2, '0');
  const formattedDateString = `${y}-${m}-${d}`;
  const formattedTimeString = `${selectedHour}:${selectedMinute < 10 ? '0' + selectedMinute : selectedMinute} ${selectedPeriod}`;

  const getSelectedAddressText = () => {
    if (selectedAddr === 'live') {
      return liveLocationStr || 'Current Live Location (Not requested yet)';
    }
    const matched = addresses.find(a => a._id === selectedAddr);
    return matched ? `${matched.label}: ${matched.address}` : 'Select an address';
  };

  const handleSubmit = async () => {
    if (!selectedSvc) {
      Alert.alert('Select Service', 'Please select a service from the list.');
      return;
    }

    let addressStr = '';
    let lat: number | null = null;
    let lng: number | null = null;

    if (selectedAddr === 'live') {
      if (!liveLocationStr) {
        Alert.alert("Location Required", "Please click the 'Live Location' button to fetch your address.");
        return;
      }
      addressStr = liveLocationStr;
      lat = liveCoords?.latitude ?? null;
      lng = liveCoords?.longitude ?? null;
    } else {
      const matched = addresses.find(a => a._id === selectedAddr);
      if (!matched) {
        Alert.alert("Address Required", "Please select a saved address.");
        return;
      }
      addressStr = matched.address;
      lat = matched.lat ?? null;
      lng = matched.lng ?? null;
    }

    setSubmitting(true);
    try {
      await createBooking({
        serviceType: selectedSvc.category,
        problemDescription: problemDesc,
        preferredDate: formattedDateString,
        preferredTime: formattedTimeString,
        address: addressStr,
        lat,
        lng,
        isLiveLocation: selectedAddr === 'live',
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

  // Custom Calendar Generator
  const renderCustomCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<View key={`empty-${i}`} style={s.calDayBox} />);
    }

    for (let d = 1; d <= lastDay; d++) {
      const isSelected = selectedDate.getDate() === d && 
                         selectedDate.getMonth() === month && 
                         selectedDate.getFullYear() === year;

      days.push(
        <TouchableOpacity 
          key={d} 
          style={[s.calDayBox, isSelected && { backgroundColor: colors.primary }]}
          onPress={() => {
            setSelectedDate(new Date(year, month, d));
            setShowCalendar(false);
          }}
        >
          <Text style={[s.calDayText, { color: isSelected ? '#FFF' : colors.text }]}>{d}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[s.customCalendarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.calHeader}>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <Icons.ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.calTitle, { color: colors.text }]}>{months[month]} {year}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <Icons.ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={s.calWeekdays}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => (
            <Text key={w} style={[s.weekdayText, { color: colors.textSecondary }]}>{w}</Text>
          ))}
        </View>

        <View style={s.calGrid}>{days}</View>
      </View>
    );
  };

  // Custom Clock Picker
  const renderCustomWatchPicker = () => {
    return (
      <View style={[s.customWatchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[s.watchLabel, { color: colors.textSecondary }]}>SET PREFERRED TIME</Text>
        
        <View style={s.watchSelectorRow}>
          <View style={s.dialCol}>
            <Text style={[s.dialHeader, { color: colors.textSecondary }]}>Hour</Text>
            <ScrollView style={s.dialScroll} showsVerticalScrollIndicator={false}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                <TouchableOpacity 
                  key={h} 
                  style={[s.dialItem, selectedHour === h && { backgroundColor: colors.primary + '18' }]}
                  onPress={() => setSelectedHour(h)}
                >
                  <Text style={[s.dialText, { color: selectedHour === h ? colors.primary : colors.text }]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={[s.dialColon, { color: colors.text }]}>:</Text>

          <View style={s.dialCol}>
            <Text style={[s.dialHeader, { color: colors.textSecondary }]}>Min</Text>
            <ScrollView style={s.dialScroll} showsVerticalScrollIndicator={false}>
              {[0, 15, 30, 45].map(m => (
                <TouchableOpacity 
                  key={m} 
                  style={[s.dialItem, selectedMinute === m && { backgroundColor: colors.primary + '18' }]}
                  onPress={() => setSelectedMinute(m)}
                >
                  <Text style={[s.dialText, { color: selectedMinute === m ? colors.primary : colors.text }]}>
                    {m < 10 ? '0' + m : m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.periodCol}>
            <TouchableOpacity 
              style={[s.periodBtn, selectedPeriod === 'AM' && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedPeriod('AM')}
            >
              <Text style={[s.periodText, { color: selectedPeriod === 'AM' ? '#FFF' : colors.text }]}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[s.periodBtn, selectedPeriod === 'PM' && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedPeriod('PM')}
            >
              <Text style={[s.periodText, { color: selectedPeriod === 'PM' ? '#FFF' : colors.text }]}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[s.confirmWatchBtn, { backgroundColor: colors.primary }]} onPress={() => setShowTimePicker(false)}>
          <Text style={s.confirmWatchBtnText}>Confirm Time</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[s.container, bgStyle]}>
      <View style={[
        s.header,
        {
          borderBottomColor: colors.primary + '30',
          backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF',
          paddingTop: Math.max(12, insets.top),
        }
      ]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>REQUEST AC SERVICE</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.banner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
          <Icons.Info size={15} color={colors.primary} />
          <Text style={[s.bannerText, { color: colors.primary }]}>
            Pick a service — admin will assign a certified technician and confirm pricing.
          </Text>
        </View>

        {/* Services Dropdown */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <View style={[s.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>SELECT A SERVICE *</Text>
          </View>
        </View>
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

        {/* Describe Problem */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <View style={[s.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>DESCRIBE THE PROBLEM (OPTIONAL)</Text>
          </View>
        </View>
        <RNTextInput
          placeholder="E.g. AC not cooling, making loud noise..."
          placeholderTextColor={colors.textSecondary}
          value={problemDesc}
          onChangeText={setProblemDesc}
          multiline
          numberOfLines={4}
          style={[s.textarea, { backgroundColor: colors.card, borderColor: colors.primary + '30', color: colors.text }]}
        />

        {/* Date & Time with Custom Calendar and Clock */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <View style={[s.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>PREFERRED DATE & TIME</Text>
          </View>
        </View>
        <View style={s.dateRow}>
          <TouchableOpacity
            style={[s.dateBtn, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
            onPress={() => {
              setShowCalendar(!showCalendar);
              setShowTimePicker(false);
            }}
          >
            <Icons.Calendar size={16} color={colors.primary} />
            <Text style={[s.dateBtnText, { color: colors.text }]}>{formattedDateString}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.dateBtn, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
            onPress={() => {
              setShowTimePicker(!showTimePicker);
              setShowCalendar(false);
            }}
          >
            <Icons.Clock size={16} color={colors.primary} />
            <Text style={[s.dateBtnText, { color: colors.text }]}>{formattedTimeString}</Text>
          </TouchableOpacity>
        </View>

        {showCalendar && renderCustomCalendar()}
        {showTimePicker && renderCustomWatchPicker()}

        {/* Service Location - custom address dropdown + Live Location button */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <View style={[s.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>SERVICE LOCATION *</Text>
          </View>
        </View>

        <View style={s.addressDropdownRow}>
          <TouchableOpacity 
            style={[s.dropdownTrigger, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
            onPress={() => setAddrDropdownOpen(!addrDropdownOpen)}
          >
            <Icons.MapPin size={18} color={colors.primary} />
            <Text numberOfLines={1} style={[s.dropdownText, { color: colors.text }]}>
              {getSelectedAddressText()}
            </Text>
            <Icons.ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.liveLocBtn, { backgroundColor: colors.primary }]}
            onPress={handleFetchLiveLocation}
            disabled={fetchingLive}
          >
            {fetchingLive ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icons.Navigation size={14} color="#FFF" />
                <Text style={s.liveLocBtnText}>Live Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {addrDropdownOpen && (
          <View style={[s.dropdownOptionsList, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
            {liveLocationStr !== '' && (
              <TouchableOpacity 
                style={[s.dropdownOptionItem, selectedAddr === 'live' && { backgroundColor: colors.primary + '12' }]}
                onPress={() => {
                  setSelectedAddr('live');
                  setAddrDropdownOpen(false);
                }}
              >
                <Icons.Navigation size={14} color={colors.primary} style={{ marginRight: 8 }} />
                <Text numberOfLines={1} style={[s.dropdownOptionText, { color: colors.text }]}>
                  📍 Current Live Location
                </Text>
              </TouchableOpacity>
            )}
            
            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr._id}
                style={[s.dropdownOptionItem, selectedAddr === addr._id && { backgroundColor: colors.primary + '12' }]}
                onPress={() => {
                  setSelectedAddr(addr._id);
                  setAddrDropdownOpen(false);
                }}
              >
                <Icons.MapPin size={14} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text numberOfLines={1} style={[s.dropdownOptionText, { color: colors.text }]}>
                  {addr.label}: {addr.address}
                </Text>
              </TouchableOpacity>
            ))}

            {addresses.length === 0 && liveLocationStr === '' && (
              <Text style={{ padding: 12, fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
                No addresses saved. Tap Live Location to track.
              </Text>
            )}
          </View>
        )}

        {/* Submit */}
        <View style={{ marginTop: 32 }}>
          {selectedSvc && (
            <View style={[s.summaryStrip, { backgroundColor: colors.primary }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.summaryTitle} numberOfLines={1}>{selectedSvc.title}</Text>
                <Text style={s.summaryMeta}>{selectedSvc.estimatedTime} · {formattedTimeString} · {formattedDateString}</Text>
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
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1.5 },
  backBtn:      { width: 36, height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
  scroll:       { paddingHorizontal: 16, paddingBottom: 52 },
  banner:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1.5, borderRadius: 12, padding: 14, marginTop: 12 },
  bannerText:   { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleDot: { width: 4, height: 4, borderRadius: 2 },
  errorText:    { fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: '600' },
  textarea:     { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 13, minHeight: 100, textAlignVertical: 'top', fontWeight: '500' },

  // Date / time picker
  dateRow:      { flexDirection: 'row', gap: 12 },
  dateBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, padding: 14 },
  dateBtnText:  { flex: 1, fontWeight: '600', fontSize: 13 },

  // Custom Calendar
  customCalendarContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  calWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    width: 32,
    textAlign: 'center',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calDayBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  calDayText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Custom Watch time picker
  customWatchContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  watchLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  watchSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    height: 140,
  },
  dialCol: {
    width: 60,
    height: '100%',
    alignItems: 'center',
  },
  dialHeader: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  dialScroll: {
    flex: 1,
    width: '100%',
  },
  dialItem: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  dialText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dialColon: {
    fontSize: 22,
    fontWeight: '800',
    paddingBottom: 20,
  },
  periodCol: {
    gap: 8,
    justifyContent: 'center',
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '800',
  },
  confirmWatchBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  confirmWatchBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Address Dropdown
  addressDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  dropdownText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  liveLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  liveLocBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dropdownOptionsList: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 6,
    padding: 6,
  },
  dropdownOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  dropdownOptionText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // Summary + submit
  summaryStrip:      { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 14, gap: 12 },
  summaryTitle:      { color: '#fff', fontSize: 13, fontWeight: '800' },
  summaryMeta:       { color: '#ffffff99', fontSize: 11, marginTop: 2, fontWeight: '600' },
  summaryPriceBox:   { alignItems: 'flex-end' },
  summaryPriceLabel: { color: '#ffffff99', fontSize: 10, fontWeight: '700' },
  summaryPrice:      { color: '#fff', fontSize: 20, fontWeight: '900' },
  submitNote:        { fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18, fontWeight: '600' },
});
