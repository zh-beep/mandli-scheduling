#!/usr/bin/env node

const https = require('https');

async function testRailwayInvite() {
  console.log('Testing calendar invite on Railway production...\n');

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
        console.log('  Status code:', res.statusCode);
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

  console.log('✓ Login successful');
  console.log('  Token:', loginResponse.token.substring(0, 20) + '...\n');

  // Now send calendar invite
  console.log('2. Sending calendar invite...');
  const inviteData = JSON.stringify({
    userId: '22ea57f2-b16f-4f2b-a3ac-0094e5b36785',
    title: 'Early Paat - Production Test',
    description: 'Testing from Railway production',
    startDateTime: '2025-01-17T06:00:00',
    endDateTime: '2025-01-17T07:00:00',
    timeZone: 'America/New_York'
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
    console.log('\n✅ Calendar invite sent successfully on Railway!');
    return true;
  } else {
    console.log('\n❌ Calendar invite failed on Railway');
    return false;
  }
}

testRailwayInvite().then(success => process.exit(success ? 0 : 1));
