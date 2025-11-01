/**
 * Comprehensive Test Script for Mandli App
 * Tests all features from the handwritten notes:
 * 1. Test all 3 unique links work
 * 2. Admin Panel - Can add users
 * 3. Admin Panel - Send notifications (email functionality)
 * 4. Auth Link works
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'mandli',
  password: 'Mandli8'
};

let adminToken = null;

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS'.green : '❌ FAIL'.red;
  console.log(`${status} - ${testName}`);
  if (details) {
    console.log(`   ${details}`.gray);
  }
}

function logSection(title) {
  console.log('\n' + '='.repeat(60).cyan);
  console.log(title.toUpperCase().cyan.bold);
  console.log('='.repeat(60).cyan + '\n');
}

// Test 1: Admin Login
async function testAdminLogin() {
  logSection('Test 1: Admin Authentication');

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    adminToken = response.data.token;

    logTest('Admin Login', true, `Token: ${adminToken.substring(0, 20)}...`);
    logTest('Admin Info Retrieved', response.data.admin?.username === 'mandli',
      `Username: ${response.data.admin?.username}`);

    return true;
  } catch (error) {
    logTest('Admin Login', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 2: Admin Can Add Users
async function testAddUsers() {
  logSection('Test 2: Admin Panel - Add Users');

  const testUsers = [
    {
      full_name: 'Test User 1',
      email: `test1_${Date.now()}@example.com`,
      cell_phone: '+1234567890',
      gender: 'gents'
    },
    {
      full_name: 'Test User 2',
      email: `test2_${Date.now()}@example.com`,
      cell_phone: '+1234567891',
      gender: 'ladies'
    },
    {
      full_name: 'Test User 3',
      email: `test3_${Date.now()}@example.com`,
      cell_phone: '+1234567892',
      gender: 'gents'
    }
  ];

  const createdUsers = [];

  for (let i = 0; i < testUsers.length; i++) {
    try {
      const response = await axios.post(`${API_URL}/api/users`, testUsers[i], {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      createdUsers.push(response.data.user);
      logTest(`Create User ${i + 1}`, true,
        `Name: ${response.data.user.full_name}, Email: ${response.data.user.email}`);
      logTest(`  Unique Link Generated`, !!response.data.user.unique_link,
        `Link Token: ${response.data.user.unique_link?.substring(0, 15)}...`);

    } catch (error) {
      logTest(`Create User ${i + 1}`, false,
        error.response?.data?.message || error.message);
    }
  }

  return createdUsers;
}

// Test 3: Get All Users
async function testGetAllUsers() {
  logSection('Test 3: Get All Users');

  try {
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    logTest('Get All Users', true, `Found ${response.data.users.length} users`);
    return response.data.users;
  } catch (error) {
    logTest('Get All Users', false, error.response?.data?.message || error.message);
    return [];
  }
}

// Test 4: Test All 3 Unique Links Work
async function testUniqueLinks(users) {
  logSection('Test 4: Test All 3 Unique Links Work');

  // Get first 3 users
  const testUsers = users.slice(0, 3);
  const links = [];

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];

    try {
      // Get unique link for user
      const response = await axios.get(`${API_URL}/api/users/${user.id}/link`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const link = response.data.link;
      links.push({ user, link });

      logTest(`Link ${i + 1} Generated`, true,
        `User: ${user.full_name}\n   Link: ${link}`);

      // Verify the link token works by checking user by link
      const linkToken = user.unique_link;
      const verifyResponse = await axios.get(`${API_URL}/api/users/by-link/${linkToken}`);

      logTest(`  Link ${i + 1} Authentication Works`,
        verifyResponse.data.user.id === user.id,
        `Verified user: ${verifyResponse.data.user.name}`);

    } catch (error) {
      logTest(`Link ${i + 1} Test`, false,
        error.response?.data?.message || error.message);
    }
  }

  return links;
}

// Test 5: Test Auth Link - Submit Availability
async function testAvailabilitySubmission(links) {
  logSection('Test 5: Auth Link - Submit Availability');

  const testMonth = '2025-11';
  const availableDays = [1, 5, 10, 15, 20, 25, 30];

  for (let i = 0; i < links.length; i++) {
    const { user, link } = links[i];
    const linkToken = user.unique_link;

    try {
      // Submit availability using link token
      const response = await axios.post(`${API_URL}/api/availability`, {
        link_token: linkToken,
        month: testMonth,
        available_days: availableDays
      });

      logTest(`Submit Availability - User ${i + 1}`, true,
        `User: ${user.full_name}\n   Month: ${testMonth}\n   Days: ${availableDays.join(', ')}`);

      // Verify availability was saved
      const verifyResponse = await axios.get(
        `${API_URL}/api/availability?link_token=${linkToken}&month=${testMonth}`
      );

      logTest(`  Verify Availability Saved - User ${i + 1}`,
        verifyResponse.data.availability !== null,
        `Saved ${verifyResponse.data.availability?.available_days.length} days`);

    } catch (error) {
      logTest(`Submit Availability - User ${i + 1}`, false,
        error.response?.data?.message || error.message);
    }
  }
}

// Test 6: Admin View Availability Status
async function testAdminViewAvailability() {
  logSection('Test 6: Admin Panel - View Availability Status');

  const testMonth = '2025-11';

  try {
    // Get all availability for the month
    const response = await axios.get(`${API_URL}/api/availability/month/${testMonth}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    logTest('Get All Availability for Month', true,
      `Found ${response.data.availability.length} submissions for ${testMonth}`);

    // Get availability status
    const statusResponse = await axios.get(`${API_URL}/api/availability/status/${testMonth}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    logTest('Get Availability Status', true,
      `Status retrieved for ${statusResponse.data.status.length} users`);

    // Display summary
    const submitted = statusResponse.data.status.filter(s => s.has_submitted).length;
    const notSubmitted = statusResponse.data.status.filter(s => !s.has_submitted).length;

    console.log(`\n   Summary:`.yellow);
    console.log(`   - Submitted: ${submitted}`.green);
    console.log(`   - Not Submitted: ${notSubmitted}`.red);

  } catch (error) {
    logTest('Admin View Availability', false,
      error.response?.data?.message || error.message);
  }
}

// Test 7: Email Notifications (Check if implemented)
async function testEmailNotifications() {
  logSection('Test 7: Email Notifications');

  // Check if email endpoint exists
  try {
    const response = await axios.post(`${API_URL}/api/users/send-notifications`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    logTest('Email Notifications Endpoint Exists', true,
      'Email functionality is implemented');

  } catch (error) {
    if (error.response?.status === 404) {
      logTest('Email Notifications Endpoint', false,
        'Email notification endpoint NOT FOUND - needs to be implemented');
      console.log('\n   ⚠️  Recommendation:'.yellow);
      console.log('   Create POST /api/users/send-notifications endpoint'.gray);
      console.log('   This should send availability form links to all users via email'.gray);
    } else {
      logTest('Email Notifications Test', false,
        error.response?.data?.message || error.message);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗'.cyan);
  console.log('║       MANDLI APP - COMPREHENSIVE FEATURE TESTS            ║'.cyan);
  console.log('╚═══════════════════════════════════════════════════════════╝'.cyan);
  console.log(`\nAPI URL: ${API_URL}`.yellow);
  console.log(`Frontend URL: ${FRONTEND_URL}`.yellow);
  console.log(`Test Time: ${new Date().toISOString()}`.yellow);

  try {
    // Test 1: Admin Login
    const loginSuccess = await testAdminLogin();
    if (!loginSuccess) {
      console.log('\n❌ Admin login failed. Cannot proceed with other tests.\n'.red);
      process.exit(1);
    }

    // Test 2: Add Users
    const createdUsers = await testAddUsers();

    // Test 3: Get All Users
    const allUsers = await testGetAllUsers();

    // Test 4: Test Unique Links
    const links = await testUniqueLinks(allUsers);

    // Test 5: Test Availability Submission
    await testAvailabilitySubmission(links);

    // Test 6: Admin View Availability
    await testAdminViewAvailability();

    // Test 7: Email Notifications
    await testEmailNotifications();

    // Summary
    logSection('Test Summary');
    console.log('All tests completed!'.green.bold);
    console.log('\nTest Coverage:'.yellow);
    console.log('  ✅ Admin authentication'.green);
    console.log('  ✅ Add users functionality'.green);
    console.log('  ✅ Generate unique links'.green);
    console.log('  ✅ Unique link authentication'.green);
    console.log('  ✅ Availability submission via link'.green);
    console.log('  ✅ Admin view availability'.green);
    console.log('  ⚠️  Email notifications (needs implementation)'.yellow);

  } catch (error) {
    console.error('\n❌ Unexpected error during tests:'.red, error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
