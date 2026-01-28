import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'eazylink_access_token',
  REFRESH_TOKEN: 'eazylink_refresh_token',
  USER_ID: 'eazylink_user_id',
  DEVICE_ID: 'eazylink_device_id',
};

// Simple base64 encoding (no Buffer needed)
function btoa(str: string): string {
  return Buffer.from ? Buffer.from(str).toString('base64') : str;
}

function atob(str: string): string {
  return Buffer.from ? Buffer.from(str, 'base64').toString() : str;
}

export class SecureStorageManager {
  static async storeSecurely(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`✓ Stored: ${key}`);
    } catch (error) {
      console.error(`✗ Failed to store ${key}:`, error);
    }
  }

  static async retrieveSecurely(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`✗ Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  static async removeSecurely(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`✓ Removed: ${key}`);
    } catch (error) {
      console.error(`✗ Failed to remove ${key}:`, error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.ACCESS_TOKEN,
        KEYS.REFRESH_TOKEN,
        KEYS.USER_ID,
        KEYS.DEVICE_ID,
      ]);
      console.log('✓ Cleared all data');
    } catch (error) {
      console.error('✗ Failed to clear all data:', error);
    }
  }
}

export class TokenManager {
  static async storeTokens(
    accessToken: string,
    refreshToken?: string,
    userId?: string | number
  ): Promise<void> {
    try {
      await SecureStorageManager.storeSecurely(KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await SecureStorageManager.storeSecurely(KEYS.REFRESH_TOKEN, refreshToken);
      }
      if (userId) {
        await SecureStorageManager.storeSecurely(KEYS.USER_ID, String(userId));
      }
      console.log('✓ Tokens stored');
    } catch (error) {
      console.error('✗ Failed to store tokens:', error);
      throw error;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    return SecureStorageManager.retrieveSecurely(KEYS.ACCESS_TOKEN);
  }

  static async getValidAccessToken(): Promise<string | null> {
    return SecureStorageManager.retrieveSecurely(KEYS.ACCESS_TOKEN);
  }

  static async clearTokens(): Promise<void> {
    await SecureStorageManager.clearAll();
  }
}

export async function generateDeviceId(): Promise<string> {
  let deviceId = await SecureStorageManager.retrieveSecurely(KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await SecureStorageManager.storeSecurely(KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}
