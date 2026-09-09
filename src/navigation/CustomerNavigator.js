import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/customer/HomeScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import ConfirmBookingScreen from '../screens/customer/ConfirmBookingScreen';
import BookingSuccessScreen from '../screens/customer/BookingSuccessScreen';
import BookingsScreen from '../screens/customer/BookingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

const Stack = createNativeStackNavigator();

const CustomerNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CustomerHome"
        component={HomeScreen}
        options={{
          title: 'Jhanvi Cars',
        }}
      />

      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          title: 'Book a Cab',
        }}
      />

      <Stack.Screen
        name="ConfirmBooking"
        component={ConfirmBookingScreen}
        options={{
          title: 'Confirm Booking',
        }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{
          title: 'Booking Confirmed',
        }}
      />

      <Stack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          title: 'My Bookings',
        }}
      />

      <Stack.Screen
        name="CustomerProfile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
