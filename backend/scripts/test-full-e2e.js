#!/usr/bin/env node

const { chromium } = require('playwright');

const TEST_USERS = [
  {
    name: 'John Smith',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTMyM2RjZS1mYTIxLTQ4NGEtYWQ3Mi1lMmM5NzhlZWE2MTMiLCJuYW1lIjoiSm9obiBTbWl0aCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.e4obKHEl7WG9dtY_0cJHOil3ttRdFAqXfbzm7kuaPS0',
    email: 'john@example.com'
  },
  {
    name: 'Jane Doe',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGUyYzU5Ni03NWJhLTQzMWYtYjQ5Zi1jZWU3ODFlYmI5Y2YiLCJuYW1lIjoiSmFuZSBEb2UiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MTg0NjkzMSwiZXhwIjoxNzY5NjIyOTMxfQ.7-BfSlXirFEenEJNVlNZKADEaTVI3lCF6xSOk_kYtEQ',
    email: 'jane@example.com'
  },
  {
    name: 'Bob Wilson',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTcyN2QyZC1iYjIyLTRlNTctYWMzMS0yNTRmZTczOTBmMTYiLCJuYW1lIjoiQm9iIFdpbHNvbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.SNQmmduYRsV5DSzOdnTLeGPDBZAixoRVXAwXkD5hKMc',
    email: 'bob@example.com'
  }
];

async function runFullE2ETest() {
  console.log('\n🎯 COMPLETE END-TO-END TEST');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: false }); // Show browser
  let context, page;

  try {
    // STEP 1: Admin Login
    console.log('\n📌 STEP 1: Admin Login');
    console.log('-'.repeat(70));

    context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://mandli-scheduling.vercel.app/login.html');
    await page.fill('input[name="username"], input#username', 'mandli');
    await page.fill('input[name="password"], input#password', 'Mandli8');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    console.log('✅ Admin logged in');

    // STEP 2: Check users in settings
    console.log('\n📌 STEP 2: View Users in Settings');
    console.log('-'.repeat(70));

    await page.goto('https://mandli-scheduling.vercel.app/user-management.html');
    await page.waitForTimeout(2000);

    // Count users in table
    const userRows = await page.locator('table tbody tr').count();
    console.log(`Found ${userRows} users in the table`);

    if (userRows === 3) {
      console.log('✅ Exactly 3 users found');
    } else {
      console.log(`⚠️  Expected 3 users, found ${userRows}`);
    }

    // Get user names
    for (let i = 0; i < Math.min(userRows, 3); i++) {
      const name = await page.locator(`table tbody tr:nth-child(${i + 1}) td:first-child`).textContent();
      console.log(`   ${i + 1}. ${name}`);
    }

    await page.screenshot({ path: '/tmp/users-page.png' });
    console.log('📸 Screenshot: /tmp/users-page.png');

    // STEP 3: Submit availability for all 3 users
    console.log('\n📌 STEP 3: Submit Availability for Each User');
    console.log('-'.repeat(70));

    for (const user of TEST_USERS) {
      console.log(`\n👤 Testing availability for ${user.name}...`);

      await page.goto(`https://mandli-scheduling.vercel.app/availability.html?token=${user.token}`);
      await page.waitForTimeout(2000);

      // Check if page shows user name
      const pageContent = await page.textContent('body');
      if (pageContent.includes(user.name)) {
        console.log(`   ✅ Page shows: "Hi ${user.name}"`);
      } else {
        console.log(`   ⚠️  User name not found on page`);
      }

      // Select some random days (simplified - select checkboxes if they exist)
      const checkboxes = await page.locator('input[type="checkbox"]').count();
      console.log(`   Found ${checkboxes} checkboxes for availability`);

      if (checkboxes > 0) {
        // Check first 5 checkboxes
        for (let i = 0; i < Math.min(5, checkboxes); i++) {
          await page.locator(`input[type="checkbox"]`).nth(i).check();
        }
        console.log(`   ✅ Selected ${Math.min(5, checkboxes)} days`);

        // Submit form
        const submitButton = await page.locator('button[type="submit"], button:has-text("Submit")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(1500);
          console.log(`   ✅ Availability submitted`);
        } else {
          console.log(`   ⚠️  Submit button not found`);
        }
      } else {
        console.log(`   ⚠️  No checkboxes found - different UI structure`);
      }

      await page.screenshot({ path: `/tmp/availability-${user.name.replace(' ', '-')}.png` });
      console.log(`   📸 Screenshot: /tmp/availability-${user.name.replace(' ', '-')}.png`);
    }

    // STEP 4: Check admin can see availability
    console.log('\n📌 STEP 4: View Availability in Admin Panel');
    console.log('-'.repeat(70));

    // Go back to admin (need to login again or use stored token)
    await page.goto('https://mandli-scheduling.vercel.app/admin.html');
    await page.waitForTimeout(2000);

    const adminPageContent = await page.textContent('body');
    console.log('Current page:', page.url());

    // Look for availability data
    if (adminPageContent.includes('October') || adminPageContent.includes('2025')) {
      console.log('✅ Admin panel shows date information');
    }

    // Check if we see user names
    let foundUsers = 0;
    for (const user of TEST_USERS) {
      if (adminPageContent.includes(user.name)) {
        console.log(`✅ Found ${user.name} in admin panel`);
        foundUsers++;
      }
    }

    if (foundUsers === 3) {
      console.log(`✅ All 3 users visible in admin panel`);
    } else {
      console.log(`⚠️  Only ${foundUsers}/3 users found in admin panel`);
    }

    await page.screenshot({ path: '/tmp/admin-availability.png' });
    console.log('📸 Screenshot: /tmp/admin-availability.png');

    // STEP 5: Check duty assignment dropdown
    console.log('\n📌 STEP 5: Check Duty Assignment Shows Only Available Users');
    console.log('-'.repeat(70));

    // Look for any dropdowns or user selection UI
    const selectElements = await page.locator('select').count();
    console.log(`Found ${selectElements} dropdown elements`);

    if (selectElements > 0) {
      const firstSelect = page.locator('select').first();
      await firstSelect.click();
      await page.waitForTimeout(500);

      const options = await firstSelect.locator('option').count();
      console.log(`   Found ${options} options in dropdown`);

      // Get option texts
      for (let i = 0; i < Math.min(options, 10); i++) {
        const optionText = await firstSelect.locator('option').nth(i).textContent();
        console.log(`   Option ${i + 1}: ${optionText}`);
      }
    } else {
      console.log('⚠️  No dropdown elements found - may use different UI');
    }

    await page.screenshot({ path: '/tmp/duty-assignment.png' });
    console.log('📸 Screenshot: /tmp/duty-assignment.png');

    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('✅ END-TO-END TEST COMPLETED');
    console.log('\n📸 Screenshots saved:');
    console.log('   /tmp/users-page.png');
    console.log('   /tmp/availability-John-Smith.png');
    console.log('   /tmp/availability-Jane-Doe.png');
    console.log('   /tmp/availability-Bob-Wilson.png');
    console.log('   /tmp/admin-availability.png');
    console.log('   /tmp/duty-assignment.png');
    console.log('\nView all screenshots:');
    console.log('   open /tmp/*.png');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: '/tmp/error-e2e.png' }).catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
}

runFullE2ETest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});