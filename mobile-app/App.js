import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './src/i18n';

// Import screens
import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ResultScreen from './src/screens/ResultScreen';
import MapScreen from './src/screens/MapScreen';
import ImpactScreen from './src/screens/ImpactScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import VoiceScreen from './src/screens/VoiceScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // FORCE CLEAR OLD CACHED USER ID
    const clearOldCache = async () => {
      try {
        const data = await AsyncStorage.getItem('user-storage');
        if (data) {
          const parsed = JSON.parse(data);
          // If old user ID detected, clear it completely
          if (parsed?.state?.userId === '691642ec8c548b95117f24c1' || 
              parsed?.state?.user?.id === '691642ec8c548b95117f24c1') {
            console.log('🔥 CLEARING OLD USER ID FROM CACHE');
            await AsyncStorage.removeItem('user-storage');
            // Force reload with correct ID
            await AsyncStorage.setItem('user-storage', JSON.stringify({
              state: {
                user: { 
                  id: '673fc7f4f1867ab46b0a8c01',
                  name: 'Test User',
                  phone: '+919876543210'
                },
                userId: '673fc7f4f1867ab46b0a8c01',
                language: 'en'
              },
              version: 0
            }));
          }
        }
      } catch (error) {
        console.error('Cache clear error:', error);
      }
    };
    clearOldCache();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Impact" component={ImpactScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Voice" component={VoiceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
