import { apiRequest, isBackendAvailable } from '../config/mongodb';
import { FallbackService } from './fallbackService';
import { AuthErrorHandler } from '../utils/authErrorHandler';
import type { Client } from '../types/Client';

export class MongoDBService {

  // Fetch all clients
  static async fetchClients(): Promise<Client[]> {
    try {
      const backendUp = await isBackendAvailable();
      if (!backendUp) {
        console.log('🔄 Backend API unavailable, using fallback service');
        return FallbackService.fetchClients();
      }

      console.log('📡 Fetching clients from MongoDB via backend API');
      const clients = await apiRequest('/api/clients');
      return clients;
    } catch (error) {
      console.error('❌ Error fetching clients from backend, using fallback:', error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        await AuthErrorHandler.handleAuthError(error);
        throw error;
      }
      
      return FallbackService.fetchClients();
    }
  }

  // Add a new client
  static async addClient(clientData: Omit<Client, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    try {
      const backendUp = await isBackendAvailable();
      if (!backendUp) {
        console.log('🔄 Backend API unavailable, using fallback service');
        return FallbackService.addClient(clientData);
      }

      console.log('📡 Creating client via backend API');
      const newClient = await apiRequest('/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });
      return newClient;
    } catch (error) {
      console.error('❌ Error creating client via backend, using fallback:', error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        await AuthErrorHandler.handleAuthError(error);
        throw error;
      }
      
      return FallbackService.addClient(clientData);
    }
  }

  // Update a client
  static async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    try {
      const backendUp = await isBackendAvailable();
      if (!backendUp) {
        console.log('🔄 Backend API unavailable, using fallback service');
        return FallbackService.updateClient(clientId, updates);
      }

      console.log('📡 Updating client via backend API');
      const updatedClient = await apiRequest(`/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return updatedClient;
    } catch (error) {
      console.error('❌ Error updating client via backend, using fallback:', error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        await AuthErrorHandler.handleAuthError(error);
        throw error;
      }
      
      return FallbackService.updateClient(clientId, updates);
    }
  }

  // Delete a client
  static async deleteClient(clientId: string): Promise<void> {
    try {
      const backendUp = await isBackendAvailable();
      if (!backendUp) {
        console.log('🔄 Backend API unavailable, using fallback service');
        return FallbackService.deleteClient(clientId);
      }

      console.log('📡 Deleting client via backend API');
      await apiRequest(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ Error deleting client via backend, using fallback:', error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        await AuthErrorHandler.handleAuthError(error);
        throw error;
      }
      
      return FallbackService.deleteClient(clientId);
    }
  }

  // Find client by phone
  static async findClientByPhone(phone: string): Promise<Client | null> {
    try {
      const backendUp = await isBackendAvailable();
      if (!backendUp) {
        return FallbackService.findClientByPhone(phone);
      }

      const clients = await apiRequest(`/api/clients/search?q=${encodeURIComponent(phone)}`);
      return clients.find((client: Client) => client.phone === phone) || null;
    } catch (error) {
      console.error('❌ Error finding client by phone via backend:', error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        await AuthErrorHandler.handleAuthError(error);
        throw error;
      }
      
      return FallbackService.findClientByPhone(phone);
    }
  }

  // Search clients by name or phone
  static async searchClients(query: string): Promise<Client[]> {
    try {
      const backendUp = await isBackendAvailable();
      if (!backendUp) {
        return FallbackService.searchClients(query);
      }

      const clients = await apiRequest(`/api/clients/search?q=${encodeURIComponent(query)}`);
      return clients;
    } catch (error) {
      console.error('❌ Error searching clients via backend:', error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        await AuthErrorHandler.handleAuthError(error);
        throw error;
      }
      
      return FallbackService.searchClients(query);
    }
  }

  // Get clients by AI status
  static async getClientsByAIStatus(aiActive: Client['aiActive']): Promise<Client[]> {
    try {
      const backendUp = await isBackendAvailable();
      if (!backendUp) {
        return FallbackService.getClientsByAIStatus(aiActive);
      }

      // For now, fetch all clients and filter (can optimize later with backend filtering)
      const allClients = await this.fetchClients();
      return allClients.filter(client => client.aiActive === aiActive);
    } catch (error) {
      console.error('❌ Error fetching clients by AI status via backend:', error);
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        await AuthErrorHandler.handleAuthError(error);
        throw error;
      }
      
      return FallbackService.getClientsByAIStatus(aiActive);
    }
  }
}