// src/services/networkService.ts

import { getNetworkStateAsync, NetworkStateType } from 'expo-network';
import { NetworkConnection, WiFiInfo, WiFiNetwork } from '../types';

/**
 * Get current network connection status
 * Checks if device is connected to WiFi, cellular, or offline
 */
export const getCurrentConnection = async (): Promise<NetworkConnection> => {
  try {
    const state = await getNetworkStateAsync();
    
    const connectionType: 'wifi' | 'cellular' | 'none' = 
      state.type === NetworkStateType.WIFI 
        ? 'wifi' 
        : state.type === NetworkStateType.CELLULAR 
        ? 'cellular' 
        : 'none';

    return {
      type: connectionType,
      isConnected: state.isConnected || false,
    };
  } catch (error) {
    console.error('Error getting network state:', error);
    return {
      type: 'none',
      isConnected: false,
    };
  }
};

/**
 * Get WiFi information (simulated for now)
 * Note: iOS doesn't allow direct WiFi network scanning without special entitlements
 */
export const getWiFiInfo = async (): Promise<WiFiInfo> => {
  try {
    return {
      ipAddress: '192.168.1.100',
      gateway: '192.168.1.1',
      netmask: '255.255.255.0',
      dns1: '8.8.8.8',
      dns2: '8.8.4.4',
    };
  } catch (error) {
    console.error('Error getting WiFi info:', error);
    return {};
  }
};

/**
 * Calculate quality score for a WiFi network based on signal strength
 */
export const calculateQualityScore = (strength: number): number => {
  if (strength >= 80) return 10;
  if (strength >= 70) return 8;
  if (strength >= 60) return 6;
  if (strength >= 50) return 4;
  if (strength >= 40) return 2;
  return 1;
};

/**
 * Get recommendation based on quality score
 */
export const getRecommendation = (
  score: number
): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'fair';
  return 'poor';
};

/**
 * Check if WiFi is available for calling
 */
export const isWiFiAvailable = async (): Promise<boolean> => {
  try {
    const connection = await getCurrentConnection();
    return connection.type === 'wifi' && connection.isConnected;
  } catch (error) {
    console.error('Error checking WiFi availability:', error);
    return false;
  }
};

/**
 * Monitor network connectivity changes
 */
export const monitorNetworkChanges = (
  callback: (connection: NetworkConnection) => void
) => {
  const interval = setInterval(async () => {
    const connection = await getCurrentConnection();
    callback(connection);
  }, 5000);

  return () => clearInterval(interval);
};

/**
 * Mock WiFi network scanning
 */
export const scanWiFiNetworks = async (): Promise<WiFiNetwork[]> => {
  const mockNetworks: WiFiNetwork[] = [
    {
      ssid: 'Home WiFi',
      bssid: '00:11:22:33:44:55',
      strength: 85,
      frequency: 5000,
      isSecure: true,
      qualityScore: calculateQualityScore(85),
      recommendation: getRecommendation(calculateQualityScore(85)),
    },
    {
      ssid: 'Guest Network',
      bssid: '11:22:33:44:55:66',
      strength: 65,
      frequency: 2400,
      isSecure: false,
      qualityScore: calculateQualityScore(65),
      recommendation: getRecommendation(calculateQualityScore(65)),
    },
  ];

  return mockNetworks;
};

/**
 * Estimate network speed based on signal strength
 */
export const estimateNetworkSpeed = (strength: number): 'slow' | 'medium' | 'fast' => {
  if (strength >= 80) return 'fast';
  if (strength >= 50) return 'medium';
  return 'slow';
};

/**
 * Check if user can start a VoIP call
 * Validates WiFi connection is available
 */
export const canStartCall = async (): Promise<{ allowed: boolean; reason?: string }> => {
  try {
    const connection = await getCurrentConnection();

    if (!connection.isConnected) {
      return {
        allowed: false,
        reason: 'No internet connection. Please connect to WiFi or cellular data.',
      };
    }

    if (connection.type !== 'wifi') {
      return {
        allowed: true,
        reason: 'Warning: You are not on WiFi. Consider connecting to WiFi for best call quality.',
      };
    }

    return {
      allowed: true,
      reason: 'WiFi connection detected. Ready to call.',
    };
  } catch (error) {
    console.error('Error checking call requirements:', error);
    return {
      allowed: false,
      reason: 'Error checking connection. Please try again.',
    };
  }
};
