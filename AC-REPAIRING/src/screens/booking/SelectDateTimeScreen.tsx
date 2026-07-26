import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const SelectDateTimeScreen = ({ route, navigation }: any) => {
  const { bookingDetails } = route.params || { bookingDetails: {} };

  // Generate next 7 days starting today
  const getNext7Days = () => {
    const days = [];
    const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        id: i.toString(),
        dayName: dateNames[d.getDay()],
        dateNum: d.getDate(),
        month: monthNames[d.getMonth()],
        fullString: `${d.getDate()} ${monthNames[d.getMonth()]} 2026`,
      });
    }
    return days;
  };

  const dates = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const timeSlots = {
    morning: [
      { id: 'm1', label: '09:00 AM - 11:00 AM' },
      { id: 'm2', label: '11:00 AM - 01:00 PM' },
    ],
    afternoon: [
      { id: 'a1', label: '01:00 PM - 03:00 PM' },
      { id: 'a2', label: '03:00 PM - 05:00 PM' },
    ],
    evening: [
      { id: 'e1', label: '05:00 PM - 07:00 PM' },
      { id: 'e2', label: '07:00 PM - 09:00 PM' },
    ],
  };

  const [selectedSlot, setSelectedSlot] = useState(timeSlots.morning[0]);

  const handleNext = () => {
    navigation.navigate('AddressManagement', {
      bookingDetails: {
        ...bookingDetails,
        date: selectedDate.fullString,
        time: selectedSlot.label,
      }
    });
  };

  return (
    <ScreenContainer title="Select Date & Time" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Progress header step details */}
        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>Schedule Your Service</Text>
          <Text style={styles.stepSubtitle}>Select a convenient slot when you will be at home</Text>
        </View>

        {/* Calendar Picker */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
          {dates.map((item) => {
            const isSelected = selectedDate.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.dateCard, isSelected ? styles.dateCardActive : null]}
                onPress={() => setSelectedDate(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayText, isSelected ? styles.dayTextActive : null]}>{item.dayName}</Text>
                <Text style={[styles.dateText, isSelected ? styles.dateTextActive : null]}>{item.dateNum}</Text>
                <Text style={[styles.monthText, isSelected ? styles.monthTextActive : null]}>{item.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time slots groups */}
        <Text style={styles.sectionTitle}>Select Time Slot</Text>

        {/* Morning Slots */}
        <View style={styles.slotGroup}>
          <View style={styles.slotGroupTitleRow}>
            <MaterialIcons name="wb-sunny" size={16} color={COLORS.warning} />
            <Text style={styles.slotGroupTitle}>Morning Slots</Text>
          </View>
          <View style={styles.slotsRow}>
            {timeSlots.morning.map((slot) => {
              const isSelected = selectedSlot.id === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotBtn, isSelected ? styles.slotBtnActive : null]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotText, isSelected ? styles.slotTextActive : null]}>{slot.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Afternoon Slots */}
        <View style={styles.slotGroup}>
          <View style={styles.slotGroupTitleRow}>
            <MaterialIcons name="wb-cloudy" size={16} color={COLORS.primary} />
            <Text style={styles.slotGroupTitle}>Afternoon Slots</Text>
          </View>
          <View style={styles.slotsRow}>
            {timeSlots.afternoon.map((slot) => {
              const isSelected = selectedSlot.id === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotBtn, isSelected ? styles.slotBtnActive : null]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotText, isSelected ? styles.slotTextActive : null]}>{slot.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Evening Slots */}
        <View style={styles.slotGroup}>
          <View style={styles.slotGroupTitleRow}>
            <MaterialIcons name="nights-stay" size={16} color="#4F46E5" />
            <Text style={styles.slotGroupTitle}>Evening Slots</Text>
          </View>
          <View style={styles.slotsRow}>
            {timeSlots.evening.map((slot) => {
              const isSelected = selectedSlot.id === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotBtn, isSelected ? styles.slotBtnActive : null]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotText, isSelected ? styles.slotTextActive : null]}>{slot.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Slot Recap */}
        <View style={styles.recapCard}>
          <MaterialIcons name="info" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
          <Text style={styles.recapText}>
            Selected schedule: <Text style={styles.boldText}>{selectedDate.dayName}, {selectedDate.dateNum} {selectedDate.month}</Text> between <Text style={styles.boldText}>{selectedSlot.label.split(' - ')[0]}</Text>
          </Text>
        </View>

        {/* Next Button */}
        <AppButton
          title="Proceed to Address"
          onPress={handleNext}
          icon="room"
          style={styles.nextBtn}
        />

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  stepInfo: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  calendarRow: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  dateCard: {
    width: 68,
    height: 90,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  dateCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  dayText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayTextActive: {
    color: COLORS.secondary,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 2,
  },
  dateTextActive: {
    color: COLORS.secondary,
  },
  monthText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  monthTextActive: {
    color: COLORS.secondary,
  },
  slotGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  slotGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  slotGroupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotBtn: {
    width: '48%',
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  slotBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  slotText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  slotTextActive: {
    color: '#ffffff',
  },
  recapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    padding: SPACING.md,
    borderRadius: ROUNDED.md,
    marginBottom: SPACING.lg,
  },
  recapText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
});
