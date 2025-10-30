#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const calendarService = require('../backend/src/services/calendar');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCalendarInvite() {
  console.log('Testing calendar invite creation...\n');

  const userId = '22ea57f2-b16f-4f2b-a3ac-0094e5b36785';

  // Get OAuth tokens from database
  const { data: authData, error: authError } = await supabase
    .from('gmail_sender')
    .select('*')
    .eq('user_email', userId)
    .single();

  if (authError || !authData) {
    console.error('❌ Failed to get OAuth tokens:', authError);
    return false;
  }

  console.log('✓ Retrieved OAuth tokens from database');
  console.log('  - Access token:', authData.access_token.substring(0, 20) + '...');
  console.log('  - Refresh token:', authData.refresh_token.substring(0, 20) + '...');
  console.log('  - Expires at:', authData.expires_at);
  console.log('');

  // Prepare tokens
  const tokens = {
    access_token: authData.access_token,
    refresh_token: authData.refresh_token,
    expiry_date: new Date(authData.expires_at).getTime()
  };

  console.log('Token structure:');
  console.log('  - access_token: ', tokens.access_token ? 'present' : 'missing');
  console.log('  - refresh_token:', tokens.refresh_token ? 'present' : 'missing');
  console.log('  - expiry_date:', tokens.expiry_date);
  console.log('  - expiry_date type:', typeof tokens.expiry_date);
  console.log('');

  // Create event data
  const eventData = {
    title: 'Early Paat - Test Event #1',
    description: 'First test of automatic calendar invite via OAuth',
    startDateTime: '2025-01-15T06:00:00',
    endDateTime: '2025-01-15T07:00:00',
    timeZone: 'America/New_York'
  };

  console.log('Event data:');
  console.log(JSON.stringify(eventData, null, 2));
  console.log('');

  // Try to create the event
  try {
    console.log('Calling calendarService.createCalendarEvent...');
    const event = await calendarService.createCalendarEvent(tokens, eventData);

    console.log('\n✅ Calendar event created successfully!');
    console.log('  - Event ID:', event.id);
    console.log('  - Summary:', event.summary);
    console.log('  - Start:', event.start.dateTime);
    console.log('  - End:', event.end.dateTime);
    console.log('  - HTML Link:', event.htmlLink);
    return true;
  } catch (error) {
    console.error('\n❌ Failed to create calendar event:');
    console.error('  - Error name:', error.name);
    console.error('  - Error message:', error.message);
    if (error.response) {
      console.error('  - Response status:', error.response.status);
      console.error('  - Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    return false;
  }
}

testCalendarInvite().then(success => process.exit(success ? 0 : 1));
