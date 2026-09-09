import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {useAuth} from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import DriverNavigator from './DriverNavigator';

const AppNavigator = () => {
  const {user} = useAuth();

  return (
    <NavigationContainer>
      {user === null ? (
        <AuthNavigator />
      ) : user.role === 'driver' ? (
        <DriverNavigator />
      ) : (
        <CustomerNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
