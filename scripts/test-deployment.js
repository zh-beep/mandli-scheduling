#!/usr/bin/env node

const https = require('https');

async function testLogin(origin, description) {
  console.log(`\n${description}:`);
  console.log('=' .repeat(50));

  try {
    // Test CORS preflight
    const corsResponse = await new Promise((resolve) => {
      const options = {
        hostname: 'mandli-production.up.railway.app',
        port: 443,
        path: '/api/auth/login',
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      };

      const req = https.request(options, (res) => {
        let headers = res.headers;
        resolve({
          statusCode: res.statusCode,
          allowOrigin: headers['access-control-allow-origin'],
          allowCredentials: headers['access-control-allow-credentials']
        });
      });

      req.on('error', (err) => resolve({ error: err.message }));
      req.end();
    });

    if (corsResponse.error) {
      console.log(`❌ Connection failed: ${corsResponse.error}`);
      return;
    }

    console.log(`CORS Status: ${corsResponse.statusCode}`);
    console.log(`Allow Origin: ${corsResponse.allowOrigin || 'NOT SET'}`);
    console.log(`Allow Credentials: ${corsResponse.allowCredentials || 'NOT SET'}`);

    if (corsResponse.allowOrigin === origin || corsResponse.allowOrigin === '*') {
      console.log('✅ CORS configuration allows this origin');
    } else {
      console.log(`❌ CORS blocked - expected ${origin}, got ${corsResponse.allowOrigin}`);
    }

    // Test actual login
    const loginData = JSON.stringify({
      username: 'mandli',
      password: 'Mandli8'
    });

    const loginResponse = await new Promise((resolve) => {
      const options = {
        hostname: 'mandli-production.up.railway.app',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin,
          'Content-Length': loginData.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : {},
            corsHeader: res.headers['access-control-allow-origin']
          });
        });
      });

      req.on('error', (err) => resolve({ error: err.message }));
      req.write(loginData);
      req.end();
    });

    if (loginResponse.error) {
      console.log(`\n❌ Login request failed: ${loginResponse.error}`);
    } else if (loginResponse.statusCode === 200 && loginResponse.body.token) {
      console.log(`\n✅ Login successful! Token received`);
    } else {
      console.log(`\n❌ Login failed: ${loginResponse.body.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

async function main() {
  console.log('\n🧪 TESTING MANDLI DEPLOYMENT CORS CONFIGURATION');
  console.log('=' .repeat(50));

  await testLogin('http://localhost:8080', 'Testing from localhost:8080');
  await testLogin('https://mandli-scheduling.vercel.app', 'Testing from Vercel deployment');
  await testLogin('http://localhost:3000', 'Testing from localhost:3000');

  console.log('\n' + '=' .repeat(50));
  console.log('📋 DEPLOYMENT STATUS SUMMARY:');
  console.log('- Railway API: https://mandli-production.up.railway.app');
  console.log('- Vercel Frontend: https://mandli-scheduling.vercel.app');
  console.log('\nIf Vercel is blocked, Railway needs to redeploy with the updated CORS config.');
  console.log('Check Railway dashboard: https://railway.app/dashboard');
}

main().catch(console.error);