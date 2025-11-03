# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up push notifications for INKFLOW CRM so that you receive notifications on your phone whenever a new client is added, even when the app is closed.

## Prerequisites

- Firebase project already set up (you have this)
- Firebase Admin SDK configured in backend (you have this)
- HTTPS connection (required for service workers)

## Setup Steps

### 1. Enable Firebase Cloud Messaging in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your INKFLOW CRM project
3. Navigate to **Project Settings** (gear icon) > **Cloud Messaging** tab
4. Under "Cloud Messaging API (Legacy)", make sure the API is **enabled**
5. If you see "Cloud Messaging API (Legacy) is disabled", click **Enable**

### 2. Generate Web Push Certificate (VAPID Key)

1. Still in the **Cloud Messaging** tab, scroll down to **Web Push certificates**
2. Click **Generate key pair**
3. Copy the generated key (it looks like: `BKxxx...xxx`)
4. You'll need this for the next step

### 3. Update Environment Variables

#### Frontend (.env file in `inkflow-crm/`)

Add or update your `.env` file with the VAPID key:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=BKxxx...xxx  # <- Add this line with your VAPID key
VITE_BACKEND_URL=http://localhost:3001  # Or your production backend URL
```

#### Update Service Worker

Edit `inkflow-crm/public/firebase-messaging-sw.js` and replace the Firebase config with your actual values:

```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",           // Replace with your actual values
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

### 4. Verify Backend Configuration

The backend is already configured! Make sure your backend `.env` file has:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
MONGODB_CONNECTION_STRING=your_mongodb_connection
```

### 5. Deploy and Test

#### Local Testing

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd inkflow-crm
   npm run dev
   ```

3. **Open the app** in your browser (must be HTTPS or localhost)

4. **Login** and look for the "Enable Notifications" button in the header

5. **Click "Enable Notifications"** - you should see a browser permission prompt

6. **Grant permission** when prompted

7. **Click "Test 🔔"** button to send yourself a test notification

8. **Try adding a new client** - you should receive a notification!

#### Testing on Mobile

For testing on your phone:

1. **Deploy to Vercel/Netlify** (service workers require HTTPS in production)

2. **Install as PWA:**
   - On Android Chrome: Menu > "Add to Home Screen"
   - On iOS Safari: Share > "Add to Home Screen"

3. **Enable notifications** when prompted

4. **Close the app** completely

5. **Add a new client** (from desktop or another device)

6. **You should receive a notification** on your phone! 📱

## How It Works

### Notification Flow

1. **User logs in** → App requests notification permission
2. **Permission granted** → FCM token is generated
3. **Token saved** → Stored in MongoDB `fcm_tokens` collection
4. **New client added** → Backend triggers notification
5. **Notification sent** → Firebase sends to all registered devices
6. **User notified** → Even if app is closed!

### When You'll Receive Notifications

✅ **App closed** - Notification appears in system tray
✅ **App in background** - Notification appears in system tray
✅ **App open** - Notification appears as browser notification

## Troubleshooting

### "Notifications are not supported in this browser"

- Make sure you're using a modern browser (Chrome, Firefox, Edge)
- Service workers require HTTPS (or localhost for development)

### "No FCM token available"

- Check that `VITE_FIREBASE_VAPID_KEY` is set in `.env`
- Verify the VAPID key is correct in Firebase Console
- Check browser console for errors

### "Failed to save FCM token to server"

- Verify backend is running and accessible
- Check that Firebase Admin SDK is initialized correctly
- Make sure MongoDB is connected

### Notifications not appearing on phone

- Ensure the app is deployed to HTTPS (not HTTP)
- Check phone notification settings
- Try "Add to Home Screen" to install as PWA
- Make sure notifications are allowed in browser settings

### "Service worker registration failed"

- Make sure `firebase-messaging-sw.js` is in the `public/` folder
- Verify the Firebase config in the service worker is correct
- Check browser console for specific errors

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Login works correctly
- [ ] "Enable Notifications" button appears
- [ ] Browser asks for notification permission
- [ ] Permission is granted
- [ ] "Test 🔔" button appears
- [ ] Test notification is received
- [ ] New client notification is received
- [ ] Notifications work when app is closed
- [ ] Notifications work on mobile (after PWA install)

## Security Notes

- FCM tokens are stored per user in MongoDB
- Tokens are automatically cleaned up if they become invalid
- All notification endpoints require Firebase authentication
- Notifications are only sent to authenticated users

## Production Deployment

### Environment Variables to Set

**Frontend (Vercel/Netlify):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY` ⚠️ **Don't forget this!**
- `VITE_BACKEND_URL` (your backend URL)

**Backend (Railway/Render):**
- All your existing Firebase Admin SDK variables
- `MONGODB_CONNECTION_STRING`

### Update Service Worker

Don't forget to update `public/firebase-messaging-sw.js` with your actual Firebase config before deploying!

## Need Help?

- Check the browser console for error messages
- Verify all environment variables are set correctly
- Make sure both frontend and backend are running
- Test in Chrome/Firefox first before trying Safari
- Ensure you're using HTTPS in production

---

**Congratulations!** 🎉 You now have push notifications set up for your CRM. Your artists will be notified instantly when new clients are added, even when they're away from their computer!
