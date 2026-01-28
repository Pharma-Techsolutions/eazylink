import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { callAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CallScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [recipientId, setRecipientId] = useState('2');
  const [callData, setCallData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'initiated' | 'confirmed' | 'ended'>('idle');

  const handleInitiateCall = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await callAPI.initiateCall(recipientId);
      setCallData(response.data);
      setCallStatus('initiated');
      setVerificationCode(response.data.verification_code);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initiate call');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await callAPI.confirmCallCode(callData.call_id, verificationCode);
      if (response.data.is_verified) {
        setCallStatus('confirmed');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to confirm code');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      setLoading(true);
      setError('');
      await callAPI.endCall(callData.call_id, 120);
      setCallStatus('ended');
      setTimeout(() => {
        setCallData(null);
        setCallStatus('idle');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to end call');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Make a Call</Text>
          <Text style={styles.subtitle}>{user?.name} (ID: {user?.id})</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {callStatus === 'idle' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Recipient User ID"
            value={recipientId}
            onChangeText={setRecipientId}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleInitiateCall} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Initiate Call</Text>}
          </TouchableOpacity>
        </>
      )}

      {callStatus === 'initiated' && (
        <>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Verification Code:</Text>
            <Text style={styles.code}>{verificationCode}</Text>
            <Text style={styles.info}>Share this code with the recipient</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleConfirmCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Code</Text>}
          </TouchableOpacity>
        </>
      )}

      {callStatus === 'confirmed' && (
        <>
          <View style={styles.connectedBox}>
            <Text style={styles.connected}>Connected ✓</Text>
            <Text style={styles.callInfo}>Call in progress...</Text>
          </View>
          <TouchableOpacity style={[styles.button, styles.endButton]} onPress={handleEndCall} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>End Call</Text>}
          </TouchableOpacity>
        </>
      )}

      {callStatus === 'ended' && (
        <>
          <View style={styles.successBox}>
            <Text style={styles.success}>Call ended successfully ✓</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setCallStatus('idle')}>
            <Text style={styles.buttonText}>New Call</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  logoutBtn: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 12, borderRadius: 8 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#c62828', marginBottom: 15, textAlign: 'center', backgroundColor: '#ffebee', padding: 10, borderRadius: 8 },
  codeBox: { backgroundColor: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  codeLabel: { fontSize: 12, color: '#666', marginBottom: 10 },
  code: { fontSize: 32, fontWeight: 'bold', color: '#007AFF', letterSpacing: 4 },
  info: { fontSize: 12, color: '#666', marginTop: 10 },
  connectedBox: { backgroundColor: '#d4edda', padding: 20, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  connected: { fontSize: 18, color: '#155724', fontWeight: '600' },
  callInfo: { fontSize: 14, color: '#155724', marginTop: 10 },
  endButton: { backgroundColor: '#dc3545' },
  successBox: { backgroundColor: '#d4edda', padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  success: { fontSize: 16, color: '#155724', fontWeight: '600' },
});
