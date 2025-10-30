#!/usr/bin/env node

const https = require('https');

async function testAdminLogin() {
  console.log('\n🔐 TESTING ADMIN LOGIN');
  console.log('=' .repeat(50));

  const credentials = {
    username: 'mandli',
    password: 'Mandli8'
  };

  console.log('Testing login with:');
  console.log(`  Username: ${credentials.username}`);
  console.log(`  Password: ${credentials.password.replace(/./g, '*')}`);
  console.log('');

  // Test Railway backend
  console.log('1. Testing Railway Backend API:');
  await testLogin('https://mandli-production.up.railway.app', credentials);

  // Test local backend
  console.log('\n2. Testing Local Backend API:');
  await testLogin('http://localhost:3001', credentials);

  console.log('\n' + '=' .repeat(50));
  console.log('SUMMARY:');
  console.log('✅ If login succeeds, you should get a JWT token');
  console.log('✅ Token should allow access to admin endpoints');
  console.log('🔗 Use token to access: /api/users, /api/schedules, etc.');
}

async function testLogin(baseUrl, credentials) {
  const data = JSON.stringify(credentials);

  return new Promise((resolve) => {
    const url = new URL(`${baseUrl}/api/auth/login`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const protocol = url.protocol === 'https:' ? https : require('http');

    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);

          if (res.statusCode === 200 && result.token) {
            console.log(`  ✅ Login successful!`);
            console.log(`  📝 Token: ${result.token.substring(0, 50)}...`);
            console.log(`  👤 Admin: ${result.admin.username}`);
            console.log(`  🆔 Admin ID: ${result.admin.id}`);
          } else {
            console.log(`  ❌ Login failed: ${result.message || 'Unknown error'}`);
            console.log(`  Status code: ${res.statusCode}`);
          }
        } catch (error) {
          console.log(`  ❌ Invalid response: ${responseData}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Connection failed: ${error.message}`);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

testAdminLogin().catch(console.error);