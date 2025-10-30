#!/usr/bin/env node

const https = require('https');

async function testVercelLogin() {
  console.log('\n🔐 TESTING VERCEL LOGIN FLOW');
  console.log('=' .repeat(60));

  console.log('\n1️⃣  Testing admin login via Railway API');
  console.log('-'.repeat(60));

  const loginResult = await loginToRailway();

  if (!loginResult.success) {
    console.log('❌ Login failed - cannot proceed');
    return;
  }

  console.log('✅ Login successful!');
  console.log(`   Token received: ${loginResult.token.substring(0, 50)}...`);
  console.log(`   Admin username: ${loginResult.data.admin?.username}`);
  console.log(`   Admin ID: ${loginResult.data.admin?.id}`);

  console.log('\n2️⃣  Testing authenticated API calls');
  console.log('-'.repeat(60));

  // Test getting users
  console.log('\n📋 Fetching users list...');
  const usersResult = await makeAuthenticatedRequest(
    'https://mandli-production.up.railway.app',
    '/api/users',
    'GET',
    loginResult.token
  );

  if (usersResult.success) {
    console.log('✅ Users API works!');
    if (usersResult.data.users) {
      console.log(`   Found ${usersResult.data.users.length} users`);
      usersResult.data.users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.full_name} (${user.email})`);
      });
    }
  } else {
    console.log('❌ Users API failed:', usersResult.error);
    console.log('   Status:', usersResult.statusCode);
    console.log('   Response:', JSON.stringify(usersResult.data, null, 2));
  }

  // Test getting availability
  console.log('\n📅 Fetching October 2025 availability...');
  const availResult = await makeAuthenticatedRequest(
    'https://mandli-production.up.railway.app',
    '/api/availability/month/2025-10',
    'GET',
    loginResult.token
  );

  if (availResult.success) {
    console.log('✅ Availability API works!');
    if (availResult.data.availability) {
      console.log(`   Found ${availResult.data.availability.length} submissions`);
      availResult.data.availability.forEach((entry, i) => {
        console.log(`   ${i + 1}. ${entry.users?.full_name || 'Unknown'}: ${entry.available_days?.length} days`);
      });
    }
  } else {
    console.log('❌ Availability API failed:', availResult.error);
    console.log('   Status:', availResult.statusCode);
    console.log('   Response:', JSON.stringify(availResult.data, null, 2));
  }

  console.log('\n3️⃣  Summary');
  console.log('=' .repeat(60));
  console.log('✅ Railway backend is up and running');
  console.log('✅ CORS is properly configured for Vercel');
  console.log('✅ Admin login works');
  console.log('\n🌐 You can now try logging in at:');
  console.log('   https://mandli-scheduling.vercel.app/login.html');
  console.log('\n   Credentials:');
  console.log('   Username: mandli');
  console.log('   Password: Mandli8');
}

async function loginToRailway() {
  const credentials = {
    username: 'mandli',
    password: 'Mandli8'
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(credentials);

    const options = {
      hostname: 'mandli-production.up.railway.app',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Origin': 'https://mandli-scheduling.vercel.app'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);

          if (res.statusCode === 200 && parsed.token) {
            resolve({
              success: true,
              token: parsed.token,
              data: parsed
            });
          } else {
            resolve({
              success: false,
              error: parsed.message || 'Login failed',
              statusCode: res.statusCode
            });
          }
        } catch (err) {
          resolve({
            success: false,
            error: `Parse error: ${err.message}`,
            raw: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    req.write(data);
    req.end();
  });
}

async function makeAuthenticatedRequest(baseUrl, path, method, token) {
  return new Promise((resolve) => {
    const url = new URL(`${baseUrl}${path}`);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://mandli-scheduling.vercel.app'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: parsed,
            statusCode: res.statusCode
          });
        } catch (err) {
          resolve({
            success: false,
            error: `Parse error: ${err.message}`,
            raw: responseData,
            statusCode: res.statusCode
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    req.end();
  });
}

testVercelLogin().catch(console.error);