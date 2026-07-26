import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton, AppInput } from '../../components/Common';
import { useApp } from '../../context/AppContext';

export const SavedAddressesScreen = ({ navigation }: any) => {
  const { user, addAddress, deleteAddress } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!label || !address) {
      setError('Both fields are required.');
      return;
    }
    addAddress(label, address);
    setLabel('');
    setAddress('');
    setError('');
    setModalVisible(false);
  };

  return (
    <ScreenContainer title="Saved Addresses" onBack={() => navigation.goBack()}>
      <View style={styles.flex}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {user.addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="room" size={60} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
              <Text style={styles.emptyTitle}>No saved addresses</Text>
              <Text style={styles.emptyDesc}>Add your home or office address to book services quickly.</Text>
            </View>
          ) : (
            user.addresses.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.labelRow}>
                    <MaterialIcons 
                      name={item.label.toLowerCase() === 'home' ? 'home' : item.label.toLowerCase() === 'office' ? 'business' : 'room'} 
                      size={18} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.label}>{item.label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                    <MaterialIcons name="delete-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.address}>{item.address}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            title="Add New Address"
            onPress={() => setModalVisible(true)}
            icon="add"
            style={styles.addBtn}
          />
        </View>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Address</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <AppInput
                label="Address Type Label"
                value={label}
                onChangeText={setLabel}
                placeholder="Home, Office, Other"
              />

              <AppInput
                label="Full Address details"
                value={address}
                onChangeText={setAddress}
                placeholder="Street address, building, apartment, city, state"
                style={{ marginTop: SPACING.sm }}
              />

              <AppButton
                title="Save Address"
                onPress={handleSave}
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6,
  },
  address: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
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
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    marginTop: SPACING.md,
  },
});
