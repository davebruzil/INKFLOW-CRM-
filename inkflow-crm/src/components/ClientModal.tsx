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

  // Debug: Log reference photos when modal opens
  console.log('ClientModal - Reference Photos:', editableClient.referencePhotos);
  console.log('ClientModal - First photo structure:', editableClient.referencePhotos?.[0]);

  // Helper function to extract URL from photo (handles both string URLs and objects)
  const getPhotoUrl = (photo: any): string => {
    let originalUrl = '';

    if (typeof photo === 'string') {
      originalUrl = photo;
    } else if (typeof photo === 'object' && photo !== null) {
      // Try common property names for image URLs
      originalUrl = photo.url || photo.downloadUrl || photo.src || photo.link || photo.fileUrl || '';
    }

    // If the URL is external (from wasenderapi.com), proxy it through our backend
    if (originalUrl && (originalUrl.includes('wasenderapi.com') || originalUrl.startsWith('http'))) {
      // Proxy through our backend to bypass CORS (note: /proxy-image not /api/proxy-image to avoid rate limiting)
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const proxyUrl = `${apiBaseUrl}/proxy-image?url=${encodeURIComponent(originalUrl)}`;
      console.log('🖼️ Using proxy URL:', proxyUrl);
      return proxyUrl;
    }

    return originalUrl;
  };

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
                <svg className="calendar-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 7H16" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12.5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Next: {editableClient.nextAppointment}</span>
              </div>
            </div>
          )}

          <div className="section">
            <h3>Contact Information</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <svg className="contact-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 12.75v2.25a1.5 1.5 0 01-1.635 1.493 14.813 14.813 0 01-6.458-2.298A14.588 14.588 0 013.555 9.34 14.813 14.813 0 011.257 2.865 1.5 1.5 0 012.745 1.5h2.25a1.5 1.5 0 011.5 1.29c.095.712.27 1.41.525 2.078a1.5 1.5 0 01-.338 1.582l-.952.953a12 12 0 004.852 4.852l.953-.952a1.5 1.5 0 011.582-.338c.668.255 1.366.43 2.078.525a1.5 1.5 0 011.29 1.522v-.007z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="contact-label">Phone</div>
                  <div className="contact-value">{editableClient.phone || 'Not provided'}</div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper whatsapp">
                  <svg className="contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <div className="contact-label">WhatsApp</div>
                  <div className="contact-value">
                    {editableClient.phone ? (
                      <a
                        href={`https://wa.me/${editableClient.phone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-link"
                      >
                        {editableClient.phone}
                      </a>
                    ) : 'Not provided'}
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
            <h3>Details</h3>

            <div className="editable-item">
              <div className="edit-icon-wrapper status">
                <svg className="edit-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
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
              <div className="edit-icon-wrapper location">
                <svg className="edit-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 14s6-4.5 6-8.5a6 6 0 00-12 0C2 9.5 8 14 8 14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
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
              <div className="edit-icon-wrapper size">
                <svg className="edit-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 6L10 10M10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
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
              <div className="edit-icon-wrapper budget">
                <svg className="edit-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4.5V5.5M8 10.5V11.5M10 8H11M5 8H6M8 5.5C8.828 5.5 9.5 6.172 9.5 7S8.828 8.5 8 8.5 6.5 7.828 6.5 7 7.172 5.5 8 5.5zM8 8.5C7.172 8.5 6.5 9.172 6.5 10S7.172 11.5 8 11.5 9.5 10.828 9.5 10 8.828 8.5 8 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
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
                  <svg className="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Add Reference Photos</span>
                  <span className="upload-hint">Click to upload images</span>
                </label>
              </div>
              
              {editableClient.referencePhotos && editableClient.referencePhotos.length > 0 && (
                <div className="photo-gallery">
                  {editableClient.referencePhotos.map((photo, index) => {
                    const photoUrl = getPhotoUrl(photo);
                    console.log(`Photo ${index} URL:`, photoUrl);

                    return (
                      <div key={index} className="photo-item">
                        <img
                          src={photoUrl}
                          alt={`Reference ${index + 1}`}
                          className="photo-thumbnail"
                          onClick={() => setFullscreenPhoto(photoUrl)}
                          onError={(e) => {
                            console.error(`Failed to load image:`, photo);
                            console.log('Extracted URL:', photoUrl);
                            console.log('Photo object:', JSON.stringify(photo, null, 2));
                            // Add a fallback styling for broken images
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.image-error')) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'image-error';
                              const displayUrl = photoUrl.substring(0, 30) || 'No URL';
                              errorDiv.innerHTML = `<div style="padding: 8px;">❌ Failed to load<br/><small style="font-size: 10px; opacity: 0.7;">${displayUrl}...</small></div>`;
                              errorDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; font-size: 11px; color: #dc3545; text-align: center;';
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                      </div>
                    );
                  })}
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Delete Client</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Fullscreen Photo Modal */}
      {fullscreenPhoto && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenPhoto(null)}>
          <button
            className="fullscreen-close-btn"
            onClick={() => setFullscreenPhoto(null)}
            title="Back to client"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>
          <button
            className="fullscreen-download-btn"
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = fullscreenPhoto;
              link.download = `reference-photo-${Date.now()}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            title="Download image"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12.5V3.75M10 12.5L7.5 10M10 12.5L12.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.25 12.5V15C16.25 15.6904 15.6904 16.25 15 16.25H5C4.30964 16.25 3.75 15.6904 3.75 15V12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Download</span>
          </button>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <img src={fullscreenPhoto} alt="Reference photo" className="fullscreen-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientModal;