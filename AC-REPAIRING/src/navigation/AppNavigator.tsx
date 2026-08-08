import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppProvider, useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../constants/theme';

// ─── Auth Screens ──────────────────────────────────────────────────────────
import { SplashScreen }          from '../screens/auth/SplashScreen';
import { OnboardingScreen }       from '../screens/auth/OnboardingScreen';
import { LoginScreen }            from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen }   from '../screens/auth/ForgotPasswordScreen';

// ─── Permission Screens ────────────────────────────────────────────────────
import { LocationPermissionScreen }     from '../screens/permissions/LocationPermissionScreen';
import { NotificationPermissionScreen } from '../screens/permissions/NotificationPermissionScreen';
import { CameraPermissionScreen }       from '../screens/permissions/CameraPermissionScreen';
import { MediaPermissionScreen }        from '../screens/permissions/MediaPermissionScreen';

import { AssignedJobsScreen }  from '../screens/main/AssignedJobsScreen';   // Home: jobs assigned by admin
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileScreen }       from '../screens/main/ProfileScreen';
import { TechAdvisorScreen }   from '../screens/main/TechAdvisorScreen';
import { PartsRequestScreen }  from '../screens/main/PartsRequestScreen';
import { EarningsDetailsScreen } from '../screens/main/EarningsDetailsScreen';
import { SafetyChecklistScreen } from '../screens/main/SafetyChecklistScreen';
import { FeedbackRatingsScreen } from '../screens/main/FeedbackRatingsScreen';

// ─── Job Flow Screens ──────────────────────────────────────────────────────
import { JobDetailsScreen }    from '../screens/booking/JobDetailsScreen';   // Accept / Start / Complete
import { WorkReportScreen }    from '../screens/booking/WorkReportScreen';   // Submit photos + report to admin
import { BookingDetailsScreen } from '../screens/booking/BookingDetailsScreen'; // Legacy detail view

// ─── Profile / Account Screens ────────────────────────────────────────────
import { SettingsScreen }       from '../screens/profile/SettingsScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { EditProfileScreen }    from '../screens/profile/EditProfileScreen';
import { ServiceHistoryScreen } from '../screens/profile/ServiceHistoryScreen';

// ─── Support Screens ──────────────────────────────────────────────────────
import { HelpCenterScreen }      from '../screens/support/HelpCenterScreen';
import { RaiseComplaintScreen }  from '../screens/support/RaiseComplaintScreen';
import { ComplaintHistoryScreen } from '../screens/support/ComplaintHistoryScreen';

// ─── Chat Screen (for communicating with customer / admin) ─────────────────
import { ChatScreen }            from '../screens/advanced/ChatScreen';

// ─── Navigation Types ─────────────────────────────────────────────────────
type RootStackParamList = {
  // Auth
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  // Permissions
  LocationPermission: undefined;
  NotificationPermission: undefined;
  CameraPermission: undefined;
  MediaPermission: undefined;
  // Tabs
  MainTabs: undefined;
  // Notifications
  Notifications: undefined;
  // Diagnostics Advisor Utility
  TechAdvisor: undefined;
  PartsRequest: undefined;
  EarningsDetails: undefined;
  SafetyChecklist: undefined;
  FeedbackRatings: undefined;
  // Job Flow — core
  JobDetails: { job: any };
  WorkReport: { job: any };
  BookingDetails: { bookingId: string } | undefined;
  // Profile
  Settings: undefined;
  ChangePassword: undefined;
  EditProfile: undefined;
  ServiceHistory: undefined;
  // Support
  HelpCenter: undefined;
  RaiseComplaint: undefined;
  ComplaintHistory: undefined;
  // Chat
  Chat: { technicianName?: string; customerName?: string } | undefined;
};

type TabParamList = {
  AssignedJobs: undefined;
  TechAdvisor: undefined;
  EarningsDetails: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary:      COLORS.secondary,
    background:   COLORS.background,
    card:         '#ffffff',
    text:         COLORS.primary,
    border:       COLORS.border,
    notification: COLORS.secondary,
  },
};

function TabIcon({ name, color }: { name: keyof typeof MaterialIcons.glyphMap; color: string }) {
  return <MaterialIcons name={name} size={24} color={color} />;
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor:  COLORS.border,
          height: Platform.OS === 'ios' ? 88 : (insets.bottom > 0 ? 62 + insets.bottom : 64),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="AssignedJobs"
        component={AssignedJobsScreen}
        options={{
          title: 'My Jobs',
          tabBarIcon: ({ color }) => <TabIcon name="assignment" color={color} />,
        }}
      />
      <Tab.Screen
        name="TechAdvisor"
        component={TechAdvisorScreen}
        options={{
          title: 'Advisor',
          tabBarIcon: ({ color }) => <TabIcon name="build" color={color} />,
        }}
      />
      <Tab.Screen
        name="EarningsDetails"
        component={EarningsDetailsScreen}
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => <TabIcon name="account-balance-wallet" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <TabIcon name="more-horiz" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
      >
        {/* ── Auth ── */}
        <Stack.Screen name="Splash"              component={SplashScreen} />
        <Stack.Screen name="Onboarding"          component={OnboardingScreen} />
        <Stack.Screen name="Login"               component={LoginScreen} />
        <Stack.Screen name="ForgotPassword"      component={ForgotPasswordScreen} />

        {/* ── Permissions ── */}
        <Stack.Screen name="LocationPermission"     component={LocationPermissionScreen} />
        <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
        <Stack.Screen name="CameraPermission"       component={CameraPermissionScreen} />
        <Stack.Screen name="MediaPermission"        component={MediaPermissionScreen} />

        {/* ── Main App ── */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="TechAdvisor" component={TechAdvisorScreen} />
        <Stack.Screen name="PartsRequest" component={PartsRequestScreen} />
        <Stack.Screen name="EarningsDetails" component={EarningsDetailsScreen} />
        <Stack.Screen name="SafetyChecklist" component={SafetyChecklistScreen} />
        <Stack.Screen name="FeedbackRatings" component={FeedbackRatingsScreen} />

        {/* ── Job Flow (Core) ── */}
        <Stack.Screen name="JobDetails"    component={JobDetailsScreen} />
        <Stack.Screen name="WorkReport"    component={WorkReportScreen} />
        <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />

        {/* ── Profile / Account ── */}
        <Stack.Screen name="Settings"       component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="EditProfile"    component={EditProfileScreen} />
        <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />

        {/* ── Support ── */}
        <Stack.Screen name="HelpCenter"       component={HelpCenterScreen} />
        <Stack.Screen name="RaiseComplaint"   component={RaiseComplaintScreen} />
        <Stack.Screen name="ComplaintHistory" component={ComplaintHistoryScreen} />

        {/* ── Communication ── */}
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
