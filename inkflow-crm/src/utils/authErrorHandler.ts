import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export class AuthErrorHandler {
  /**
   * Handle authentication errors and take appropriate action
   */
  static async handleAuthError(error: Error): Promise<void> {
    console.error('Authentication error:', error.message);
    
    // If it's an authentication error, sign out the user
    if (error.message.includes('Authentication required') || 
        error.message.includes('Invalid authentication token') ||
        error.message.includes('Token expired')) {
      
      try {
        await signOut(auth);
        // Reload the page to trigger login flow
        window.location.reload();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
        // Force reload anyway
        window.location.reload();
      }
    }
  }
  
  /**
   * Show user-friendly error messages
   */
  static getUserFriendlyMessage(error: Error): string {
    const message = error.message;
    
    if (message.includes('Authentication required')) {
      return 'Please log in to continue.';
    }
    
    if (message.includes('Invalid authentication token')) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (message.includes('Too many requests')) {
      return 'Too many requests. Please try again in a few minutes.';
    }
    
    if (message.includes('Validation failed')) {
      return 'Please check your input and try again.';
    }
    
    if (message.includes('Network error') || message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Return original message for other errors
    return message;
  }
}