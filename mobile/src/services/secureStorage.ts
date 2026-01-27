/**
 * Secure Storage Service for React Native
 * 
 * Replaces plain AsyncStorage with encrypted secure storage
 * Prevents token theft from:
 * - Device theft
 * - Malicious apps reading AsyncStorage
 * - Debugging tools accessing memory
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SECURE_STORAGE_KEYS = {
  ACCESS_TOKEN: 'eazylink_access_token',
  REFRESH_TOKEN: 'eazylink_refresh_token',
  USER_ID: 'eazylink_user_id',
  DEVICE_ID: 'eazylink_device_id',
};

/**
 * Secure Storage Manager
 * Uses platform-native secure storage:
 * - iOS: Keychain
 * - Android: Keystore + EncryptedSharedPreferences
 */
export class SecureStorageManager {
  /**
   * Store sensitive data securely
   */
  static async storeSecurely(
    key: string,
    value: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Store in secure storage (encrypted at OS level)
      await SecureStore.setItemAsync(key, value);

      // Optionally store metadata in regular storage (non-sensitive)
      if (metadata) {
        const metadataKey = `${key}_metadata`;
        await AsyncStorage.setItem(metadataKey, JSON.stringify(metadata));
      }

      console.log(`✓ Securely stored: ${key}`);
    } catch (error) {
      console.error(`✗ Failed to store: ${key}`, error);
      throw error;
    }
  }

  /**
   * Retrieve sensitive data from secure storage
   */
  static async retrieveSecurely(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`✗ Failed to retrieve: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove sensitive data securely
   */
  static async removeSecurely(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      
      // Also remove metadata
      const metadataKey = `${key}_metadata`;
      await AsyncStorage.removeItem(metadataKey);
      
      console.log(`✓ Securely removed: ${key}`);
    } catch (error) {
      console.error(`✗ Failed to remove: ${key}`, error);
    }
  }

  /**
   * Clear all sensitive data (on logout)
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.removeSecurely(SECURE_STORAGE_KEYS.ACCESS_TOKEN),
        this.removeSecurely(SECURE_STORAGE_KEYS.REFRESH_TOKEN),
        this.removeSecurely(SECURE_STORAGE_KEYS.USER_ID),
      ]);
      console.log('✓ All sensitive data cleared');
    } catch (error) {
      console.error('✗ Failed to clear all data', error);
    }
  }
}

/**
 * Authentication Token Manager
 * Handles token storage, refresh, and expiration
 */
export class TokenManager {
  /**
   * Store tokens securely after login
   */
  static async storeTokens(
    accessToken: string,
    refreshToken?: string,
    userId?: string
  ): Promise<void> {
    try {
      // Decode token to get expiry and metadata
      const decoded = this.decodeToken(accessToken);
      
      await SecureStorageManager.storeSecurely(
        SECURE_STORAGE_KEYS.ACCESS_TOKEN,
        accessToken,
        {
          expiresAt: decoded.exp * 1000, // Convert to milliseconds
          issuedAt: decoded.iat * 1000,
        }
      );

      if (refreshToken) {
        await SecureStorageManager.storeSecurely(
          SECURE_STORAGE_KEYS.REFRESH_TOKEN,
          refreshToken
        );
      }

      if (userId) {
        await SecureStorageManager.storeSecurely(
          SECURE_STORAGE_KEYS.USER_ID,
          userId
        );
      }

      console.log('✓ Tokens stored securely');
    } catch (error) {
      console.error('✗ Failed to store tokens', error);
      throw error;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  static async getValidAccessToken(): Promise<string | null> {
    try {
      let token = await SecureStorageManager.retrieveSecurely(
        SECURE_STORAGE_KEYS.ACCESS_TOKEN
      );

      if (!token) {
        return null;
      }

      // Check if token is expired
      const decoded = this.decodeToken(token);
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();
      const minutesUntilExpiry = (expiresAt - now) / 1000 / 60;

      // If less than 5 minutes left, refresh
      if (minutesUntilExpiry < 5) {
        token = await this.refreshAccessToken();
      }

      return token;
    } catch (error) {
      console.error('✗ Failed to get valid token', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStorageManager.retrieveSecurely(
        SECURE_STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!refreshToken) {
        console.log('No refresh token available');
        return null;
      }

      // Call backend to refresh token
      const response = await fetch('${API_URL}/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Store new token
      await this.storeTokens(data.access_token, data.refresh_token);
      
      return data.access_token;
    } catch (error) {
      console.error('✗ Failed to refresh token', error);
      // Clear tokens on refresh failure
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Clear all tokens (on logout)
   */
  static async clearTokens(): Promise<void> {
    await SecureStorageManager.clearAll();
  }

  /**
   * Decode JWT without verification (just parse)
   * Note: Always verify on backend
   */
  private static decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token');
      }

      const decoded = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      throw error;
    }
  }
}

/**
 * Generate unique device ID for tracking
 * Used to detect if account accessed from new device
 */
export async function generateDeviceId(): Promise<string> {
  try {
    let deviceId = await SecureStorageManager.retrieveSecurely(
      SECURE_STORAGE_KEYS.DEVICE_ID
    );

    if (!deviceId) {
      // Generate new device ID
      deviceId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}-${Math.random()}`
      );

      await SecureStorageManager.storeSecurely(
        SECURE_STORAGE_KEYS.DEVICE_ID,
        deviceId
      );
    }

    return deviceId;
  } catch (error) {
    console.error('Failed to generate device ID', error);
    throw error;
  }
}
