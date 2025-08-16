import { PushNotifications, type PushNotificationSchema, type ActionPerformed, type Token } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export class PushNotificationService {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only work on native platforms');
      return;
    }

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    } else {
      // Show some error
      console.log('Push notification permission denied');
    }

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      // Send the token to your server for sending notifications
      this.saveTokenToServer(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ' + JSON.stringify(notification));
      // You can show a local notification here or update the UI
      this.showLocalNotification(notification);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      // Handle notification tap - maybe navigate to specific client
      this.handleNotificationAction(notification);
    });
  }

  static async saveTokenToServer(token: string) {
    try {
      // Send token to your backend to store for sending notifications
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
      
      if (response.ok) {
        console.log('Push token saved to server');
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  static showLocalNotification(notification: PushNotificationSchema) {
    // You could show a custom in-app notification here
    // For now, we'll just log it
    console.log('Showing notification:', notification.title, notification.body);
  }

  static handleNotificationAction(notification: ActionPerformed) {
    // Handle what happens when user taps the notification
    const data = notification.notification.data;
    
    if (data.clientId) {
      // Navigate to specific client
      console.log('Navigate to client:', data.clientId);
      // You could use React Router to navigate here
    }
  }

  static async sendTestNotification() {
    // This would typically be called from your backend
    // but useful for testing
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'INKFLOW CRM',
          body: 'Test notification from your CRM app!',
          data: { test: true }
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}