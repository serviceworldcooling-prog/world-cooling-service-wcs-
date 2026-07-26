import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function PermissionsScreen() {
  const { themeMode, setPermissions } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [locationOpt, setLocationOpt] = useState(false);
  const [notifyOpt, setNotifyOpt] = useState(false);

  const handleContinue = () => {
    setPermissions(locationOpt, notifyOpt);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Icons.Lock size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Permissions Required</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Please enable following services to enjoy uninterrupted AC repairing and servicing options.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>📍 Location Service</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                To locate and send the nearest technician to your address.
              </Text>
            </View>
            <Switch 
              value={locationOpt} 
              onValueChange={setLocationOpt} 
              trackColor={{ false: colors.border, true: colors.primary }} 
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>🔔 Push Notifications</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                For active booking updates, tech live tracker status, and offer alerts.
              </Text>
            </View>
            <Switch 
              value={notifyOpt} 
              onValueChange={setNotifyOpt} 
              trackColor={{ false: colors.border, true: colors.primary }} 
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  }
});
