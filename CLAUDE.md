# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend (inkflow-crm/)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (runs TypeScript check first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend (backend/)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Project Architecture

INKFLOW CRM is a full-stack tattoo artist client management system with two main components:

### Frontend Structure
- **React 18 + TypeScript** application built with Vite
- **Firebase Authentication** for user management
- **MongoDB integration** via REST API for data persistence
- **Dual data layer**: Firebase (legacy) + MongoDB (current)
- Key directories:
  - `src/components/` - React components (ClientList, ClientModal, Login, DatabaseTest)
  - `src/config/` - Firebase and MongoDB connection configuration
  - `src/services/` - API service layers and fallback logic
  - `src/types/` - TypeScript type definitions

### Backend Structure
- **Express.js API server** with MongoDB Atlas connection
- **CRUD operations** for client management
- **Security middleware**: Helmet, CORS configuration
- **Health check endpoint** at `/health`
- **RESTful API routes** under `/api/clients`

### Data Flow Architecture
The application uses a sophisticated fallback system:
1. **Primary**: MongoDB via backend API (backend/server.js)
2. **Fallback**: Firebase Firestore (legacy system)
3. **Smart switching**: Automatic detection and failover in services/fallbackService.ts

### Key Technical Patterns
- **Authentication flow**: Firebase Auth with automatic state management
- **Error handling**: Comprehensive try-catch with user-friendly error messages
- **Type safety**: Full TypeScript coverage with custom Client interface
- **Responsive design**: Mobile-first CSS with glassmorphism styling
- **Real-time updates**: Immediate UI updates with optimistic rendering

### Environment Configuration
- Frontend uses Vite environment variables (`VITE_*`)
- Backend requires `.env` file with MongoDB connection details
- CORS configured for development (localhost:5173) and production

### Client Data Model
Core Client interface includes:
- Basic info: name, phone, email
- Tattoo details: placement, description, style
- Business fields: status, consultation date, price
- Metadata: timestamps, unique identifiers

### Development Notes
- The project maintains both Firebase and MongoDB implementations for data persistence
- DatabaseTest component provides connection testing for both systems
- WhatsApp integration available via direct URL generation
- Mobile-responsive design prioritizes touch interactions