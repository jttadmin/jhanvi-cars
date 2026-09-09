import React, {useCallback, useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import {useAuth} from '../../context/AuthContext';
import {getMyBookings} from '../../services/api';

const BookingsScreen = () => {
  const {token} = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadBookings = useCallback(
    async (isRefreshing = false, showLoading = true) => {
      if (!token) {
        setBookings([]);
        setLoading(false);
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else if (showLoading) {
        setLoading(true);
      }

      setError('');

      try {
        const data = await getMyBookings(token);

        setBookings(data || []);
      } catch (err) {
        setError(err.message || 'Unable to load your bookings.');
      } finally {
        if (showLoading) {
          setLoading(false);
        }

        if (isRefreshing) {
          setRefreshing(false);
        }
      }
    },
    [token],
  );

  /*
   * Load bookings whenever the screen receives focus.
   */
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  /*
   * Automatically refresh bookings every 5 seconds.
   *
   * This silently updates the booking status without
   * showing the full loading screen.
   */
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadBookings(false, false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [token, loadBookings]);

  const handleRefresh = () => {
    loadBookings(true);
  };

  const formatDate = dateString => {
    if (!dateString) {
      return '--';
    }

    const date = new Date(dateString);

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'requested':
        return 'Requested';

      case 'driver_assigned':
        return 'Driver Assigned';

      case 'driver_arriving':
        return 'Driver Arriving';

      case 'ride_started':
        return 'Ride Started';

      case 'ride_completed':
        return 'Completed';

      case 'cancelled':
        return 'Cancelled';

      default:
        return status || 'Unknown';
    }
  };

  const renderBooking = ({item}) => {
    const driverAssigned =
      item.status === 'driver_assigned' ||
      item.status === 'driver_arriving' ||
      item.status === 'ride_started' ||
      item.status === 'ride_completed';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.vehicle}>{item.vehicle_type}</Text>

            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.status}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationRow}>
          <View style={styles.dotPickup} />

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>PICKUP</Text>

            <Text style={styles.locationText}>{item.pickup_address}</Text>
          </View>
        </View>

        <View style={styles.connector} />

        <View style={styles.locationRow}>
          <View style={styles.dotDestination} />

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>DESTINATION</Text>

            <Text style={styles.locationText}>{item.destination_address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>DISTANCE</Text>

            <Text style={styles.detailValue}>
              {Number(item.distance_km || 0).toFixed(1)} km
            </Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.detailLabel}>TIME</Text>

            <Text style={styles.detailValue}>
              {item.duration_minutes || 0} min
            </Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.detailLabel}>FARE</Text>

            <Text style={styles.fareValue}>
              ₹{Number(item.estimated_fare || 0)}
            </Text>
          </View>
        </View>

        {driverAssigned && item.driver_id ? (
          <>
            <View style={styles.divider} />

            <View style={styles.driverCard}>
              <Text style={styles.driverTitle}>Driver Assigned</Text>

              <View style={styles.driverRow}>
                <Text style={styles.driverLabel}>Driver</Text>

                <Text style={styles.driverValue}>
                  {item.driver_name || 'Driver'}
                </Text>
              </View>

              <View style={styles.driverRow}>
                <Text style={styles.driverLabel}>Mobile</Text>

                <Text style={styles.driverValue}>
                  {item.driver_mobile || '-'}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to load bookings</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadBookings()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>

        <Text style={styles.subtitle}>Your ride history</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚕</Text>

          <Text style={styles.emptyTitle}>No bookings yet</Text>

          <Text style={styles.emptyText}>
            Your completed and upcoming rides will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => String(item.id)}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  vehicle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  date: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },

  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },

  status: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  dotPickup: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111111',
    marginTop: 5,
    marginRight: 12,
  },

  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#777777',
    marginTop: 5,
    marginRight: 12,
  },

  connector: {
    width: 1,
    height: 16,
    backgroundColor: '#CCCCCC',
    marginLeft: 4.5,
    marginVertical: 2,
  },

  locationContent: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 4,
  },

  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
    lineHeight: 20,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detail: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },

  fareValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },

  driverCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
  },

  driverTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },

  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  driverLabel: {
    fontSize: 13,
    color: '#777777',
  },

  driverValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
  },

  loadingText: {
    fontSize: 15,
    color: '#777777',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  retryButton: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 21,
  },
});

export default BookingsScreen;
