import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar, LayoutAnimation, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BottomTabBar } from '../../components/Common';

const INVENTORY_ITEMS = [
  { id: '1', name: 'R32 Refrigerant Gas (1KG)', qty: '2 Cans', status: 'Available' },
  { id: '2', name: '45 MFD Run Capacitor', qty: '4 Pcs', status: 'Low Stock' },
  { id: '3', name: 'LG Outdoor Fan Motor (Universal)', qty: '1 Pc', status: 'Available' },
  { id: '4', name: 'Insulated Copper Pipes (1/4 & 3/8 - 3M)', qty: '0 Sets', status: 'Out of Stock' },
];

export const PartsRequestScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus } = useApp();
  const insets = useSafeAreaInsets();

  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purpose, setPurpose] = useState('');

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

  const handleSubmitRequest = () => {
    if (!partName || !quantity) {
      Alert.alert('Error', 'Please fill in the Part Name and Quantity.');
      return;
    }
    Alert.alert(
      'Request Submitted',
      `Your request for ${quantity}x "${partName}" has been sent to the warehouse manager. You will receive an alert once approved.`,
      [{ text: 'OK', onPress: () => {
        setPartName('');
        setQuantity('');
        setPurpose('');
      }}]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header exactly matching Dashboard style */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Inventory Summary */}
        <Text style={styles.sectionTitle}>MY VAN INVENTORY</Text>
        <View style={styles.cardGroup}>
          {INVENTORY_ITEMS.map((item, idx) => (
            <View key={item.id} style={[styles.invRow, idx < INVENTORY_ITEMS.length - 1 && styles.borderBottom]}>
              <View style={styles.invInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>Quantity In Hand: <Text style={{ fontWeight: '800' }}>{item.qty}</Text></Text>
              </View>
              <View style={[
                styles.statusBadge, 
                item.status === 'Available' ? { backgroundColor: COLORS.successLight } :
                item.status === 'Low Stock' ? { backgroundColor: COLORS.warningLight } : { backgroundColor: COLORS.dangerLight }
              ]}>
                <Text style={[
                  styles.statusText, 
                  item.status === 'Available' ? { color: COLORS.success } :
                  item.status === 'Low Stock' ? { color: COLORS.warning } : { color: COLORS.danger }
                ]}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Request Form */}
        <Text style={styles.sectionTitle}>REQUEST NEW PART FROM WAREHOUSE</Text>
        <View style={styles.formCard}>
          <Text style={styles.label}>PART NAME / COMPONENT MODEL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Copper coil, compressor capacitor, gas..."
              value={partName}
              onChangeText={setPartName}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <Text style={styles.label}>QUANTITY NEEDED</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2 pieces, 1 cylinder..."
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="default"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <Text style={styles.label}>REASON / BOOKING ID ASSOCIATED</Text>
          <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 8 }]}>
            <TextInput
              style={[styles.input, { textAlignVertical: 'top', height: '100%' }]}
              placeholder="Provide a booking ID reference or reason for request..."
              value={purpose}
              onChangeText={setPurpose}
              multiline
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRequest} activeOpacity={0.85}>
            <MaterialIcons name="send" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>SUBMIT SPARE PARTS REQUEST</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomTabBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  backBtn: {
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
  scroll: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: COLORS.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 24,
    ...SHADOWS.small,
  },
  invRow: { flexDirection: 'row', padding: 14, alignItems: 'center', justifyContent: 'space-between' },
  borderBottom: { borderBottomWidth: 1.5, borderBottomColor: COLORS.border },
  invInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  itemQty: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    ...SHADOWS.small,
  },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 6 },
  inputContainer: {
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.sm,
    paddingHorizontal: 12,
    marginBottom: 16,
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
  },
  input: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, height: '100%' },
  submitBtn: {
    height: 48,
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOWS.small,
  },
  submitBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
