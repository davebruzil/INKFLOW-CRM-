import React, { useState, useEffect } from 'react';
import type { Client } from '../types/Client';
// import { mockClients } from '../data/mockData'; // Using MongoDB/fallback service instead
import { MongoDBService } from '../services/mongodb';
import { AuthErrorHandler } from '../utils/authErrorHandler';
import ClientModal from './ClientModal';
import './ClientList.css';
import whatsappLogo from '../assets/whatsapp.png';

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{show: boolean, client: Client | null}>({show: false, client: null});

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mongoData = await MongoDBService.fetchClients();
      
      if (!mongoData || mongoData.length === 0) {
        setClients([]);
        return;
      }
      
      // Process and clean the data - handle both CRM and n8n field structures
      const processedClients = mongoData.map((client) => {
        return {
          ...client,
          // Handle ID mapping - ensure we have both id and _id for compatibility
          id: client.id || client._id?.toString() || client._id,
          _id: client._id,
          // Handle name mapping - MongoDB 'name' field takes priority
          name: client.name || client.client_name || 'Unnamed Client',
          // Handle phone mapping - n8n uses phone_number, CRM uses phone
          phone: client.phone || client.phone_number || 'No Phone',
          // Handle meeting type mapping
          meetingType: client.meetingType || client.meeting_type || 'consultation',
          // Handle idea summary mapping
          ideaSummary: client.ideaSummary || client.idea_summary || 'No description provided',
          // Handle AI active mapping - n8n uses boolean, CRM uses string
          aiActive: client.aiActive || (client.ai_active ? 'completed' : 'pending') || 'pending',
          status: client.status || 'Consultation',
          // Handle images/reference photos mapping - n8n may use 'images', CRM uses 'referencePhotos'
          referencePhotos: client.referencePhotos || client.images || [],
          createdAt: client.createdAt || client.created_at ? new Date(client.createdAt || client.created_at) : new Date(),
          updatedAt: client.updatedAt || client.updated_at ? new Date(client.updatedAt || client.updated_at) : new Date()
        };
      }).filter(client => !!(client._id || client.id)); // Only filter out records without any ID
      
      setClients(processedClients);
      
    } catch (err) {
      console.error('Failed to load clients:', err);
      const errorMessage = err instanceof Error ? AuthErrorHandler.getUserFriendlyMessage(err) : 'Failed to load clients. Please check your connection.';
      setError(errorMessage);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    
    // Set up polling to check for new clients every 30 seconds
    const interval = setInterval(loadClients, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const showDeleteConfirmation = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setConfirmDelete({show: true, client});
    }
  };

  const confirmRejectClient = async () => {
    if (confirmDelete.client) {
      try {
        const clientId = confirmDelete.client.id || confirmDelete.client._id?.toString();
        if (!clientId) throw new Error('Client ID is missing');
        await MongoDBService.deleteClient(clientId);
        
        // Remove from local state
        setClients(prev => prev.filter(c => c.id !== confirmDelete.client!.id));
        
        // Also close modal if this client was selected
        if (selectedClient?.id === confirmDelete.client.id) {
          setSelectedClient(null);
        }
        
        console.log('Client deleted from MongoDB successfully.');
      } catch (error) {
        console.error('Failed to delete client:', error);
        const errorMessage = error instanceof Error ? AuthErrorHandler.getUserFriendlyMessage(error) : 'Failed to delete client from database.';
        setError(errorMessage);
      }
    }
    setConfirmDelete({show: false, client: null});
  };

  const cancelRejectClient = () => {
    setConfirmDelete({show: false, client: null});
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const updatedClient = await MongoDBService.updateClient(clientId, updates);
      
      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId ? updatedClient : client
      ));
      
      // Update selected client if it's the one being updated
      if (selectedClient?.id === clientId) {
        setSelectedClient(updatedClient);
      }
    } catch (error) {
      console.error('Failed to update client:', error);
      const errorMessage = error instanceof Error ? AuthErrorHandler.getUserFriendlyMessage(error) : 'Failed to update client in database.';
      setError(errorMessage);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (client.phone || '').includes(searchTerm);
    const matchesFilter = filterStatus === '' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Consultation': return '#D4A574';
      case 'In Progress': return '#B85450';
      case 'Booked': return '#7A9B8E';
      case 'Completed': return '#6B8DBF';
      case 'Canceled': return '#999999';
      case 'Consultation Scheduled': return '#2D2D2D';
      default: return '#999999';
    }
  };

  return (
    <div className="client-list-container">
      <div className="header">
        <div className="search-section">
          <div className="search-bar">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.75 15.75L12.4875 12.4875" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search clients"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-section">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-dropdown"
            >
              <option value="">All</option>
              <option value="Consultation">Consultation</option>
              <option value="In Progress">In Progress</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
              <option value="Consultation Scheduled">Consultation Scheduled</option>
            </select>
            <svg className="filter-icon" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading-banner">Loading clients...</div>}

      <div className="clients-list">
        {filteredClients.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="8" width="40" height="48" rx="4" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
                <line x1="20" y1="20" x2="44" y2="20" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                <line x1="20" y1="28" x2="44" y2="28" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                <line x1="20" y1="36" x2="36" y2="36" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>No clients yet</h3>
            <p>Clients will appear here when they're added to your database</p>
          </div>
        ) : (
          filteredClients.map((client, index) => (
            <div 
              key={client.id || client._id || `client-${index}`}
              className="client-item"
              onClick={() => setSelectedClient(client)}
            >
                  <div className="client-avatar">
                    <div className="avatar-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9aa0a6"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="client-info">
                    <div className="client-name">{client.name}</div>
                    {client.ideaSummary && (
                      <div className="client-description">{client.ideaSummary}</div>
                    )}
                    <div className="client-status-row">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(client.status) }}
                      >
                        {client.status}
                      </span>
                      {client.nextAppointment && (
                        <span className="appointment-time">{client.nextAppointment}</span>
                      )}
                    </div>
                  </div>

                  <div className="client-actions">
                    <button
                      className="action-btn whatsapp"
                      onClick={(e) => {
                        e.stopPropagation();
                        const phoneNumber = client.phone.replace(/[^\d]/g, '');
                        window.open(`https://wa.me/${phoneNumber}`, '_blank');
                      }}
                    >
                      <img src={whatsappLogo} alt="WhatsApp" width="20" height="20" />
                    </button>
                  </div>
                </div>
              ))
        )}
      </div>

      {selectedClient && (
        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onReject={showDeleteConfirmation}
          onUpdate={updateClient}
        />
      )}

      {confirmDelete.show && confirmDelete.client && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h3>Delete Client</h3>
            </div>
            <div className="confirmation-body">
              <div className="warning-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
                  <path d="M24 14V26" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="24" cy="32" r="2" fill="#F59E0B"/>
                </svg>
              </div>
              <p>Are you sure you want to delete</p>
              <p className="client-name-highlight">{confirmDelete.client.name}?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={cancelRejectClient}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={confirmRejectClient}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;