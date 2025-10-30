const { google } = require('googleapis');
const config = require('../config');

/**
 * Create OAuth2 client
 */
function getOAuthClient() {
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}

/**
 * Generate OAuth authorization URL
 */
function getAuthUrl(userId) {
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId, // Pass user ID in state to identify them in callback
    prompt: 'consent' // Force consent screen to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
async function getTokensFromCode(code) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Create calendar client with user's tokens
 */
function getCalendarClient(tokens) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(tokens);
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Create a calendar event
 */
async function createCalendarEvent(tokens, eventData) {
  const calendar = getCalendarClient(tokens);

  const event = {
    summary: eventData.title,
    description: eventData.description || '',
    start: {
      dateTime: eventData.startDateTime,
      timeZone: eventData.timeZone || 'America/New_York',
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: eventData.timeZone || 'America/New_York',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
  };

  // Add attendees if provided
  if (eventData.attendees && eventData.attendees.length > 0) {
    event.attendees = eventData.attendees.map(email => ({ email: email }));
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    sendUpdates: 'all', // Send email notifications to attendees
  });

  return response.data;
}

/**
 * Update a calendar event
 */
async function updateCalendarEvent(tokens, eventId, eventData) {
  const calendar = getCalendarClient(tokens);

  const event = {
    summary: eventData.title,
    description: eventData.description || '',
    start: {
      dateTime: eventData.startDateTime,
      timeZone: eventData.timeZone || 'America/New_York',
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: eventData.timeZone || 'America/New_York',
    },
  };

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    resource: event,
  });

  return response.data;
}

/**
 * Delete a calendar event
 */
async function deleteCalendarEvent(tokens, eventId) {
  const calendar = getCalendarClient(tokens);

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });

  return true;
}

/**
 * Refresh access token if expired
 */
async function refreshAccessToken(refreshToken) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  refreshAccessToken
};
