import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import { Camera } from 'expo-camera';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function PermMicrophoneScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check real microphone permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Camera.getMicrophonePermissionsAsync();
        if (status === 'granted') {
          setIsAllowed(true);
        }
      } catch (err) {
        console.log('Error checking microphone permission:', err);
      } finally {
        setLoading(false);
      }
    };
    checkPermission();
  }, []);

  const handleRequest = async () => {
    try {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      if (status === 'granted') {
        setIsAllowed(true);
        Alert.alert("Granted", "Microphone access has been successfully granted.");
      } else {
        Alert.alert("Permission Denied", "Microphone permission was denied.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to request microphone permission");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full-Page Background Illustration */}
      <Image
        source={require('../../assets/permissions_microphone_bg.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(248, 250, 252, 0.90)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>STEP 4 OF 4</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          <Text style={[styles.brandText, { color: colors.primary }]}>AUDIO DIAGNOSTICS</Text>
          <Text style={[styles.title, { color: colors.text }]}>Enable Microphone Access</Text>
          <View style={[styles.headerDivider, { backgroundColor: colors.primary + '20' }]} />
          
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            This is used to record audio descriptions of AC noises or malfunction details, and lets you perform audio diagnostic calls directly with our support team.
          </Text>

          {!loading && isAllowed ? (
            <MotiView 
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.highlightBadge}
            >
              <Text style={styles.highlightBadgeText}>✓ Microphone Access Enabled</Text>
            </MotiView>
          ) : (
            <Text style={[styles.errorDesc, { color: colors.error }]}>
              ⚠️ Permission required to proceed. Please grant access.
            </Text>
          )}

          <View style={styles.indicatorContainer}>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.primary, width: 24 }]} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!loading && isAllowed ? (
          <PrimaryButton 
            title="Finish Setup" 
            onPress={() => router.replace('/(tabs)/home')} 
          />
        ) : (
          <PrimaryButton 
            title="Allow Microphone Access" 
            onPress={handleRequest} 
          />
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 10,
  },
  contentCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerDivider: {
    width: 32,
    height: 2,
    marginVertical: 14,
    borderRadius: 1,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  highlightBadge: {
    backgroundColor: '#10B98112',
    borderColor: '#10B98140',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
  },
  highlightBadgeText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 10,
  }
});
