import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, cancelBooking } from '../services/bookingService';
import { VEHICLE_LABELS } from '../constants/routes';

export default function BookingHistoryScreen() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(() => {
    if (!token) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    getUserBookings(token)
      .then(setBookings)
      .catch(() => Alert.alert('Error', 'Could not load bookings'))
      .finally(() => setLoading(false));
  }, [token]);

  // Refresh every time this screen comes into focus
  useFocusEffect(loadBookings);

  const handleCancel = (bookingId) => {
    Alert.alert(
      'Cancel booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId, token);
              loadBookings();
            } catch (error) {
              Alert.alert('Error', error.message || 'Could not cancel booking');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#999' }}>No bookings yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bookings}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.route}>
              {item.fromCity} → {item.toCity}
            </Text>

            <Text
              style={[
                styles.status,
                item.bookingStatus === 'cancelled'
                  ? styles.statusCancelled
                  : styles.statusConfirmed,
              ]}
            >
              {item.bookingStatus}
            </Text>
          </View>

          <Text style={styles.detail}>
            {item.date} at {item.time}
          </Text>

          <Text style={styles.detail}>
            {VEHICLE_LABELS[item.vehicleType]} · ₹{item.price}
          </Text>

          {item.bookingStatus === 'confirmed' && (
            <TouchableOpacity onPress={() => handleCancel(item.id)}>
              <Text style={styles.cancelLink}>Cancel booking</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  route: {
    fontSize: 15,
    fontWeight: '700',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusConfirmed: {
    color: '#34a853',
  },
  statusCancelled: {
    color: '#ea4335',
  },
  detail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  cancelLink: {
    color: '#ea4335',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
  },
});
