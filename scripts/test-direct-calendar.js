#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function testDirectCalendar() {
  console.log('Testing direct calendar API call with attendee...\n');

  // Get OAuth tokens
  const userId = '22ea57f2-b16f-4f2b-a3ac-0094e5b36785';
  const { data: authData } = await supabase
    .from('gmail_sender')
    .select('*')
    .eq('user_email', userId)
    .single();

  // Setup OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: authData.access_token,
    refresh_token: authData.refresh_token,
    expiry_date: new Date(authData.expires_at).getTime()
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Create event with attendee
  const event = {
    summary: 'TEST: Direct API Call with Attendee',
    description: 'Testing if attendees work with direct API call',
    start: {
      dateTime: '2025-10-30T16:00:00',
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: '2025-10-30T17:00:00',
      timeZone: 'America/New_York'
    },
    attendees: [
      { email: 'zanir@ferociter.co' }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };

  console.log('Event object being sent:');
  console.log(JSON.stringify(event, null, 2));
  console.log('');

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all'
    });

    console.log('✅ Event created successfully!');
    console.log('Event ID:', response.data.id);
    console.log('Event Link:', response.data.htmlLink);
    console.log('');

    console.log('Checking attendees in response:');
    if (response.data.attendees && response.data.attendees.length > 0) {
      console.log('Attendees found:');
      response.data.attendees.forEach(att => {
        console.log(`  - ${att.email} (${att.responseStatus})`);
      });
    } else {
      console.log('❌ NO ATTENDEES in response!');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Error creating event:');
    console.error(error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

testDirectCalendar().catch(console.error);