import React, {createContext, useContext, useEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {loginUser, registerUser, getCurrentUser} from '../services/api';

const TOKEN_KEY = '@jhanvi_car_token';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        return;
      }

      const data = await getCurrentUser(savedToken);

      setToken(savedToken);
      setUser(data.user);
    } catch (error) {
      console.error('Session restore failed:', error);

      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async (authToken, authUser) => {
    await AsyncStorage.setItem(TOKEN_KEY, authToken);

    setToken(authToken);
    setUser(authUser);
  };

  const login = async ({mobile, password}) => {
    setLoading(true);

    try {
      const data = await loginUser({
        mobile,
        password,
      });

      await saveSession(data.token, data.user);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({name, mobile, password, role = 'customer'}) => {
    setLoading(true);

    try {
      const data = await registerUser({
        name,
        mobile,
        password,
        role,
      });

      await saveSession(data.token, data.user);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!token) {
      return null;
    }

    const data = await getCurrentUser(token);

    setUser(data.user);

    return data.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: user !== null && token !== null,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
};
