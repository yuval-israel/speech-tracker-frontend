import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Layout, Spacing, useTheme } from '../theme';
import Text from '../components/Text';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SetupScreen from '../screens/SetupScreen';
import ChildListScreen from '../screens/ChildListScreen';
import AddChildScreen from '../screens/AddChildScreen';
import ChildDetailScreen from '../screens/ChildDetailScreen';
import RecordScreen from '../screens/RecordScreen';
import AlertsScreen from '../screens/AlertsScreen';
import DataScreen from '../screens/DataScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import VoiceCalibrationScreen from '../screens/VoiceCalibrationScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Placeholder for missing screens
const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name}</Text>
    </View>
);

// Stacks
const AuthStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const FamilyStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Auth Navigator
const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

// Onboarding Navigator
const OnboardingNavigator = () => (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
        <OnboardingStack.Screen name="IntroCarousel" component={OnboardingScreen} />
        <OnboardingStack.Screen name="Setup" component={SetupScreen} />
        <OnboardingStack.Screen name="AddChild" component={AddChildScreen} />
        <OnboardingStack.Screen name="VoiceCalibration" component={VoiceCalibrationScreen} />
    </OnboardingStack.Navigator>
);

// Family Stack (inside Tab)
const FamilyNavigator = () => (
    <FamilyStack.Navigator screenOptions={{ headerShown: false }}>
        <FamilyStack.Screen name="ChildList" component={ChildListScreen} />
        <FamilyStack.Screen name="AddChild" component={AddChildScreen} />
        <FamilyStack.Screen name="ChildDetail" component={ChildDetailScreen} />
        <FamilyStack.Screen name="Record" component={RecordScreen} />
    </FamilyStack.Navigator>
);

// Main Tabs - now uses theme
const MainNavigator = () => {
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: Layout.BOTTOM_NAV_HEIGHT,
                    paddingBottom: Spacing.sm,
                    paddingTop: Spacing.sm,
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                }
            }}
        >
            <Tab.Screen name="Home" component={ExercisesScreen} options={{
                title: 'Home',
                tabBarLabel: 'Home',
            }} />
            <Tab.Screen name="Record" component={RecordScreen} options={{
                title: 'Record',
                tabBarLabel: 'Record',
            }} />
            <Tab.Screen name="Data" component={DataScreen} options={{
                title: 'Data',
                tabBarLabel: 'Data',
            }} />
            <Tab.Screen name="Alerts" component={AlertsScreen} options={{
                title: 'Alerts',
                tabBarLabel: 'Alerts',
            }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{
                title: 'Profile',
                tabBarLabel: 'Profile',
            }} />
            <Tab.Screen name="MyFamily" component={FamilyNavigator} options={{
                title: 'My Family',
                tabBarLabel: 'Family',
                tabBarButton: () => null, // Hide from tab bar but keep accessible
            }} />
        </Tab.Navigator>
    );
};

// App Stack (Main + Modals)
const AppNavigator = () => (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="MainTabs" component={MainNavigator} />
    </AppStack.Navigator>
);

export default function Navigation({ isAuthenticated, hasConfiguredFamily, isLoading }) {
    const { colors } = useTheme();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {!isAuthenticated ? (
                <AuthNavigator />
            ) : !hasConfiguredFamily ? (
                <OnboardingNavigator />
            ) : (
                <AppNavigator />
            )}
        </NavigationContainer>
    );
}
