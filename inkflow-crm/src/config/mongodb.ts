import { auth } from './firebase';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Check if backend API is available (uses public endpoint)
export const isBackendAvailable = async () => {
  try {
    console.log(`🔍 Checking backend availability at: ${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`);
    const isAvailable = response.ok;
    console.log(`${isAvailable ? '✅' : '❌'} Backend ${isAvailable ? 'available' : 'unavailable'} - Status: ${response.status}`);
    return isAvailable;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.log('🔄 Falling back to Firebase');
    return false;
  }
};

// Get Firebase auth token
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

// API request helper with authentication
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
  
  // Get authentication token
  const token = await getAuthToken();
  console.log(`🔐 Auth token ${token ? 'available' : 'missing'}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  // Add auth header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    console.log(`📋 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage: string;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || `HTTP error! status: ${response.status}`;
        console.error('❌ API Error Response:', error);
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      
      // Handle authentication errors specifically
      if (response.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
        console.error('🚫 Authentication failed - redirecting to login may be needed');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ API Success: Retrieved ${Array.isArray(data) ? data.length : 1} record(s)`);
    return data;
  } catch (error) {
    console.error(`❌ API Request failed for ${url}:`, error);
    throw error;
  }
};

// Public API request helper (for endpoints that don't require auth)
export const publicApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage: string;
    try {
      const error = await response.json();
      errorMessage = error.error || `HTTP error! status: ${response.status}`;
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};