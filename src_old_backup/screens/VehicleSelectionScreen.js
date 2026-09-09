import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { findRoute } from '../services/bookingService';
import { VEHICLE_LABELS } from '../constants/routes';

export default function VehicleSelectionScreen({ route, navigation }) {
  const { fromCity, toCity, date, time } = route.params;
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    findRoute(toCity)
      .then((routeDoc) => {
        if (!routeDoc) {
          Alert.alert('Not available', 'No pricing found for this route yet');
          navigation.goBack();
          return;
        }
        setPricing(routeDoc.vehiclePricing);
      })
      .catch(() => Alert.alert('Error', 'Could not load pricing'))
      .finally(() => setLoading(false));
  }, [toCity]);

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert('Select a vehicle', 'Please choose Cab, Sedan or SUV');
      return;
    }
    navigation.navigate('BookerDetails', {
      fromCity,
      toCity,
      date,
      time,
      vehicleType: selectedVehicle,
      price: pricing[selectedVehicle],
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {fromCity} → {toCity}
      </Text>
      <Text style={styles.subtitle}>{date} at {time}</Text>

      {Object.keys(pricing).map((vehicleKey) => (
        <TouchableOpacity
          key={vehicleKey}
          style={[
            styles.card,
            selectedVehicle === vehicleKey && styles.cardSelected,
          ]}
          onPress={() => setSelectedVehicle(vehicleKey)}
        >
          <Text style={styles.cardTitle}>{VEHICLE_LABELS[vehicleKey] || vehicleKey}</Text>
          <Text style={styles.cardPrice}>₹{pricing[vehicleKey]}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSelected: { borderColor: '#1a73e8', backgroundColor: '#eef4fe' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#1a73e8' },
  button: { backgroundColor: '#1a73e8', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
