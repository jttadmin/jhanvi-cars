import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VEHICLE_LABELS } from '../constants/routes';

export default function ConfirmationScreen({ route, navigation }) {
  const { bookingId, toCity, date, time, vehicleType, price } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>

      <View style={styles.card}>
        <Row label="Destination" value={`Bangalore → ${toCity}`} />
        <Row label="Date & Time" value={`${date} at ${time}`} />
        <Row label="Vehicle" value={VEHICLE_LABELS[vehicleType]} />
        <Row label="Amount Paid" value={`₹${price}`} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Search' }] })}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  check: { fontSize: 56, color: '#34a853', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  bookingId: { fontSize: 13, color: '#666', marginBottom: 24 },
  card: { width: '100%', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 16, marginBottom: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: '#666', fontSize: 14 },
  rowValue: { fontWeight: '600', fontSize: 14 },
  button: { backgroundColor: '#1a73e8', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
