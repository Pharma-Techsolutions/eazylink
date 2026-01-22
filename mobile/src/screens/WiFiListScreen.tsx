import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { WiFiNetwork } from '../types';
import {
  getCurrentConnection,
  calculateQualityScore,
  getRecommendation,
} from '../services/networkService';

interface WiFiListScreenProps {
  onBack?: () => void;
}

export default function WiFiListScreen({ onBack }: WiFiListScreenProps) {
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scanNetworks = async () => {
    setLoading(true);
    try {
      // Mock networks (in production, call backend API or use native modules)
      const mockNetworks: WiFiNetwork[] = [
        {
          ssid: 'Home WiFi',
          bssid: '00:11:22:33:44:55',
          strength: 85,
          frequency: 5000,
          isSecure: true,
        },
        {
          ssid: 'Starbucks WiFi',
          bssid: '11:22:33:44:55:66',
          strength: 65,
          frequency: 2400,
          isSecure: false,
        },
        {
          ssid: 'Airport_Free',
          bssid: '22:33:44:55:66:77',
          strength: 45,
          frequency: 2400,
          isSecure: false,
        },
        {
          ssid: 'WeWork_Guest',
          bssid: '33:44:55:66:77:88',
          strength: 72,
          frequency: 5000,
          isSecure: true,
        },
        {
          ssid: 'Hotel_Lobby',
          bssid: '44:55:66:77:88:99',
          strength: 38,
          frequency: 2400,
          isSecure: true,
        },
      ];

      const networksWithScores = mockNetworks.map((network) => {
        const qualityScore = calculateQualityScore(network.strength);
        return {
          ...network,
          qualityScore,
          recommendation: getRecommendation(qualityScore),
        };
      });

      networksWithScores.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
      setNetworks(networksWithScores);
    } catch (error) {
      console.error('Error scanning networks:', error);
      Alert.alert('Scan Failed', 'Could not scan for networks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    scanNetworks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    scanNetworks();
  };

  const handleNetworkPress = (network: WiFiNetwork) => {
    Alert.alert(
      `Connect to ${network.ssid}?`,
      `Quality Score: ${network.qualityScore}/10\nRecommendation: ${network.recommendation}\n${
        network.isSecure ? '🔒 Secure' : '⚠️ Open Network'
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => {
            Alert.alert('Coming Soon', 'Auto-connect feature will be added in the next update!');
          },
        },
      ]
    );
  };

  const getQualityColor = (score?: number) => {
    if (!score) return Colors.textSecondary;
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    return Colors.error;
  };

  const getSignalBars = (strength: number) => {
    if (strength >= 80) return '📶';
    if (strength >= 60) return '📶';
    if (strength >= 40) return '📶';
    return '📶';
  };

  const renderNetworkItem = ({ item }: { item: WiFiNetwork }) => (
    <TouchableOpacity
      style={styles.networkCard}
      onPress={() => handleNetworkPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.networkHeader}>
        <View style={styles.networkInfo}>
          <Text style={styles.ssid}>{item.ssid}</Text>
          <View style={styles.networkMeta}>
            <Text style={styles.metaText}>
              {item.frequency && item.frequency > 5000 ? '5GHz' : '2.4GHz'}
            </Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>
              {item.isSecure ? '🔒 Secure' : '⚠️ Open'}
            </Text>
          </View>
        </View>
        <Text style={styles.signalIcon}>{getSignalBars(item.strength)}</Text>
      </View>

      <View style={styles.networkDetails}>
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>Quality Score:</Text>
          <View style={styles.qualityBadge}>
            <View
              style={[
                styles.qualityDot,
                { backgroundColor: getQualityColor(item.qualityScore) },
              ]}
            />
            <Text
              style={[
                styles.qualityScore,
                { color: getQualityColor(item.qualityScore) },
              ]}
            >
              {item.qualityScore}/10
            </Text>
          </View>
        </View>

        <View style={styles.recommendationRow}>
          <Text style={styles.recommendation}>
            {item.recommendation === 'excellent' && '⭐ Excellent'}
            {item.recommendation === 'good' && '👍 Good'}
            {item.recommendation === 'fair' && '👌 Fair'}
            {item.recommendation === 'poor' && '👎 Poor'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Available Networks</Text>
        <Text style={styles.subtitle}>
          {networks.length} network{networks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={scanNetworks}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.scanButtonText}>🔄 Scan Again</Text>
        )}
      </TouchableOpacity>

      {loading && networks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Scanning for networks...</Text>
        </View>
      ) : (
        <FlatList
          data={networks}
          renderItem={renderNetworkItem}
          keyExtractor={(item) => item.bssid || item.ssid}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No networks found</Text>
              <Text style={styles.emptyHint}>Pull down to refresh or tap Scan Again</Text>
            </View>
          }
        />
      )}

      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          💡 Tip: Higher quality scores mean better connection and faster speeds
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.primary,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scanButton: {
    backgroundColor: Colors.secondary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  networkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  networkInfo: {
    flex: 1,
  },
  ssid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  networkMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  signalIcon: {
    fontSize: 24,
  },
  networkDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  qualityScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationRow: {
    alignItems: 'flex-start',
  },
  recommendation: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoBanner: {
    backgroundColor: Colors.surface,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
