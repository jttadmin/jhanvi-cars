import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import SearchScreen from '../screens/SearchScreen';
import VehicleSelectionScreen from '../screens/VehicleSelectionScreen';
import BookerDetailsScreen from '../screens/BookerDetailsScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        {user ? (
          // Logged in — main booking flow
          <>
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} options={{ title: 'Select Vehicle' }} />
            <Stack.Screen name="BookerDetails" component={BookerDetailsScreen} options={{ title: 'Your Details' }} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="History" component={BookingHistoryScreen} options={{ title: 'My Bookings' }} />
          </>
        ) : (
          // Logged out — auth flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Verify OTP' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
