export interface Client {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  meetingType: 'consultation' | 'appointment' | 'follow-up';
  ideaSummary: string;
  aiActive: 'completed' | 'error' | 'pending' | 'in_progress';
  status: 'Consultation' | 'In Progress' | 'Booked' | 'Completed' | 'Canceled' | 'Consultation Scheduled';
  nextAppointment?: string;
  email?: string;
  instagram?: string;
  tattooDescription?: string;
  placement?: string;
  size?: string;
  budget?: string;
  createdAt: Date;
  updatedAt: Date;
}