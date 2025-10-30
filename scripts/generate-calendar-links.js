#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// You can host this frontend page anywhere - GitHub Pages, Netlify, Vercel, etc.
// For now, we'll assume you deploy it to the same domain or a CDN
const FRONTEND_AUTH_PAGE = 'https://mandli-production.up.railway.app/calendar-auth.html';

async function generateCalendarLinks() {
  console.log('Generating calendar authentication links for all users...\n');
  console.log('=' .repeat(80));
  console.log('\n');

  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email, cell_phone')
    .order('full_name');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users:\n`);

  users.forEach((user, index) => {
    const authLink = `${FRONTEND_AUTH_PAGE}?userId=${user.id}`;

    console.log(`${index + 1}. ${user.full_name}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Phone: ${user.cell_phone || 'N/A'}`);
    console.log(`   Auth Link: ${authLink}`);
    console.log('');
  });

  console.log('=' .repeat(80));
  console.log('\n📧 Send these links to users via email or text message');
  console.log('🔗 Users click the link, authorize Google Calendar, and events auto-add!');
  console.log('\n');

  // Check who's already connected
  console.log('Checking calendar connection status...\n');

  const { data: connected, error: connError } = await supabase
    .from('gmail_sender')
    .select('user_email, authenticated_at, expires_at');

  if (!connError && connected) {
    const connectedUserIds = new Set(connected.map(c => c.user_email));

    console.log('✅ Already Connected:');
    users.filter(u => connectedUserIds.has(u.id)).forEach(user => {
      const conn = connected.find(c => c.user_email === user.id);
      const expired = new Date(conn.expires_at) < new Date();
      console.log(`   - ${user.full_name} ${expired ? '(⚠️ EXPIRED - needs to reconnect)' : ''}`);
    });

    console.log('\n❌ Not Connected Yet:');
    users.filter(u => !connectedUserIds.has(u.id)).forEach(user => {
      console.log(`   - ${user.full_name}`);
    });
  }

  console.log('\n');
}

generateCalendarLinks().catch(console.error);