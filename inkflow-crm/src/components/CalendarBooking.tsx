import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import './CalendarBooking.css';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  htmlLink: string;
  status?: string;
}

interface CalendarBookingProps {
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  existingEventId?: string;
  existingEventLink?: string;
  onEventCreated?: (eventId: string, eventLink: string) => void;
  onEventDeleted?: () => void;
}

const CalendarBooking: React.FC<CalendarBookingProps> = ({
  clientId,
  clientName,
  clientPhone,
  clientEmail,
  existingEventId,
  existingEventLink,
  onEventCreated,
  onEventDeleted
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60); // Default 1 hour in minutes
  const [location, setLocation] = useState('Tattoo Studio');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [existingEvent, setExistingEvent] = useState<CalendarEvent | null>(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Helper function to get Firebase auth token
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Fetch existing event details if eventId is provided
  useEffect(() => {
    const fetchExistingEvent = async () => {
      if (existingEventId) {
        try {
          const token = await getAuthToken();
          if (!token) return;

          const response = await fetch(`${API_URL}/api/calendar/events/${existingEventId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const eventData = await response.json();
            setExistingEvent(eventData);
          }
        } catch (err) {
          console.error('Error fetching event:', err);
        }
      }
    };

    fetchExistingEvent();
  }, [existingEventId, API_URL]);

  // Check availability when date and time change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!date || !time) {
        setIsAvailable(null);
        return;
      }

      try {
        const token = await getAuthToken();
        if (!token) return;

        const startDateTime = new Date(`${date}T${time}`).toISOString();
        const endDateTime = new Date(new Date(`${date}T${time}`).getTime() + duration * 60000).toISOString();

        const response = await fetch(`${API_URL}/api/calendar/check-availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            startDateTime,
            endDateTime
          })
        });

        if (response.ok) {
          const data = await response.json();
          setIsAvailable(data.available);
        }
      } catch (err) {
        console.error('Error checking availability:', err);
      }
    };

    const debounceTimeout = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimeout);
  }, [date, time, duration, API_URL]);

  const handleBookAppointment = async () => {
    if (!date || !time) {
      setError('Please select both date and time');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = await getAuthToken();
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }

      const startDateTime = new Date(`${date}T${time}`).toISOString();
      const endDateTime = new Date(new Date(`${date}T${time}`).getTime() + duration * 60000).toISOString();

      const eventData = {
        summary: `Tattoo Appointment - ${clientName}`,
        description: description || `Appointment with ${clientName}\nPhone: ${clientPhone}`,
        startDateTime,
        endDateTime,
        location,
        attendees: clientEmail ? [clientEmail] : [],
        clientId
      };

      const response = await fetch(`${API_URL}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      const result = await response.json();
      setSuccess('Appointment booked successfully!');

      if (onEventCreated) {
        onEventCreated(result.event.id, result.event.htmlLink);
      }

      // Update existing event state
      setExistingEvent(result.event);

      // Clear form
      setDate('');
      setTime('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!existingEventId) return;

    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = await getAuthToken();
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }

      const response = await fetch(`${API_URL}/api/calendar/events/${existingEventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clientId })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setSuccess('Appointment cancelled successfully');
      setExistingEvent(null);

      if (onEventDeleted) {
        onEventDeleted();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="calendar-booking">
      <h3>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 7H18" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 1V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 1V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Appointment Booking
      </h3>

      {/* Existing Appointment */}
      {existingEvent && (
        <div className="existing-appointment">
          <div className="appointment-header">
            <span className="appointment-status">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Scheduled
            </span>
          </div>
          <div className="appointment-details">
            <div className="appointment-info-group">
              <span className="appointment-label">Date</span>
              <span className="appointment-value">{new Date(existingEvent.startDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="appointment-info-group">
              <span className="appointment-label">Time</span>
              <span className="appointment-value">{new Date(existingEvent.startDateTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            {existingEvent.location && (
              <div className="appointment-info-group">
                <span className="appointment-label">Location</span>
                <span className="appointment-value">{existingEvent.location}</span>
              </div>
            )}
          </div>
          <div className="appointment-actions">
            {existingEventLink && (
              <a
                href={existingEventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="calendar-link-btn"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2.5H3c-.83 0-1.5.67-1.5 1.5v8c0 .83.67 1.5 1.5 1.5h10c.83 0 1.5-.67 1.5-1.5V4c0-.83-.67-1.5-1.5-1.5zM1.5 5.5h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                View in Google Calendar
              </a>
            )}
            <button
              onClick={handleDeleteAppointment}
              className="cancel-appointment-btn"
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Cancel Appointment
            </button>
          </div>
        </div>
      )}

      {/* Booking Form */}
      {!existingEvent && (
        <div className="booking-form">
          {/* Primary Section: Date & Time */}
          <div className="primary-section">
            <div className="section-header">
              <h4>Select Date & Time</h4>
              <span className="required-badge">Required</span>
            </div>

            <div className="datetime-row">
              <div className="form-group primary-input">
                <label htmlFor="appointment-date">
                  Appointment Date
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 6.5H16" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5.5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12.5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    id="appointment-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={getMinDate()}
                    className="form-input date-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group primary-input">
                <label htmlFor="appointment-time">
                  Start Time
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 5v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    id="appointment-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-input time-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Selected Date & Time Preview */}
            {date && time && (
              <div className="selected-datetime-preview">
                <div className="preview-header">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Your Selection</span>
                </div>
                <div className="preview-content">
                  <div className="preview-item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M1.5 5H12.5" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    <span className="preview-label">Date:</span>
                    <span className="preview-value">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="preview-item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className="preview-label">Time:</span>
                    <span className="preview-value">
                      {new Date(`${date}T${time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <div className="preview-item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M7 4v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className="preview-label">Duration:</span>
                    <span className="preview-value">
                      {duration >= 60 ? `${duration / 60} ${duration / 60 === 1 ? 'hour' : 'hours'}` : `${duration} min`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isAvailable !== null && date && time && (
              <div className={`availability-indicator ${isAvailable ? 'available' : 'unavailable'}`}>
                {isAvailable ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="8" fill="currentColor" opacity="0.15"/>
                      <path d="M13.5 6L7.5 12L4.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="availability-text">
                      <strong>Time slot available</strong>
                      <span>This time is free in your calendar</span>
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="8" fill="currentColor" opacity="0.15"/>
                      <path d="M11 7L7 11M7 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div className="availability-text">
                      <strong>Time slot unavailable</strong>
                      <span>You have a conflict at this time</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Secondary Section: Details */}
          <div className="secondary-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointment-duration">Duration</label>
                <div className="input-wrapper">
                  <svg className="input-icon secondary" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <select
                    id="appointment-duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="form-select"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4 hours</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="appointment-location">Location</label>
                <div className="input-wrapper">
                  <svg className="input-icon secondary" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14s5-4 5-7.5a5 5 0 00-10 0C3 10 8 14 8 14z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <input
                    id="appointment-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                    placeholder="e.g., Main Studio, Studio 2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tertiary Section: Notes */}
          <div className="form-group full-width">
            <label htmlFor="appointment-notes">
              Additional Notes <span className="optional-label">(Optional)</span>
            </label>
            <textarea
              id="appointment-notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Add any special instructions, design details, or preferences for this appointment..."
              rows={3}
            />
          </div>

          {error && (
            <div className="error-message">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 5v4M9 12v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="success-message">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 6.5L7.5 12L5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {success}
            </div>
          )}

          <button
            onClick={handleBookAppointment}
            disabled={isLoading || !date || !time || isAvailable === false}
            className="book-appointment-btn"
          >
            {isLoading ? (
              <>
                <svg className="spinner" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                  <path d="M16 9a7 7 0 01-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Booking Appointment...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L7 13L3 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Book Appointment
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarBooking;
