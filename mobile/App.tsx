import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import DashboardScreen from './src/screens/DashboardScreen';
import WiFiListScreen from './src/screens/WiFiListScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'wifi'>('dashboard');

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'dashboard' ? (
        <DashboardScreen onNavigateToWiFi={() => setCurrentScreen('wifi')} />
      ) : (
        <WiFiListScreen onBack={() => setCurrentScreen('dashboard')} />
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
