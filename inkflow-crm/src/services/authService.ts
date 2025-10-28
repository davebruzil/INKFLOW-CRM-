import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Initialize Google Auth for Capacitor
if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: '87072368963-8a1616bahi9ub64v639gas240lr8iovu.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

export class AuthService {
  static async signInWithGoogle(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Mobile authentication using Capacitor plugin
        console.log('🔐 Using native Google Auth for mobile');
        
        const result = await GoogleAuth.signIn();
        
        if (result.authentication?.idToken) {
          // Sign in to Firebase using the Google credential
          const credential = GoogleAuthProvider.credential(result.authentication.idToken);
          await signInWithCredential(auth, credential);
          console.log('✅ Successfully signed in with native Google Auth');
        } else {
          throw new Error('No ID token received from Google Auth');
        }
      } else {
        // Web authentication using Firebase popup
        console.log('🔐 Using web Google Auth for browser');
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        
        await signInWithPopup(auth, provider);
        console.log('✅ Successfully signed in with web Google Auth');
      }
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
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
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