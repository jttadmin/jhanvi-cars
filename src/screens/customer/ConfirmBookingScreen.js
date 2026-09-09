import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import {useAuth} from '../../context/AuthContext';
import {createBooking} from '../../services/api';

const ConfirmBookingScreen = ({route, navigation}) => {
  const {
    pickup,
    destination,
    selectedVehicle,
    distanceKm,
    durationMinutes,
    estimatedFare,
    pickupLocation,
    destinationLocation,
  } = route.params || {};

  const {token} = useAuth();

  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = async () => {
    if (!token) {
      Alert.alert(
        'Login required',
        'Your session has expired. Please login again.',
      );
      return;
    }

    if (
      !pickupLocation ||
      typeof pickupLocation.latitude !== 'number' ||
      typeof pickupLocation.longitude !== 'number'
    ) {
      Alert.alert(
        'Pickup location missing',
        'Please select your pickup location again.',
      );
      return;
    }

    if (
      !destinationLocation ||
      typeof destinationLocation.latitude !== 'number' ||
      typeof destinationLocation.longitude !== 'number'
    ) {
      Alert.alert(
        'Destination location missing',
        'Please select your destination again.',
      );
      return;
    }

    setLoading(true);

    try {
      const booking = await createBooking({
        token,
        pickupAddress: pickup || 'Current location',
        pickupLatitude: pickupLocation.latitude,
        pickupLongitude: pickupLocation.longitude,
        destinationAddress: destination || 'Destination',
        destinationLatitude: destinationLocation.latitude,
        destinationLongitude: destinationLocation.longitude,
        vehicleType: selectedVehicle || 'Sedan',
      });

      navigation.reset({
        index: 1,
        routes: [
          {
            name: 'CustomerHome',
          },
          {
            name: 'BookingSuccess',
            params: {
              booking,
              pickup: booking.pickup_address,
              destination: booking.destination_address,
              selectedVehicle: booking.vehicle_type,
              distanceKm: Number(booking.distance_km),
              durationMinutes: booking.duration_minutes,
              estimatedFare: Number(booking.estimated_fare),
            },
          },
        ],
      });
    } catch (error) {
      console.error('Booking creation failed:', error);

      Alert.alert(
        'Booking failed',
        error.message || 'Unable to create your booking. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Confirm Your Ride</Text>

        <Text style={styles.subtitle}>
          Please check your ride details before confirming.
        </Text>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.label}>PICKUP</Text>

            <Text style={styles.value}>{pickup || 'Current location'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>DESTINATION</Text>

            <Text style={styles.value}>
              {destination || 'Destination not selected'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>VEHICLE</Text>

              <Text style={styles.value}>{selectedVehicle || 'Sedan'}</Text>
            </View>

            <View style={styles.rightColumn}>
              <Text style={styles.label}>DISTANCE</Text>

              <Text style={styles.value}>
                {Number(distanceKm || 0).toFixed(1)} km
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>ESTIMATED TRAVEL TIME</Text>

            <Text style={styles.value}>
              {durationMinutes ? `${durationMinutes} min` : '--'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>ESTIMATED FARE</Text>

            <Text style={styles.fareAmount}>₹{estimatedFare || 0}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            loading && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={loading}
          activeOpacity={0.8}>
          <Text style={styles.confirmButtonText}>
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <Text style={styles.backButtonText}>Change Ride Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginTop: 10,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  section: {
    paddingVertical: 4,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    marginBottom: 6,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 18,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rightColumn: {
    alignItems: 'flex-end',
  },

  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fareLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  fareAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
  },

  confirmButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmButtonDisabled: {
    opacity: 0.6,
  },

  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  backButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  backButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConfirmBookingScreen;
