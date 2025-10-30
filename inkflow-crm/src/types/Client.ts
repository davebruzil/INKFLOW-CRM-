// n8n image object structure
export interface N8nImage {
  url: string;           // Temporary wasenderapi.com URL (expires)
  base64: string;        // Permanent base64 image (use this!)
  analysis?: string;     // AI analysis text
  timestamp?: string;    // When the image was received
}

export interface Client {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  meetingType: 'consultation' | 'appointment' | 'follow-up';
  ideaSummary: string;
  aiActive: 'completed' | 'error' | 'pending' | 'in_progress';
  status: 'Consultation' | 'In Progress' | 'Booked' | 'Completed' | 'Canceled' | 'Consultation Scheduled' | 'scheduled';
  nextAppointment?: string;
  email?: string;
  instagram?: string;
  tattooDescription?: string;
  placement?: string;
  size?: string;
  budget?: string;
  referencePhotos?: (string | N8nImage)[];  // Can be string URLs or n8n objects
  images?: (string | N8nImage)[];           // Alternative field name used by n8n
  calendarEventId?: string;                 // Google Calendar event ID
  calendarEventLink?: string;               // Google Calendar event link
  consultationDate?: string;                // ISO 8601 date-time string
  createdAt: Date;
  updatedAt: Date;

  // n8n field mappings (snake_case versions) - optional for compatibility
  client_name?: string;
  phone_number?: string;
  meeting_type?: string;
  idea_summary?: string;
  ai_active?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}