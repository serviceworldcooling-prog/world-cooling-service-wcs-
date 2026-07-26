import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function SavedAddressesScreen() {
  const { themeMode, addresses, addAddress, removeAddress } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!label || !address) {
      Alert.alert("Error", "Please fill in all address fields.");
      return;
    }
    addAddress(label, address);
    setLabel('');
    setAddress('');
    setIsAdding(false);
    Alert.alert("Success", "Address added successfully.");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <Icons.Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {isAdding && (
          <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Add New Address</Text>
            
            <TextInput 
              label="Label (e.g. Home, Office, Gym)" 
              placeholder="Home" 
              value={label} 
              onChangeText={setLabel}
            />

            <TextInput 
              label="Complete Address" 
              placeholder="124 Ocean Drive, Miami, FL" 
              value={address} 
              onChangeText={setAddress}
            />

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.cancelBtn, { borderColor: colors.border }]} 
                onPress={() => setIsAdding(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.primary }]} 
                onPress={handleAdd}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {addresses.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>No saved addresses found.</Text>
        ) : (
          addresses.map((item) => (
            <View key={item._id} style={[styles.addrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.addrLeft}>
                <Icons.MapPin size={20} color={colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.addrLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.addrText, { color: colors.textSecondary }]}>{item.address}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeAddress(item._id)}>
                <Icons.Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  addForm: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveBtn: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  addrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addrLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  addrText: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  }
});
