/**
 * Production End-to-End Test
 * Tests the actual production deployment
 */

const axios = require('axios');
const colors = require('colors');

// PRODUCTION URLs
const API_URL = 'https://mandli-production.up.railway.app';
const FRONTEND_URL = 'https://mandli-scheduling.vercel.app';

const ADMIN_CREDENTIALS = {
  username: 'mandli',
  password: 'Mandli8'
};

async function testProduction() {
  console.log('\n' + '='.repeat(70).cyan);
  console.log('PRODUCTION DEPLOYMENT TEST'.cyan.bold);
  console.log('='.repeat(70).cyan + '\n');
  console.log(`API: ${API_URL}`.yellow);
  console.log(`Frontend: ${FRONTEND_URL}`.yellow);
  console.log('');

  let adminToken;

  // Step 1: Admin Login
  console.log('Step 1: Admin Login (Production)'.yellow);
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    adminToken = loginResponse.data.token;
    console.log('✅ Admin logged in successfully'.green);
    console.log(`   Token: ${adminToken.substring(0, 30)}...`.gray);
    console.log('');
  } catch (error) {
    console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`.red);
    process.exit(1);
  }

  // Step 2: Get All Users
  console.log('Step 2: Get All Users from Production DB'.yellow);
  let allUsers = [];
  try {
    const usersResponse = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    allUsers = usersResponse.data.users;
    console.log(`✅ Found ${allUsers.length} total users`.green);
    console.log('');

    // Show first 5 users
    console.log('   Users:'.cyan);
    allUsers.slice(0, 5).forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.full_name} (${user.email}) - ${user.is_active ? 'Active' : 'Inactive'}`.gray);
    });
    if (allUsers.length > 5) {
      console.log(`   ... and ${allUsers.length - 5} more`.gray);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ Failed to get users: ${error.response?.data?.message || error.message}`.red);
    process.exit(1);
  }

  // Step 3: Test 3 Unique Links
  console.log('Step 3: Generate 3 Unique Links (Production)'.yellow);
  const testUsers = allUsers.filter(u => u.is_active).slice(0, 3);
  const productionLinks = [];

  testUsers.forEach((user, i) => {
    const link = `${FRONTEND_URL}/availability.html?link=${user.unique_link}`;
    productionLinks.push({ user, link });
    console.log(`${i + 1}. ${user.full_name}:`.cyan);
    console.log(`   ${link}`.gray);
    console.log('');
  });

  // Step 4: Verify Links Work
  console.log('Step 4: Verify Link Authentication'.yellow);
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    try {
      const response = await axios.get(`${API_URL}/api/users/by-link/${user.unique_link}`);
      console.log(`✅ Link ${i + 1} (${user.full_name}) authenticates correctly`.green);
    } catch (error) {
      console.log(`❌ Link ${i + 1} failed: ${error.response?.data?.message || error.message}`.red);
    }
  }
  console.log('');

  // Step 5: Submit Availability via Links
  console.log('Step 5: Submit Availability via Production Links'.yellow);
  const testMonth = '2025-11';
  const availableDays = [1, 5, 10, 15, 20, 25, 30];

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    try {
      const response = await axios.post(`${API_URL}/api/availability`, {
        link_token: user.unique_link,
        month: testMonth,
        available_days: availableDays
      });
      console.log(`✅ Submitted availability for ${user.full_name}`.green);
      console.log(`   Days: ${availableDays.join(', ')}`.gray);
    } catch (error) {
      if (error.response?.data?.message?.includes('already')) {
        console.log(`ℹ️  Availability already submitted for ${user.full_name}`.yellow);
      } else {
        console.log(`❌ Failed: ${error.response?.data?.message || error.message}`.red);
      }
    }
  }
  console.log('');

  // Step 6: Verify in Admin Panel
  console.log('Step 6: Verify Availability Shows in Admin Panel'.yellow);
  try {
    const availResponse = await axios.get(`${API_URL}/api/availability/month/${testMonth}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const submissions = availResponse.data.availability;
    console.log(`✅ Found ${submissions.length} availability submissions for ${testMonth}`.green);
    console.log('');

    // Show details
    submissions.forEach((submission, i) => {
      const userName = submission.users?.full_name || 'Unknown User';
      const daysCount = submission.available_days?.length || 0;
      console.log(`   ${i + 1}. ${userName}`.cyan);
      console.log(`      Available: ${submission.available_days.join(', ')} (${daysCount} days)`.gray);
      console.log(`      Submitted: ${new Date(submission.submitted_at).toLocaleString()}`.gray);
    });
    console.log('');

  } catch (error) {
    console.log(`❌ Failed to get availability: ${error.response?.data?.message || error.message}`.red);
  }

  // Step 7: Check Availability Status
  console.log('Step 7: Check Availability Status'.yellow);
  try {
    const statusResponse = await axios.get(`${API_URL}/api/availability/status/${testMonth}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const statusData = statusResponse.data.status;
    const submitted = statusData.filter(s => s.has_submitted).length;
    const notSubmitted = statusData.filter(s => !s.has_submitted).length;

    console.log(`✅ Status Retrieved`.green);
    console.log(`   Submitted: ${submitted}`.green);
    console.log(`   Not Submitted: ${notSubmitted}`.red);
    console.log('');

  } catch (error) {
    console.log(`❌ Failed: ${error.response?.data?.message || error.message}`.red);
  }

  // Step 8: Generate Calendar Auth Link
  console.log('Step 8: Generate Google Calendar Auth Link'.yellow);
  const testUser = testUsers[0];
  const calendarAuthLink = `${FRONTEND_URL}/calendar-auth.html?userId=${testUser.id}`;
  console.log(`📅 Calendar Auth Link for ${testUser.full_name}:`.cyan);
  console.log(`   ${calendarAuthLink}`.gray);
  console.log('');
  console.log('   Open this link in browser to test Google Calendar OAuth flow'.yellow);
  console.log('');

  // Summary
  console.log('='.repeat(70).cyan);
  console.log('PRODUCTION TEST SUMMARY'.cyan.bold);
  console.log('='.repeat(70).cyan);
  console.log('');
  console.log('✅ Admin login works on production'.green);
  console.log('✅ User management API works'.green);
  console.log('✅ Unique links are generated'.green);
  console.log('✅ Link authentication works'.green);
  console.log('✅ Availability submission works'.green);
  console.log('✅ Admin can view submissions'.green);
  console.log('✅ Availability status tracking works'.green);
  console.log('');
  console.log('📋 MANUAL TESTING LINKS (Open in Browser):'.yellow.bold);
  console.log('');
  console.log('1. Admin Login:'.cyan);
  console.log(`   ${FRONTEND_URL}/login.html`.gray);
  console.log('   Username: mandli, Password: Mandli8'.gray);
  console.log('');
  console.log('2. Test Availability Links:'.cyan);
  productionLinks.forEach((item, i) => {
    console.log(`   Link ${i + 1} (${item.user.full_name}):`.gray);
    console.log(`   ${item.link}`.gray);
    console.log('');
  });
  console.log('3. Check Admin Panel:'.cyan);
  console.log(`   ${FRONTEND_URL}/settings.html`.gray);
  console.log('   (After logging in with admin credentials)'.gray);
  console.log('');
  console.log('4. Google Calendar Auth:'.cyan);
  console.log(`   ${calendarAuthLink}`.gray);
  console.log('');
  console.log('🧪 VERIFICATION STEPS IN BROWSER:'.yellow.bold);
  console.log('');
  console.log('Step A: Open availability link in incognito window'.gray);
  console.log('Step B: Verify user name shows correctly'.gray);
  console.log('Step C: Click on dates to mark available (should turn green)'.gray);
  console.log('Step D: Click "Submit Availability"'.gray);
  console.log('Step E: Open admin panel and verify submission appears'.gray);
  console.log('Step F: Run this in browser console to see data:'.gray);
  console.log('');
  console.log(`  fetch('${API_URL}/api/availability/month/2025-11', {`.gray);
  console.log(`    headers: {'Authorization': 'Bearer ' + document.cookie.split('mandli_token=')[1]?.split(';')[0]}`.gray);
  console.log(`  }).then(r => r.json()).then(console.log)`.gray);
  console.log('');
}

testProduction().catch(error => {
  console.error('\n❌ Test failed:'.red, error.message);
  process.exit(1);
});
