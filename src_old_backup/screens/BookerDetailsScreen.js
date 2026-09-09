import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { collectPayment, createBooking } from '../services/bookingService';
import { VEHICLE_LABELS } from '../constants/routes';

export default function BookerDetailsScreen({ route, navigation }) {
  const { fromCity, toCity, date, time, vehicleType, price } = route.params;
  const { user, token } = useAuth();

  const [name, setName] = useState('');
  const [contact, setContact] = useState(user?.phone?.replace('+91', '') || '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayAndBook = async () => {
    if (!token) {
      Alert.alert('Authentication required', 'Please log in again.');
      return;
    }

    if (!name.trim() || contact.trim().length !== 10 || !email.includes('@')) {
      Alert.alert(
        'Missing details',
        'Please enter a valid name, 10-digit contact, and email',
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Create Razorpay Test Mode order,
      //    open checkout, and verify payment on backend.
      const paymentResult = await collectPayment({
        amount: price,
        bookerName: name,
        bookerEmail: email,
        bookerContact: contact,
        token,
      });

      // 2. Create booking only after successful payment verification.
      const bookingId = await createBooking({
        fromCity,
        toCity,
        date,
        time,
        vehicleType,
        price,
        bookerName: name,
        bookerContact: contact,
        bookerEmail: email,
        paymentId: paymentResult.razorpay_payment_id,
        token,
      });

      navigation.replace('Confirmation', {
        bookingId,
        toCity,
        date,
        time,
        vehicleType,
        price,
      });
    } catch (err) {
      Alert.alert(
        'Payment not completed',
        err.description || err.message || 'Please try again',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your details</Text>

      <Text style={styles.summary}>
        {fromCity} → {toCity} · {date} {time} ·{' '}
        {VEHICLE_LABELS[vehicleType]} · ₹{price}
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />

      <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={styles.input}
        value={contact}
        onChangeText={setContact}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="10-digit mobile number"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handlePayAndBook}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pay ₹{price} & Book</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
