import React, { useState } from 'react';
import { addSampleData } from '../utils/sampleData';
import { MongoDBService } from '../services/mongodb';

const DatabaseTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddSampleData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await addSampleData();
      setMessage('Sample data added successfully! Refresh the client list to see the new clients.');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const clients = await MongoDBService.fetchClients();
      setMessage(`Connection successful! Found ${clients.length} clients in database.`);
    } catch (error) {
      setMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h3>MongoDB Test Panel</h3>
      
      <button 
        onClick={handleTestConnection}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          margin: '5px 0',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      <button 
        onClick={handleAddSampleData}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          margin: '5px 0',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Adding...' : 'Add Sample Data'}
      </button>
      
      {message && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;