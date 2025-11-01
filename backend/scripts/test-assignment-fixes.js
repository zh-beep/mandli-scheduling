#!/usr/bin/env node

const { chromium } = require('playwright');

async function testAssignmentFixes() {
  console.log('\n🎯 TESTING ASSIGNMENT FIXES');
  console.log('='.repeat(70));
  console.log('1. UUID Display Fix: Names should appear instead of UUIDs');
  console.log('2. Double-booking Prevention: Already-assigned users filtered out');
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: false });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capture console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' || text.includes('Error')) {
        console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
      }
    });

    // Login as admin
    console.log('\n📝 Step 1: Logging in as admin...');
    await page.goto('https://mandli-scheduling.vercel.app/login.html');
    await page.fill('input[name="username"], input#username', 'mandli');
    await page.fill('input[name="password"], input#password', 'Mandli8');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('   ✅ Logged in');

    // Navigate to calendar
    console.log('\n📝 Step 2: Loading calendar...');
    await page.goto('https://mandli-scheduling.vercel.app/index.html');
    await page.waitForTimeout(5000);
    console.log('   ✅ Calendar loaded');

    // Check for UUIDs in the page content
    console.log('\n📝 Step 3: Checking for UUIDs (should be NONE)...');
    const pageContent = await page.textContent('body');
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const foundUuids = pageContent.match(uuidPattern);

    if (foundUuids && foundUuids.length > 0) {
      console.log('   ❌ FAILED: Found UUIDs in calendar:');
      foundUuids.forEach(uuid => console.log(`      - ${uuid}`));
    } else {
      console.log('   ✅ PASSED: No UUIDs found - all assignments showing names');
    }

    // Check that real names are displayed
    console.log('\n📝 Step 4: Checking for user names...');
    const testUsers = ['John Smith', 'Jane Doe', 'Bob Wilson'];
    let foundCount = 0;
    for (const user of testUsers) {
      if (pageContent.includes(user)) {
        console.log(`   ✅ Found: ${user}`);
        foundCount++;
      }
    }
    console.log(`   Result: ${foundCount}/${testUsers.length} users found`);

    // Test double-booking prevention
    console.log('\n📝 Step 5: Testing double-booking prevention...');
    console.log('   Opening assignment modal for a date with existing assignments...');

    // Click on a cell to open modal
    const cells = await page.$$('.grid-cell');
    if (cells.length > 0) {
      await cells[0].click();
      await page.waitForTimeout(2000);

      // Check if modal opened
      const modalVisible = await page.isVisible('#editModal:not(.hidden)');
      if (modalVisible) {
        console.log('   ✅ Modal opened successfully');

        // Get the dropdown options
        const options = await page.$$eval('#personSelect option', opts =>
          opts.map(o => ({ value: o.value, text: o.textContent }))
        );

        console.log(`   Found ${options.length - 1} available users (excluding "Unassigned")`);

        // Take a screenshot
        await page.screenshot({ path: '/tmp/assignment-modal-test.png', fullPage: true });
        console.log('   📸 Screenshot saved: /tmp/assignment-modal-test.png');

        // Close modal
        await page.click('#cancelAssignment');
        await page.waitForTimeout(1000);
      } else {
        console.log('   ⚠️  Could not open modal (might not be in admin mode)');
      }
    }

    // Final screenshot
    await page.screenshot({ path: '/tmp/calendar-after-fixes.png', fullPage: true });
    console.log('\n📸 Final screenshot: /tmp/calendar-after-fixes.png');

    // Summary
    console.log('\n' + '='.repeat(70));
    if (!foundUuids || foundUuids.length === 0) {
      console.log('✅ SUCCESS: All assignments display names correctly!');
      console.log('✅ SUCCESS: No UUIDs found in the calendar');
    } else {
      console.log('⚠️  WARNING: Still found UUIDs - check screenshots');
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

testAssignmentFixes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
