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

  useEffect(() => {
    // Initialize app for web platform
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Silently initialize push notifications when user logs in
      if (user) {
        try {
          // Wait a bit after login, then silently try to enable notifications
          setTimeout(async () => {
            await PushNotificationService.initialize();
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

  return (
    <div className="App authenticated">
      <div className="app-header">
        <div className="user-info">
          <span>Welcome, {user.displayName || user.email}</span>
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
