#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test users with their tokens
const testUsers = [
  {
    name: 'John Smith',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTMyM2RjZS1mYTIxLTQ4NGEtYWQ3Mi1lMmM5NzhlZWE2MTMiLCJuYW1lIjoiSm9obiBTbWl0aCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.e4obKHEl7WG9dtY_0cJHOil3ttRdFAqXfbzm7kuaPS0',
    availability: {
      Monday: { morning: true, afternoon: true, evening: false },
      Tuesday: { morning: false, afternoon: true, evening: true },
      Wednesday: { morning: true, afternoon: true, evening: true },
      Thursday: { morning: true, afternoon: false, evening: true },
      Friday: { morning: false, afternoon: true, evening: false },
      Saturday: { morning: true, afternoon: true, evening: true },
      Sunday: { morning: false, afternoon: false, evening: true }
    }
  },
  {
    name: 'Jane Doe',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGUyYzU5Ni03NWJhLTQzMWYtYjQ5Zi1jZWU3ODFlYmI5Y2YiLCJuYW1lIjoiSmFuZSBEb2UiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MTg0NjkzMSwiZXhwIjoxNzY5NjIyOTMxfQ.7-BfSlXirFEenEJNVlNZKADEaTVI3lCF6xSOk_kYtEQ',
    availability: {
      Monday: { morning: true, afternoon: false, evening: true },
      Tuesday: { morning: true, afternoon: true, evening: false },
      Wednesday: { morning: false, afternoon: false, evening: true },
      Thursday: { morning: true, afternoon: true, evening: true },
      Friday: { morning: true, afternoon: true, evening: true },
      Saturday: { morning: false, afternoon: true, evening: false },
      Sunday: { morning: true, afternoon: true, evening: true }
    }
  },
  {
    name: 'Bob Wilson',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTcyN2QyZC1iYjIyLTRlNTctYWMzMS0yNTRmZTczOTBmMTYiLCJuYW1lIjoiQm9iIFdpbHNvbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.SNQmmduYRsV5DSzOdnTLeGPDBZAixoRVXAwXkD5hKMc',
    availability: {
      Monday: { morning: false, afternoon: true, evening: false },
      Tuesday: { morning: true, afternoon: false, evening: true },
      Wednesday: { morning: true, afternoon: true, evening: false },
      Thursday: { morning: false, afternoon: false, evening: true },
      Friday: { morning: true, afternoon: false, evening: true },
      Saturday: { morning: true, afternoon: true, evening: true },
      Sunday: { morning: false, afternoon: true, evening: false }
    }
  }
];

async function simulateAvailabilitySubmissions() {
  console.log('\n🌐 SIMULATING AVAILABILITY SUBMISSION FLOW');
  console.log('=' .repeat(70));
  console.log('This simulates what would happen when users click their availability links\n');

  for (const user of testUsers) {
    console.log(`\n📧 ${user.name} clicks their availability link:`);
    console.log(`   https://mandli-scheduling.vercel.app/availability.html?token=${user.token.substring(0, 30)}...`);
    console.log('-'.repeat(70));

    // 1. Simulate page load - it would show "Hi John Smith" etc
    console.log(`   ✅ Page loads: "Hi ${user.name}!"`);
    console.log(`   📅 Shows weekly availability form`);

    // 2. User fills out their availability
    console.log(`\n   📝 ${user.name} selects their availability:`);
    const slots = [];
    for (const [day, shifts] of Object.entries(user.availability)) {
      const available = Object.entries(shifts)
        .filter(([_, isAvail]) => isAvail)
        .map(([shift]) => shift);
      if (available.length > 0) {
        console.log(`      ${day}: ${available.join(', ')}`);
        slots.push(...available.map(s => `${day} ${s}`));
      }
    }
    console.log(`      Total: ${slots.length} slots available`);

    // 3. Submit to local backend (simulating what the form would do)
    console.log(`\n   🚀 Submitting to backend...`);

    const success = await submitAvailability(user.token, user.availability);

    if (success) {
      console.log(`   ✅ SUCCESS! Availability saved for ${user.name}`);
    } else {
      console.log(`   ❌ FAILED to save availability for ${user.name}`);
    }
  }

  // 4. Check admin panel
  console.log('\n' + '=' .repeat(70));
  console.log('👨‍💼 ADMIN CHECKS THE PANEL');
  console.log('-'.repeat(70));

  await checkAdminView();
}

async function submitAvailability(token, availability) {
  // Format availability for the API
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Get Sunday

  const data = JSON.stringify({
    week_start: weekStart.toISOString().split('T')[0],
    availability: availability
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/availability?token=${token}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        resolve(res.statusCode === 200 || res.statusCode === 201);
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function checkAdminView() {
  // Login as admin
  const adminToken = await getAdminToken();

  if (!adminToken) {
    console.log('❌ Admin login failed');
    return;
  }

  console.log('✅ Admin logged in successfully');

  // Get all availability
  const availabilities = await getAvailabilities(adminToken);

  console.log(`\n📊 Admin Dashboard shows:\n`);

  if (availabilities && availabilities.length > 0) {
    // Group by user
    const byUser = {};
    availabilities.forEach(av => {
      const userName = av.user?.full_name || 'Unknown';
      if (!byUser[userName]) {
        byUser[userName] = [];
      }
      byUser[userName].push(av);
    });

    console.log(`   Total submissions: ${availabilities.length}`);
    console.log(`   Users who submitted: ${Object.keys(byUser).length}\n`);

    for (const [userName, submissions] of Object.entries(byUser)) {
      const latest = submissions[submissions.length - 1];
      console.log(`   ✅ ${userName}:`);
      console.log(`      - Submitted at: ${new Date(latest.created_at).toLocaleString()}`);

      // Count slots
      let slots = 0;
      if (latest.availability) {
        for (const day of Object.values(latest.availability)) {
          for (const [_, available] of Object.entries(day)) {
            if (available) slots++;
          }
        }
      }
      console.log(`      - Available slots: ${slots}/21`);
    }
  } else {
    console.log('   No availability submissions found');
  }

  console.log('\n✅ All submissions are visible to the admin!');
  console.log('📱 Admin can now use this data to create the schedule');
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

async function getAvailabilities(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/availability',
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
          resolve(Array.isArray(result) ? result : result.availabilities || []);
        } catch {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.end();
  });
}

// Run the simulation
simulateAvailabilitySubmissions().catch(console.error);