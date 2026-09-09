import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOTP } = useAuth();

  const handleSendOTP = async () => {
    const cleaned = phone.trim();
    if (cleaned.length !== 10) {
      Alert.alert('Invalid number', 'Enter a 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      // India country code assumed; adjust if you support other countries
      await sendOTP(cleaned);
      navigation.navigate('OTP', { phone: cleaned });
    } catch (err) {
      Alert.alert('Error sending OTP', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book your ride from Bangalore</Text>
      <Text style={styles.label}>Mobile Number</Text>
      <View style={styles.phoneRow}>
        <Text style={styles.prefix}>+91</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="98765 43210"
          value={phone}
          onChangeText={setPhone}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 32, textAlign: 'center' },
  label: { fontSize: 14, color: '#555', marginBottom: 8 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 24,
  },
  prefix: { paddingHorizontal: 12, fontSize: 16, color: '#333' },
  input: { flex: 1, paddingVertical: 12, paddingRight: 12, fontSize: 16 },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
