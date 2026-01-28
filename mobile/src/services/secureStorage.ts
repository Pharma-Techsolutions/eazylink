// Simple in-memory storage for development
// In production, use expo-secure-store after fixing the iOS issue

class SimpleStorage {
  private store: Map<string, string> = new Map();

  async storeSecurely(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    console.log(`✓ Stored: ${key}`);
  }

  async retrieveSecurely(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async removeSecurely(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clearAll(): Promise<void> {
    this.store.clear();
  }
}

const simpleStorage = new SimpleStorage();

export class SecureStorageManager {
  static async storeSecurely(key: string, value: string): Promise<void> {
    return simpleStorage.storeSecurely(key, value);
  }

  static async retrieveSecurely(key: string): Promise<string | null> {
    return simpleStorage.retrieveSecurely(key);
  }

  static async removeSecurely(key: string): Promise<void> {
    return simpleStorage.removeSecurely(key);
  }

  static async clearAll(): Promise<void> {
    return simpleStorage.clearAll();
  }
}

export class TokenManager {
  static async storeTokens(accessToken: string, refreshToken?: string, userId?: string | number): Promise<void> {
    await SecureStorageManager.storeSecurely('access_token', accessToken);
    if (refreshToken) await SecureStorageManager.storeSecurely('refresh_token', refreshToken);
    if (userId) await SecureStorageManager.storeSecurely('user_id', String(userId));
  }

  static async getAccessToken(): Promise<string | null> {
    return SecureStorageManager.retrieveSecurely('access_token');
  }

  static async getValidAccessToken(): Promise<string | null> {
    return SecureStorageManager.retrieveSecurely('access_token');
  }

  static async clearTokens(): Promise<void> {
    await SecureStorageManager.clearAll();
  }
}

export async function generateDeviceId(): Promise<string> {
  return 'device_dev_' + Math.random().toString(36).substr(2, 9);
}
