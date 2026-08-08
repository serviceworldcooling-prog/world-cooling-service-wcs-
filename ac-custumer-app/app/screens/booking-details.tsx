import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Modal, Image, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, SecondaryButton } from '../../components/CustomUI';
import { WarrantyCertificateModal } from '../../components/WarrantyCertificateModal';
import { getBookingById } from '../../api/bookingApi';
import { getInvoice } from '../../api/paymentApi';
import type { Booking } from '../../api/bookingApi';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeMode, cancelBooking, rescheduleBooking } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getBookingById(id)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await cancelBooking(id!, 'Customer cancelled');
            Alert.alert('Cancelled', 'Booking cancelled and deleted successfully.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  // Reschedule Modal states
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [rescheduling, setRescheduling] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  useEffect(() => {
    if (rescheduleModalOpen && booking) {
      if (booking.preferredDate) {
        const parts = booking.preferredDate.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          setSelectedDate(d);
          setCurrentDate(d);
        }
      }
      if (booking.preferredTime) {
        const match = booking.preferredTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          setSelectedHour(parseInt(match[1], 10));
          setSelectedMinute(parseInt(match[2], 10));
          setSelectedPeriod(match[3].toUpperCase() as 'AM' | 'PM');
        }
      }
    }
  }, [rescheduleModalOpen, booking]);

  const submitReschedule = async () => {
    setRescheduling(true);
    try {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDateString = `${y}-${m}-${d}`;
      const formattedTimeString = `${selectedHour}:${selectedMinute < 10 ? '0' + selectedMinute : selectedMinute} ${selectedPeriod}`;

      await rescheduleBooking(id!, formattedDateString, formattedTimeString);
      setBooking(prev => prev ? { ...prev, preferredDate: formattedDateString, preferredTime: formattedTimeString } : prev);
      setRescheduleModalOpen(false);
      Alert.alert('✅ Rescheduled', 'Service rescheduled successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setRescheduling(false);
    }
  };

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
          }}
        >
          <Text style={[styles.calDayText, { color: isSelected ? '#FFF' : colors.text }]}>{d}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.customCalendarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

  const renderCustomWatchPicker = () => {
    const cx = 110;
    const cy = 110;
    const radius = 78;
    const itemSize = 34;

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
      <View style={[styles.customWatchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
      </View>
    );
  };

  const renderTimeline = (status: string) => {
    const steps = ['Pending', 'Confirmed', 'In Progress', 'Completed'];
    const currentIdx = steps.indexOf(status) !== -1 ? steps.indexOf(status) : 0;

    return (
      <View style={styles.timelineRow}>
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;
          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <View style={[
                  styles.timelineLine,
                  { backgroundColor: idx <= currentIdx ? colors.primary : colors.border }
                ]} />
              )}
              <View style={styles.timelineStep}>
                <View style={[
                  styles.timelineNode,
                  {
                    backgroundColor: isActive ? colors.primary : isCompleted ? colors.primary + '18' : colors.card,
                    borderColor: isCompleted ? colors.primary : colors.border,
                    borderWidth: 2,
                  }
                ]}>
                  {isCompleted ? (
                    <Icons.Check size={10} color={isActive ? '#FFF' : colors.primary} />
                  ) : (
                    <View style={styles.inactiveDot} />
                  )}
                </View>
                <Text numberOfLines={1} style={[
                  styles.timelineLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '800' : '600'
                  }
                ]}>
                  {step}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const handleDownloadInvoice = async () => {
    try {
      const invoice = await getInvoice(id!);
      Alert.alert(
        `Invoice ${invoice.invoiceNumber}`,
        `Total: ₹${invoice.total.toFixed(2)}\nPaid: ${invoice.isPaid ? 'Yes' : 'No'}\nMethod: ${invoice.paymentMethod || 'Pending'}`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not fetch invoice.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>Booking not found.</Text>
      </SafeAreaView>
    );
  }

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header matching Dashboard */}
      <View style={[
        styles.header,
        {
          borderBottomColor: colors.primary + '30',
          backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF',
          paddingTop: Math.max(12, insets.top),
        }
      ]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
            <Icons.ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.headerDividerVertical, { backgroundColor: colors.border }]} />

          <View style={styles.headerTitleSelector}>
            <Text style={[styles.brandHeader, { color: colors.primary }]}>W  C  S</Text>
            <Text numberOfLines={1} style={[styles.locationText, { color: colors.text }]}>
              BOOKING DETAILS
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { borderColor: colors.border }]}
          onPress={() => router.push('/screens/notifications')}
          activeOpacity={0.7}
        >
          <Icons.Bell size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card 1: Booking Banner & Timeline */}
        <View style={[styles.bookingBannerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bannerHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.brandHeaderSub, { color: colors.primary }]}>ID: {booking.bookingId}</Text>
              <Text style={[styles.mainBookingTitle, { color: colors.text }]}>{booking.serviceType}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: booking.status === 'Completed' ? colors.success + '15' : colors.primary + '15',
                borderColor: booking.status === 'Completed' ? colors.success + '40' : colors.primary + '40'
              }
            ]}>
              <Text style={[styles.statusBadgeText, { color: booking.status === 'Completed' ? colors.success : colors.primary }]}>
                ● {booking.status}
              </Text>
            </View>
          </View>

          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

          {renderTimeline(booking.status)}
        </View>

        {/* Card 2: Schedule & Details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Icons.CalendarDays size={16} color={colors.primary} />
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary, marginLeft: 6 }]}>APPOINTMENT DETAILS</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailPillRow}>
              <View style={[styles.detailPill, { backgroundColor: colors.border + '24' }]}>
                <Icons.Calendar size={13} color={colors.primary} />
                <Text style={[styles.detailPillText, { color: colors.text }]}>{booking.preferredDate}</Text>
              </View>
              <View style={[styles.detailPill, { backgroundColor: colors.border + '24' }]}>
                <Icons.Clock size={13} color={colors.primary} />
                <Text style={[styles.detailPillText, { color: colors.text }]}>{booking.preferredTime}</Text>
              </View>
            </View>

            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

            <View style={styles.labelValueGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>SERVICE ADDRESS</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>{booking.address}</Text>
            </View>

            {booking.problemDescription ? (
              <>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <View style={styles.labelValueGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>PROBLEM DETAILS</Text>
                  <Text style={[styles.fieldValue, { color: colors.text }]}>{booking.problemDescription}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Card 3: Assigned Technician */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Icons.UserCheck size={16} color={colors.primary} />
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary, marginLeft: 6 }]}>ASSIGNED TECHNICIAN</Text>
          </View>

          {(!booking.technicianName || booking.technicianName === 'Assigning...' || booking.technicianName === 'Pending') ? (
            <View style={styles.pendingTechWrap}>
              <View style={[styles.techAvatarPlaceholderBig, { backgroundColor: colors.border }]}>
                <Icons.UserSearch size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.techTitleText, { color: colors.text }]}>Work Scheduling Pending</Text>
                <Text style={[styles.techSubText, { color: colors.textSecondary }]}>Waiting for technician assignment</Text>
              </View>
            </View>
          ) : (
            <View style={styles.activeTechWrap}>
              <Image
                source={{ uri: booking.techAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' }}
                style={styles.techAvatarBig}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.techTitleText, { color: colors.text }]}>{booking.technicianName}</Text>
                <Text style={[styles.techSubText, { color: colors.textSecondary }]}>Expert Cooling Engineer</Text>
                <View style={styles.ratingRow}>
                  <Icons.Star size={11} color="#F59E0B" fill="#F59E0B" />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}> 4.9 · 100+ Jobs</Text>
                </View>
              </View>
              <View style={styles.techActionsRow}>
                <TouchableOpacity
                  style={[styles.techCircleBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    const phone = (booking as any).technicianPhone || (booking.technicianId as any)?.phone || '9999999999';
                    Linking.openURL(`tel:${phone}`);
                  }}
                >
                  <Icons.Phone size={13} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.techCircleBtn, { backgroundColor: '#64748B' }]}
                  onPress={() => {
                    const phone = (booking as any).technicianPhone || (booking.technicianId as any)?.phone || '9999999999';
                    const cleanPhone = phone.replace(/[^0-9]/g, '');
                    const message = encodeURIComponent(`Hello ${booking.technicianName}, I am the customer for AC service booking ID #${booking.bookingId}.`);
                    Linking.openURL(`https://wa.me/${cleanPhone.startsWith('91') || cleanPhone.length === 10 ? '91' + cleanPhone.slice(-10) : cleanPhone}?text=${message}`);
                  }}
                >
                  <Icons.MessageSquare size={13} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Card 4: Billing Summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Icons.ReceiptText size={16} color={colors.primary} />
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary, marginLeft: 6 }]}>BILLING SUMMARY</Text>
          </View>

          <View style={styles.invoiceTable}>
            <View style={styles.invoiceItemRow}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>AC Service Charge</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>₹{(booking.price || 0).toFixed(2)}</Text>
            </View>
            
            {!!booking.extraMaterialCharges && booking.extraMaterialCharges > 0 && (
              <>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <View style={styles.invoiceItemRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Extra Material Charges</Text>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>+ ₹{booking.extraMaterialCharges.toFixed(2)}</Text>
                </View>
              </>
            )}

            {!!booking.extraAmountTaken && booking.extraAmountTaken > 0 && (
              <>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <View style={styles.invoiceItemRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Extra Labor/Amount Taken</Text>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>+ ₹{booking.extraAmountTaken.toFixed(2)}</Text>
                </View>
              </>
            )}

            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <View style={styles.invoiceItemRow}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>
                {booking.isPaid ? 'Total Paid Amount' : 'Total Due Amount'}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>
                ₹{((booking.price || 0) + (booking.extraMaterialCharges || 0) + (booking.extraAmountTaken || 0)).toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.invoiceBtnPremium, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
            onPress={handleDownloadInvoice}
          >
            <Icons.Download size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '800', marginLeft: 8, fontSize: 13 }}>View & Download Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Card 4.5: Official Service Guarantee Certificate */}
        {booking.warrantyStatus === 'Active' && (
          <View style={[styles.card, { backgroundColor: '#FFFDF5', borderColor: '#F59E0B', borderWidth: 1.5 }]}>
            <View style={styles.sectionHeaderRow}>
              <Icons.ShieldCheck size={20} color="#0F766E" />
              <Text style={[styles.sectionTitleLabel, { color: '#0F766E', marginLeft: 6, fontWeight: '900' }]}>
                OFFICIAL SERVICE GUARANTEE CERTIFICATE
              </Text>
            </View>

            <View style={{ marginTop: 10, gap: 4 }}>
              <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '800' }}>
                Warranty Period: {booking.warrantyPeriod || '3 Months'}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 12, lineHeight: 18 }}>
                {booking.warrantyDetails || 'Covers parts replacement and service defects.'}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                marginTop: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: '#0F766E',
                paddingVertical: 12,
                borderRadius: 14,
                shadowColor: '#0F766E',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 3,
              }}
              onPress={() => setShowWarrantyModal(true)}
            >
              <Icons.Award size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                View Official Guarantee Certificate
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        {['Pending', 'Confirmed', 'Upcoming'].includes(booking.status) && (
          <View style={{ gap: 10, marginVertical: 16 }}>
            <PrimaryButton
              title="Live Tracking & Details"
              onPress={() => router.push(`/screens/live-tracking?id=${booking._id}`)}
            />
            <SecondaryButton title="Reschedule Service" onPress={() => setRescheduleModalOpen(true)} />
            <TouchableOpacity
              style={[styles.cancelBtnPremium, { borderColor: colors.error }]}
              onPress={handleCancel}
            >
              <Text style={{ color: colors.error, fontWeight: '800', textAlign: 'center', fontSize: 13 }}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setRescheduleModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setRescheduleModalOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Reschedule Service</Text>
              <TouchableOpacity onPress={() => setRescheduleModalOpen(false)} style={styles.modalCloseBtn}>
                <Icons.X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Calendar Section */}
              <Text style={[styles.pickerSectionLabel, { color: colors.textSecondary }]}>CHOOSE PREFERRED DATE</Text>
              {renderCustomCalendar()}

              {/* Clock Section */}
              <Text style={[styles.pickerSectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>CHOOSE PREFERRED TIME</Text>
              {renderCustomWatchPicker()}

              <View style={{ marginTop: 24 }}>
                <PrimaryButton
                  title={rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                  onPress={submitReschedule}
                  loading={rescheduling}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Official Guarantee Certificate Modal (Exact Match to Admin UI) */}
      <WarrantyCertificateModal
        isOpen={showWarrantyModal}
        onClose={() => setShowWarrantyModal(false)}
        booking={booking}
      />
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
    paddingBottom: 12,
    borderBottomWidth: 1.5,
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
  backBtn: {
    padding: 4,
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  headerTitleSelector: {
    flex: 1,
    justifyContent: 'center',
  },
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16 },
  bookingBannerCard: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 16, marginTop: 12 },
  bannerHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  brandHeaderSub: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  mainBookingTitle: { fontSize: 20, fontWeight: '800' },
  statusBadge: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  dividerLine: { height: 1.5, marginVertical: 16 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  timelineLine: { flex: 1, height: 2, marginHorizontal: 4, alignSelf: 'center', marginBottom: 14 },
  timelineStep: { alignItems: 'center', flex: 1 },
  timelineNode: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  inactiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.1)' },
  timelineLabel: { fontSize: 10, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitleLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  detailsGrid: { width: '100%' },
  detailPillRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  detailPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  detailPillText: { fontSize: 12, fontWeight: '700' },
  labelValueGroup: { gap: 4 },
  fieldLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  fieldValue: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  pendingTechWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  techAvatarPlaceholderBig: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  techTitleText: { fontSize: 15, fontWeight: '700' },
  techSubText: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  activeTechWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  techAvatarBig: { width: 48, height: 48, borderRadius: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  ratingText: { fontSize: 11, fontWeight: '600' },
  techActionsRow: { flexDirection: 'row', gap: 8 },
  techCircleBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  invoiceTable: { width: '100%', gap: 12 },
  invoiceItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceBtnPremium: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 16 },
  cancelBtnPremium: { borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 8 },
  otpVerifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, padding: 16, marginTop: 8 },
  otpVerifyText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingBottom: 32,
  },
  pickerSectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  customCalendarContainer: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  calDayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customWatchContainer: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
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
    fontSize: 13,
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
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: '800',
  },
});
