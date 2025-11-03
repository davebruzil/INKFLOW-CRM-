import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { messaging } from '../config/firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export class PushNotificationService {
  private static fcmToken: string | null = null;

  /**
   * Initialize Firebase Cloud Messaging and request notification permissions
   */
  static async initialize(): Promise<string | null> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('⚠️ This browser does not support notifications');
        return null;
      }

      // Check if FCM is initialized
      if (!messaging) {
        console.warn('⚠️ Firebase Messaging is not supported in this browser');
        return null;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.log('❌ Notification permission denied');
        return null;
      }

      console.log('✅ Notification permission granted');

      // Get FCM token (VAPID key will need to be added to your Firebase project)
      const token = await this.getMessagingToken(messaging);

      if (token) {
        this.fcmToken = token;
        console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');

        // Save token to server
        await this.saveTokenToServer(token);

        // Set up foreground message handler
        this.setupForegroundMessageHandler(messaging);

        return token;
      } else {
        console.warn('⚠️ No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Get FCM token with VAPID key
   */
  private static async getMessagingToken(messagingInstance: Messaging): Promise<string | null> {
    try {
      // You'll need to generate a VAPID key in Firebase Console
      // Go to: Project Settings > Cloud Messaging > Web Push certificates
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.error('❌ VITE_FIREBASE_VAPID_KEY not set in environment variables');
        console.log('📝 To get your VAPID key:');
        console.log('   1. Go to Firebase Console > Project Settings');
        console.log('   2. Navigate to Cloud Messaging tab');
        console.log('   3. Under "Web Push certificates", generate a new key pair');
        console.log('   4. Add the key to your .env file as VITE_FIREBASE_VAPID_KEY');
        return null;
      }

      const token = await getToken(messagingInstance, { vapidKey });
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to backend server
   */
  static async saveTokenToServer(token: string): Promise<void> {
    try {
      const authToken = localStorage.getItem('userToken');

      if (!authToken) {
        console.warn('⚠️ No auth token found, cannot save FCM token to server');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/fcm/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ fcmToken: token })
      });

      if (!response.ok) {
        throw new Error(`Failed to save FCM token: ${response.statusText}`);
      }

      console.log('✅ FCM token saved to server');
    } catch (error) {
      console.error('❌ Error saving FCM token to server:', error);
    }
  }

  /**
   * Setup handler for foreground messages (when app is open)
   */
  private static setupForegroundMessageHandler(messagingInstance: Messaging): void {
    onMessage(messagingInstance, (payload) => {
      console.log('📬 Foreground message received:', payload);

      const notificationTitle = payload.notification?.title || 'New Client Added';
      const notificationBody = payload.notification?.body || 'A new client has been added to your CRM';

      // Show browser notification even when app is open
      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'new-client-notification',
          requireInteraction: true
        });
      }

      // You can also update the UI here
      this.showLocalNotification({
        title: notificationTitle,
        body: notificationBody,
        data: payload.data
      });
    });
  }

  /**
   * Show local notification (can be used to update UI)
   */
  static showLocalNotification(notification: any): void {
    console.log('📱 Local notification:', notification);

    // You can dispatch a custom event to update the UI
    window.dispatchEvent(new CustomEvent('new-client-notification', {
      detail: notification
    }));
  }

  /**
   * Handle notification action (when user clicks notification)
   */
  static handleNotificationAction(notification: any): void {
    console.log('🔔 Notification action:', notification);
    // Handle notification click - e.g., navigate to client details
  }

  /**
   * Send test notification (for testing purposes)
   */
  static async sendTestNotification(): Promise<boolean> {
    try {
      if (!this.fcmToken) {
        console.error('❌ No FCM token available for test notification');
        return false;
      }

      const authToken = localStorage.getItem('userToken');

      if (!authToken) {
        console.error('❌ No auth token found');
        return false;
      }

      const response = await fetch(`${BACKEND_URL}/api/fcm/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to send test notification: ${response.statusText}`);
      }

      console.log('✅ Test notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Get current FCM token
   */
  static getCurrentToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Check if notifications are enabled
   */
  static isNotificationEnabled(): boolean {
    return Notification.permission === 'granted' && this.fcmToken !== null;
  }
}