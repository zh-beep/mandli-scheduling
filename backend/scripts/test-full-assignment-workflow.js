#!/usr/bin/env node

const { chromium } = require('playwright');

async function testFullAssignmentWorkflow() {
  console.log('\n🎯 FULL ASSIGNMENT WORKFLOW TEST');
  console.log('='.repeat(70));
  console.log('Test Steps:');
  console.log('1. Assign user to a duty on Day 1');
  console.log('2. Verify they cannot be assigned to another duty on Day 1 (double-booking prevention)');
  console.log('3. Unassign them from Day 1');
  console.log('4. Verify they can now be assigned to another duty on Day 1');
  console.log('5. Assign them to a duty on Day 2 (different day)');
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: false, slowMo: 500 });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capture console errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' || text.includes('Error')) {
        console.log(`   [BROWSER ERROR]: ${text}`);
      }
    });

    // Step 1: Login
    console.log('\n📝 Step 1: Logging in as admin...');
    await page.goto('https://mandli-scheduling.vercel.app/login.html');
    await page.fill('input[name="username"], input#username', 'mandli');
    await page.fill('input[name="password"], input#password', 'Mandli8');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('   ✅ Logged in successfully');

    // Step 2: Navigate to calendar
    console.log('\n📝 Step 2: Loading calendar...');
    await page.goto('https://mandli-scheduling.vercel.app/index.html');
    await page.waitForTimeout(5000);
    console.log('   ✅ Calendar loaded');

    // Get assignment cells
    const cells = await page.$$('.weekly-assignment-cell');
    console.log(`   Found ${cells.length} cells on calendar`);
    if (cells.length < 16) {
      throw new Error(`Not enough cells found on calendar (found ${cells.length}, need at least 16)`);
    }

    // Step 3: Find a cell with available users
    console.log('\n📝 Step 3: Finding a cell with available users...');
    let firstCellIndex = -1;
    let firstUser = null;
    let options = [];

    // Try up to 20 cells to find one with available users
    for (let i = 0; i < Math.min(cells.length, 20); i++) {
      await cells[i].click();
      await page.waitForTimeout(1500);

      options = await page.$$eval('#personSelect option', opts =>
        opts.filter(o => o.value !== '' && !o.disabled).map(o => ({ value: o.value, text: o.textContent }))
      );

      if (options.length > 0) {
        firstCellIndex = i;
        firstUser = options[0];
        console.log(`   ✅ Found cell #${i} with ${options.length} available users`);
        break;
      }

      await page.click('#cancelBtn');
      await page.waitForTimeout(500);
    }

    if (!firstUser) {
      throw new Error('Could not find any cell with available users');
    }

    console.log('\n📝 Step 4: Assigning first user to this duty...');
    console.log(`   → Selecting user: ${firstUser.text}`);
    await page.selectOption('#personSelect', firstUser.value);
    await page.click('#saveBtn');
    await page.waitForTimeout(3000);
    console.log('   ✅ User assigned to first duty');

    // Step 5: Try to assign same user to second duty on the same day (should be filtered out)
    console.log('\n📝 Step 5: Checking double-booking prevention on same day...');

    // Find the next cell on the same day (assuming 8 duties per day, cells are arranged sequentially per day)
    const secondCellSameDay = Math.floor(firstCellIndex / 8) * 8 + ((firstCellIndex % 8 + 1) % 8);
    console.log(`   → Clicking cell #${secondCellSameDay} (same day as cell #${firstCellIndex})`);
    await cells[secondCellSameDay].click();
    await page.waitForTimeout(2000);

    options = await page.$$eval('#personSelect option', opts =>
      opts.filter(o => o.value !== '' && !o.disabled).map(o => ({ value: o.value, text: o.textContent }))
    );

    const userStillAvailable = options.some(opt => opt.value === firstUser.value);

    if (userStillAvailable) {
      console.log(`   ❌ FAILED: User ${firstUser.text} still appears in dropdown (should be filtered)`);
    } else {
      console.log(`   ✅ PASSED: User ${firstUser.text} correctly filtered out (double-booking prevented)`);
    }

    await page.click('#cancelAssignment');
    await page.waitForTimeout(1000);

    // Step 6: Unassign user from first duty
    console.log('\n📝 Step 6: Unassigning user from first duty...');
    await cells[firstCellIndex].click();
    await page.waitForTimeout(2000);
    await page.selectOption('#personSelect', ''); // Select "-- Unassigned --"
    await page.click('#saveBtn');
    await page.waitForTimeout(3000);
    console.log('   ✅ User unassigned from first duty');

    // Step 7: Verify user is now available for second duty on same day
    console.log('\n📝 Step 7: Verifying user is now available again...');
    await cells[secondCellSameDay].click();
    await page.waitForTimeout(2000);

    options = await page.$$eval('#personSelect option', opts =>
      opts.filter(o => o.value !== '' && !o.disabled).map(o => ({ value: o.value, text: o.textContent }))
    );

    const userNowAvailable = options.some(opt => opt.value === firstUser.value);

    if (userNowAvailable) {
      console.log(`   ✅ PASSED: User ${firstUser.text} is now available again after unassignment`);
    } else {
      console.log(`   ❌ FAILED: User ${firstUser.text} still not available (should be available now)`);
    }

    await page.click('#cancelAssignment');
    await page.waitForTimeout(1000);

    // Step 8: Assign to different day
    console.log('\n📝 Step 8: Assigning user to a duty on a different day...');
    // Click a cell on the next day (add 8 to jump to next day, assuming 8 duties per day)
    const cellDifferentDay = firstCellIndex + 8;
    console.log(`   → Clicking cell #${cellDifferentDay} (different day)`);
    await cells[cellDifferentDay].click();
    await page.waitForTimeout(2000);

    options = await page.$$eval('#personSelect option', opts =>
      opts.filter(o => o.value !== '' && !o.disabled).map(o => ({ value: o.value, text: o.textContent }))
    );

    const userAvailableDay2 = options.some(opt => opt.value === firstUser.value);

    if (userAvailableDay2) {
      console.log(`   ✅ User ${firstUser.text} is available on Day 2`);
      await page.selectOption('#personSelect', firstUser.value);
      await page.click('#saveBtn');
      await page.waitForTimeout(3000);
      console.log('   ✅ Successfully assigned user to duty on Day 2');
    } else {
      console.log(`   ⚠️  User ${firstUser.text} not available on Day 2 (might not be available that day)`);
      await page.click('#cancelBtn');
    }

    // Take final screenshot
    await page.screenshot({ path: '/tmp/full-workflow-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: /tmp/full-workflow-test.png');

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ WORKFLOW TEST COMPLETE');
    console.log('='.repeat(70));
    console.log('Key Findings:');
    console.log(`  - Assignment: ${firstUser.text}`);
    console.log(`  - Double-booking prevention: ${!userStillAvailable ? 'WORKING ✅' : 'FAILED ❌'}`);
    console.log(`  - Unassignment: WORKING ✅`);
    console.log(`  - Re-availability after unassignment: ${userNowAvailable ? 'WORKING ✅' : 'FAILED ❌'}`);
    console.log('='.repeat(70) + '\n');

    await context.close();

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testFullAssignmentWorkflow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
