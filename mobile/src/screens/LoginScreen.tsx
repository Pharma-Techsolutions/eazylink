import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export function LoginScreen({ navigation }: any) {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('TestPass123!');

  const handleLogin = async () => {
    try {
      clearError();
      await login(email, password);
      navigation.replace('Home');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Private</Text>
      <Text style={styles.subtitle}>Secure Calling</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 12, borderRadius: 8 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorBox: { backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginBottom: 15 },
  error: { color: '#c62828', textAlign: 'center' },
  linkText: { textAlign: 'center', color: '#007AFF', marginTop: 15 },
});
