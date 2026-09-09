import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DriverRegisterScreen from '../screens/auth/DriverRegisterScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
        }}
      />

      <Stack.Screen
        name="DriverRegister"
        component={DriverRegisterScreen}
        options={{
          title: 'Driver Registration',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
