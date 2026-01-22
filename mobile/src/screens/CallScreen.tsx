import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';

interface CallScreenProps {
  contactName: string;
  contactId: string;
  onEndCall: () => void;
}

export default function CallScreen({ contactName, contactId, onEndCall }: CallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('Connecting...');

  useEffect(() => {
    // Simulate connection
    const connectTimer = setTimeout(() => {
      setCallStatus('Connected');
    }, 2000);

    // Duration timer
    const durationTimer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(durationTimer);
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call?',
      `Call duration: ${formatDuration(callDuration)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Call', style: 'destructive', onPress: onEndCall },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{contactName[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.contactName}>{contactName}</Text>
        <Text style={styles.callStatus}>{callStatus}</Text>
        {callStatus === 'Connected' && (
          <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
        >
          <Text style={styles.controlIcon}>{isSpeaker ? '🔊' : '🔈'}</Text>
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
        <Text style={styles.endCallIcon}>📞</Text>
        <Text style={styles.endCallText}>End Call</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        💡 Note: This is a demo. Real calling requires Agora integration.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  duration: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 60,
  },
  controlButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 100,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  controlIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  endCallButton: {
    backgroundColor: Colors.error,
    borderRadius: 35,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  endCallIcon: {
    fontSize: 32,
    marginBottom: 8,
    transform: [{ rotate: '135deg' }],
  },
  endCallText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
});
