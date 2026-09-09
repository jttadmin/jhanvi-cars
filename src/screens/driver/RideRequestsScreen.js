import React, {useCallback, useState} from 'react';

import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {useAuth} from '../../context/AuthContext';

import {acceptRideRequest, getDriverRideRequests} from '../../services/api';

const RideRequestsScreen = () => {
  const navigation = useNavigation();

  const {token} = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadRequests = useCallback(
    async (isRefreshing = false) => {
      if (!token) {
        setRequests([]);
        setLoading(false);
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const data = await getDriverRideRequests(token);

        setRequests(data || []);
      } catch (err) {
        console.error('Failed to load ride requests:', err);

        setError(err.message || 'Unable to load ride requests.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests]),
  );

  const handleRefresh = () => {
    loadRequests(true);
  };

  const handleAccept = booking => {
    Alert.alert(
      'Accept Ride',
      `Accept this ride from ${booking.customer_name || 'customer'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const acceptedBooking = await acceptRideRequest({
                token,
                bookingId: booking.id,
              });

              setRequests(currentRequests =>
                currentRequests.filter(item => item.id !== booking.id),
              );

              Alert.alert(
                'Ride Accepted',
                'You have successfully accepted this ride.',
                [
                  {
                    text: 'Open Ride',
                    onPress: () => {
                      navigation.navigate('ActiveRide', {
                        booking: {
                          ...booking,
                          ...acceptedBooking,
                        },
                      });
                    },
                  },
                ],
              );
            } catch (acceptError) {
              console.error('Failed to accept ride:', error);

              Alert.alert(
                'Unable to Accept Ride',
                error.message || 'This ride may no longer be available.',
              );

              loadRequests(true);
            }
          },
        },
      ],
    );
  };

  const renderRequest = ({item}) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.customerName}>
              {item.customer_name || 'Customer'}
            </Text>

            <Text style={styles.customerMobile}>
              {item.customer_mobile || ''}
            </Text>
          </View>

          <Text style={styles.fare}>₹{Number(item.estimated_fare || 0)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationRow}>
          <View style={styles.pickupDot} />

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>PICKUP</Text>

            <Text style={styles.locationText}>{item.pickup_address}</Text>
          </View>
        </View>

        <View style={styles.connector} />

        <View style={styles.locationRow}>
          <View style={styles.destinationDot} />

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>DESTINATION</Text>

            <Text style={styles.locationText}>{item.destination_address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>VEHICLE</Text>

            <Text style={styles.detailValue}>{item.vehicle_type}</Text>
          </View>

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
        </View>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAccept(item)}
          activeOpacity={0.8}>
          <Text style={styles.acceptButtonText}>Accept Ride</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading ride requests...</Text>
      </View>
    );
  }

  if (error && requests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to load ride requests</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadRequests()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚕</Text>

          <Text style={styles.emptyTitle}>No ride requests</Text>

          <Text style={styles.emptyText}>
            New ride requests will appear here when you are online.
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => String(item.id)}
          renderItem={renderRequest}
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
    backgroundColor: '#F5F5F5',
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

  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  customerMobile: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },

  fare: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
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

  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111111',
    marginTop: 5,
    marginRight: 12,
  },

  destinationDot: {
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

  acceptButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F5F5F5',
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

export default RideRequestsScreen;
