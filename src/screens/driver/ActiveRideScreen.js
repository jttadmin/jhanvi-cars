import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';

import {useAuth} from '../../context/AuthContext';
import {updateDriverRideStatus} from '../../services/api';

const ActiveRideScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {token} = useAuth();

  const [booking, setBooking] = useState(route.params?.booking || null);

  const [updating, setUpdating] = useState(false);

  const status = booking?.status;

  const updateStatus = async nextStatus => {
    if (!booking?.id || !token || updating) {
      return;
    }

    setUpdating(true);

    try {
      const updatedBooking = await updateDriverRideStatus({
        token,
        bookingId: booking.id,
        status: nextStatus,
      });

      setBooking(updatedBooking);

      if (nextStatus === 'ride_completed') {
        Alert.alert(
          'Ride Completed',
          'The ride has been completed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'DriverHome',
                    },
                  ],
                });
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Failed to update ride status:', error);

      Alert.alert(
        'Unable to update ride',
        error.message || 'Unable to update the ride status.',
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleStartArriving = () => {
    Alert.alert('Start Ride Arrival', 'Are you on your way to the customer?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Start',
        onPress: () => updateStatus('driver_arriving'),
      },
    ]);
  };

  const handleStartRide = () => {
    Alert.alert('Start Ride', 'Have you picked up the customer?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Start Ride',
        onPress: () => updateStatus('ride_started'),
      },
    ]);
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride',
      'Have you reached the destination and completed the ride?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete Ride',
          onPress: () => updateStatus('ride_completed'),
        },
      ],
    );
  };

  const getStatusLabel = currentStatus => {
    switch (currentStatus) {
      case 'driver_assigned':
        return 'Driver Assigned';

      case 'driver_arriving':
        return 'Driver Arriving';

      case 'ride_started':
        return 'Ride Started';

      case 'ride_completed':
        return 'Ride Completed';

      default:
        return currentStatus || 'Unknown';
    }
  };

  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Ride not found</Text>

        <Text style={styles.errorText}>
          The active ride information is unavailable.
        </Text>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'DriverHome',
                },
              ],
            })
          }>
          <Text style={styles.homeButtonText}>Driver Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>CURRENT STATUS</Text>

        <Text style={styles.statusValue}>{getStatusLabel(status)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>

          <Text style={styles.infoValue}>
            {booking.customer_name || 'Customer'}
          </Text>
        </View>

        {booking.customer_mobile ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile</Text>

            <Text style={styles.infoValue}>{booking.customer_mobile}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trip Details</Text>

        <View style={styles.locationRow}>
          <View style={styles.pickupDot} />

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>PICKUP</Text>

            <Text style={styles.locationText}>{booking.pickup_address}</Text>
          </View>
        </View>

        <View style={styles.connector} />

        <View style={styles.locationRow}>
          <View style={styles.destinationDot} />

          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>DESTINATION</Text>

            <Text style={styles.locationText}>
              {booking.destination_address}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>VEHICLE</Text>

          <Text style={styles.detailValue}>{booking.vehicle_type}</Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.detailLabel}>DISTANCE</Text>

          <Text style={styles.detailValue}>
            {Number(booking.distance_km || 0).toFixed(1)} km
          </Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.detailLabel}>FARE</Text>

          <Text style={styles.fareValue}>
            ₹{Number(booking.estimated_fare || 0)}
          </Text>
        </View>
      </View>

      {status === 'driver_assigned' ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartArriving}
          disabled={updating}
          activeOpacity={0.8}>
          {updating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Start Arriving</Text>
          )}
        </TouchableOpacity>
      ) : null}

      {status === 'driver_arriving' ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartRide}
          disabled={updating}
          activeOpacity={0.8}>
          {updating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Start Ride</Text>
          )}
        </TouchableOpacity>
      ) : null}

      {status === 'ride_started' ? (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteRide}
          disabled={updating}
          activeOpacity={0.8}>
          {updating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Complete Ride</Text>
          )}
        </TouchableOpacity>
      ) : null}

      {status === 'ride_completed' ? (
        <View style={styles.completedCard}>
          <Text style={styles.completedTitle}>Ride Completed</Text>

          <Text style={styles.completedText}>
            This ride has been successfully completed.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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

  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 0.5,
  },

  statusValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111111',
    marginTop: 5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  infoLabel: {
    fontSize: 13,
    color: '#777777',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
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
    height: 18,
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

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
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

  primaryButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  completeButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#16803C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  completedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16803C',
  },

  completedText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F5F5F5',
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
  },

  homeButton: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ActiveRideScreen;
