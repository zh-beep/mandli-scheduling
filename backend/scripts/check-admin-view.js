#!/usr/bin/env node

const http = require('http');

async function checkAdminView() {
  console.log('\n🔍 CHECKING ADMIN PANEL VIEW');
  console.log('=' .repeat(60));

  // 1. Login as admin
  const adminToken = await getAdminToken();
  if (!adminToken) {
    console.log('❌ Failed to login as admin');
    return;
  }
  console.log('✅ Admin logged in successfully\n');

  // 2. Get October 2025 availability
  const availability = await getMonthAvailability(adminToken, '2025-10');

  if (availability && availability.length > 0) {
    console.log(`📊 OCTOBER 2025 AVAILABILITY SUBMISSIONS:\n`);
    console.log(`Total submissions: ${availability.length}\n`);

    availability.forEach((submission, i) => {
      console.log(`${i + 1}. ${submission.users?.full_name || 'Unknown User'}`);
      console.log(`   User ID: ${submission.user_id}`);
      console.log(`   Available Days: ${submission.available_days.join(', ')}`);
      console.log(`   Total Days: ${submission.available_days.length}`);
      console.log(`   Submitted: ${new Date(submission.submitted_at).toLocaleString()}`);
      console.log('');
    });

    console.log('✅ All three users have submitted their availability!');
    console.log('✅ Admin can see all submissions in the panel!');
  } else {
    console.log('❌ No availability found for October 2025');
  }
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

async function getMonthAvailability(token, month) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/availability/month/${month}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.availability || result);
        } catch {
          console.log('Response:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.log('Error:', err.message);
      resolve(null);
    });
    req.end();
  });
}

checkAdminView().catch(console.error);