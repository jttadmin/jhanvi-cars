import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const BookingSuccessScreen = ({route, navigation}) => {
  const {
    booking,
    pickup,
    destination,
    selectedVehicle,
    distanceKm,
    durationMinutes,
    estimatedFare,
  } = route.params || {};

  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      gestureEnabled: false,
    });

    const unsubscribe = navigation.addListener('beforeRemove', event => {
      const actionType = event.data.action?.type;

      if (actionType === 'GO_BACK' || actionType === 'POP') {
        event.preventDefault();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const bookingId = booking?.id;
  const bookingStatus = booking?.status || 'requested';

  const finalPickup = booking?.pickup_address || pickup || 'Current location';

  const finalDestination =
    booking?.destination_address || destination || 'Destination not selected';

  const finalVehicle = booking?.vehicle_type || selectedVehicle || 'Sedan';

  const finalDistance = booking?.distance_km ?? distanceKm ?? 0;

  const finalDuration = booking?.duration_minutes ?? durationMinutes ?? 0;

  const finalFare = booking?.estimated_fare ?? estimatedFare ?? 0;

  const formatStatus = status => {
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

  const handleViewBookings = () => {
    navigation.reset({
      index: 1,
      routes: [{name: 'CustomerHome'}, {name: 'Bookings'}],
    });
  };

  const handleBackHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CustomerHome',
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>

        <Text style={styles.subtitle}>
          Your Jhanvi Car ride has been booked successfully.
        </Text>

        {bookingId ? (
          <View style={styles.bookingInfoCard}>
            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>BOOKING ID</Text>

              <Text style={styles.bookingInfoValue}>{bookingId}</Text>
            </View>

            <View style={styles.bookingInfoDivider} />

            <View style={styles.bookingInfoRow}>
              <Text style={styles.bookingInfoLabel}>STATUS</Text>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {formatStatus(bookingStatus)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride Details</Text>

          <View style={styles.section}>
            <Text style={styles.label}>PICKUP</Text>

            <Text style={styles.value}>{finalPickup}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>DESTINATION</Text>

            <Text style={styles.value}>{finalDestination}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>VEHICLE</Text>

              <Text style={styles.value}>{finalVehicle}</Text>
            </View>

            <View style={styles.columnRight}>
              <Text style={styles.label}>DISTANCE</Text>

              <Text style={styles.value}>
                {Number(finalDistance).toFixed(1)} km
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>ESTIMATED TRAVEL TIME</Text>

            <Text style={styles.value}>
              {finalDuration ? `${finalDuration} min` : '--'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>ESTIMATED FARE</Text>

            <Text style={styles.fareAmount}>₹{Number(finalFare)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewBookings}>
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackHome}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
    alignItems: 'stretch',
  },

  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  checkmark: {
    color: '#fff',
    fontSize: 46,
    fontWeight: '700',
    lineHeight: 52,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  bookingInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  bookingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bookingInfoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
  },

  bookingInfoValue: {
    flex: 1,
    marginLeft: 16,
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    textAlign: 'right',
  },

  bookingInfoDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
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

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
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

  column: {
    flex: 1,
  },

  columnRight: {
    flex: 1,
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

  primaryButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  secondaryButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  secondaryButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default BookingSuccessScreen;
