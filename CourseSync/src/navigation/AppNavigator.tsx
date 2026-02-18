import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import GradesScreen from '../screens/GradesScreen';
import AIScreen from '../screens/AIScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Calendar') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Grades') {
                        iconName = focused ? 'school' : 'school-outline';
                    } else if (route.name === 'AI') {
                        iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Grades" component={GradesScreen} />
            <Tab.Screen name="AI" component={AIScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const canvasDomain = useStore((state) => state.preferences.canvasDomain);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!canvasDomain ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (
                    <Stack.Screen name="Main" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
