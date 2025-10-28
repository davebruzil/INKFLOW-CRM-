export class PushNotificationService {
  static async initialize() {
    console.log('Push notifications disabled for web version');
    return;
  }

  static async saveTokenToServer(_token: string) {
    console.log('Push token saving disabled for web version');
  }

  static showLocalNotification(_notification: any) {
    console.log('Local notifications disabled for web version');
  }

  static handleNotificationAction(_notification: any) {
    console.log('Notification actions disabled for web version');
  }

  static async sendTestNotification() {
    console.log('Test notifications disabled for web version');
    return false;
  }
}