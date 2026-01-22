import * as Network from 'expo-network';
import { WiFiNetwork, NetworkConnection } from '../types';

/**
 * Get current network connection status
 */
export const getCurrentConnection = async (): Promise<NetworkConnection> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    
    return {
      type: networkState.type === Network.NetworkStateType.WIFI 
        ? 'wifi' 
        : networkState.type === Network.NetworkStateType.CELLULAR 
        ? 'cellular' 
        : 'none',
      isConnected: networkState.isConnected || false,
    };
  } catch (error) {
    console.error('Error getting network connection:', error);
    return {
      type: 'none',
      isConnected: false,
    };
  }
};

/**
 * Get WiFi information (SSID, IP address)
 */
export const getWiFiInfo = async () => {
  try {
    const ipAddress = await Network.getIpAddressAsync();
    
    return {
      ipAddress,
      // Note: Expo doesn't provide SSID directly for privacy reasons
      // We'll need native modules or rely on backend for full WiFi scanning
    };
  } catch (error) {
    console.error('Error getting WiFi info:', error);
    return null;
  }
};

/**
 * Calculate quality score based on signal strength
 * Signal strength typically ranges from 0-100 or -100 to 0 (dBm)
 */
export const calculateQualityScore = (strength: number): number => {
  // Normalize to 0-10 scale
  if (strength >= 80) return 10;
  if (strength >= 70) return 9;
  if (strength >= 60) return 8;
  if (strength >= 50) return 7;
  if (strength >= 40) return 6;
  if (strength >= 30) return 5;
  if (strength >= 20) return 4;
  if (strength >= 10) return 3;
  return 2;
};

/**
 * Get recommendation based on quality score
 */
export const getRecommendation = (score: number): WiFiNetwork['recommendation'] => {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'fair';
  return 'poor';
};

/**
 * Monitor network changes
 */
export const subscribeToNetworkUpdates = (
  callback: (connection: NetworkConnection) => void
) => {
  // Poll network status every 5 seconds
  const interval = setInterval(async () => {
    const connection = await getCurrentConnection();
    callback(connection);
  }, 5000);

  return () => clearInterval(interval);
};
