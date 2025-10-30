# Google Calendar Integration Setup Guide

This guide will walk you through setting up Google Calendar integration for INKFLOW CRM to enable appointment booking directly from client profiles.

## Prerequisites

- Google account
- Access to Google Cloud Console
- INKFLOW CRM backend server running

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "INKFLOW CRM"
5. Click "Create"

## Step 2: Enable Google Calendar API

1. In Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS"
3. Select "OAuth client ID"
4. If prompted to configure consent screen:
   - Click "Configure Consent Screen"
   - Select "External" (or "Internal" if using Google Workspace)
   - Click "Create"
   - Fill in the required fields:
     - App name: "INKFLOW CRM"
     - User support email: Your email
     - Developer contact information: Your email
   - Click "Save and Continue"
   - Add scopes:
     - Click "Add or Remove Scopes"
     - Select "Google Calendar API" > ".../auth/calendar"
     - Select "Google Calendar API" > ".../auth/calendar.events"
     - Click "Update"
   - Click "Save and Continue"
   - Add test users (your email address)
   - Click "Save and Continue"
   - Click "Back to Dashboard"

5. Return to "Credentials" and click "+ CREATE CREDENTIALS" > "OAuth client ID"
6. Application type: Select "Web application"
7. Name: "INKFLOW CRM Backend"
8. Authorized JavaScript origins:
   - `http://localhost:3001`
   - Add your production domain if deploying
9. Authorized redirect URIs:
   - `http://localhost:3001/api/calendar/oauth2callback`
   - Add your production callback URL if deploying
10. Click "Create"
11. **IMPORTANT:** Copy the Client ID and Client Secret - you'll need these!

## Step 4: Update Backend Environment Variables

1. Open `backend/.env` file
2. Update the following variables with your credentials:

```env
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/oauth2callback
GOOGLE_REFRESH_TOKEN=
```

3. Save the file
4. Restart the backend server (it will restart automatically if using nodemon)

## Step 5: Authorize the Application

This is a one-time setup to get the refresh token:

1. Make sure both backend and frontend servers are running
2. Log into INKFLOW CRM application
3. Open your browser's developer console (F12)
4. In the console, run this command to get the authorization URL:

```javascript
fetch('http://localhost:3001/api/calendar/auth', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Go to this URL:', data.authUrl);
  window.open(data.authUrl, '_blank');
});
```

5. You'll be redirected to Google's consent screen
6. Sign in with your Google account
7. Click "Allow" to grant calendar permissions
8. You'll be redirected back to your application with a response containing the refresh token
9. Copy the `refresh_token` value from the response
10. Add it to your `backend/.env` file:

```env
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

11. Restart the backend server

## Step 6: Test the Integration

1. Open INKFLOW CRM application
2. Click on any client to open their profile
3. Scroll down to the "Book Appointment" section
4. Select a date and time
5. Click "Book Appointment"
6. The appointment should be created in your Google Calendar
7. You should see a link to view it in Google Calendar

## Features

### For Artists (You)

- **Book appointments** directly from client profiles
- **Automatic conflict detection** - prevents double-booking
- **Email notifications** sent to clients automatically
- **Google Calendar integration** - all appointments sync to your calendar
- **Cancel appointments** with automatic notifications
- **View in Calendar** - quick link to see appointment in Google Calendar

### For Clients

- Clients receive email invitations with calendar event
- They can add the event to their own calendar
- Receive automatic reminders (1 day before and 1 hour before)
- Receive cancellation notifications if appointment is cancelled

## Calendar Event Details

Each appointment includes:

- **Title:** "Tattoo Appointment - [Client Name]"
- **Description:** Client's phone number and custom notes
- **Duration:** Customizable (30min to 4 hours)
- **Location:** Your studio address
- **Color:** Banana yellow (easy to spot in calendar)
- **Reminders:** Email 1 day before, popup 1 hour before

## Timezone

- All appointments are set in **Asia/Jerusalem** timezone
- You can change this in `backend/calendarService.js` if needed

## Troubleshooting

### "Authorization failed" error

- Make sure your OAuth credentials are correct in `.env`
- Try re-authorizing by following Step 5 again
- Check that the redirect URI matches exactly in Google Cloud Console

### "Time slot is not available" error

- Another appointment is already scheduled at that time
- Choose a different time slot

### "Authentication service unavailable"

- Backend server is not running
- Firebase authentication is not configured correctly

### Appointments not showing in Google Calendar

- Check that GOOGLE_REFRESH_TOKEN is set correctly
- Re-authorize the application (Step 5)
- Check Google Calendar API is enabled in Cloud Console

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret and Refresh Token secure
- Only grant access to trusted test users during development
- For production, complete the OAuth consent screen verification process
- Consider using environment-specific credentials for dev/prod

## API Endpoints

The following calendar endpoints are available:

- `GET /api/calendar/auth` - Get authorization URL
- `GET /api/calendar/oauth2callback` - OAuth callback
- `POST /api/calendar/events` - Create calendar event
- `GET /api/calendar/events/:eventId` - Get event details
- `PUT /api/calendar/events/:eventId` - Update event
- `DELETE /api/calendar/events/:eventId` - Delete event
- `GET /api/calendar/events` - List upcoming events
- `POST /api/calendar/check-availability` - Check time slot availability

All endpoints require Firebase authentication token.

## Next Steps

- Test the integration thoroughly
- Customize appointment durations as needed
- Set up email notifications for your studio
- Consider adding SMS reminders via Twilio (future enhancement)

## Support

If you encounter any issues, check:
1. Backend server logs for errors
2. Browser console for frontend errors
3. Google Cloud Console for API quotas and limits
4. Firebase Authentication status

For Google Calendar API documentation:
https://developers.google.com/calendar/api/v3/reference
