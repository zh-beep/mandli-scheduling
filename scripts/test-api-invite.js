#!/usr/bin/env node

const http = require('http');

async function testAPIInvite() {
  console.log('Testing calendar invite API endpoint...\n');

  // First, login to get token
  console.log('1. Logging in...');
  const loginData = JSON.stringify({
    username: 'mandli',
    password: 'Mandli8'
  });

  const loginResponse = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(JSON.parse(data)); });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  if (!loginResponse.token) {
    console.error('❌ Login failed:', loginResponse);
    return false;
  }

  console.log('✓ Login successful');
  console.log('  Token:', loginResponse.token.substring(0, 20) + '...\n');

  // Now send calendar invite
  console.log('2. Sending calendar invite...');
  const inviteData = JSON.stringify({
    userId: '22ea57f2-b16f-4f2b-a3ac-0094e5b36785',
    title: 'Early Paat - Test Event #2',
    description: 'Second test via API endpoint',
    startDateTime: '2025-01-16T06:00:00',
    endDateTime: '2025-01-16T07:00:00',
    timeZone: 'America/New_York'
  });

  const inviteResponse = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/calendar/send-invite',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginResponse.token}`,
        'Content-Length': inviteData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('  Status code:', res.statusCode);
        resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
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
    return true;
  } else {
    console.log('\n❌ Calendar invite failed');
    return false;
  }
}

testAPIInvite().then(success => process.exit(success ? 0 : 1));
