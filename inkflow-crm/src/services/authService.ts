import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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

  static async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      console.log('🔐 Signing in with email and password');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Successfully signed in with email');
    } catch (error) {
      console.error('❌ Email sign-in error:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in. Please check your credentials.';

      if (error instanceof Error) {
        if (error.message.includes('invalid-credential') || error.message.includes('wrong-password')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email.';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Invalid email address format.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }

      throw new Error(errorMessage);
    }
  }

  static async createUserWithEmail(email: string, password: string): Promise<void> {
    try {
      console.log('🔐 Creating user with email and password');
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Successfully created user and signed in');
    } catch (error) {
      console.error('❌ Email sign-up error:', error);

      let errorMessage = 'Failed to create account. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = 'An account with this email already exists.';
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'Password is too weak. Use at least 6 characters.';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Invalid email address format.';
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