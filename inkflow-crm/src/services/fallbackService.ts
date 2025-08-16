import type { Client } from '../types/Client';
import { OfflineStorageService } from './offlineStorageService';

// In-memory storage for demo purposes with Hebrew client samples
const mockDatabase: Client[] = [
  {
    id: '1',
    _id: '1',
    name: 'יעל כהן',
    phone: '0523456789',
    meetingType: 'consultation',
    ideaSummary: 'פרח לוטוס על הכתף הימנית, סגנון מינימליסטי בקווים עדינים. רוצה משהו שיסמל התחדשות ותחילה חדשה',
    aiActive: 'pending',
    status: 'Consultation Scheduled',
    email: 'yael.cohen@example.com',
    instagram: '@yaelcohen_art',
    tattooDescription: 'פרח לוטוס על הכתף הימנית, סגנון מינימליסטי בקווים עדינים',
    placement: 'כתף',
    size: 'בינוני',
    budget: '800-1200 ש"ח',
    createdAt: new Date('2024-12-15T10:30:00'),
    updatedAt: new Date('2024-12-15T10:30:00')
  },
  {
    id: '2',
    _id: '2',
    name: 'דניאל לוי',
    phone: '0541234567',
    meetingType: 'appointment',
    ideaSummary: 'אריה גיאומטרי על הזרוע השמאלית, בסגנון בלקוורק עם פרטים עדינים. חשוב שיהיה חזק ומרשים',
    aiActive: 'completed',
    status: 'In Progress',
    email: 'daniel.levi@gmail.com',
    instagram: '@daniellevi92',
    tattooDescription: 'אריה גיאומטרי על הזרוע השמאלית, בסגנון בלקוורק',
    placement: 'זרוע',
    size: 'גדול',
    budget: '1500-2000 ש"ח',
    nextAppointment: '2024-12-20T15:00:00',
    createdAt: new Date('2024-12-10T14:15:00'),
    updatedAt: new Date('2024-12-12T09:20:00')
  },
  {
    id: '3',
    _id: '3',
    name: 'מיכל רוזן',
    phone: '0529876543',
    meetingType: 'consultation',
    ideaSummary: 'כתובת עברית קטנה על הצלע - "אהבה" או "אמונה". רוצה משהו עדין ונשי שמתחבר לזהות שלי',
    aiActive: 'pending',
    status: 'Consultation Scheduled',
    email: 'michal.rosen@hotmail.com',
    tattooDescription: 'כתובת עברית קטנה על הצלע',
    placement: 'צלע',
    size: 'קטן',
    budget: '400-600 ש"ח',
    createdAt: new Date('2024-12-08T16:45:00'),
    updatedAt: new Date('2024-12-08T16:45:00')
  },
  {
    id: '4',
    _id: '4',
    name: 'עומר גולדברג',
    phone: '0506789012',
    meetingType: 'follow-up',
    ideaSummary: 'עץ החיים על הגב העליון, עם שורשים ועלים מפורטים. משהו שמחבר אותי לשורשים המשפחתיים',
    aiActive: 'in_progress',
    status: 'Booked',
    email: 'omer.goldberg@yahoo.com',
    instagram: '@omergold',
    tattooDescription: 'עץ החיים על הגב העליון עם פרטים מורכבים',
    placement: 'גב',
    size: 'גדול מאוד',
    budget: '2500-3500 ש"ח',
    nextAppointment: '2024-12-18T13:30:00',
    createdAt: new Date('2024-11-28T11:20:00'),
    updatedAt: new Date('2024-12-05T08:15:00')
  },
  {
    id: '5',
    _id: '5',
    name: 'נועה אביטל',
    phone: '0583456789',
    meetingType: 'consultation',
    ideaSummary: 'מנדלה עדינה על הקרסול הימני, בקווים דקיקים. רוצה משהו שיהיה גלוי בקיץ אבל עדיין צנוע',
    aiActive: 'pending',
    status: 'Consultation Scheduled',
    email: 'noa.avital@gmail.com',
    instagram: '@noaavital_',
    tattooDescription: 'מנדלה עדינה על הקרסול הימני',
    placement: 'קרסול',
    size: 'קטן',
    budget: '500-800 ש"ח',
    createdAt: new Date('2024-12-14T09:00:00'),
    updatedAt: new Date('2024-12-14T09:00:00')
  },
  {
    id: '6',
    _id: '6',
    name: 'רון ישראלי',
    phone: '0507654321',
    meetingType: 'appointment',
    ideaSummary: 'ציפור עפה על הצוואר מאחור, בסגנון ריאליסטי עם צללים. משהו שמסמל חופש וכמיהה לגבהים',
    aiActive: 'completed',
    status: 'Completed',
    email: 'ron.israeli@outlook.com',
    tattooDescription: 'ציפור עפה על הצוואר מאחור, סגנון ריאליסטי',
    placement: 'צוואר',
    size: 'בינוני',
    budget: '1200-1600 ש"ח',
    createdAt: new Date('2024-11-15T13:45:00'),
    updatedAt: new Date('2024-12-01T16:30:00')
  }
];
let nextId = 7;

export class FallbackService {
  // Fetch all clients with offline support
  static async fetchClients(): Promise<Client[]> {
    try {
      // Check if we have cached data and if it's fresh
      const isStale = await OfflineStorageService.isCacheStale();
      
      if (!isStale) {
        const cachedClients = await OfflineStorageService.getCachedClients();
        if (cachedClients.length > 0) {
          console.log('Using cached clients');
          return cachedClients;
        }
      }
      
      // Fetch fresh data
      console.log('Fetching fresh client data');
      const freshClients = [...mockDatabase].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Cache the fresh data
      await OfflineStorageService.cacheClients(freshClients);
      
      return freshClients;
    } catch (error) {
      console.error('Error fetching clients, using cache:', error);
      // Fallback to cached data even if stale
      return await OfflineStorageService.getCachedClients();
    }
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
    
    // Update cache with new client
    await OfflineStorageService.cacheClients([...mockDatabase].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    
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

    // Update cache after client update
    await OfflineStorageService.cacheClients([...mockDatabase].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));

    return mockDatabase[clientIndex];
  }

  // Delete a client
  static async deleteClient(clientId: string): Promise<void> {
    const clientIndex = mockDatabase.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }

    mockDatabase.splice(clientIndex, 1);
    
    // Update cache after client deletion
    await OfflineStorageService.cacheClients([...mockDatabase].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
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