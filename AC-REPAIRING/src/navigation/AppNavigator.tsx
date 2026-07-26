import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { AppProvider, useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../constants/theme';

// ─── Auth Screens ──────────────────────────────────────────────────────────
import { SplashScreen }          from '../screens/auth/SplashScreen';
import { OnboardingScreen }       from '../screens/auth/OnboardingScreen';
import { LoginScreen }            from '../screens/auth/LoginScreen';
import { RegisterScreen }         from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen }   from '../screens/auth/ForgotPasswordScreen';

// ─── Permission Screens ────────────────────────────────────────────────────
import { LocationPermissionScreen }     from '../screens/permissions/LocationPermissionScreen';
import { NotificationPermissionScreen } from '../screens/permissions/NotificationPermissionScreen';

// ─── Core Flow Screens (Tab) ───────────────────────────────────────────────
// Main bottom tab screens — only what a serviceman needs
import { AssignedJobsScreen }  from '../screens/main/AssignedJobsScreen';   // Home: jobs assigned by admin
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileScreen }       from '../screens/main/ProfileScreen';

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
  Register: undefined;
  ForgotPassword: undefined;
  // Permissions
  LocationPermission: undefined;
  NotificationPermission: undefined;
  // Tabs
  MainTabs: undefined;
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
  Notifications: undefined;
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
  // FIX: was !n.read — correct field from TechNotification type is isRead
  const { unreadCount } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor:  COLORS.border,
          height: 60,
          paddingBottom: 8,
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
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <TabIcon name="notifications-none" color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
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
        <Stack.Screen name="Register"            component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword"      component={ForgotPasswordScreen} />

        {/* ── Permissions ── */}
        <Stack.Screen name="LocationPermission"     component={LocationPermissionScreen} />
        <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />

        {/* ── Main App ── */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

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
