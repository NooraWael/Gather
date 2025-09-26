import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '@/constants/auth';

// Storage Keys - Centralized to avoid typos
export const STORAGE_KEYS = {
  IS_LOGGED_IN: 'isLoggedIn',
  IS_NOTIFICATIONS_ON: 'isNotifsOn',
  USER_INFO: 'userInfo',
} as const;

// User Auth Storage
export const AuthStorage = {
  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return value === 'true';
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Set login status
  async setLoggedIn(isLoggedIn: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, isLoggedIn.toString());
    } catch (error) {
      console.error('Error setting login status:', error);
      throw error;
    }
  },

  // Get user info
  async getUserInfo(): Promise<AuthUser | null> {
    try {
      const userInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  },

  // Set user info
  async setUserInfo(userInfo: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error setting user info:', error);
      throw error;
    }
  },

  // Clear all auth data (logout)
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.IS_LOGGED_IN,
        STORAGE_KEYS.USER_INFO,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  },
};

// Notifications Storage
export const NotificationStorage = {
  // Check if notifications are enabled
  async areNotificationsOn(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_NOTIFICATIONS_ON);
      // Default to true if not set (opt-in)
      return value !== null ? value === 'true' : true;
    } catch (error) {
      console.error('Error checking notification status:', error);
      return true; // Default to enabled
    }
  },

  // Set notification preference
  async setNotificationsOn(isOn: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_NOTIFICATIONS_ON, isOn.toString());
    } catch (error) {
      console.error('Error setting notification preference:', error);
      throw error;
    }
  },
};

// General Storage Utilities
export const StorageUtils = {
  // Get all stored data (for debugging)
  async getAllData(): Promise<Record<string, string | null>> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const values = await AsyncStorage.multiGet(keys);
      
      return values.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string | null>);
    } catch (error) {
      console.error('Error getting all data:', error);
      return {};
    }
  },

  // Clear all app data (factory reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },

  // Check if storage is available
  async isStorageAvailable(): Promise<boolean> {
    try {
      const testKey = '__test_key__';
      await AsyncStorage.setItem(testKey, 'test');
      await AsyncStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('Storage not available:', error);
      return false;
    }
  },
};

// Export commonly used functions for convenience
export const {
  isLoggedIn,
  setLoggedIn,
  getUserInfo,
  setUserInfo,
  clearAuthData,
} = AuthStorage;

export const {
  areNotificationsOn,
  setNotificationsOn,
} = NotificationStorage;