import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer } from '../../components/Common';

export const AboutTermsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'about' | 'terms' | 'privacy'>('about');

  return (
    <ScreenContainer title="About Us & Legal" onBack={() => navigation.goBack()}>
      <View style={styles.flex}>
        {/* Tab row */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'about' ? styles.tabActive : null]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' ? styles.tabTextActive : null]}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'terms' ? styles.tabActive : null]}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabText, activeTab === 'terms' ? styles.tabTextActive : null]}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'privacy' ? styles.tabActive : null]}
            onPress={() => setActiveTab('privacy')}
          >
            <Text style={[styles.tabText, activeTab === 'privacy' ? styles.tabTextActive : null]}>Privacy</Text>
          </TouchableOpacity>
        </View>

        {/* Scroll Content */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {activeTab === 'about' && (
            <View style={styles.contentCard}>
              <View style={styles.logoRow}>
                <View style={styles.logoCircle}>
                  <MaterialIcons name="ac-unit" size={32} color={COLORS.secondary} />
                </View>
                <View style={{ marginLeft: SPACING.sm }}>
                  <Text style={styles.logoTitle}>CoolBreeze AC Service</Text>
                  <Text style={styles.version}>Version 1.0.0 (Build 90)</Text>
                </View>
              </View>

              <Text style={styles.paragraph}>
                CoolBreeze is India's leading on-demand air conditioning maintenance platform. We connect certified cooling experts to customers needing split/window AC installation, gas charging, jet wet cleaning, and AMC maintenance solutions.
              </Text>
              
              <Text style={styles.paragraph}>
                Our network consists of 500+ vetted technicians across major metropolitan regions. Every booking comes with a 30-day service warranty, background-checked experts, and standard parts replacement support.
              </Text>

              <Text style={styles.subHeading}>Corporate Office</Text>
              <Text style={styles.officeText}>
                CoolBreeze Technologies Pvt. Ltd.{'\n'}
                7th Floor, Cyber Towers, Sector 62,{'\n'}
                Noida, Uttar Pradesh - 201301.
              </Text>
            </View>
          )}

          {activeTab === 'terms' && (
            <View style={styles.contentCard}>
              <Text style={styles.title}>Terms & Conditions</Text>
              <Text style={styles.lastUpdated}>Last Updated: 12 July 2026</Text>
              
              <Text style={styles.legalSub}>1. Booking Requisitions</Text>
              <Text style={styles.legalBody}>
                By placing a booking request on CoolBreeze, you represent that you have the authority to permit entry to the technicians at the specified address.
              </Text>

              <Text style={styles.legalSub}>2. Cancellation & Fee Policy</Text>
              <Text style={styles.legalBody}>
                Bookings can be cancelled free of charge up to 2 hours before the scheduled time slot. Cancellations within the 2-hour window are subject to a late fee of ₹50 to compensate technicians for travel prep.
              </Text>

              <Text style={styles.legalSub}>3. Service Warranty</Text>
              <Text style={styles.legalBody}>
                We guarantee service support and troubleshooting for 30 days after booking completion. This warranty covers the specific repair done by our technician, but excludes issues arising from external factors.
              </Text>
            </View>
          )}

          {activeTab === 'privacy' && (
            <View style={styles.contentCard}>
              <Text style={styles.title}>Privacy Policy</Text>
              <Text style={styles.lastUpdated}>Last Updated: 12 July 2026</Text>

              <Text style={styles.legalSub}>1. Information We Collect</Text>
              <Text style={styles.legalBody}>
                We collect your name, mobile number, email, and home address to schedule services. During active service tracking, we record location data from both technician and customer devices to facilitate logistics.
              </Text>

              <Text style={styles.legalSub}>2. Sharing of Information</Text>
              <Text style={styles.legalBody}>
                Your address and phone number are shared with the assigned service professional only when they accept the booking, and are revoked upon job completion.
              </Text>

              <Text style={styles.legalSub}>3. Data Security</Text>
              <Text style={styles.legalBody}>
                We encrypt all sensitive payment information. We do not store full credit card numbers or banking passwords on our platform.
              </Text>
            </View>
          )}

        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: 4,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: ROUNDED.sm,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scroll: {
    paddingBottom: SPACING.lg,
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.sm,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  version: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  paragraph: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  officeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  lastUpdated: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  legalSub: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  legalBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
});
