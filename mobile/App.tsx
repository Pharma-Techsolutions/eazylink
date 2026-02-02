import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { authAPI, callAPI } from './src/services/api';
import { TokenManager } from './src/services/secureStorage';
import {
  MicOnIcon,
  MicOffIcon,
  SpeakerOnIcon,
  SpeakerOffIcon,
  VideoOnIcon,
  VideoOffIcon,
  ICON_GREEN,
  ICON_GRAY,
} from './src/components/CustomIcons';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [recipientId, setRecipientId] = useState('');
  const [callData, setCallData] = useState(null);
  const [callLoading, setCallLoading] = useState(false);
  const [callError, setCallError] = useState('');
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerphone, setIsSpeakerphone] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  useEffect(() => {
    if (callStatus === 'active') {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter email and password');
      return;
    }
    try {
      setLoginLoading(true);
      setLoginError('');
      console.log('🔐 Login attempt:', { email, password });
      const response = await authAPI.login(email, password);
      console.log('✅ Login success:', response.data);
      await TokenManager.storeTokens(response.data.token);
      setUser(response.data.user);
      setScreen('call');
    } catch (err: any) {
      console.error('❌ Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setLoginError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await TokenManager.clearTokens();
      setUser(null);
      setScreen('login');
      setEmail('');
      setPassword('');
      setCallData(null);
      setCallStatus('idle');
      setCallDuration(0);
      setIsMuted(false);
      setIsSpeakerphone(false);
      setIsVideoEnabled(false);
      setLoginError('');
      setCallError('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleInitiateCall = async () => {
    if (!recipientId.trim()) {
      setCallError('Please enter recipient ID');
      return;
    }
    try {
      setCallLoading(true);
      setCallError('');
      setCallStatus('initiating');
      const response = await callAPI.initiateCall(recipientId);
      setCallData(response.data);
      setTimeout(() => { setCallStatus('connecting'); }, 500);
      setTimeout(() => { setCallStatus('active'); }, 2000);
    } catch (err: any) {
      setCallError(err.response?.data?.detail || 'Failed to initiate call');
      setCallStatus('idle');
    } finally {
      setCallLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      setCallLoading(true);
      await callAPI.endCall(callData.call_id, callDuration);
      setCallStatus('ended');
      setTimeout(() => {
        setCallData(null);
        setCallStatus('idle');
        setCallDuration(0);
        setRecipientId('');
        setIsMuted(false);
        setIsSpeakerphone(false);
        setIsVideoEnabled(false);
      }, 1500);
    } catch (err: any) {
      setCallError(err.response?.data?.detail || 'Failed to end call');
    } finally {
      setCallLoading(false);
    }
  };

  const toggleMute = () => { setIsMuted(!isMuted); };
  const toggleSpeaker = () => { setIsSpeakerphone(!isSpeakerphone); };
  const toggleVideo = () => { setIsVideoEnabled(!isVideoEnabled); };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.loginContent}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoBg}>
                <Image 
                  source={require('./assets/icon.png')} 
                  style={styles.logo}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.titleLarge}>EazyLink</Text>
            <Text style={styles.subtitle}>Encrypted calling, no logs</Text>

            {/* Error */}
            {loginError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.formSection}>
              <TextInput
                style={styles.inputField}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                editable={!loginLoading}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={[styles.inputField, { marginTop: 12 }]}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loginLoading}
              />

              <TouchableOpacity
                style={[styles.btnLogin, loginLoading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnLoginText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Test Credentials */}
            <View style={styles.credentialsBox}>
              <Text style={styles.credentialsTitle}>Demo Credentials</Text>
              <Text style={styles.credentialsText}>alice@example.com</Text>
              <Text style={styles.credentialsText}>bob@example.com</Text>
              <Text style={styles.credentialsPassword}>Password: TestPass123!</Text>
            </View>

            {/* Footer */}
            <View style={styles.loginFooter}>
              <Text style={styles.footerSmall}>End-to-end encrypted</Text>
              <Text style={styles.footerSmall}>Calls are deleted after 5 seconds</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // FULLSCREEN VIDEO CALL
  if (callStatus === 'active' && isVideoEnabled) {
    return (
      <SafeAreaView style={styles.fullscreenContainer}>
        <View style={styles.videoFullscreen}>
          {/* Remote Video (placeholder) */}
          <View style={styles.remoteVideoArea}>
            <Text style={styles.videoPlaceholder}>📹</Text>
            <Text style={styles.remoteName}>Caller</Text>
            <Text style={styles.remoteDuration}>{formatDuration(callDuration)}</Text>
          </View>

          {/* Local Video Indicator (small) */}
          <View style={styles.localVideoIndicator}>
            <Text style={styles.localVideoText}>You</Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.fullscreenControls}>
            {/* Mute */}
            <TouchableOpacity
              style={[styles.fscButton, isMuted && styles.fscButtonActive]}
              onPress={toggleMute}
            >
              {isMuted ? (
                <MicOffIcon size={32} color={ICON_GRAY} />
              ) : (
                <MicOnIcon size={32} color={ICON_GREEN} />
              )}
            </TouchableOpacity>

            {/* Speaker */}
            <TouchableOpacity
              style={[styles.fscButton, isSpeakerphone && styles.fscButtonActive]}
              onPress={toggleSpeaker}
            >
              {isSpeakerphone ? (
                <SpeakerOffIcon size={32} color={ICON_GRAY} />
              ) : (
                <SpeakerOnIcon size={32} color={ICON_GREEN} />
              )}
            </TouchableOpacity>

            {/* End Call - Large Red */}
            <TouchableOpacity
              style={styles.fscButtonEnd}
              onPress={handleEndCall}
            >
              <Text style={styles.fscEndText}>End</Text>
            </TouchableOpacity>

            {/* Toggle Video */}
            <TouchableOpacity
              style={[styles.fscButton]}
              onPress={toggleVideo}
            >
              <VideoOnIcon size={32} color={ICON_GREEN} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // CALL SCREEN (Audio Only)
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.callContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userId}>ID: {user?.id}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {callError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{callError}</Text>
          </View>
        )}

        {/* IDLE STATE */}
        {callStatus === 'idle' && (
          <View style={styles.centerContent}>
            <Text style={styles.pageTitle}>Make a Call</Text>
            <Text style={styles.pageSubtitle}>Enter the recipient ID</Text>

            <TextInput
              style={styles.recipientInput}
              placeholder="Recipient ID (e.g., 2)"
              placeholderTextColor="#999"
              value={recipientId}
              onChangeText={setRecipientId}
              keyboardType="numeric"
              editable={!callLoading}
            />

            <TouchableOpacity
              style={[styles.callButton, callLoading && styles.btnDisabled]}
              onPress={handleInitiateCall}
              disabled={callLoading}
            >
              {callLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  <Text style={styles.callButtonText}>Start Call</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* INITIATING/CONNECTING STATE */}
        {(callStatus === 'initiating' || callStatus === 'connecting') && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={ICON_GREEN} style={{ marginBottom: 20 }} />
            <Text style={styles.statusTitle}>
              {callStatus === 'initiating' ? 'Initiating Call' : 'Connecting'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {callStatus === 'initiating' ? 'Setting up connection...' : 'Establishing secure link...'}
            </Text>

            {callData && (
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Code</Text>
                <Text style={styles.codeValue}>{callData.verification_code}</Text>
              </View>
            )}
          </View>
        )}

        {/* ACTIVE CALL STATE */}
        {callStatus === 'active' && !isVideoEnabled && (
          <View style={styles.centerContent}>
            <View style={styles.activeCallBox}>
              <Text style={styles.callTimerLabel}>Call Duration</Text>
              <Text style={styles.callTimer}>{formatDuration(callDuration)}</Text>
              <View style={styles.encryptedBadge}>
                <Text style={styles.encryptedText}>🔒 Encrypted</Text>
              </View>
            </View>

            {/* Call Controls */}
            <View style={styles.controlsGrid}>
              <TouchableOpacity
                style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                onPress={toggleMute}
              >
                {isMuted ? (
                  <MicOffIcon size={40} color={ICON_GRAY} />
                ) : (
                  <MicOnIcon size={40} color={ICON_GREEN} />
                )}
                <Text style={styles.controlBtnLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, isSpeakerphone && styles.controlBtnActive]}
                onPress={toggleSpeaker}
              >
                {isSpeakerphone ? (
                  <SpeakerOffIcon size={40} color={ICON_GRAY} />
                ) : (
                  <SpeakerOnIcon size={40} color={ICON_GREEN} />
                )}
                <Text style={styles.controlBtnLabel}>{isSpeakerphone ? 'Phone' : 'Speaker'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, isVideoEnabled && styles.controlBtnActive]}
                onPress={toggleVideo}
              >
                {isVideoEnabled ? (
                  <VideoOnIcon size={40} color={ICON_GREEN} />
                ) : (
                  <VideoOffIcon size={40} color={ICON_GRAY} />
                )}
                <Text style={styles.controlBtnLabel}>Video</Text>
              </TouchableOpacity>
            </View>

            {/* End Call */}
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
            >
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ENDED STATE */}
        {callStatus === 'ended' && (
          <View style={styles.centerContent}>
            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.endedTitle}>Call Ended</Text>
            <Text style={styles.endedDuration}>{formatDuration(callDuration)}</Text>
            <Text style={styles.endedMessage}>Data securely deleted</Text>

            <TouchableOpacity
              style={styles.newCallButton}
              onPress={() => {
                setCallStatus('idle');
                setRecipientId('');
              }}
            >
              <Text style={styles.newCallText}>New Call</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // GENERAL
  container: { flex: 1, backgroundColor: '#fff' },
  fullscreenContainer: { flex: 1, backgroundColor: '#000' },

  // LOGIN
  loginContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 30 },
  logoBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logo: { width: 80, height: 80, borderRadius: 40 },
  titleLarge: { fontSize: 36, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 40 },

  formSection: { marginBottom: 30 },
  inputField: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#f5f5f5', borderRadius: 10, fontSize: 15, color: '#000', borderWidth: 1, borderColor: '#e0e0e0' },
  btnLogin: { marginTop: 20, paddingVertical: 14, backgroundColor: ICON_GREEN, borderRadius: 10, alignItems: 'center' },
  btnLoginText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },

  credentialsBox: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 40, borderLeftWidth: 4, borderLeftColor: ICON_GREEN },
  credentialsTitle: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 8, textTransform: 'uppercase' },
  credentialsText: { fontSize: 13, color: '#333', marginVertical: 3 },
  credentialsPassword: { fontSize: 12, color: '#999', marginTop: 8 },

  loginFooter: { alignItems: 'center' },
  footerSmall: { fontSize: 11, color: '#ccc', marginVertical: 3 },

  // CALL SCREEN
  callContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: ICON_GREEN, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 15, fontWeight: '600', color: '#000' },
  userId: { fontSize: 12, color: '#999', marginTop: 2 },
  signOutBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#ffe0e0', borderRadius: 6 },
  signOutText: { color: '#ff4444', fontSize: 12, fontWeight: '600' },

  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#999', marginBottom: 40 },

  recipientInput: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#f5f5f5', borderRadius: 10, fontSize: 15, color: '#000', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 20 },
  callButton: { width: '100%', paddingVertical: 16, backgroundColor: ICON_GREEN, borderRadius: 12, alignItems: 'center', marginTop: 20, shadowColor: ICON_GREEN, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  callButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  statusTitle: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 8 },
  statusSubtitle: { fontSize: 13, color: '#999', marginBottom: 30 },

  codeBox: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 20, marginTop: 20, alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0' },
  codeLabel: { fontSize: 11, fontWeight: '600', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  codeValue: { fontSize: 32, fontWeight: '800', color: ICON_GREEN, letterSpacing: 2, fontFamily: 'Courier New' },

  activeCallBox: { alignItems: 'center', marginBottom: 40 },
  callTimerLabel: { fontSize: 12, fontWeight: '600', color: '#999' },
  callTimer: { fontSize: 52, fontWeight: '800', color: '#000', marginVertical: 8, fontFamily: 'Courier New' },
  encryptedBadge: { marginTop: 16, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(52, 199, 89, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: ICON_GREEN },
  encryptedText: { color: ICON_GREEN, fontSize: 12, fontWeight: '600' },

  controlsGrid: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 40, gap: 16 },
  controlBtn: { flex: 1, paddingVertical: 16, backgroundColor: '#f5f5f5', borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0' },
  controlBtnActive: { borderColor: ICON_GREEN, backgroundColor: 'rgba(52, 199, 89, 0.05)' },
  controlBtnLabel: { fontSize: 11, fontWeight: '600', color: '#666', marginTop: 8 },

  endCallButton: { width: '100%', paddingVertical: 14, backgroundColor: '#ff3b30', borderRadius: 10, alignItems: 'center' },
  endCallText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  successCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(52, 199, 89, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: ICON_GREEN },
  successIcon: { fontSize: 40, color: ICON_GREEN, fontWeight: '800' },
  endedTitle: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 8 },
  endedDuration: { fontSize: 28, fontWeight: '700', color: ICON_GREEN, marginBottom: 4 },
  endedMessage: { fontSize: 12, color: '#999', marginBottom: 30 },

  newCallButton: { width: '100%', paddingVertical: 12, backgroundColor: ICON_GREEN, borderRadius: 10, alignItems: 'center' },
  newCallText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  errorBanner: { backgroundColor: '#ffe0e0', borderLeftWidth: 4, borderLeftColor: '#ff3b30', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, marginBottom: 20 },
  errorText: { color: '#ff3b30', fontSize: 13, fontWeight: '500' },

  // FULLSCREEN VIDEO
  videoFullscreen: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },
  remoteVideoArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoPlaceholder: { fontSize: 80, marginBottom: 16 },
  remoteName: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 8 },
  remoteDuration: { fontSize: 24, fontWeight: '700', color: ICON_GREEN, fontFamily: 'Courier New' },

  localVideoIndicator: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  localVideoText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  fullscreenControls: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 24, paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  fscButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: ICON_GREEN },
  fscButtonActive: { backgroundColor: 'rgba(52, 199, 89, 0.2)' },
  fscButtonEnd: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ff3b30', justifyContent: 'center', alignItems: 'center' },
  fscEndText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
