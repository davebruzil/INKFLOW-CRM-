import { useState, useRef } from 'react';
import type { Client } from '../types/Client';
import './ClientModal.css';

interface ClientModalProps {
  client: Client;
  onClose: () => void;
  onReject?: (clientId: string) => void;
  onUpdate?: (clientId: string, updates: Partial<Client>) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onReject, onUpdate }) => {
  const [editableClient, setEditableClient] = useState<Client>({ ...client });
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof Client, value: string | string[]) => {
    const updatedClient = {
      ...editableClient,
      [field]: value
    };
    setEditableClient(updatedClient);
    
    // Immediately save changes locally
    if (onUpdate) {
      const clientId = client.id || client._id?.toString();
      if (clientId) {
        onUpdate(clientId, { [field]: value });
      }
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentPhotos = editableClient.referencePhotos || [];
    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image and will be skipped.`);
        return false;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB). Please choose a smaller image.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const newPhotosPromises = validFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(new Error('File reading failed'));
          reader.readAsDataURL(file);
        });
      });

      const newPhotos = await Promise.all(newPhotosPromises);
      const updatedPhotos = [...currentPhotos, ...newPhotos];
      handleInputChange('referencePhotos', updatedPhotos);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload some photos. Please try again.');
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (photoIndex: number) => {
    const currentPhotos = editableClient.referencePhotos || [];
    const updatedPhotos = currentPhotos.filter((_, index) => index !== photoIndex);
    handleInputChange('referencePhotos', updatedPhotos);
  };

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editableClient.name}</h2>
          <div className="status-container">
            <span 
              className="status-badge-modal"
              style={{ backgroundColor: getStatusColor(editableClient.status) }}
            >
              {editableClient.status}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {editableClient.nextAppointment && (
            <div className="appointment-section">
              <div className="appointment-info">
                <span className="calendar-icon">📅</span>
                <span>Next: {editableClient.nextAppointment}</span>
              </div>
            </div>
          )}

          <div className="section">
            <h3>Contact Information</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <div className="contact-label">Phone</div>
                  <div className="contact-value">{editableClient.phone || 'לא צוין'}</div>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <div>
                  <div className="contact-label">WhatsApp</div>
                  <div className="contact-value">
                    {editableClient.phone ? (
                      <a 
                        href={`https://wa.me/1${editableClient.phone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-link"
                      >
                        {editableClient.phone}
                      </a>
                    ) : 'לא צוין'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Tattoo Concept</h3>
            <div className="tattoo-concept-content">
              <p className="tattoo-description">
                {editableClient.tattooDescription || 'לא צוין'}
              </p>
            </div>
          </div>

          <div className="editable-section">
            <h3>Manual Edits</h3>
            
            <div className="editable-item">
              <span className="status-icon">🔄</span>
              <div className="editable-content">
                <div className="editable-label">Status</div>
                <select
                  value={editableClient.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="editable-select status-select"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Consultation Scheduled">Consultation Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Booked">Booked</option>
                  <option value="Completed">Completed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
            </div>
            
            <div className="editable-item">
              <span className="location-icon">📍</span>
              <div className="editable-content">
                <div className="editable-label">Placement</div>
                <input
                  type="text"
                  value={editableClient.placement}
                  onChange={(e) => handleInputChange('placement', e.target.value)}
                  className="editable-input placement-input"
                  placeholder="Enter placement..."
                />
              </div>
            </div>

            <div className="editable-item">
              <span className="size-icon">🔗</span>
              <div className="editable-content">
                <div className="editable-label">Size</div>
                <select
                  value={editableClient.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="editable-select size-select"
                >
                  <option value="">Select size...</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="editable-item">
              <span className="budget-icon">💰</span>
              <div className="editable-content">
                <div className="editable-label">Budget</div>
                <input
                  type="text"
                  value={editableClient.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="editable-input budget-input"
                  placeholder="Enter budget..."
                />
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Reference Photos</h3>
            <div className="photo-section">
              <div className="photo-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="photo-input"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="photo-upload-button">
                  <span className="upload-icon">📸</span>
                  <span>Add Reference Photos</span>
                  <span className="upload-hint">Click to upload images</span>
                </label>
              </div>
              
              {editableClient.referencePhotos && editableClient.referencePhotos.length > 0 && (
                <div className="photo-gallery">
                  {editableClient.referencePhotos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={photo} 
                        alt={`Reference ${index + 1}`} 
                        className="photo-thumbnail"
                        onClick={() => setFullscreenPhoto(photo)}
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="photo-remove-btn"
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {onReject && (
            <div className="modal-footer">
              <button 
                className="reject-client-btn"
                onClick={() => {
                  const clientId = client.id || client._id?.toString();
                  if (clientId && onReject) {
                    onReject(clientId);
                  }
                  onClose();
                }}
              >
                ❌ Reject Client
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Fullscreen Photo Modal */}
      {fullscreenPhoto && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenPhoto(null)}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <img src={fullscreenPhoto} alt="Reference photo" className="fullscreen-image" />
            <button 
              className="fullscreen-close-btn"
              onClick={() => setFullscreenPhoto(null)}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientModal;