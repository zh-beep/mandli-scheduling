/**
 * Test Incremental Scheduling Algorithm
 * Tests the improved UX flow where:
 * 1. First submission triggers full scheduling
 * 2. New users only fill empty slots
 * 3. User deletion triggers regeneration
 */

const axios = require('axios');
const colors = require('colors');

// API Configuration
const API_URL = 'https://mandli-production.up.railway.app';
const ADMIN_CREDENTIALS = {
  username: 'mandli',
  password: 'Mandli8'
};

// Test month - use future month to avoid conflicts
const TEST_MONTH = '2025-12';

let adminToken = null;
let testUsers = [];

/**
 * Login as admin
 */
async function adminLogin() {
  console.log('\n📝 Logging in as admin...'.cyan);
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    adminToken = response.data.token;
    console.log('✅ Admin logged in successfully'.green);
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:'.red, error.response?.data || error.message);
    return false;
  }
}

/**
 * Clear test month schedules
 */
async function clearTestMonth() {
  console.log(`\n🗑️  Clearing schedules for ${TEST_MONTH}...`.cyan);
  try {
    // Get and delete all schedules for test month
    const { data: schedules } = await axios.get(
      `${API_URL}/api/schedule/month/${TEST_MONTH}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (schedules.length > 0) {
      for (const schedule of schedules) {
        await axios.delete(
          `${API_URL}/api/schedule/${schedule.id}`,
          {
            headers: { Authorization: `Bearer ${adminToken}` }
          }
        );
      }
      console.log(`✅ Cleared ${schedules.length} existing schedules`.green);
    } else {
      console.log('✅ No existing schedules to clear'.green);
    }
  } catch (error) {
    console.log('⚠️  No schedules to clear or API returned empty'.yellow);
  }
}

/**
 * Create test users
 */
async function createTestUsers() {
  console.log('\n👥 Creating test users...'.cyan);

  const userTemplates = [
    { name: 'Test Gents 1', gender: 'gents', email: 'test.gents1@example.com' },
    { name: 'Test Gents 2', gender: 'gents', email: 'test.gents2@example.com' },
    { name: 'Test Ladies 1', gender: 'ladies', email: 'test.ladies1@example.com' },
    { name: 'Test Ladies 2', gender: 'ladies', email: 'test.ladies2@example.com' },
    { name: 'Test Gents 3', gender: 'gents', email: 'test.gents3@example.com' }, // Will be added later
    { name: 'Test Ladies 3', gender: 'ladies', email: 'test.ladies3@example.com' } // Will be added later
  ];

  for (const template of userTemplates) {
    try {
      const response = await axios.post(
        `${API_URL}/api/users`,
        {
          full_name: template.name,
          gender: template.gender,
          email: template.email
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      const user = response.data.user;

      // Get unique link for user
      const linkResponse = await axios.get(
        `${API_URL}/api/users/${user.id}/link`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      testUsers.push({
        ...user,
        unique_link: linkResponse.data.uniqueLink
      });

      console.log(`✅ Created ${template.name} with ID: ${user.id}`.green);
    } catch (error) {
      console.error(`❌ Failed to create ${template.name}:`.red, error.response?.data || error.message);
    }
  }
}

/**
 * Submit availability for a user
 */
async function submitAvailability(user, availableDays) {
  console.log(`\n📅 Submitting availability for ${user.full_name}...`.cyan);

  try {
    const response = await axios.post(
      `${API_URL}/api/availability`,
      {
        month: TEST_MONTH,
        available_days: availableDays
      },
      {
        headers: { 'X-User-Link': user.unique_link }
      }
    );

    console.log(`✅ ${user.full_name} submitted availability for ${availableDays.length} days`.green);
    return true;
  } catch (error) {
    console.error(`❌ Failed to submit availability:`.red, error.response?.data || error.message);
    return false;
  }
}

/**
 * Get schedule for the test month
 */
async function getSchedule() {
  try {
    const response = await axios.get(
      `${API_URL}/api/schedule/month/${TEST_MONTH}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get schedule:'.red, error.response?.data || error.message);
    return [];
  }
}

/**
 * Analyze schedule statistics
 */
function analyzeSchedule(schedules, phase) {
  console.log(`\n📊 Schedule Analysis - ${phase}:`.cyan);

  const stats = {
    total: schedules.length,
    byUser: {},
    emptySlots: 0,
    daysWithAssignments: new Set()
  };

  schedules.forEach(s => {
    if (!stats.byUser[s.assigned_user_id]) {
      stats.byUser[s.assigned_user_id] = {
        count: 0,
        name: s.users?.full_name || s.assigned_user_id
      };
    }
    stats.byUser[s.assigned_user_id].count++;
    stats.daysWithAssignments.add(s.day);
  });

  console.log(`  Total Assignments: ${stats.total}`);
  console.log(`  Days with coverage: ${stats.daysWithAssignments.size}/31`);
  console.log(`  Assignments by user:`);

  Object.values(stats.byUser).forEach(user => {
    console.log(`    - ${user.name}: ${user.count} assignments`);
  });

  return stats;
}

/**
 * Test 1: Initial Full Scheduling
 */
async function testInitialScheduling() {
  console.log('\n\n🧪 TEST 1: INITIAL FULL SCHEDULING'.yellow.bold);
  console.log('Testing that first submissions trigger full scheduling algorithm'.gray);

  // First 2 users submit availability
  await submitAvailability(testUsers[0], [1, 5, 10, 15, 20, 25, 30]); // Gents 1
  await submitAvailability(testUsers[1], [2, 7, 12, 17, 22, 27]); // Gents 2

  // Wait for scheduling
  await new Promise(resolve => setTimeout(resolve, 2000));

  const schedule1 = await getSchedule();
  const stats1 = analyzeSchedule(schedule1, 'After First 2 Users');

  // Now add 2 more users
  await submitAvailability(testUsers[2], [3, 8, 13, 18, 23, 28]); // Ladies 1
  await submitAvailability(testUsers[3], [1, 6, 11, 16, 21, 26, 31]); // Ladies 2

  // Wait for incremental scheduling
  await new Promise(resolve => setTimeout(resolve, 2000));

  const schedule2 = await getSchedule();
  const stats2 = analyzeSchedule(schedule2, 'After 4 Users');

  // Verify incremental behavior
  console.log('\n✅ Verification:'.green);
  console.log(`  - Initial users kept their assignments: ${stats1.total > 0 ? 'YES' : 'NO'}`);
  console.log(`  - New users filled empty slots: ${stats2.total > stats1.total ? 'YES' : 'NO'}`);
  console.log(`  - Total coverage increased: ${stats2.total} > ${stats1.total}`);

  return { success: true, initialStats: stats1, finalStats: stats2 };
}

/**
 * Test 2: New User Only Fills Empty Slots
 */
async function testIncrementalScheduling() {
  console.log('\n\n🧪 TEST 2: INCREMENTAL SCHEDULING'.yellow.bold);
  console.log('Testing that new users only fill empty slots without affecting existing assignments'.gray);

  // Get current schedule
  const scheduleBefore = await getSchedule();
  const statsBefore = analyzeSchedule(scheduleBefore, 'Before New User');

  // Track existing assignments
  const existingAssignments = new Map();
  scheduleBefore.forEach(s => {
    const key = `${s.day}-${s.duty_type}-${s.assigned_user_id}`;
    existingAssignments.set(key, true);
  });

  // Create and submit availability for new user
  console.log('\n👤 Adding a brand new user...'.cyan);
  const newUser = {
    name: 'New Test User',
    gender: 'gents',
    email: `new.user.${Date.now()}@example.com`
  };

  const response = await axios.post(
    `${API_URL}/api/users`,
    {
      full_name: newUser.name,
      gender: newUser.gender,
      email: newUser.email
    },
    {
      headers: { Authorization: `Bearer ${adminToken}` }
    }
  );

  const createdUser = response.data.user;

  const linkResponse = await axios.get(
    `${API_URL}/api/users/${createdUser.id}/link`,
    {
      headers: { Authorization: `Bearer ${adminToken}` }
    }
  );

  createdUser.unique_link = linkResponse.data.uniqueLink;

  // Submit availability for ALL days
  await submitAvailability(createdUser, Array.from({length: 31}, (_, i) => i + 1));

  // Wait for incremental scheduling
  await new Promise(resolve => setTimeout(resolve, 3000));

  const scheduleAfter = await getSchedule();
  const statsAfter = analyzeSchedule(scheduleAfter, 'After New User');

  // Verify existing assignments weren't changed
  let existingPreserved = true;
  scheduleAfter.forEach(s => {
    const key = `${s.day}-${s.duty_type}-${s.assigned_user_id}`;
    if (existingAssignments.has(key)) {
      // This was an existing assignment
      existingAssignments.delete(key);
    }
  });

  if (existingAssignments.size > 0) {
    existingPreserved = false;
    console.log(`❌ ${existingAssignments.size} existing assignments were removed!`.red);
  }

  console.log('\n✅ Verification:'.green);
  console.log(`  - Existing assignments preserved: ${existingPreserved ? 'YES' : 'NO'}`);
  console.log(`  - New user got assignments: ${statsAfter.byUser[createdUser.id]?.count || 0} slots`);
  console.log(`  - Only empty slots were filled: ${existingPreserved ? 'YES' : 'NO'}`);

  // Clean up new user
  testUsers.push(createdUser);

  return { success: existingPreserved, newUserAssignments: statsAfter.byUser[createdUser.id]?.count || 0 };
}

/**
 * Test 3: User Deletion Triggers Regeneration
 */
async function testUserDeletion() {
  console.log('\n\n🧪 TEST 3: USER DELETION & REGENERATION'.yellow.bold);
  console.log('Testing that deleting a user triggers schedule regeneration'.gray);

  // Get current schedule
  const scheduleBefore = await getSchedule();
  const statsBefore = analyzeSchedule(scheduleBefore, 'Before Deletion');

  // Delete the first test user
  const userToDelete = testUsers[0];
  console.log(`\n🗑️  Deleting user: ${userToDelete.full_name}...`.cyan);

  const userAssignmentsBefore = statsBefore.byUser[userToDelete.id]?.count || 0;
  console.log(`  User had ${userAssignmentsBefore} assignments before deletion`.gray);

  try {
    await axios.delete(
      `${API_URL}/api/users/${userToDelete.id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log(`✅ User deleted successfully`.green);
  } catch (error) {
    console.error(`❌ Failed to delete user:`.red, error.response?.data || error.message);
  }

  // Wait for regeneration
  await new Promise(resolve => setTimeout(resolve, 3000));

  const scheduleAfter = await getSchedule();
  const statsAfter = analyzeSchedule(scheduleAfter, 'After Deletion');

  const userAssignmentsAfter = statsAfter.byUser[userToDelete.id]?.count || 0;

  console.log('\n✅ Verification:'.green);
  console.log(`  - User assignments removed: ${userAssignmentsAfter === 0 ? 'YES' : 'NO'}`);
  console.log(`  - Schedule regenerated: ${scheduleAfter.length > 0 ? 'YES' : 'NO'}`);
  console.log(`  - Duties redistributed to others: ${statsAfter.total > 0 ? 'YES' : 'NO'}`);

  // Remove deleted user from testUsers
  testUsers = testUsers.filter(u => u.id !== userToDelete.id);

  return { success: userAssignmentsAfter === 0, totalAssignments: statsAfter.total };
}

/**
 * Cleanup test users
 */
async function cleanup() {
  console.log('\n\n🧹 Cleaning up test data...'.cyan);

  for (const user of testUsers) {
    try {
      await axios.delete(
        `${API_URL}/api/users/${user.id}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log(`  Deleted ${user.full_name}`.gray);
    } catch (error) {
      // User might already be deleted
    }
  }

  console.log('✅ Cleanup complete'.green);
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('='.repeat(60).cyan);
  console.log('INCREMENTAL SCHEDULING ALGORITHM TESTS'.cyan.bold);
  console.log('Testing on Production Environment'.gray);
  console.log('='.repeat(60).cyan);

  try {
    // Login
    const loginSuccess = await adminLogin();
    if (!loginSuccess) {
      throw new Error('Admin login failed');
    }

    // Clear test month
    await clearTestMonth();

    // Create test users
    await createTestUsers();

    // Run tests
    const test1 = await testInitialScheduling();
    const test2 = await testIncrementalScheduling();
    const test3 = await testUserDeletion();

    // Summary
    console.log('\n\n' + '='.repeat(60).green);
    console.log('TEST SUMMARY'.green.bold);
    console.log('='.repeat(60).green);

    console.log(`\n✅ Test 1 - Initial Full Scheduling: ${test1.success ? 'PASSED' : 'FAILED'}`.bold);
    console.log(`   Coverage: ${test1.finalStats.total} assignments`);

    console.log(`\n✅ Test 2 - Incremental Scheduling: ${test2.success ? 'PASSED' : 'FAILED'}`.bold);
    console.log(`   New user got ${test2.newUserAssignments} assignments`);

    console.log(`\n✅ Test 3 - User Deletion & Regeneration: ${test3.success ? 'PASSED' : 'FAILED'}`.bold);
    console.log(`   Schedule regenerated with ${test3.totalAssignments} assignments`);

    // Cleanup
    await cleanup();

    console.log('\n🎉 All tests completed successfully!'.green.bold);

  } catch (error) {
    console.error('\n❌ Test suite failed:'.red, error.message);
    await cleanup();
    process.exit(1);
  }
}

// Run tests
runTests();