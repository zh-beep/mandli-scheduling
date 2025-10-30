#!/usr/bin/env node

const https = require('https');

async function sendInviteWithAttendee() {
  console.log('Sending calendar invite to zanir@ferociter.co...\n');

  // First, login to get token
  console.log('1. Logging in...');
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

  // Send calendar invite with attendee
  console.log('2. Sending calendar invite with attendee...');
  const inviteData = JSON.stringify({
    userId: '22ea57f2-b16f-4f2b-a3ac-0094e5b36785',
    title: 'Early Paat - Duty Assignment',
    description: 'You have been assigned to Early Paat duty. Please confirm your attendance.',
    startDateTime: '2025-10-30T10:00:00',
    endDateTime: '2025-10-30T11:00:00',
    timeZone: 'America/New_York',
    attendees: ['zanir@ferociter.co']
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
    console.log('\n✅ Calendar invite sent successfully!');
    console.log('📧 zanir@ferociter.co should receive an email invitation');
    console.log('📅 Event added to Ahmed Khan\'s calendar');
    console.log('🔗 Event link:', inviteResponse.body.event.htmlLink);
    return true;
  } else {
    console.log('\n❌ Calendar invite failed');
    return false;
  }
}

sendInviteWithAttendee().then(success => process.exit(success ? 0 : 1));
