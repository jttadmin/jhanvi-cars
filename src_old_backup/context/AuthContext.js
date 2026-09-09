import React, { createContext, useContext, useState } from 'react';

const API_BASE_URL = 'http://10.0.2.2:30080';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [token, setToken] = useState(null);
  const [phone, setPhone] = useState(null);

  // Step 1: send OTP through the Kubernetes backend
  const sendOTP = async (phoneNumber) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phoneNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to send OTP');
    }

    setPhone(phoneNumber);
    return data;
  };

  // Step 2: verify OTP and receive JWT
  const verifyOTP = async (code) => {
    if (!phone) {
      throw new Error('No OTP request in progress');
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Invalid OTP');
    }

    setToken(data.token);
    setUser(data.user);
    setPhone(null);

    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPhone(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        initializing,
        sendOTP,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
