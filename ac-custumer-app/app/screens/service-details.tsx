import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput as RNTextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { CATEGORIES } from '../../constants/mocks';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import * as Location from 'expo-location';
import { getServiceById } from '../../api/serviceApi';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { themeMode, addresses, loadAddresses, createBooking } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  const [service, setService] = useState<any>(null);
  const [loadingService, setLoadingService] = useState(true);

  // Address
  const [selectedAddr, setSelectedAddr] = useState(addresses[0]?._id || 'live');
  const [addrDropdownOpen, setAddrDropdownOpen] = useState(false);
  const [liveLocationStr, setLiveLocationStr] = useState<string>('');
  const [liveCoords, setLiveCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fetchingLive, setFetchingLive] = useState(false);

  // Problem Desc
  const [desc, setDesc] = useState('');

  // Custom Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Custom Time Picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
    if (id) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id as string);
      if (isObjectId) {
        getServiceById(id as string)
          .then(res => {
            if (res) setService(res);
            else {
              const mockSvc = CATEGORIES.find(c => c.id === id);
              setService(mockSvc || CATEGORIES[0]);
            }
          })
          .catch(() => {
            const mockSvc = CATEGORIES.find(c => c.id === id);
            setService(mockSvc || CATEGORIES[0]);
          })
          .finally(() => setLoadingService(false));
      } else {
        const mockSvc = CATEGORIES.find(c => c.id === id);
        setService(mockSvc || CATEGORIES[0]);
        setLoadingService(false);
      }
    } else {
      setService(CATEGORIES[0] as any);
      setLoadingService(false);
    }
  }, [id]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddr === 'live' && !liveLocationStr) {
      setSelectedAddr(addresses[0]._id);
    }
  }, [addresses]);

  // Format Date & Time strings for API
  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.getDate()).padStart(2, '0');
  const formattedDateString = `${y}-${m}-${d}`;
  const formattedTimeString = `${selectedHour}:${selectedMinute < 10 ? '0' + selectedMinute : selectedMinute} ${selectedPeriod}`;

  // Get active address string
  const getSelectedAddressText = () => {
    if (selectedAddr === 'live') {
      return liveLocationStr || 'Current Live Location (Not requested yet)';
    }
    const matched = addresses.find(a => a._id === selectedAddr);
    return matched ? `${matched.label}: ${matched.address}` : 'Select an address';
  };

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
        Alert.alert("Permission Denied", "Could not access location services.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to get location.");
    } finally {
      setFetchingLive(false);
    }
  };

  const handleProceedToPayment = async () => {
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
        Alert.alert("Address Required", "Please choose or add a service address.");
        return;
      }
      addressStr = matched.address;
      lat = matched.lat ?? null;
      lng = matched.lng ?? null;
    }

    setBookingLoading(true);
    try {
      const booking = await createBooking({
        serviceType: service.category || service.title,
        problemDescription: desc,
        preferredDate: formattedDateString,
        preferredTime: formattedTimeString,
        address: addressStr,
        lat,
        lng,
        isLiveLocation: selectedAddr === 'live',
        price: service.basePrice,
      });

      router.push({
        pathname: '/screens/booking-details',
        params: {
          id: booking._id,
        }
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to initiate booking. Please try again.');
    } finally {
      setBookingLoading(false);
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
    // Padding for empty days at start of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calDayBox} />);
    }

    for (let d = 1; d <= lastDay; d++) {
      const isSelected = selectedDate.getDate() === d && 
                         selectedDate.getMonth() === month && 
                         selectedDate.getFullYear() === year;

      days.push(
        <TouchableOpacity 
          key={d} 
          style={[styles.calDayBox, isSelected && { backgroundColor: colors.primary }]}
          onPress={() => {
            setSelectedDate(new Date(year, month, d));
            setShowCalendar(false);
          }}
        >
          <Text style={[styles.calDayText, { color: isSelected ? '#FFF' : colors.text }]}>{d}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.customCalendarContainer, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <Icons.ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.calTitle, { color: colors.text }]}>{months[month]} {year}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <Icons.ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.calWeekdays}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => (
            <Text key={w} style={[styles.weekdayText, { color: colors.textSecondary }]}>{w}</Text>
          ))}
        </View>

        <View style={styles.calGrid}>{days}</View>
      </View>
    );
  };

  // Custom Clock Picker
  const renderCustomWatchPicker = () => {
    // Trigonometry coordinate mapping for 12 hours on a circle of diameter 220
    const cx = 110;
    const cy = 110;
    const radius = 78;
    const itemSize = 34;

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
      <View style={[styles.customWatchContainer, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
        <Text style={[styles.watchLabel, { color: colors.textSecondary }]}>CHOOSE PREFERRED TIME</Text>
        
        <View style={styles.clockLayoutRow}>
          {/* Circular Clock Face */}
          <View style={[styles.clockFace, { borderColor: colors.border }]}>
            {/* Center cap */}
            <View style={[styles.clockCenterDot, { backgroundColor: colors.primary }]} />
            
            {/* Rotating Hand */}
            <View style={[
              styles.clockHandWrapper,
              { transform: [{ rotate: `${selectedHour * 30}deg` }] }
            ]}>
              <View style={[styles.clockHandLine, { backgroundColor: colors.primary }]} />
            </View>

            {/* Hours around the circle */}
            {hours.map(h => {
              const theta = (h * 30 - 90) * (Math.PI / 180);
              const x = cx + radius * Math.cos(theta) - itemSize / 2;
              const y = cy + radius * Math.sin(theta) - itemSize / 2;
              const isSelected = selectedHour === h;

              return (
                <TouchableOpacity
                  key={h}
                  activeOpacity={0.8}
                  style={[
                    styles.hourCircle,
                    {
                      left: x,
                      top: y,
                      width: itemSize,
                      height: itemSize,
                      borderRadius: itemSize / 2,
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedHour(h)}
                >
                  <Text style={[
                    styles.hourCircleText,
                    { color: isSelected ? '#FFF' : colors.text }
                  ]}>
                    {h}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Minutes & Period Column */}
          <View style={styles.clockRightPanel}>
            {/* AM / PM Segmented Control */}
            <View style={[styles.periodGroup, { borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.periodToggleBtn,
                  selectedPeriod === 'AM' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedPeriod('AM')}
              >
                <Text style={[
                  styles.periodToggleText,
                  { color: selectedPeriod === 'AM' ? '#FFF' : colors.text }
                ]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodToggleBtn,
                  selectedPeriod === 'PM' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedPeriod('PM')}
              >
                <Text style={[
                  styles.periodToggleText,
                  { color: selectedPeriod === 'PM' ? '#FFF' : colors.text }
                ]}>PM</Text>
              </TouchableOpacity>
            </View>

            {/* Minutes Grid */}
            <Text style={[styles.clockPanelLabel, { color: colors.textSecondary }]}>MINUTES</Text>
            <View style={styles.minutesGrid}>
              {[0, 15, 30, 45].map(m => {
                const isSelected = selectedMinute === m;
                return (
                  <TouchableOpacity
                    key={m}
                    activeOpacity={0.75}
                    style={[
                      styles.minuteGridBtn,
                      {
                        backgroundColor: isSelected ? colors.primary + '18' : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setSelectedMinute(m)}
                  >
                    <Text style={[
                      styles.minuteGridText,
                      { color: isSelected ? colors.primary : colors.text }
                    ]}>
                      {m === 0 ? '00' : m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Current Selection Preview */}
            <View style={[styles.timePreviewBox, { backgroundColor: colors.border + '30' }]}>
              <Icons.Clock size={12} color={colors.primary} />
              <Text style={[styles.timePreviewText, { color: colors.text }]}>
                {selectedHour}:{selectedMinute < 10 ? '0' + selectedMinute : selectedMinute} {selectedPeriod}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.confirmWatchBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowTimePicker(false)}
        >
          <Text style={styles.confirmWatchBtnText}>Confirm Selection</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loadingService || !service) {
    return (
      <SafeAreaView style={[styles.container, bgStyle, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <View style={[
        styles.header,
        {
          borderBottomColor: colors.primary + '30',
          backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF',
          paddingTop: Math.max(12, insets.top),
        }
      ]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{service.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {service.image ? (
          <Image source={{ uri: service.image }} style={styles.serviceImage} />
        ) : null}
        
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>SERVICE INFO</Text>
          </View>
        </View>
        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>{service.description}</Text>
          <Text style={[styles.basePriceText, { color: colors.primary }]}>Base Price: ₹{service.basePrice}</Text>
        </View>

        {/* Problem Description */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>PROBLEM DESCRIPTION (OPTIONAL)</Text>
          </View>
        </View>
        <RNTextInput
          placeholder="Describe your issue (e.g. AC leaking water, no cooling...)"
          placeholderTextColor={colors.textSecondary}
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={3}
          style={[styles.multilineInput, { backgroundColor: colors.card, borderColor: colors.primary + '30', color: colors.text }]}
        />

        {/* Choose Date & Time */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>PREFERRED DATE & TIME</Text>
          </View>
        </View>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity 
            style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
            onPress={() => {
              setShowCalendar(!showCalendar);
              setShowTimePicker(false);
            }}
          >
            <Icons.Calendar size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: 8 }}>{formattedDateString}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
            onPress={() => {
              setShowTimePicker(!showTimePicker);
              setShowCalendar(false);
            }}
          >
            <Icons.Clock size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: 8 }}>{formattedTimeString}</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Calendar & Watch Overlays */}
        {showCalendar && renderCustomCalendar()}
        {showTimePicker && renderCustomWatchPicker()}

        {/* Choose Address - Custom Dropdown with Live Location Button */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>SERVICE ADDRESS</Text>
          </View>
        </View>

        <View style={styles.addressDropdownRow}>
          <TouchableOpacity 
            style={[styles.dropdownTrigger, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}
            onPress={() => setAddrDropdownOpen(!addrDropdownOpen)}
          >
            <Icons.MapPin size={18} color={colors.primary} />
            <Text numberOfLines={1} style={[styles.dropdownText, { color: colors.text }]}>
              {getSelectedAddressText()}
            </Text>
            <Icons.ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.liveLocBtn, { backgroundColor: colors.primary }]}
            onPress={handleFetchLiveLocation}
            disabled={fetchingLive}
          >
            {fetchingLive ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icons.Navigation size={14} color="#FFF" />
                <Text style={styles.liveLocBtnText}>Live Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {addrDropdownOpen && (
          <View style={[styles.dropdownOptionsList, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
            {liveLocationStr !== '' && (
              <TouchableOpacity 
                style={[styles.dropdownOptionItem, selectedAddr === 'live' && { backgroundColor: colors.primary + '12' }]}
                onPress={() => {
                  setSelectedAddr('live');
                  setAddrDropdownOpen(false);
                }}
              >
                <Icons.Navigation size={14} color={colors.primary} style={{ marginRight: 8 }} />
                <Text numberOfLines={1} style={[styles.dropdownOptionText, { color: colors.text }]}>
                  📍 Current Live Location
                </Text>
              </TouchableOpacity>
            )}
            
            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr._id}
                style={[styles.dropdownOptionItem, selectedAddr === addr._id && { backgroundColor: colors.primary + '12' }]}
                onPress={() => {
                  setSelectedAddr(addr._id);
                  setAddrDropdownOpen(false);
                }}
              >
                <Icons.MapPin size={14} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text numberOfLines={1} style={[styles.dropdownOptionText, { color: colors.text }]}>
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

        {/* Price Breakdown */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>PRICE BREAKDOWN</Text>
          </View>
        </View>
        <View style={[styles.priceBox, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
          <View style={styles.priceItem}>
            <Text style={{ color: colors.textSecondary }}>AC Service Base Price</Text>
            <Text style={{ color: colors.text }}>₹{service.basePrice.toFixed(2)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.priceItem}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Total Amount</Text>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>₹{service.basePrice.toFixed(2)}</Text>
          </View>
        </View>

        <PrimaryButton title="Book Now" onPress={handleProceedToPayment} loading={bookingLoading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  serviceImage: { 
    width: '100%', 
    height: 180, 
    borderRadius: 12, 
    marginBottom: 8,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  infoBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  basePriceText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  multilineInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top',
    fontWeight: '500',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
  },
  
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
    width: 38,
    height: 38,
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
  clockLayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 10,
  },
  clockFace: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  clockCenterDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    left: 105,
    top: 105,
    zIndex: 10,
  },
  clockHandWrapper: {
    position: 'absolute',
    width: 2,
    height: 160,
    left: 109,
    top: 30,
    alignItems: 'center',
    zIndex: 5,
  },
  clockHandLine: {
    width: 3,
    height: 60,
    borderRadius: 2,
  },
  hourCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 8,
  },
  hourCircleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  clockRightPanel: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  periodGroup: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  periodToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodToggleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  clockPanelLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  minutesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  minuteGridBtn: {
    width: '45%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteGridText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    width: '100%',
    justifyContent: 'center',
  },
  timePreviewText: {
    fontSize: 11,
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

  // Price box
  priceBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  }
});
