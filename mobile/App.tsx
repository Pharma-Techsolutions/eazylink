import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { authAPI, callAPI } from './src/services/api';
import { TokenManager } from './src/services/secureStorage';

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('TestPass123!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [recipientId, setRecipientId] = useState('2');
  const [callData, setCallData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [callLoading, setCallLoading] = useState(false);
  const [callError, setCallError] = useState('');
  const [callStatus, setCallStatus] = useState('idle');

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      const response = await authAPI.login(email, password);
      console.log('Login response:', response.data);
      await TokenManager.storeTokens(response.data.token);
      setUser(response.data.user);
      setScreen('call');
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await TokenManager.clearTokens();
    setUser(null);
    setScreen('login');
    setCallData(null);
    setCallStatus('idle');
  };

  const handleInitiateCall = async () => {
    try {
      setCallLoading(true);
      setCallError('');
      const response = await callAPI.initiateCall(recipientId);
      console.log('Call initiated:', response.data);
      setCallData(response.data);
      setCallStatus('initiated');
      setVerificationCode(response.data.verification_code);
    } catch (err: any) {
      console.error('Call error:', err);
      setCallError(err.response?.data?.detail || 'Failed to initiate call');
    } finally {
      setCallLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    try {
      setCallLoading(true);
      setCallError('');
      const response = await callAPI.confirmCallCode(callData.call_id, verificationCode);
      console.log('Code confirmed:', response.data);
      if (response.data.is_verified) {
        setCallStatus('confirmed');
      }
    } catch (err: any) {
      setCallError(err.response?.data?.detail || 'Failed to confirm code');
    } finally {
      setCallLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      setCallLoading(true);
      await callAPI.endCall(callData.call_id, 120);
      setCallStatus('ended');
      setTimeout(() => {
        setCallData(null);
        setCallStatus('idle');
      }, 1500);
    } catch (err: any) {
      setCallError(err.response?.data?.detail || 'Failed to end call');
    } finally {
      setCallLoading(false);
    }
  };

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logo}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
          
          <Text style={styles.appTitle}>Private</Text>
          <Text style={styles.appSubtitle}>End-to-end encrypted calling</Text>

          {loginError && (
            <View style={styles.alert}>
              <Text style={styles.alertText}>⚠ {loginError}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              editable={!loginLoading}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loginLoading}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.buttonPrimary, loginLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>Demo: alice@example.com / TestPass123!</Text>
        </View>
      </ScrollView>
    );
  }

  // CALL SCREEN
  if (screen === 'call') {
    return (
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userInfo}>ID {user?.id}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {callError && (
          <View style={styles.alert}>
            <Text style={styles.alertText}>⚠ {callError}</Text>
          </View>
        )}

        <View style={styles.section}>
          {/* IDLE STATE */}
          {callStatus === 'idle' && (
            <>
              <Text style={styles.sectionTitle}>Start a Call</Text>
              <Text style={styles.sectionSubtitle}>Enter recipient ID</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Recipient ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  value={recipientId}
                  onChangeText={setRecipientId}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={[styles.buttonPrimary, callLoading && styles.buttonDisabled]}
                onPress={handleInitiateCall}
                disabled={callLoading}
              >
                {callLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>📞 Initiate Call</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* INITIATED STATE */}
          {callStatus === 'initiated' && (
            <>
              <Text style={styles.sectionTitle}>Verification Code</Text>
              
              <View style={styles.codeCard}>
                <Text style={styles.codeCardLabel}>Code</Text>
                <Text style={styles.codeCardValue}>{verificationCode}</Text>
                <View style={styles.divider} />
                <Text style={styles.codeCardSmall}>Share with recipient</Text>
              </View>

              <TouchableOpacity
                style={[styles.buttonPrimary, callLoading && styles.buttonDisabled]}
                onPress={handleConfirmCode}
                disabled={callLoading}
              >
                {callLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Code Verified</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => {
                  setCallData(null);
                  setCallStatus('idle');
                }}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* CONFIRMED STATE */}
          {callStatus === 'confirmed' && (
            <>
              <View style={styles.activeCallCard}>
                <Text style={styles.activeCallIcon}>✓</Text>
                <Text style={styles.activeCallStatus}>Call Active</Text>
              </View>

              <TouchableOpacity
                style={[styles.buttonDanger, callLoading && styles.buttonDisabled]}
                onPress={handleEndCall}
                disabled={callLoading}
              >
                {callLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>⊗ End Call</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ENDED STATE */}
          {callStatus === 'ended' && (
            <>
              <View style={styles.successCard}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>Call Ended</Text>
              </View>

              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={() => {
                  setCallData(null);
                  setCallStatus('idle');
                }}
              >
                <Text style={styles.buttonText}>New Call</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  content: { padding: 24, minHeight: '100%', justifyContent: 'center' },
  
  logo: { alignItems: 'center', marginBottom: 24 },
  lockIcon: { fontSize: 48 },
  appTitle: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  appSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1a2340' },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  userInfo: { fontSize: 12, color: '#888' },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 6 },
  logoutText: { color: '#FF3B30', fontSize: 13, fontWeight: '600' },
  
  section: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, color: '#888', marginBottom: 24 },
  
  formGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#aaa', marginBottom: 8 },
  input: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#1a2340', borderWidth: 1, borderColor: '#2a3554', color: '#fff', borderRadius: 8, fontSize: 14 },
  
  alert: { backgroundColor: 'rgba(255, 59, 48, 0.1)', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#FF3B30', marginBottom: 20, marginHorizontal: 24 },
  alertText: { color: '#FF6B60', fontSize: 13 },
  
  buttonPrimary: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonSecondary: { backgroundColor: '#1a2340', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonSecondaryText: { color: '#aaa', fontSize: 14, fontWeight: '600' },
  buttonDanger: { backgroundColor: '#FF3B30', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  
  codeCard: { backgroundColor: '#1a2340', borderWidth: 2, borderColor: '#007AFF', borderRadius: 12, padding: 24, marginBottom: 24, alignItems: 'center' },
  codeCardLabel: { fontSize: 11, color: '#888', marginBottom: 12 },
  codeCardValue: { fontSize: 36, fontWeight: '700', color: '#007AFF', letterSpacing: 4, fontFamily: 'Courier' },
  divider: { width: '100%', height: 1, backgroundColor: '#2a3554', marginVertical: 16 },
  codeCardSmall: { fontSize: 12, color: '#888' },
  
  activeCallCard: { backgroundColor: '#1a2340', borderWidth: 1, borderColor: '#34C759', borderRadius: 12, padding: 32, marginBottom: 24, alignItems: 'center' },
  activeCallIcon: { fontSize: 32, color: '#34C759', marginBottom: 12 },
  activeCallStatus: { fontSize: 18, fontWeight: '600', color: '#34C759' },
  
  successCard: { backgroundColor: '#1a2340', borderWidth: 1, borderColor: '#34C759', borderRadius: 12, padding: 32, marginBottom: 24, alignItems: 'center' },
  successIcon: { fontSize: 48, color: '#34C759', marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  
  footer: { textAlign: 'center', color: '#666', fontSize: 12, marginTop: 24, fontStyle: 'italic' },
});
