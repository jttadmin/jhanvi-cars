import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import RideRequestsScreen from '../screens/driver/RideRequestsScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';
import ActiveRideScreen from '../screens/driver/ActiveRideScreen';

const Stack = createNativeStackNavigator();

const DriverNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{
          title: 'Driver Dashboard',
        }}
      />

      <Stack.Screen
        name="RideRequests"
        component={RideRequestsScreen}
        options={{
          title: 'Ride Requests',
        }}
      />

      <Stack.Screen
        name="ActiveRide"
        component={ActiveRideScreen}
        options={{
          title: 'Active Ride',
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="DriverProfile"
        component={DriverProfileScreen}
        options={{
          title: 'Driver Profile',
        }}
      />
    </Stack.Navigator>
  );
};

export default DriverNavigator;
