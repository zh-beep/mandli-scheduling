#!/usr/bin/env node

const https = require('https');

async function sendTestInvites() {
  console.log('Sending test calendar invites...\n');

  // First, login to get token
  console.log('1. Logging in to Mandli API...');
  const loginData = JSON.stringify({
    username: 'mandli',
    password: 'Mandli8'
  });

  const loginResponse = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'mandli-production.up.railway.app',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Parse error', raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  if (!loginResponse.token) {
    console.error('❌ Login failed:', loginResponse);
    return false;
  }

  console.log('✓ Login successful\n');

  // Get current date and time
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];

  // Schedule for 3:00 PM - 4:00 PM EST today
  const startTime = `${todayDate}T15:00:00`;
  const endTime = `${todayDate}T16:00:00`;

  console.log('2. Creating calendar event...');
  console.log(`   Date: ${todayDate}`);
  console.log(`   Time: 3:00 PM - 4:00 PM EST`);
  console.log(`   Attendees: jalal@shukranconstruction.com, zanir@ferociter.co\n`);

  const inviteData = JSON.stringify({
    userId: '22ea57f2-b16f-4f2b-a3ac-0094e5b36785', // Ahmed Khan / ai@ferociter.co
    title: 'Mandli Test Meeting',
    description: 'Testing calendar invites with multiple attendees. This event is organized by ai@ferociter.co.',
    startDateTime: startTime,
    endDateTime: endTime,
    timeZone: 'America/New_York',
    attendees: ['jalal@shukranconstruction.com', 'zanir@ferociter.co']
  });

  const inviteResponse = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'mandli-production.up.railway.app',
      port: 443,
      path: '/api/calendar/send-invite',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginResponse.token}`,
        'Content-Length': inviteData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('  Status code:', res.statusCode);
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: { error: 'Parse error', raw: data } });
        }
      });
    });

    req.on('error', reject);
    req.write(inviteData);
    req.end();
  });

  console.log('\nResponse:');
  console.log(JSON.stringify(inviteResponse.body, null, 2));

  if (inviteResponse.statusCode === 200 && inviteResponse.body.success) {
    console.log('\n✅ Calendar invites sent successfully!');
    console.log('📧 jalal@shukranconstruction.com will receive an email invitation');
    console.log('📧 zanir@ferociter.co will receive an email invitation');
    console.log('📅 Organized by: ai@ferociter.co (Ahmed Khan)');
    console.log('📅 Event: TODAY at 3:00-4:00 PM EST');
    console.log('🔗 Event link:', inviteResponse.body.event.htmlLink);
    return true;
  } else {
    console.log('\n❌ Calendar invite failed');
    return false;
  }
}

sendTestInvites().then(success => process.exit(success ? 0 : 1));
