#!/usr/bin/env node

const { chromium } = require('playwright');

async function testCalendarDisplay() {
  console.log('\n🎯 TESTING CALENDAR DISPLAY WITH REAL DUTIES');
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: false });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login as admin
    console.log('\n1. Logging in as admin...');
    await page.goto('https://mandli-scheduling.vercel.app/login.html');
    await page.fill('input[name="username"], input#username', 'mandli');
    await page.fill('input[name="password"], input#password', 'Mandli8');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('   ✅ Logged in');

    // Navigate to main calendar
    console.log('\n2. Navigating to schedule calendar...');
    await page.goto('https://mandli-scheduling.vercel.app/index.html');
    await page.waitForTimeout(5000); // Wait for API data to load
    console.log('   ✅ Calendar loaded');

    // Get page content
    const pageContent = await page.textContent('body');

    // Check for user names in the calendar
    const testUsers = ['John Smith', 'Jane Doe', 'Bob Wilson'];
    let foundUsers = 0;

    console.log('\n3. Checking for assigned duties...');
    console.log('-'.repeat(70));

    for (const user of testUsers) {
      if (pageContent.includes(user)) {
        console.log(`   ✅ Found ${user} assigned to duties`);
        foundUsers++;
      } else {
        console.log(`   ⚠️  ${user} not found on calendar`);
      }
    }

    // Check stats
    const totalDuties = await page.textContent('#totalDuties');
    const assignedDuties = await page.textContent('#assignedDuties');
    const coverage = await page.textContent('#coverageRate');

    console.log('\n4. Calendar Statistics:');
    console.log('-'.repeat(70));
    console.log(`   Total Duties: ${totalDuties}`);
    console.log(`   Assigned Duties: ${assignedDuties}`);
    console.log(`   Coverage: ${coverage}`);

    // Take screenshot
    await page.screenshot({ path: '/tmp/calendar-with-duties.png', fullPage: true });
    console.log('\n📸 Screenshot saved: /tmp/calendar-with-duties.png');

    // Summary
    console.log('\n' + '='.repeat(70));
    if (foundUsers > 0 && assignedDuties !== '0') {
      console.log('✅ SUCCESS: Calendar is displaying real duty assignments!');
      console.log(`   Found ${foundUsers}/3 users with assigned duties`);
      console.log(`   ${assignedDuties} duties assigned out of ${totalDuties} total slots`);
    } else {
      console.log('⚠️  WARNING: Calendar may not be showing duty assignments');
      console.log('   Check screenshot at /tmp/calendar-with-duties.png');
    }
    console.log('='.repeat(70) + '\n');

    await context.close();

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testCalendarDisplay().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
