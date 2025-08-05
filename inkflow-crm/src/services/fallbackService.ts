import type { Client } from '../types/Client';

// In-memory storage for demo purposes
const mockDatabase: Client[] = [];
let nextId = 1;

export class FallbackService {
  // Fetch all clients
  static async fetchClients(): Promise<Client[]> {
    // Sort by createdAt descending
    return [...mockDatabase].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Add a new client
  static async addClient(clientData: Omit<Client, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    // Check for duplicate phone
    const existingClient = mockDatabase.find(c => c.phone === clientData.phone);
    if (existingClient) {
      throw new Error('A client with this phone number already exists');
    }

    const now = new Date();
    const newClient: Client = {
      ...clientData,
      id: nextId.toString(),
      _id: nextId.toString(),
      createdAt: now,
      updatedAt: now,
    };

    nextId++;
    mockDatabase.push(newClient);
    
    return newClient;
  }

  // Update a client
  static async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    const clientIndex = mockDatabase.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    // Remove _id and id from updates
    delete updateData._id;
    delete updateData.id;

    mockDatabase[clientIndex] = {
      ...mockDatabase[clientIndex],
      ...updateData,
    };

    return mockDatabase[clientIndex];
  }

  // Delete a client
  static async deleteClient(clientId: string): Promise<void> {
    const clientIndex = mockDatabase.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }

    mockDatabase.splice(clientIndex, 1);
  }

  // Find client by phone
  static async findClientByPhone(phone: string): Promise<Client | null> {
    return mockDatabase.find(c => c.phone === phone) || null;
  }

  // Search clients by name or phone
  static async searchClients(query: string): Promise<Client[]> {
    const lowerQuery = query.toLowerCase();
    return mockDatabase
      .filter(client => 
        client.name.toLowerCase().includes(lowerQuery) ||
        client.phone.includes(query)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get clients by AI status
  static async getClientsByAIStatus(aiActive: Client['aiActive']): Promise<Client[]> {
    return mockDatabase
      .filter(client => client.aiActive === aiActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}