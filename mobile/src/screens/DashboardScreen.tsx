import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { getCurrentConnection, getWiFiInfo } from '../services/networkService';
import { Colors } from '../constants/colors';
import { NetworkConnection } from '../types';

interface DashboardScreenProps {
  onNavigateToWiFi: () => void;
}

export default function DashboardScreen({ onNavigateToWiFi }: DashboardScreenProps) {
  const [connection, setConnection] = useState<NetworkConnection | null>(null);
  const [wifiInfo, setWifiInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNetworkStatus = async () => {
    try {
      const currentConnection = await getCurrentConnection();
      setConnection(currentConnection);

      if (currentConnection.type === 'wifi') {
        const info = await getWiFiInfo();
        setWifiInfo(info);
      }
    } catch (error) {
      console.error('Error loading network status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNetworkStatus();
    const interval = setInterval(loadNetworkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNetworkStatus();
  };

  const getStatusColor = () => {
    if (!connection?.isConnected) return Colors.disconnected;
    if (connection.type === 'wifi') return Colors.connected;
    if (connection.type === 'cellular') return Colors.warning;
    return Colors.textSecondary;
  };

  const getStatusText = () => {
    if (!connection?.isConnected) return 'Disconnected';
    if (connection.type === 'wifi') return 'Connected to WiFi';
    if (connection.type === 'cellular') return 'Connected to Cellular';
    return 'No Connection';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking network status...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>EazyLink</Text>
        <Text style={styles.subtitle}>Your connectivity companion</Text>
      </View>

      <View style={styles.statusCard}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <Text style={styles.statusText}>{getStatusText()}</Text>

        {connection?.isConnected && (
          <View style={styles.connectionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Connection Type:</Text>
              <Text style={styles.detailValue}>
                {connection.type === 'wifi' ? 'WiFi' : 'Cellular'}
              </Text>
            </View>

            {wifiInfo?.ipAddress && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>IP Address:</Text>
                <Text style={styles.detailValue}>{wifiInfo.ipAddress}</Text>
              </View>
            )}
          </View>
        )}

        {!connection?.isConnected && (
          <View style={styles.noConnectionContainer}>
            <Text style={styles.noConnectionText}>
              No active connection detected
            </Text>
            <Text style={styles.noConnectionHint}>
              Connect to WiFi or enable cellular data
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={loadNetworkStatus}
        >
          <Text style={styles.actionButtonText}>🔄 Refresh Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={onNavigateToWiFi}
        >
          <Text style={styles.actionButtonTextSecondary}>
            📡 Scan Networks
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What's EazyLink?</Text>
        <Text style={styles.infoText}>
          EazyLink automatically monitors your network connection and helps you
          stay online wherever you go. Tap "Scan Networks" to find the best WiFi available!
        </Text>
      </View>

      <Text style={styles.version}>v1.0.0 - MVP</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  connectionDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  noConnectionContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  noConnectionText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
    marginBottom: 4,
  },
  noConnectionHint: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  actionButtonTextSecondary: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
});
