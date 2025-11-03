import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './config/firebase';
import ClientList from './components/ClientList';
import Login from './components/Login';
import { PushNotificationService } from './services/pushNotificationService';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Initialize app for web platform
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Initialize push notifications when user logs in
      if (user) {
        try {
          // Wait a bit before requesting notification permission
          setTimeout(async () => {
            const token = await PushNotificationService.initialize();
            if (token) {
              console.log('✅ Push notifications initialized');
              setNotificationPermission('granted');
            } else {
              setNotificationPermission(Notification.permission);
            }
          }, 2000); // Wait 2 seconds after login
        } catch (error) {
          console.error('Error initializing push notifications:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading INKFLOW CRM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => setUser(auth.currentUser)} />;
  }

  const handleEnableNotifications = async () => {
    try {
      const token = await PushNotificationService.initialize();
      if (token) {
        setNotificationPermission('granted');
        alert('Notifications enabled! You will now receive alerts when new clients are added.');
      } else {
        alert('Failed to enable notifications. Please check your browser settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications.');
    }
  };

  const handleTestNotification = async () => {
    try {
      const success = await PushNotificationService.sendTestNotification();
      if (success) {
        alert('Test notification sent! Check your notifications.');
      } else {
        alert('Failed to send test notification.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return (
    <div className="App authenticated">
      <div className="app-header">
        <div className="user-info">
          <span>Welcome, {user.displayName || user.email}</span>
          {notificationPermission === 'denied' && (
            <span className="notification-status denied">
              🔕 Notifications blocked
            </span>
          )}
          {notificationPermission === 'default' && (
            <button onClick={handleEnableNotifications} className="enable-notifications-btn">
              🔔 Enable Notifications
            </button>
          )}
          {notificationPermission === 'granted' && (
            <span className="notification-status granted">
              ✅ Notifications enabled
            </span>
          )}
          {notificationPermission === 'granted' && (
            <button onClick={handleTestNotification} className="test-notification-btn">
              Test 🔔
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      <div className="centered">
        <ClientList />
      </div>
    </div>
  );
}

export default App
