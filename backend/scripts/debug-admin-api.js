#!/usr/bin/env node

const http = require('http');

async function debugAdminAPI() {
  console.log('\n🔍 DEBUGGING ADMIN API RESPONSE');
  console.log('=' .repeat(60));

  // 1. Login as admin
  const adminToken = await getAdminToken();
  if (!adminToken) {
    console.log('❌ Failed to login as admin');
    return;
  }
  console.log('✅ Admin logged in successfully\n');

  // 2. Make raw request and show full response
  console.log('📡 Making request to /api/availability/month/2025-10');
  console.log('-'.repeat(60));

  await makeDebugRequest(adminToken);
}

async function getAdminToken() {
  const loginData = JSON.stringify({
    username: 'mandli',
    password: 'Mandli8'
  });

  return new Promise((resolve) => {
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
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.token);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(loginData);
    req.end();
  });
}

async function makeDebugRequest(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/availability/month/2025-10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('Request details:');
    console.log(`  URL: http://${options.hostname}:${options.port}${options.path}`);
    console.log(`  Method: ${options.method}`);
    console.log(`  Headers: Authorization: Bearer ${token.substring(0, 30)}...`);
    console.log('');

    const req = http.request(options, (res) => {
      console.log(`Response Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
      console.log('');

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Raw Response Body:');
        console.log(data);
        console.log('');

        try {
          const parsed = JSON.parse(data);
          console.log('Parsed Response:');
          console.log(JSON.stringify(parsed, null, 2));

          if (parsed.availability && Array.isArray(parsed.availability)) {
            console.log(`\n✅ Found ${parsed.availability.length} availability entries`);
            parsed.availability.forEach((entry, i) => {
              console.log(`\n${i + 1}. ${entry.users?.full_name || 'Unknown User'}`);
              console.log(`   Days: ${entry.available_days?.join(', ') || 'None'}`);
            });
          } else {
            console.log('\n❌ No availability array in response');
          }
        } catch (err) {
          console.log('❌ Failed to parse response as JSON:', err.message);
        }

        resolve();
      });
    });

    req.on('error', (err) => {
      console.log('❌ Request error:', err.message);
      resolve();
    });

    req.end();
  });
}

debugAdminAPI().catch(console.error);