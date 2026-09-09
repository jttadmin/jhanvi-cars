import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Geolocation from '@react-native-community/geolocation';

import {useAuth} from '../../context/AuthContext';

import {
  getDriverStatus,
  updateDriverStatus,
  updateDriverLocation,
} from '../../services/api';

const LOCATION_UPDATE_INTERVAL = 10000;

const DriverHomeScreen = () => {
  const navigation = useNavigation();

  const {user, token, logout} = useAuth();

  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const watchIdRef = useRef(null);
  const lastLocationRef = useRef(null);

  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    lastLocationRef.current = null;
  }, []);

  const sendDriverLocation = useCallback(
    async position => {
      if (!token) {
        return;
      }

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      lastLocationRef.current = {
        latitude,
        longitude,
      };

      try {
        await updateDriverLocation({
          token,
          latitude,
          longitude,
        });
      } catch (error) {
        console.error('Failed to update driver location:', error);
      }
    },
    [token],
  );

  const startLocationTracking = useCallback(() => {
    if (!token || !isOnline) {
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        sendDriverLocation(position);
      },
      error => {
        console.error('Unable to get driver location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );

    watchIdRef.current = Geolocation.watchPosition(
      position => {
        sendDriverLocation(position);
      },
      error => {
        console.error('Driver location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: LOCATION_UPDATE_INTERVAL,
        fastestInterval: LOCATION_UPDATE_INTERVAL,
        maximumAge: 5000,
      },
    );
  }, [token, isOnline, sendDriverLocation]);

  const loadDriverStatus = useCallback(
    async (isRefreshing = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const driver = await getDriverStatus(token);

        setIsOnline(Boolean(driver.is_online));
      } catch (error) {
        Alert.alert(
          'Unable to load status',
          error.message || 'Unable to retrieve your driver status.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadDriverStatus();

    return () => {
      stopLocationTracking();
    };
  }, [loadDriverStatus, stopLocationTracking]);

  useFocusEffect(
    useCallback(() => {
      loadDriverStatus();

      return () => {
        stopLocationTracking();
      };
    }, [loadDriverStatus, stopLocationTracking]),
  );

  useEffect(() => {
    if (isOnline) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [isOnline, startLocationTracking, stopLocationTracking]);

  const handleRefresh = () => {
    loadDriverStatus(true);
  };

  const handleToggleStatus = async () => {
    if (!token || updatingStatus) {
      return;
    }

    const nextStatus = !isOnline;

    setUpdatingStatus(true);

    try {
      const driver = await updateDriverStatus({
        token,
        isOnline: nextStatus,
      });

      setIsOnline(Boolean(driver.is_online));
    } catch (error) {
      Alert.alert(
        'Unable to update status',
        error.message || 'Unable to change your online status.',
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

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
          try {
            stopLocationTracking();
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading driver status...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.brand}>Jhanvi Car</Text>

        <Text style={styles.welcome}>Welcome, {user?.name || 'Driver'}</Text>

        <Text style={styles.subtitle}>Driver Dashboard</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.statusTitle}>Driver Status</Text>

            <Text
              style={[
                styles.statusText,
                isOnline ? styles.onlineText : styles.offlineText,
              ]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>

          <View
            style={[
              styles.statusIndicator,
              isOnline ? styles.onlineIndicator : styles.offlineIndicator,
            ]}
          />
        </View>

        <Text style={styles.statusDescription}>
          {isOnline
            ? 'You are available for new ride requests.'
            : 'Go online when you are ready to receive rides.'}
        </Text>

        <TouchableOpacity
          style={[
            styles.statusButton,
            isOnline ? styles.goOfflineButton : styles.goOnlineButton,
          ]}
          onPress={handleToggleStatus}
          disabled={updatingStatus}
          activeOpacity={0.8}>
          {updatingStatus ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.statusButtonText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>

          <Text style={styles.statLabel}>Today's Rides</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹0</Text>

          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Driver Actions</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('RideRequests')}
          activeOpacity={0.8}>
          <View>
            <Text style={styles.actionTitle}>Ride Requests</Text>

            <Text style={styles.actionDescription}>
              View and accept available rides
            </Text>
          </View>

          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('DriverProfile')}
          activeOpacity={0.8}>
          <View>
            <Text style={styles.actionTitle}>Driver Profile</Text>

            <Text style={styles.actionDescription}>
              View your driver account
            </Text>
          </View>

          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
  },

  header: {
    marginBottom: 20,
  },

  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
  },

  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
    marginTop: 12,
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },

  statusText: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },

  onlineText: {
    color: '#16803C',
  },

  offlineText: {
    color: '#777777',
  },

  statusIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  onlineIndicator: {
    backgroundColor: '#16803C',
  },

  offlineIndicator: {
    backgroundColor: '#999999',
  },

  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#777777',
    marginTop: 14,
  },

  statusButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  goOnlineButton: {
    backgroundColor: '#111111',
  },

  goOfflineButton: {
    backgroundColor: '#555555',
  },

  statusButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },

  statLabel: {
    fontSize: 12,
    color: '#777777',
    marginTop: 5,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },

  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },

  actionDescription: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
  },

  actionArrow: {
    fontSize: 30,
    color: '#777777',
  },

  logoutButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CC3333',
  },
});

export default DriverHomeScreen;
