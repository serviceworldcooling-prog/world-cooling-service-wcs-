import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Dimensions, StatusBar, Alert, LayoutAnimation
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');
const responsivePadding = Math.max(16, width * 0.05);

const BRAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Daikin:    { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
  LG:        { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  Voltas:    { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  General:   { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  Multi:     { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' },
};

const COMMON_ISSUES = [
  {
    title: '❄️ Weak or No Cooling',
    cause: 'Low refrigerant level, clogged air filters, or failing compressor capacitor.',
    solution: 'Check refrigerant pressure (R32 norm: 120-130 PSI). Clean blower wheel & filters, measure current draw of compressor.'
  },
  {
    title: '💧 Indoor Unit Water Leakage',
    cause: 'Blocked condensate drain pipe or unaligned drain tray.',
    solution: 'Use pressurized water pump to clear drain line blockage. Ensure the indoor unit is perfectly leveled.'
  },
  {
    title: '🔊 Abnormal Fan Blower Noise',
    cause: 'Worn out blower motor bushing or unaligned drum blades.',
    solution: 'Lubricate the motor shaft bushings or replace worn blower mount rubber. Clean drum blades to resolve imbalance.'
  },
  {
    title: '⚠️ Compressor Tripping Regularly',
    cause: 'High condenser coil head pressure or weak run capacitor.',
    solution: 'Thoroughly wash the outdoor condenser coil. Test run capacitor capacitance (must match 45-50 MFD rating).'
  }
];

const ERROR_CODES = [
  { code: 'E1', brand: 'General', desc: 'Room temperature sensor open/short circuit', fix: 'Test resistance. Replace 10k thermistor sensor.' },
  { code: 'E5', brand: 'Daikin', desc: 'Compressor overload / High current protection', fix: 'Check voltage stabilizer input. Verify compressor windings.' },
  { code: 'E9', brand: 'Voltas', desc: 'Indoor fan motor feedback signal missing', fix: 'Check motor connector. Verify Hall sensor signal output.' },
  { code: 'F3', brand: 'Daikin', desc: 'Abnormal discharge pipe temperature', fix: 'Verify outdoor coil airflow. Clean blockages, verify gas charge.' },
  { code: 'CH05', brand: 'LG', desc: 'Communication error between indoor/outdoor unit', fix: 'Check communication wire continuity and terminal joints.' },
];

export const TechAdvisorScreen = ({ navigation }: any) => {
  const { user, unreadCount, updateTechStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

  const insets = useSafeAreaInsets();

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(selectedBrand === brand ? null : brand);
  };

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

  const filteredCodes = ERROR_CODES.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : true;
    return matchesSearch && matchesBrand;
  });

  const brands = ['Daikin', 'LG', 'Voltas', 'General'];

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
        {/* Diagnostics Banner Card */}
        <View style={[styles.advisorBanner, { backgroundColor: COLORS.primary }]}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>FIELD TOOLKIT</Text>
          </View>
          <Text style={styles.bannerTitle}>In-Field Diagnostic Assistant</Text>
          <View style={styles.bannerDivider} />
          <Text style={styles.bannerDesc}>
            Access common AC brand error codes, correct system pressures, and standard operating troubleshooting guidelines.
          </Text>
        </View>

        {/* Brand Filter Tags */}
        <Text style={styles.sectionTitle}>FILTER BY BRAND</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandFilterScroll}>
          {brands.map(brand => {
            const isSelected = selectedBrand === brand;
            return (
              <TouchableOpacity
                key={brand}
                style={[
                  styles.brandTag,
                  { borderColor: COLORS.border, backgroundColor: isSelected ? COLORS.primary : '#FFFFFF' }
                ]}
                onPress={() => handleBrandSelect(brand)}
                activeOpacity={0.8}
              >
                <Text style={[styles.brandTagText, { color: isSelected ? '#FFFFFF' : COLORS.textPrimary }]}>
                  {brand}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Error Code Search */}
        <Text style={styles.sectionTitle}>ERROR CODE LOOKUP</Text>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search code (e.g. E1, E5, CH05)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Results List */}
        {filteredCodes.length > 0 ? (
          <View style={styles.cardGroup}>
            {filteredCodes.map((item, idx) => {
              const theme = BRAND_COLORS[item.brand] || BRAND_COLORS['Multi'];
              return (
                <View key={idx} style={[styles.codeRow, idx < filteredCodes.length - 1 && styles.borderBottom]}>
                  <View style={[styles.codeBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                    <Text style={[styles.codeText, { color: theme.text }]}>{item.code}</Text>
                  </View>
                  <View style={styles.codeDetails}>
                    <View style={styles.brandRow}>
                      <Text style={[styles.itemBrandName, { color: theme.text }]}>{item.brand.toUpperCase()}</Text>
                      <View style={[styles.badgeIndicator, { backgroundColor: theme.text }]} />
                    </View>
                    <Text style={styles.codeDescription}>{item.desc}</Text>
                    <View style={styles.fixInstructions}>
                      <Text style={styles.fixLabel}>RECOMMENDED FIX:</Text>
                      <Text style={styles.fixText}>{item.fix}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noResultsCard}>
            <Feather name="alert-triangle" size={24} color={COLORS.textLight} />
            <Text style={styles.noResultsText}>No matching error codes found.</Text>
          </View>
        )}

        {/* Troubleshooting Guidelines */}
        <Text style={styles.sectionTitle}>SYSTEM FAULT TROUBLESHOOTING</Text>
        {COMMON_ISSUES.map((issue, idx) => {
          const isOpen = selectedIssue === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.issueCard, { borderColor: COLORS.border }]}
              onPress={() => setSelectedIssue(isOpen ? null : idx)}
              activeOpacity={0.9}
            >
              <View style={styles.issueHeader}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <View style={[styles.arrowCircle, { backgroundColor: isOpen ? COLORS.secondary + '15' : '#FAF9F6' }]}>
                  <MaterialIcons
                    name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={18}
                    color={isOpen ? COLORS.secondary : COLORS.textSecondary}
                  />
                </View>
              </View>

              {isOpen && (
                <View style={styles.issueDropdown}>
                  <View style={styles.dropdownDivider} />
                  
                  <View style={styles.dropdownSection}>
                    <Text style={styles.dropdownLabel}>POTENTIAL CAUSES</Text>
                    <Text style={styles.dropdownText}>{issue.cause}</Text>
                  </View>

                  <View style={[styles.dropdownSection, { marginTop: 12 }]}>
                    <Text style={styles.dropdownLabel}>FIELD REMEDIATION ACTION</Text>
                    <View style={styles.remediationCard}>
                      <Feather name="check-circle" size={14} color={COLORS.success} style={{ marginRight: 6, marginTop: 1 }} />
                      <Text style={styles.remediationText}>{issue.solution}</Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Safety Warning */}
        <View style={styles.safetyFooter}>
          <Feather name="shield" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.safetyFooterText}>Always prioritize safety SOPs during live high-voltage diagnostics.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scroll: {
    paddingHorizontal: responsivePadding,
    paddingTop: 16,
    paddingBottom: 100,
  },
  advisorBanner: {
    padding: 18,
    borderRadius: ROUNDED.md,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  bannerBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: -0.3,
  },
  bannerDivider: {
    height: 1.5,
    backgroundColor: COLORS.secondary,
    width: 40,
    marginVertical: 12,
    borderRadius: 1,
  },
  bannerDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  brandFilterScroll: {
    marginBottom: 20,
  },
  brandTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
    ...SHADOWS.small,
  },
  brandTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  codeRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  borderBottom: {
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.divider,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    minWidth: 50,
  },
  codeText: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  codeDetails: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemBrandName: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  badgeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  codeDescription: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
    lineHeight: 18,
  },
  fixInstructions: {
    marginTop: 8,
    backgroundColor: '#FAF9F6',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  fixLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  fixText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 15,
  },
  noResultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
    ...SHADOWS.small,
  },
  noResultsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  issueCard: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueDropdown: {
    marginTop: 12,
  },
  dropdownDivider: {
    height: 1.5,
    backgroundColor: COLORS.divider,
    marginBottom: 12,
  },
  dropdownSection: {
    gap: 4,
  },
  dropdownLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  dropdownText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: '600',
  },
  remediationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.success + '20',
    marginTop: 2,
  },
  remediationText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: '600',
  },
  safetyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  safetyFooterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
