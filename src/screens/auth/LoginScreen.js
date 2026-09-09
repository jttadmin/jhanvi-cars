import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

import {useAuth} from '../../context/AuthContext';

const LoginScreen = ({navigation}) => {
  const {login, loading} = useAuth();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!/^[0-9]{10}$/.test(mobile)) {
      Alert.alert(
        'Invalid mobile number',
        'Please enter a valid 10-digit mobile number.',
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }

    try {
      await login({
        mobile,
        password,
      });
    } catch (error) {
      Alert.alert(
        'Login failed',
        error.message || 'Unable to login. Please try again.',
      );
    }
  };

  const handleCustomerRegister = () => {
    navigation.navigate('Register');
  };

  const handleDriverRegister = () => {
    navigation.navigate('DriverRegister');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🚕</Text>
          </View>

          <Text style={styles.title}>Jhanvi Cars</Text>

          <Text style={styles.subtitle}>Your ride, your way</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>

          <Text style={styles.welcomeText}>Login to continue your journey</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile number</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={10}
            value={mobile}
            onChangeText={text => setMobile(text.replace(/[^0-9]/g, ''))}
            autoComplete="tel"
            textContentType="telephoneNumber"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}>
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forgotContainer}
          onPress={() =>
            Alert.alert(
              'Forgot password',
              'Password recovery will be added later.',
            )
          }
          disabled={loading}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}>
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>

          <TouchableOpacity onPress={handleCustomerRegister} disabled={loading}>
            <Text style={styles.registerLink}> Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.driverRegisterContainer}>
          <Text style={styles.driverRegisterText}>
            Want to drive with Jhanvi Car?
          </Text>

          <TouchableOpacity onPress={handleDriverRegister} disabled={loading}>
            <Text style={styles.driverRegisterLink}>Register as Driver</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Safe rides. Simple booking.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  logoText: {
    fontSize: 36,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
  },

  subtitle: {
    fontSize: 15,
    color: '#777777',
    marginTop: 6,
  },

  welcomeContainer: {
    marginBottom: 24,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },

  welcomeText: {
    fontSize: 15,
    color: '#777777',
  },

  inputContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 14,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
  },

  showText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },

  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },

  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  loginButton: {
    height: 54,
    backgroundColor: '#111111',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  registerText: {
    fontSize: 14,
    color: '#777777',
  },

  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },

  driverRegisterContainer: {
    alignItems: 'center',
    marginTop: 18,
  },

  driverRegisterText: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 6,
  },

  driverRegisterLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 36,
  },
});

export default LoginScreen;
