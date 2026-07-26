import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput as RNTextInput, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { CATEGORIES, TECHNICIANS, OFFERS } from '../../constants/mocks';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import { TechnicianCard } from '../../components/Cards';
import * as Icons from 'lucide-react-native';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { themeMode, addresses } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const service = CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

  const [selectedTech, setSelectedTech] = useState(TECHNICIANS[0].id);
  const [selectedAddr, setSelectedAddr] = useState(addresses[0]?._id || '');
  const [date, setDate] = useState('2026-07-20');
  const [time, setTime] = useState('10:00 AM');
  const [desc, setDesc] = useState('');
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    const matched = OFFERS.find(o => o.code.toUpperCase() === couponCode.toUpperCase());
    if (matched) {
      setDiscount(matched.discount);
      Alert.alert("Coupon Applied!", `Discount of $${matched.discount} applied successfully.`);
    } else {
      Alert.alert("Invalid Coupon", "The coupon code you entered is invalid.");
    }
  };

  const totalPrice = Math.max(0, service.basePrice - discount);

  const handleProceedToPayment = () => {
    if (!selectedAddr) {
      Alert.alert("Error", "Please select or add a service address.");
      return;
    }
    const selectedAddressObj = addresses.find(a => a._id === selectedAddr);
    const techObj = TECHNICIANS.find(t => t.id === selectedTech);

    // Save booking options temporary and pass it to payment preview screen
    router.push({
      pathname: '/screens/payment-preview',
      params: {
        categoryTitle: service.title,
        technicianName: techObj?.name || 'Assigned Technician',
        date,
        time,
        price: totalPrice,
        address: selectedAddressObj?.address || 'Default address',
        description: desc,
        techAvatar: techObj?.avatar || ''
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{service.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Info</Text>
        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>{service.description}</Text>
          <Text style={[styles.basePriceText, { color: colors.primary }]}>Base Price: ${service.basePrice}</Text>
        </View>

        {/* Problem Description */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Problem Description (Optional)</Text>
        <RNTextInput
          placeholder="Describe your issue (e.g. AC leaking water, no cooling...)"
          placeholderTextColor={colors.textSecondary}
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={3}
          style={[styles.multilineInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        {/* Choose Date & Time */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferred Date & Time</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity 
            style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert("Select Date", "Dates simulated: July 20, July 21, July 22")}
          >
            <Icons.Calendar size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: 8 }}>{date}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert("Select Time", "Times simulated: 10:00 AM, 02:00 PM, 06:00 PM")}
          >
            <Icons.Clock size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: 8 }}>{time}</Text>
          </TouchableOpacity>
        </View>

        {/* Choose Address */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Address</Text>
          <TouchableOpacity onPress={() => router.push('/screens/saved-addresses')}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Manage</Text>
          </TouchableOpacity>
        </View>

        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr._id}
            onPress={() => setSelectedAddr(addr._id)}
            style={[
              styles.addressCard,
              { backgroundColor: colors.card },
              selectedAddr === addr._id ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: colors.border, borderWidth: 1 }
            ]}
          >
            <Text style={[styles.addrLabel, { color: colors.text }]}>{addr.label}</Text>
            <Text style={[styles.addrText, { color: colors.textSecondary }]}>{addr.address}</Text>
          </TouchableOpacity>
        ))}

        {/* Choose Technician */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Preferred Technician</Text>
        {TECHNICIANS.map((tech) => (
          <TechnicianCard
            key={tech.id}
            technician={tech}
            selected={selectedTech === tech.id}
            onPress={() => setSelectedTech(tech.id)}
          />
        ))}

        {/* Coupon */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo Coupon</Text>
        <View style={styles.couponRow}>
          <RNTextInput
            placeholder="SUMMER20, WELCOME30"
            placeholderTextColor={colors.textSecondary}
            value={couponCode}
            onChangeText={setCouponCode}
            style={[styles.couponInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          />
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]} onPress={applyCoupon}>
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Breakdown</Text>
        <View style={[styles.priceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.priceItem}>
            <Text style={{ color: colors.textSecondary }}>AC Service Base Price</Text>
            <Text style={{ color: colors.text }}>${service.basePrice.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceItem}>
              <Text style={{ color: colors.success }}>Discount Applied</Text>
              <Text style={{ color: colors.success }}>-${discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.priceItem}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Total Amount</Text>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <PrimaryButton title="Proceed to Payment" onPress={handleProceedToPayment} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  basePriceText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  multilineInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  addressCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  addrLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  addrText: {
    fontSize: 12,
    marginTop: 4,
  },
  couponRow: {
    flexDirection: 'row',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  applyBtn: {
    paddingHorizontal: 24,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  }
});
