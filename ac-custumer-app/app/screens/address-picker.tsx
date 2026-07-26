import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function AddressPickerScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const handleConfirm = () => {
    Alert.alert("Location Selected", "New address pinned at 150 Brickell Ave.", [
      { text: "Confirm", onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Location</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.mapMock, { backgroundColor: colors.border }]}>
        <Icons.MapPin size={48} color={colors.primary} style={styles.pin} />
        <Text style={[styles.mapText, { color: colors.textSecondary }]}>🗺️ [Pin Address on Map]</Text>
      </View>

      <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Brickell Avenue</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>150 Brickell Ave, Miami, FL 33131</Text>
        <PrimaryButton title="Confirm Pinned Location" onPress={handleConfirm} />
      </View>
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
  mapMock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pin: {
    position: 'absolute',
    top: '40%',
  },
  mapText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  }
});
