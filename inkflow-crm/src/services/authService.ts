import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

export class AuthService {
  static async signInWithGoogle(): Promise<void> {
    try {
      // Web authentication using Firebase popup
      console.log('🔐 Using web Google Auth for browser');
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
      console.log('✅ Successfully signed in with web Google Auth');
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  static async signOut(): Promise<void> {
    try {
      await auth.signOut();
      console.log('✅ Successfully signed out');
    } catch (error) {
      console.error('❌ Sign-out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  static getCurrentUser() {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: any) => void) {
    return auth.onAuthStateChanged(callback);
  }
}