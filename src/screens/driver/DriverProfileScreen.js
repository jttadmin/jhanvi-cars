import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';

import {useAuth} from '../../context/AuthContext';

const DriverProfileScreen = () => {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
          </Text>
        </View>

        <Text style={styles.name}>{user?.name || 'Driver'}</Text>

        <Text style={styles.role}>Driver</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>

          <Text style={styles.value}>{user?.name || '-'}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Mobile</Text>

          <Text style={styles.value}>{user?.mobile || '-'}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Account type</Text>

          <Text style={styles.value}>Driver</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Driver Status</Text>

        <Text style={styles.statusText}>Your driver account is active.</Text>

        <Text style={styles.statusDescription}>
          Vehicle details and verification information will be added later.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },

  role: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 35,
  },

  label: {
    fontSize: 14,
    color: '#666',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    maxWidth: '60%',
    textAlign: 'right',
  },

  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },

  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },

  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  logoutButton: {
    marginTop: 'auto',
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
});

export default DriverProfileScreen;
