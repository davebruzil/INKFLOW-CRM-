# INKFLOW CRM - Deployment Guide

A comprehensive CRM system for tattoo artists built with React, Node.js, and MongoDB.

## 🚀 Deployment Guide

### Frontend (Vercel)
1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `inkflow-crm` folder as the root directory

2. **Environment Variables:**
   Set these in Vercel dashboard:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Backend (Railway)
1. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder

2. **Environment Variables:**
   Set these in Railway dashboard:
   ```
   PORT=3001
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inkflow-crm
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

3. **Deploy:**
   - Railway will automatically deploy when you push to main branch
   - Your API will be available at: `https://your-app-name.up.railway.app`

## 📱 Mobile App (Capacitor)
The project includes Capacitor for mobile deployment:

```bash
# Install dependencies
cd inkflow-crm
npm install

# Build for web
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Sync and build
npx cap sync
npx cap run android
npx cap run ios
```

## 🔧 Development

### Frontend
```bash
cd inkflow-crm
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## 📁 Project Structure
```
├── inkflow-crm/          # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/    # API services
│   │   ├── config/      # Configuration files
│   │   └── types/       # TypeScript types
│   ├── android/         # Android app
│   ├── ios/            # iOS app
│   └── dist/           # Build output
├── backend/             # Node.js API
│   ├── server.js       # Main server file
│   └── package.json    # Backend dependencies
└── README.md           # This file
```

## 🔐 Security Features
- Firebase Authentication
- MongoDB data sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation

## 📊 Features
- Client management
- Tattoo consultation tracking
- Reference photo uploads
- WhatsApp integration
- Mobile-responsive design
- Offline support
- Push notifications

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Capacitor
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** Firebase Auth
- **Deployment:** Vercel (Frontend), Railway (Backend)
- **Mobile:** Capacitor (Android/iOS)
