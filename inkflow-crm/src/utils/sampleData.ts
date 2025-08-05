import { MongoDBService } from '../services/mongodb';
import type { Client } from '../types/Client';

export const sampleClients: Omit<Client, '_id' | 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'אלי רוזן',
    phone: '+972-50-123-4567',
    meetingType: 'consultation',
    ideaSummary: 'קעקוע של שדה פרחים על הכתף השמאלית, סגנון מינימליסטי',
    aiActive: 'completed',
    status: 'Consultation',
    email: 'eli.rosen@email.com',
    tattooDescription: 'קעקוע של שדה פרחים על הכתף השמאלית',
    placement: 'כתף שמאלית',
    size: 'Medium',
    budget: '800-1200 ₪'
  },
  {
    name: 'מיה כהן',
    phone: '+972-54-987-6543',
    meetingType: 'consultation',
    ideaSummary: 'קעקוע על הזרוע, דגם גיאומטרי, בצבע שחור בלבד',
    aiActive: 'error',
    status: 'In Progress',
    tattooDescription: 'קעקוע על הזרוע, דגם גיאומטרי',
    placement: 'זרוע',
    size: 'Small',
    budget: '600-900 ₪'
  },
  {
    name: 'דוד לוי',
    phone: '+972-52-111-2222',
    meetingType: 'appointment',
    ideaSummary: 'קעקוע של אריה על הגב, סגנון ריאליסטי עם פרטים',
    aiActive: 'completed',
    status: 'Booked',
    nextAppointment: '2025-08-10 14:00',
    tattooDescription: 'קעקוע של אריה על הגב',
    placement: 'גב',
    size: 'Large',
    budget: '1500-2000 ₪'
  },
  {
    name: 'שרה אבן',
    phone: '+972-53-333-4444',
    meetingType: 'consultation',
    ideaSummary: 'קעקוע קטן על הקרסול, פרח לוטוס מינימליסטי',
    aiActive: 'pending',
    status: 'Consultation Scheduled',
    nextAppointment: '2025-08-06 16:30',
    tattooDescription: 'קעקוע קטן על הקרסול, פרח לוטוס',
    placement: 'קרסול',
    size: 'Small',
    budget: '400-600 ₪'
  },
  {
    name: 'יוסי גבריאל',
    phone: '+972-50-555-6666',
    meetingType: 'follow-up',
    ideaSummary: 'השלמת קעקוע קיים על היד, הוספת צבעים',
    aiActive: 'in_progress',
    status: 'Completed',
    tattooDescription: 'השלמת קעקוע קיים על היד',
    placement: 'יד',
    size: 'Medium',
    budget: '700-1000 ₪'
  }
];

export const addSampleData = async (): Promise<void> => {
  try {
    console.log('Adding sample data to database...');
    
    for (const clientData of sampleClients) {
      try {
        await MongoDBService.addClient(clientData);
        console.log(`Added client: ${clientData.name}`);
      } catch (error) {
        // Skip if client already exists (duplicate phone)
        if (error instanceof Error && error.message.includes('already exists')) {
          console.log(`Client ${clientData.name} already exists, skipping...`);
          continue;
        }
        console.error(`Failed to add client ${clientData.name}:`, error);
      }
    }
    
    console.log('Sample data processing completed!');
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  }
};