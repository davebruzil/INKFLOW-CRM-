import { useState, useEffect } from 'react';
// import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
// import { auth } from './config/firebase';
import ClientList from './components/ClientList';
// import Login from './components/Login';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
// import { PushNotificationService } from './services/pushNotificationService';
import './App.css';

function App() {
  // const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize mobile app features
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
          
          // Skip push notifications for now
          // await PushNotificationService.initialize();
          
          // Hide splash screen after app loads
          await SplashScreen.hide();
        } catch (error) {
          console.log('Mobile initialization error:', error);
        }
        
        // Force loading to false on mobile for testing
        setTimeout(() => setLoading(false), 2000);
      } else {
        // Web platform
        // const unsubscribe = onAuthStateChanged(auth, (user) => {
        //   setUser(user);
        //   setLoading(false);
        // });
        // return () => unsubscribe();
        
        // Skip Firebase for now - go directly to main page
        setTimeout(() => setLoading(false), 1000);
      }
    };

    initializeApp();
  }, []);

  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth);
  //   } catch (error) {
  //     console.error('Error signing out:', error);
  //   }
  // };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading INKFLOW CRM...</p>
          {Capacitor.isNativePlatform() && (
            <p style={{color: 'green', marginTop: '10px'}}>
              ✓ Running on Native Platform (Android)
            </p>
          )}
        </div>
      </div>
    );
  }

  // Skip login for now - go directly to main page
  // if (!user) {
  //   return <Login onLogin={() => setUser(auth.currentUser)} />;
  // }

  return (
    <div className="App authenticated">
      <div className="app-header">
        <div className="user-info">
          <span>Welcome to INKFLOW CRM</span>
          {/* <button onClick={handleLogout} className="logout-btn">
            Logout
          </button> */}
        </div>
      </div>
      <div className="centered">
        <ClientList />
      </div>
    </div>
  );
}

export default App
