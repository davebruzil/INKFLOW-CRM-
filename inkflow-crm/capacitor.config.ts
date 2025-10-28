
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inkflow.crm',
  appName: 'INKFLOW CRM',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For local development: Connect to your computer's backend server
    // Comment this out when building for production
    // url: 'http://10.0.0.8:5173',
    // cleartext: true,
    // allowNavigation: ['10.0.0.8']
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '87072368963-8a1616bahi9ub64v639gas240lr8iovu.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
