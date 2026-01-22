import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import DashboardScreen from './src/screens/DashboardScreen';
import WiFiListScreen from './src/screens/WiFiListScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import CallScreen from './src/screens/CallScreen';

type Screen = 'dashboard' | 'wifi' | 'contacts' | 'call';

interface Contact {
  id: string;
  name: string;
  status: 'online' | 'offline';
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('contacts');
  const [activeCall, setActiveCall] = useState<Contact | null>(null);

  const handleStartCall = (contact: Contact) => {
    setActiveCall(contact);
    setCurrentScreen('call');
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setCurrentScreen('contacts');
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'dashboard' && (
        <DashboardScreen onNavigateToWiFi={() => setCurrentScreen('wifi')} />
      )}
      {currentScreen === 'wifi' && (
        <WiFiListScreen onBack={() => setCurrentScreen('dashboard')} />
      )}
      {currentScreen === 'contacts' && (
        <ContactsScreen onStartCall={handleStartCall} />
      )}
      {currentScreen === 'call' && activeCall && (
        <CallScreen
          contactName={activeCall.name}
          contactId={activeCall.id}
          onEndCall={handleEndCall}
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
