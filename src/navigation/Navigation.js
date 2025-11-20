import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Colors, Layout } from '../theme';
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

import PaywallScreen from '../screens/PaywallScreen';

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
        <OnboardingStack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
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

// Main Tabs
const MainNavigator = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                height: Layout.BOTTOM_NAV_HEIGHT,
                paddingBottom: Layout.Spacing.sm,
                paddingTop: Layout.Spacing.sm,
            },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.muted,
            tabBarLabelStyle: {
                fontSize: 12,
                fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
            }
        }}
    >
        <Tab.Screen name="Home" component={ExercisesScreen} options={{ title: 'Exercises' }} />
        <Tab.Screen name="MyFamily" component={FamilyNavigator} options={{ title: 'My Family' }} />
        <Tab.Screen name="Record" component={RecordScreen} />
        <Tab.Screen name="Alerts" component={AlertsScreen} />
        <Tab.Screen name="Data" component={DataScreen} />
    </Tab.Navigator>
);

// App Stack (Main + Modals)
const AppNavigator = () => (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="MainTabs" component={MainNavigator} />
        <AppStack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
    </AppStack.Navigator>
);

export default function Navigation({ isAuthenticated, hasConfiguredFamily, isLoading }) {
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
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
