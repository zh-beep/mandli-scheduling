#!/usr/bin/env node

const https = require('https');

async function testVercelDeployment() {
  console.log('\n🌐 TESTING VERCEL DEPLOYMENT');
  console.log('=' .repeat(60));
  console.log('Testing: https://mandli-scheduling.vercel.app');
  console.log('');

  const tests = [
    {
      name: 'Admin Login via Railway Backend',
      test: async () => {
        const credentials = {
          username: 'mandli',
          password: 'Mandli8'
        };

        console.log('📝 Credentials:');
        console.log(`   Username: ${credentials.username}`);
        console.log(`   Password: ${'*'.repeat(credentials.password.length)}`);

        const result = await makeRequest(
          'https://mandli-production.up.railway.app',
          '/api/auth/login',
          'POST',
          credentials
        );

        if (result.success && result.data.token) {
          console.log('✅ Login successful!');
          console.log(`   Token: ${result.data.token.substring(0, 50)}...`);
          console.log(`   Admin: ${result.data.admin?.username}`);
          return { success: true, token: result.data.token };
        } else {
          console.log('❌ Login failed:', result.error || 'No token received');
          return { success: false };
        }
      }
    },
    {
      name: 'Test Availability API with Admin Token',
      test: async (context) => {
        if (!context.token) {
          console.log('⚠️  Skipping: No admin token available');
          return { success: false };
        }

        const result = await makeRequest(
          'https://mandli-production.up.railway.app',
          '/api/availability/month/2025-10',
          'GET',
          null,
          { 'Authorization': `Bearer ${context.token}` }
        );

        if (result.success && result.data.availability) {
          console.log(`✅ Retrieved ${result.data.availability.length} availability entries`);
          result.data.availability.forEach((entry, i) => {
            console.log(`   ${i + 1}. ${entry.users?.full_name || entry.user_id.substring(0, 8)}: ${entry.available_days.length} days`);
          });
          return { success: true };
        } else {
          console.log('❌ Failed to retrieve availability:', result.error);
          return { success: false };
        }
      }
    },
    {
      name: 'Test User Availability Link',
      test: async () => {
        // John Smith's token
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTMyM2RjZS1mYTIxLTQ4NGEtYWQ3Mi1lMmM5NzhlZWE2MTMiLCJuYW1lIjoiSm9obiBTbWl0aCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.e4obKHEl7WG9dtY_0cJHOil3ttRdFAqXfbzm7kuaPS0';

        const result = await makeRequest(
          'https://mandli-production.up.railway.app',
          `/api/availability?month=2025-10`,
          'GET',
          null,
          { 'Authorization': `Bearer ${userToken}` }
        );

        if (result.success) {
          console.log('✅ User link verified for John Smith');
          if (result.data.availability) {
            console.log(`   Available days: ${result.data.availability.available_days.join(', ')}`);
          }
          return { success: true };
        } else {
          console.log('❌ User link verification failed:', result.error);
          return { success: false };
        }
      }
    },
    {
      name: 'Test CORS Headers',
      test: async () => {
        const result = await makeRequest(
          'https://mandli-production.up.railway.app',
          '/health',
          'GET'
        );

        if (result.headers) {
          const corsHeader = result.headers['access-control-allow-origin'];
          console.log('📋 CORS Headers:');
          console.log(`   Access-Control-Allow-Origin: ${corsHeader || 'Not set'}`);

          if (corsHeader && (corsHeader === '*' || corsHeader.includes('vercel'))) {
            console.log('✅ CORS configured correctly for Vercel');
            return { success: true };
          } else {
            console.log('⚠️  CORS may not be configured for Vercel');
            return { success: false };
          }
        }
        return { success: false };
      }
    }
  ];

  console.log('Starting tests...\n');
  let context = {};
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`📌 ${test.name}`);
    console.log('-'.repeat(50));

    try {
      const result = await test.test(context);
      if (result.success) {
        passed++;
        // Store context for dependent tests
        Object.assign(context, result);
      } else {
        failed++;
      }
    } catch (err) {
      console.log(`❌ Test crashed: ${err.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('=' .repeat(60));
  console.log('📊 TEST SUMMARY:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Vercel deployment is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
}

async function makeRequest(baseUrl, path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(`${baseUrl}${path}`);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = jsonData.length;
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: parsedData,
            headers: res.headers,
            statusCode: res.statusCode
          });
        } catch (err) {
          resolve({
            success: false,
            error: `Invalid JSON: ${responseData}`,
            headers: res.headers,
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

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

testVercelDeployment().catch(console.error);