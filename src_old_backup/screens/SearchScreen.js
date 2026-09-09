import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { getAvailableDestinations } from '../services/bookingService';

export default function SearchScreen({ navigation }) {
  const [destinations, setDestinations] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    getAvailableDestinations()
      .then(setDestinations)
      .catch(() => Alert.alert('Error', 'Could not load destinations'));
  }, []);

  const handleContinue = () => {
    if (!selectedCity) {
      Alert.alert('Select a destination', 'Please choose where you want to go');
      return;
    }
    navigation.navigate('VehicleSelection', {
      fromCity: 'Bangalore',
      toCity: selectedCity,
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().slice(0, 5),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Where to?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={styles.link}>My Bookings</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>From</Text>
      <View style={styles.fixedField}>
        <Text>Bangalore</Text>
      </View>

      <Text style={styles.label}>To</Text>
      <FlatList
        data={destinations}
        keyExtractor={(item) => item}
        style={{ maxHeight: 220, marginBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.destItem,
              selectedCity === item && styles.destItemSelected,
            ]}
            onPress={() => setSelectedCity(item)}
          >
            <Text style={selectedCity === item ? styles.destTextSelected : styles.destText}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.label}>Date & Time</Text>
      <TouchableOpacity style={styles.fixedField} onPress={() => setShowPicker(true)}>
        <Text>{date.toLocaleString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) setDate(selected);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Search Vehicles</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700' },
  link: { color: '#1a73e8', fontSize: 14 },
  label: { fontSize: 13, color: '#666', marginBottom: 6, marginTop: 8 },
  fixedField: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 8 },
  destItem: { padding: 14, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  destItemSelected: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  destText: { fontSize: 15, color: '#333' },
  destTextSelected: { fontSize: 15, color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#1a73e8', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { marginTop: 16, alignItems: 'center' },
  logoutText: { color: '#999', fontSize: 13 },
});
