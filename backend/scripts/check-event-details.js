#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkEventDetails() {
  console.log('Checking event details from Google Calendar...\n');

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

  // Get events from today
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items;

  console.log(`Found ${events.length} events for today:\n`);

  events.forEach((event, i) => {
    console.log(`Event ${i + 1}: ${event.summary}`);
    console.log(`  ID: ${event.id}`);
    console.log(`  Created: ${event.created}`);
    console.log(`  Organizer: ${event.organizer?.email}`);

    if (event.attendees && event.attendees.length > 0) {
      console.log('  Attendees:');
      event.attendees.forEach(att => {
        console.log(`    - ${att.email} (${att.responseStatus})`);
      });
    } else {
      console.log('  Attendees: None');
    }

    console.log(`  HTML Link: ${event.htmlLink}`);
    console.log('');
  });

  // Try to get a specific event
  const eventId = 'fuddt8s28r4n5jkripfahgbs3g'; // The last event we created
  try {
    console.log('Fetching specific event details...');
    const eventDetail = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId
    });

    console.log('Event details for:', eventDetail.data.summary);
    console.log('Full attendee data:', JSON.stringify(eventDetail.data.attendees, null, 2));
  } catch (err) {
    console.log('Could not fetch specific event:', err.message);
  }
}

checkEventDetails().catch(console.error);