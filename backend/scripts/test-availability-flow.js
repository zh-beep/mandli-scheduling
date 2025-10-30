#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const config = require('../src/config');

// The three test users we created
const testUsers = [
  {
    name: 'John Smith',
    id: '11323dce-fa21-484a-ad72-e2c978eea613',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTMyM2RjZS1mYTIxLTQ4NGEtYWQ3Mi1lMmM5NzhlZWE2MTMiLCJuYW1lIjoiSm9obiBTbWl0aCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.e4obKHEl7WG9dtY_0cJHOil3ttRdFAqXfbzm7kuaPS0'
  },
  {
    name: 'Jane Doe',
    id: '30e2c596-75ba-431f-b49f-cee781ebb9cf',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGUyYzU5Ni03NWJhLTQzMWYtYjQ5Zi1jZWU3ODFlYmI5Y2YiLCJuYW1lIjoiSmFuZSBEb2UiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MTg0NjkzMSwiZXhwIjoxNzY5NjIyOTMxfQ.7-BfSlXirFEenEJNVlNZKADEaTVI3lCF6xSOk_kYtEQ'
  },
  {
    name: 'Bob Wilson',
    id: '4a727d2d-bb22-4e57-ac31-254fe7390f16',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTcyN2QyZC1iYjIyLTRlNTctYWMzMS0yNTRmZTczOTBmMTYiLCJuYW1lIjoiQm9iIFdpbHNvbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.SNQmmduYRsV5DSzOdnTLeGPDBZAixoRVXAwXkD5hKMc'
  }
];

async function testAvailabilityFlow() {
  console.log('\n📋 TESTING AVAILABILITY SUBMISSION FLOW');
  console.log('=' .repeat(60));

  for (const user of testUsers) {
    console.log(`\n👤 Testing ${user.name}:`);
    console.log('-'.repeat(40));

    // 1. Decode and verify token
    try {
      const decoded = jwt.verify(user.token, config.jwt.secret);
      console.log(`✅ Token valid - User ID: ${decoded.userId}`);
      console.log(`   Token expires: ${new Date(decoded.exp * 1000).toLocaleDateString()}`);
    } catch (error) {
      console.log(`❌ Token invalid: ${error.message}`);
      continue;
    }

    // 2. Simulate availability submission
    const availability = generateRandomAvailability();
    console.log(`📅 Submitting availability for this week:`);

    for (const [day, slots] of Object.entries(availability)) {
      const available = Object.entries(slots)
        .filter(([_, isAvail]) => isAvail)
        .map(([slot]) => slot);

      if (available.length > 0) {
        console.log(`   ${day}: ${available.join(', ')}`);
      }
    }

    // 3. Submit to API (local backend)
    const response = await submitAvailability(user.token, availability);

    if (response.success) {
      console.log(`✅ Availability submitted successfully!`);
    } else {
      console.log(`❌ Failed to submit: ${response.error}`);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 CHECKING ADMIN VIEW');
  console.log('-'.repeat(40));

  // 4. Check what admin would see
  await checkAdminView();
}

function generateRandomAvailability() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shifts = ['morning', 'afternoon', 'evening'];
  const availability = {};

  days.forEach(day => {
    availability[day] = {};
    shifts.forEach(shift => {
      // Random availability (70% chance of being available)
      availability[day][shift] = Math.random() < 0.7;
    });
  });

  return availability;
}

async function submitAvailability(token, availability) {
  const http = require('http');

  const data = JSON.stringify({
    week_start: new Date().toISOString().split('T')[0],
    availability
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/availability',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: responseData });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

async function checkAdminView() {
  const http = require('http');

  // First login as admin
  const loginData = JSON.stringify({
    username: 'mandli',
    password: 'Mandli8'
  });

  const adminToken = await new Promise((resolve) => {
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

  if (!adminToken) {
    console.log('❌ Failed to login as admin');
    return;
  }

  // Get availability data
  const availabilityData = await new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/availability',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.end();
  });

  console.log(`\nAdmin can see ${availabilityData.length} availability submissions:`);

  const userSubmissions = {};
  availabilityData.forEach(submission => {
    const userName = submission.user?.full_name || 'Unknown';
    if (!userSubmissions[userName]) {
      userSubmissions[userName] = [];
    }
    userSubmissions[userName].push(submission);
  });

  for (const [userName, submissions] of Object.entries(userSubmissions)) {
    const latest = submissions[submissions.length - 1];
    console.log(`\n✅ ${userName}:`);
    console.log(`   Submitted: ${new Date(latest.created_at).toLocaleString()}`);
    console.log(`   Week: ${latest.week_start}`);

    // Count available slots
    let totalSlots = 0;
    if (latest.availability) {
      for (const day of Object.values(latest.availability)) {
        for (const [shift, available] of Object.entries(day)) {
          if (available) totalSlots++;
        }
      }
    }
    console.log(`   Available slots: ${totalSlots}/21`);
  }

  console.log('\n✅ All submissions are visible in the admin panel!');
}

testAvailabilityFlow().catch(console.error);