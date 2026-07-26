import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const AddressManagementScreen = ({ route, navigation }: any) => {
  const { bookingDetails } = route.params || { bookingDetails: {} };
  const { user, addAddress, deleteAddress } = useApp();

  const [selectedAddress, setSelectedAddress] = useState(user.addresses[0] || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [error, setError] = useState('');

  const handleSaveAddress = () => {
    if (!newLabel || !newAddressText) {
      setError('Both label and address fields are required.');
      return;
    }
    addAddress(newLabel, newAddressText);
    setNewLabel('');
    setNewAddressText('');
    setError('');
    setModalVisible(false);
  };

  const handleNext = () => {
    if (!selectedAddress) {
      alert('Please select or add an address first.');
      return;
    }
    navigation.navigate('Coupons', {
      bookingDetails: {
        ...bookingDetails,
        address: selectedAddress.address,
      }
    });
  };

  return (
    <ScreenContainer title="Select Address" onBack={() => navigation.goBack()}>
      <View style={styles.flex}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Select Service Location</Text>
          
          {user.addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="location-off" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No saved addresses found</Text>
            </View>
          ) : (
            user.addresses.map((item) => {
              const isSelected = selectedAddress?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.addressCard, isSelected ? styles.addressCardActive : null]}
                  onPress={() => setSelectedAddress(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.labelRow}>
                      <MaterialIcons 
                        name={item.label.toLowerCase() === 'home' ? 'home' : item.label.toLowerCase() === 'office' ? 'business' : 'room'} 
                        size={18} 
                        color={isSelected ? COLORS.secondary : COLORS.primary} 
                      />
                      <Text style={[styles.addressLabel, isSelected ? styles.addressLabelActive : null]}>{item.label}</Text>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                        <MaterialIcons name="delete-outline" size={18} color={COLORS.danger} />
                      </TouchableOpacity>
                      <MaterialIcons 
                        name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'} 
                        size={20} 
                        color={isSelected ? COLORS.primary : COLORS.textLight} 
                        style={{ marginLeft: SPACING.sm }}
                      />
                    </View>
                  </View>
                  <Text style={styles.addressText}>{item.address}</Text>
                </TouchableOpacity>
              );
            })
          )}

          {/* Add New Address Button */}
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={20} color={COLORS.secondary} />
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer Next Button */}
        <View style={styles.footer}>
          <AppButton
            title="Proceed to Coupons"
            onPress={handleNext}
            icon="card-giftcard"
            style={styles.nextBtn}
          />
        </View>

        {/* Add Address Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Address</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <AppInput
                label="Label (e.g. Home, Office, Gym)"
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Home"
              />

              <AppInput
                label="Full Address"
                value={newAddressText}
                onChangeText={setNewAddressText}
                placeholder="Flat/House No, Building, Street, Area, Landmark, City, State & Pincode"
                style={{ marginTop: SPACING.sm }}
              />

              <TouchableOpacity style={styles.gpsBtn} activeOpacity={0.8}>
                <MaterialIcons name="my-location" size={16} color={COLORS.secondary} />
                <Text style={styles.gpsBtnText}>Use Current GPS Location</Text>
              </TouchableOpacity>

              <AppButton
                title="Save Address"
                onPress={handleSaveAddress}
                icon="save"
                style={styles.saveBtn}
              />
            </View>
          </View>
        </Modal>

      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  addressCardActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6,
  },
  addressLabelActive: {
    color: COLORS.secondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.secondary,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 6,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 30, 63, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: ROUNDED.lg,
    borderTopRightRadius: ROUNDED.lg,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    marginTop: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
});
