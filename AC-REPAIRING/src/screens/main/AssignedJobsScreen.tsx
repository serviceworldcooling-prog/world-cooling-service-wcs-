import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Image, Alert, ScrollView, RefreshControl, ActivityIndicator,
  Dimensions, StatusBar, SafeAreaView, TextInput, Switch, Animated,
  LayoutAnimation
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import type { Job } from '../../api/jobsApi';

const { width } = Dimensions.get('window');
const responsivePadding = Math.max(16, width * 0.05);

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  Pending:      { bg: '#FEF9C3', text: '#854D0E', icon: 'schedule' },
  Upcoming:     { bg: '#FEF3C7', text: '#92400E', icon: 'thumb-up' },
  'In Progress':{ bg: '#E0F2FE', text: '#0369A1', icon: 'build' },
  Completed:    { bg: '#ECFDF5', text: '#065F46', icon: 'check-circle' },
  Cancelled:    { bg: '#FEE2E2', text: '#991B1B', icon: 'cancel' },
};

export const AssignedJobsScreen = ({ navigation }: any) => {
  const { user, jobs, jobsLoading, loadJobs, unreadCount, updateTechStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'done'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusChange = async (newStatus: 'Available' | 'On Job' | 'Off Duty') => {
    try {
      await updateTechStatus(newStatus);
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

  const insets = useSafeAreaInsets();

  // Technician-focused safety and work recommendations
  const technicianTips = [
    "High temperature peak. Remind customers to keep doors closed for faster cooling testing.",
    "Safety first: Always isolate the mains power supply before servicing the outdoor compressor unit.",
    "Smart tip: Check system refrigerant pressure levels before and after wet servicing.",
    "Verify customer location on map and read specific issues notes before starting navigation."
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  // Rotate technician advisory tip every 8 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % technicianTips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }, [loadJobs]);

  const activeJobs    = jobs.filter(j => ['Pending', 'Upcoming', 'In Progress'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'Completed');

  const scrollRef = React.useRef<ScrollView>(null);
  const [jobsSectionY, setJobsSectionY] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const arrowAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeJobs.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsCollapsed(false);
      const timer = setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsCollapsed(true);
      }, 3000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 6,
            duration: 805,
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 805,
            useNativeDriver: true,
          })
        ])
      ).start();

      return () => {
        clearTimeout(timer);
      };
    } else {
      arrowAnim.setValue(0);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsCollapsed(false);
    }
  }, [activeJobs.length]);
  
  // Calculate today's completed jobs and payout
  const completedToday = completedJobs.filter(j => {
    // Basic date parsing to check if it's today (mock/local dates)
    const todayStr = new Date().toLocaleDateString();
    return new Date(j.preferredDate).toLocaleDateString() === todayStr || j.status === 'Completed';
  });
  
  const getJobPayout = (j: any) => (j && typeof j.finalPrice === 'number' && j.finalPrice > 0) ? j.finalPrice : (j?.price || 0);
  const totalPayout = jobs.filter(j => j.status !== 'Cancelled').reduce((sum, j) => sum + getJobPayout(j), 0);

  // Apply search query filter
  const filterBySearch = (list: Job[]) => {
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(item => 
      item.bookingId.toLowerCase().includes(query) ||
      item.serviceType.toLowerCase().includes(query) ||
      (item.customerId?.name && item.customerId.name.toLowerCase().includes(query)) ||
      (item.address && item.address.toLowerCase().includes(query))
    );
  };

  const currentList = filterBySearch(activeTab === 'active' ? activeJobs : completedJobs);


  const renderJob = ({ item }: { item: Job }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['Upcoming'];
    const customer = item.customerId;

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: COLORS.border }]}
        onPress={() => navigation.navigate('JobDetails', { job: item })}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.jobIdRow}>
            <Text style={styles.jobId}>#{item.bookingId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <MaterialIcons name={cfg.icon as any} size={11} color={cfg.text} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: cfg.text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={[styles.serviceName, { color: COLORS.primary }]}>{item.serviceType}</Text>
          {item.isEmergency && (
            <View style={styles.emergencyBadge}>
              <MaterialIcons name="warning" size={12} color={COLORS.danger} />
              <Text style={[styles.emergencyText, { color: COLORS.danger }]}>EMERGENCY</Text>
            </View>
          )}
        </View>

        {/* Customer row */}
        <View style={styles.customerRow}>
          <Image
            source={{ uri: customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80' }}
            style={styles.avatar}
          />
          <View style={styles.customerInfo}>
            <Text style={[styles.customerName, { color: COLORS.textPrimary }]}>{customer?.name || 'Customer'}</Text>
            <Text style={[styles.customerPhone, { color: COLORS.textSecondary }]}>{customer?.phone || '—'}</Text>
          </View>
          {item.isLiveLocation && (
            <View style={[styles.liveBadge, { backgroundColor: COLORS.successLight }]}>
              <MaterialIcons name="gps-fixed" size={12} color={COLORS.success} />
              <Text style={[styles.liveText, { color: COLORS.success }]}>Live Map</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={[styles.detailsBox, { backgroundColor: COLORS.background }]}>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={14} color={COLORS.textSecondary} />
            <Text style={[styles.detailText, { color: COLORS.textSecondary }]}>{item.preferredDate}  ·  {item.preferredTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="room" size={14} color={COLORS.textSecondary} />
            <Text style={[styles.detailText, { color: COLORS.textSecondary }]} numberOfLines={1}>{item.address}</Text>
          </View>
          {item.problemDescription ? (
            <View style={styles.detailRow}>
              <MaterialIcons name="notes" size={14} color={COLORS.textSecondary} />
              <Text style={[styles.detailText, { color: COLORS.textSecondary }]} numberOfLines={2}>{item.problemDescription}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: COLORS.divider }]}>
          <Text style={[styles.priceText, { color: COLORS.primary }]}>₹{getJobPayout(item).toLocaleString()}</Text>
          <TouchableOpacity
            style={[styles.viewBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('JobDetails', { job: item })}
          >
            <Text style={styles.viewBtnText}>
              {item.status === 'Completed' ? 'View Report' : 'View & Action'}
            </Text>
            <MaterialIcons name="chevron-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FAF9F6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Classical Header with Safe Area Inset Support */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
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

      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Brand Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeLeft}>
            <Text style={[styles.brandHeader, { color: COLORS.secondary }]}>EST. 2026</Text>
            <Text style={[styles.welcomeText, { color: COLORS.textPrimary }]}>
              Welcome, {user?.name?.split(' ')[0] || 'Technician'}
            </Text>
            <View style={[styles.greetingLine, { backgroundColor: COLORS.secondary + '30' }]} />
            <Text style={[styles.subText, { color: COLORS.textSecondary }]}>
              MANAGE ASSIGNED SERVICE REQUESTS AND REPORT SYSTEM UPDATES
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
            <View style={[styles.avatarBorder, { borderColor: COLORS.secondary + '40' }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileImg} />
              ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: COLORS.primary + '15' }]}>
                  <MaterialIcons name="person" size={24} color={COLORS.primary} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Premium Quick Earnings & Stats Card */}
        <View style={[styles.earningsCard, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
          <View style={styles.earningsHeader}>
            <View style={styles.earningsHeaderLeft}>
              <MaterialIcons name="monetization-on" size={20} color="#FFF" />
              <Text style={styles.earningsTitle}>YOUR PERFORMANCE DASHBOARD</Text>
            </View>
            <Text style={styles.weeklyIndicator}>WEEKLY</Text>
          </View>
          <View style={styles.earningsDivider} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>₹{totalPayout.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Payout</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{completedJobs.length}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>4.9 ★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Monthly Goal Progress Bar */}
          <View style={styles.goalContainer}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Monthly Target (Target: 20 Jobs)</Text>
              <Text style={styles.goalProgressText}>
                {Math.min(100, Math.round((completedJobs.length / 20) * 100))}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill, 
                { width: `${Math.min(100, (completedJobs.length / 20) * 100)}%` }
              ]} />
            </View>
          </View>
        </View>

        {/* Quick Action Grid Hub */}
        <Text style={styles.sectionHeading}>TECHNICIAN UTILITY HUB</Text>
        <View style={styles.actionGrid}>
          {[
            { label: 'Diagnostic Chat', icon: 'smart-toy', color: '#3B82F6', route: 'TechAdvisor', desc: 'AI Diagnosis' },
            { label: 'Request Parts', icon: 'inventory', color: '#10B981', route: 'PartsRequest', desc: 'Parts & stock' },
            { label: 'Safety SOP', icon: 'verified-user', color: '#F59E0B', route: 'SafetyChecklist', desc: 'Safety compliance' },
            { label: 'My Reviews', icon: 'star', color: '#8B5CF6', route: 'FeedbackRatings', desc: 'Client feedback' },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.actionBtn, { borderColor: COLORS.border }]} 
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBg, { backgroundColor: item.color + '15' }]}>
                <MaterialIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={[styles.actionLabel, { color: COLORS.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.actionDesc, { color: COLORS.textSecondary }]}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar - styled exactly like customer search */}
        <View style={[styles.searchSection, { borderColor: COLORS.border }]}>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs by ID, service, customer or address..."
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
        </View>

        {/* Weather & Professional Advisory Widget */}
        <View style={[styles.weatherWidget, { backgroundColor: '#ffffff', borderColor: COLORS.border }]}>
          <View style={styles.weatherLeft}>
            <Feather name="sun" size={26} color="#D97706" />
            <Text style={[styles.tempText, { color: COLORS.textPrimary }]}>34°C</Text>
            <Text style={[styles.conditionText, { color: COLORS.textSecondary }]}>SUNNY</Text>
          </View>
          <View style={[styles.widgetDivider, { backgroundColor: COLORS.border }]} />
          <View style={styles.weatherRight}>
            <Text style={[styles.weatherTipTitle, { color: COLORS.secondary }]}>WORK RECOMMENDATION</Text>
            <Text style={[styles.weatherTipText, { color: COLORS.textPrimary }]} numberOfLines={3}>
              {technicianTips[tipIndex]}
            </Text>
          </View>
        </View>

        {/* Summary horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.summaryScroll}
          contentContainerStyle={styles.summaryContent}
        >
          {[
            { label: 'Pending',     value: jobs.filter(j => j.status === 'Pending').length,       color: '#854D0E', bg: '#FEF9C3' },
            { label: 'Upcoming',    value: jobs.filter(j => j.status === 'Upcoming').length,      color: '#92400E', bg: '#FEF3C7' },
            { label: 'In Progress', value: jobs.filter(j => j.status === 'In Progress').length,   color: '#0369A1', bg: '#E0F2FE' },
            { label: 'Completed',   value: jobs.filter(j => j.status === 'Completed').length,     color: '#065F46', bg: '#ECFDF5' },
          ].map(s => (
            <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tabs Row */}
        <View 
          style={styles.tabRow}
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            setJobsSectionY(y);
          }}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && [styles.tabActive, { backgroundColor: COLORS.primary }]]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Active ({activeJobs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'done' && [styles.tabActive, { backgroundColor: COLORS.primary }]]}
            onPress={() => setActiveTab('done')}
          >
            <Text style={[styles.tabText, activeTab === 'done' && styles.tabTextActive]}>
              Completed ({completedJobs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Job List */}
        {jobsLoading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: COLORS.textSecondary }]}>Loading jobs...</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {currentList.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="briefcase" size={56} color={COLORS.textLight} />
                <Text style={[styles.emptyTitle, { color: COLORS.primary }]}>
                  {searchQuery ? 'No matching jobs' : `No ${activeTab === 'active' ? 'active' : 'completed'} jobs`}
                </Text>
                <Text style={[styles.emptyDesc, { color: COLORS.textSecondary }]}>
                  {searchQuery 
                    ? 'Try adjusting your search filters or clear text.'
                    : activeTab === 'active'
                    ? 'Admin will assign new service requests here.'
                    : 'Your completed jobs will appear here.'}
                </Text>
              </View>
            ) : (
              currentList.map(item => (
                <View key={item._id}>
                  {renderJob({ item })}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {activeJobs.length > 0 && (
        <TouchableOpacity
          style={[
            styles.floatingTaskBar, 
            { bottom: 10 },
            isCollapsed && styles.floatingTaskBarCollapsed
          ]}
          onPress={() => scrollRef.current?.scrollTo({ y: jobsSectionY, animated: true })}
          activeOpacity={0.9}
        >
          {!isCollapsed && (
            <View style={styles.floatingTaskLeft}>
              <MaterialIcons name="work-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.floatingTaskTitle}>Active jobs are available</Text>
                <Text style={styles.floatingTaskSubtitle} numberOfLines={1}>
                  {activeJobs.length} active service {activeJobs.length === 1 ? 'request' : 'requests'} pending
                </Text>
              </View>
            </View>
          )}
          <View style={[styles.floatingTaskRight, isCollapsed && styles.floatingTaskRightCollapsed]}>
            <Text style={styles.goBtnText}>GO TO TASK</Text>
            <Animated.View style={{ transform: [{ translateY: arrowAnim }] }}>
              <MaterialIcons name="arrow-downward" size={16} color="#fff" />
            </Animated.View>
          </View>
        </TouchableOpacity>
      )}
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
    paddingHorizontal: responsivePadding,
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
    paddingBottom: 40,
  },
  brandHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 4,
  },
  welcomeRow: {
    marginVertical: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  greetingLine: {
    width: 40,
    height: 1.5,
    marginVertical: 10,
    borderRadius: 1,
  },
  subText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  avatarBorder: {
    borderWidth: 1.5,
    padding: 2,
    borderRadius: 25,
  },
  profileImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  profilePlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsTitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  weeklyIndicator: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '800',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  goalContainer: {
    marginTop: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  goalProgressText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: ROUNDED.md,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    width: '48%',
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionTextCol: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionDesc: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    paddingHorizontal: 12,
    height: 46,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  weatherLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 14,
    minWidth: 70,
  },
  tempText: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  conditionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  widgetDivider: {
    width: 1,
    height: 40,
  },
  weatherRight: {
    flex: 1,
    paddingLeft: 14,
  },
  weatherTipTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  weatherTipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  summaryScroll: {
    maxHeight: 90,
    marginBottom: 16,
  },
  summaryContent: {
    paddingVertical: SPACING.xs,
    gap: 12,
  },
  summaryCard: {
    borderRadius: ROUNDED.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 90,
    ...SHADOWS.small,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 4,
    marginBottom: 20,
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: ROUNDED.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    ...SHADOWS.small,
  },
  cardHeader: {
    marginBottom: 12,
  },
  jobIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ROUNDED.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  emergencyText: {
    fontSize: 10,
    fontWeight: '800',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  customerPhone: {
    fontSize: 12,
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: ROUNDED.full,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  detailsBox: {
    borderRadius: ROUNDED.sm,
    padding: 10,
    gap: 5,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ROUNDED.sm,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  floatingTaskBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatingTaskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  floatingTaskTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  floatingTaskSubtitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  floatingTaskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ROUNDED.sm,
  },
  goBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  floatingTaskBarCollapsed: {
    left: undefined,
    right: 16,
    width: 120,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    borderRadius: ROUNDED.full,
  },
  floatingTaskRightCollapsed: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
