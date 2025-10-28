# Firebase Environment Variables Setup for Vercel

## 🔥 Firebase Configuration Required

You need to set up Firebase environment variables in your Vercel dashboard. Here's how:

### 1. Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → Project Settings
4. Scroll down to "Your apps" section
5. Click on your web app (or create one if you don't have it)
6. Copy the config values

### 2. Set Environment Variables in Vercel

In your Vercel dashboard:

1. Go to your project
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar
4. Add these variables:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Example Firebase Config

Your Firebase config should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "inkflow-crm-12345.firebaseapp.com",
  projectId: "inkflow-crm-12345",
  storageBucket: "inkflow-crm-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 4. Redeploy

After setting the environment variables:
1. Go to "Deployments" tab in Vercel
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger a new deployment

## 🚨 Important Notes

- **Never commit Firebase config to Git** - use environment variables
- **Make sure all variables start with `VITE_`** - this is required for Vite
- **Redeploy after adding environment variables** - they don't apply to existing deployments

## 🔧 Alternative: Create Firebase Project

If you don't have a Firebase project yet:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Authentication (Google sign-in)
5. Get your config values
6. Add them to Vercel environment variables
