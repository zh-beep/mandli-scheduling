#!/usr/bin/env node

const { chromium } = require('playwright');

const TEST_USERS = [
  {
    name: 'John Smith',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTMyM2RjZS1mYTIxLTQ4NGEtYWQ3Mi1lMmM5NzhlZWE2MTMiLCJuYW1lIjoiSm9obiBTbWl0aCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.e4obKHEl7WG9dtY_0cJHOil3ttRdFAqXfbzm7kuaPS0'
  },
  {
    name: 'Jane Doe',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMGUyYzU5Ni03NWJhLTQzMWYtYjQ5Zi1jZWU3ODFlYmI5Y2YiLCJuYW1lIjoiSmFuZSBEb2UiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MTg0NjkzMSwiZXhwIjoxNzY5NjIyOTMxfQ.7-BfSlXirFEenEJNVlNZKADEaTVI3lCF6xSOk_kYtEQ'
  },
  {
    name: 'Bob Wilson',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTcyN2QyZC1iYjIyLTRlNTctYWMzMS0yNTRmZTczOTBmMTYiLCJuYW1lIjoiQm9iIFdpbHNvbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2OTMxLCJleHAiOjE3Njk2MjI5MzF9.SNQmmduYRsV5DSzOdnTLeGPDBZAixoRVXAwXkD5hKMc'
  }
];

async function testUserAvailabilityLinks() {
  console.log('\n📋 TESTING UNIQUE USER AVAILABILITY LINKS');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: false });

  for (const user of TEST_USERS) {
    console.log(`\n👤 Testing ${user.name}'s availability link`);
    console.log('-'.repeat(70));

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const url = `https://mandli-scheduling.vercel.app/availability.html?token=${user.token}`;
      console.log(`URL: ${url.substring(0, 80)}...`);

      // Navigate to the unique link
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('✅ Page loaded');

      // Wait for the page to render
      await page.waitForTimeout(2000);

      // Check if user name is displayed
      const pageText = await page.textContent('body');

      if (pageText.includes(user.name)) {
        console.log(`✅ Page shows user name: "${user.name}"`);
      } else if (pageText.includes('Welcome')) {
        console.log(`⚠️  Page shows welcome message but not "${user.name}"`);
      } else {
        console.log(`⚠️  User name "${user.name}" not found on page`);
      }

      // Check for month display
      if (pageText.includes('October 2025') || pageText.includes('October') || pageText.includes('2025')) {
        console.log('✅ Month information displayed');
      } else {
        console.log('⚠️  Month information not found');
      }

      // Check for calendar grid
      const calendarGrid = await page.locator('.availability-calendar, #availabilityCalendar').count();
      if (calendarGrid > 0) {
        console.log('✅ Calendar grid found');

        // Check for date cells
        const dateCells = await page.locator('.availability-calendar > *, #availabilityCalendar > *').count();
        console.log(`   Found ${dateCells} elements in calendar`);

        // Try to click some dates
        if (dateCells > 0) {
          // Click first 3 available date cells
          for (let i = 0; i < Math.min(3, dateCells); i++) {
            try {
              await page.locator('.availability-calendar > *, #availabilityCalendar > *').nth(i).click();
              await page.waitForTimeout(200);
            } catch (e) {
              // Continue if click fails
            }
          }
          console.log('✅ Clicked some dates');
        }
      } else {
        console.log('⚠️  Calendar grid not found');
      }

      // Look for submit button
      const submitButton = await page.locator('button:has-text("Submit"), button.btn-primary').count();
      if (submitButton > 0) {
        console.log('✅ Submit button found');

        // Click submit
        await page.locator('button:has-text("Submit"), button.btn-primary').first().click();
        console.log('✅ Submit button clicked');

        // Wait for response
        await page.waitForTimeout(2000);

        // Check for success message or error
        const afterSubmit = await page.textContent('body');
        if (afterSubmit.includes('success') || afterSubmit.includes('submitted') || afterSubmit.includes('Success')) {
          console.log('✅ Success message detected');
        } else if (afterSubmit.includes('error') || afterSubmit.includes('Error') || afterSubmit.includes('failed')) {
          console.log('❌ Error message detected');
        } else {
          console.log('⚠️  No clear success/error message');
        }
      } else {
        console.log('⚠️  Submit button not found');
      }

      // Take screenshot
      await page.screenshot({ path: `/tmp/user-${user.name.replace(' ', '-')}.png` });
      console.log(`📸 Screenshot saved: /tmp/user-${user.name.replace(' ', '-')}.png`);

    } catch (error) {
      console.error(`❌ Error testing ${user.name}:`, error.message);
      await page.screenshot({ path: `/tmp/error-${user.name.replace(' ', '-')}.png` }).catch(() => {});
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log('\n' + '=' .repeat(70));
  console.log('✅ USER LINK TESTING COMPLETED');
  console.log('\n📸 View screenshots:');
  console.log('   open /tmp/user-*.png');
}

testUserAvailabilityLinks().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});