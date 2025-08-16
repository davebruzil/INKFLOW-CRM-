import { Preferences } from '@capacitor/preferences';
import type { Client } from '../types/Client';

export class OfflineStorageService {
  private static readonly CLIENTS_KEY = 'cached_clients';
  private static readonly LAST_SYNC_KEY = 'last_sync_timestamp';
  private static readonly USER_PREFS_KEY = 'user_preferences';

  // Cache clients for offline access
  static async cacheClients(clients: Client[]) {
    try {
      await Preferences.set({
        key: this.CLIENTS_KEY,
        value: JSON.stringify(clients)
      });
      
      // Update sync timestamp
      await Preferences.set({
        key: this.LAST_SYNC_KEY,
        value: new Date().toISOString()
      });
      
      console.log('Clients cached successfully');
    } catch (error) {
      console.error('Error caching clients:', error);
    }
  }

  // Retrieve cached clients
  static async getCachedClients(): Promise<Client[]> {
    try {
      const { value } = await Preferences.get({ key: this.CLIENTS_KEY });
      
      if (value) {
        return JSON.parse(value);
      }
      
      return [];
    } catch (error) {
      console.error('Error retrieving cached clients:', error);
      return [];
    }
  }

  // Check if cache is stale (older than 1 hour)
  static async isCacheStale(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: this.LAST_SYNC_KEY });
      
      if (!value) return true;
      
      const lastSync = new Date(value);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceSync > 1; // Cache expires after 1 hour
    } catch (error) {
      console.error('Error checking cache staleness:', error);
      return true;
    }
  }

  // Store user preferences
  static async setUserPreference(key: string, value: any) {
    try {
      const prefs = await this.getUserPreferences();
      prefs[key] = value;
      
      await Preferences.set({
        key: this.USER_PREFS_KEY,
        value: JSON.stringify(prefs)
      });
    } catch (error) {
      console.error('Error setting user preference:', error);
    }
  }

  // Get user preferences
  static async getUserPreferences(): Promise<Record<string, any>> {
    try {
      const { value } = await Preferences.get({ key: this.USER_PREFS_KEY });
      
      if (value) {
        return JSON.parse(value);
      }
      
      return {};
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  // Get specific user preference
  static async getUserPreference(key: string): Promise<any> {
    const prefs = await this.getUserPreferences();
    return prefs[key];
  }

  // Store draft client (for offline editing)
  static async saveDraftClient(client: Partial<Client>) {
    try {
      const draftKey = `draft_${client.id || 'new'}`;
      await Preferences.set({
        key: draftKey,
        value: JSON.stringify({
          ...client,
          lastModified: new Date().toISOString()
        })
      });
      
      console.log('Draft client saved');
    } catch (error) {
      console.error('Error saving draft client:', error);
    }
  }

  // Get draft client
  static async getDraftClient(clientId?: string): Promise<Partial<Client> | null> {
    try {
      const draftKey = `draft_${clientId || 'new'}`;
      const { value } = await Preferences.get({ key: draftKey });
      
      if (value) {
        return JSON.parse(value);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting draft client:', error);
      return null;
    }
  }

  // Clear draft client
  static async clearDraftClient(clientId?: string) {
    try {
      const draftKey = `draft_${clientId || 'new'}`;
      await Preferences.remove({ key: draftKey });
    } catch (error) {
      console.error('Error clearing draft client:', error);
    }
  }

  // Get all pending operations for sync
  static async getPendingOperations(): Promise<any[]> {
    try {
      const { value } = await Preferences.get({ key: 'pending_operations' });
      
      if (value) {
        return JSON.parse(value);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  // Add operation to pending queue
  static async addPendingOperation(operation: {
    type: 'create' | 'update' | 'delete';
    clientId?: string;
    data?: any;
    timestamp: string;
  }) {
    try {
      const operations = await this.getPendingOperations();
      operations.push(operation);
      
      await Preferences.set({
        key: 'pending_operations',
        value: JSON.stringify(operations)
      });
      
      console.log('Operation added to pending queue');
    } catch (error) {
      console.error('Error adding pending operation:', error);
    }
  }

  // Clear pending operations after successful sync
  static async clearPendingOperations() {
    try {
      await Preferences.remove({ key: 'pending_operations' });
    } catch (error) {
      console.error('Error clearing pending operations:', error);
    }
  }

  // Clear all cache and data
  static async clearAllData() {
    try {
      await Preferences.clear();
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }
}