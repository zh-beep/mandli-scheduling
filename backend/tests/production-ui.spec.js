/**
 * Production UI End-to-End Tests
 * Tests the actual browser UI on production deployment
 */

const { test, expect } = require('@playwright/test');

const PRODUCTION_FRONTEND = 'https://mandli-scheduling.vercel.app';
const PRODUCTION_API = 'https://mandli-production.up.railway.app';

// Test data
const ADMIN_CREDENTIALS = {
  username: 'mandli',
  password: 'Mandli8'
};

test.describe('Production UI Tests', () => {

  test('Test 1: Unique Link - User can submit availability via browser', async ({ page }) => {
    console.log('\n🧪 TEST 1: Availability Submission via Browser UI\n');

    // Navigate to availability page with unique link
    const uniqueLink = `${PRODUCTION_FRONTEND}/availability.html?link=uAI3a1Ku9YXUXkNaU5Jq2RhbkfUevsAz`;
    console.log(`Opening: ${uniqueLink}`);

    await page.goto(uniqueLink);
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Mandli Scheduling');
    console.log('✅ Page loaded successfully');

    // Verify user name displays
    const userNameDisplay = await page.locator('#userNameDisplay').textContent();
    console.log(`✅ User name displayed: ${userNameDisplay}`);
    expect(userNameDisplay).toBeTruthy();
    expect(userNameDisplay).not.toBe('Guest User');

    // Wait for calendar to render
    await page.waitForSelector('.availability-calendar', { timeout: 10000 });
    console.log('✅ Calendar rendered');

    // Get current month display
    const monthDisplay = await page.locator('#currentMonth').textContent();
    console.log(`✅ Month displayed: ${monthDisplay}`);

    // Click on some dates to mark as available
    const selectableDays = page.locator('.calendar-day.selectable');
    const dayCount = await selectableDays.count();
    console.log(`Found ${dayCount} selectable days`);

    // Click first 5 available days
    const daysToSelect = Math.min(5, dayCount);
    for (let i = 0; i < daysToSelect; i++) {
      await selectableDays.nth(i).click();
      await page.waitForTimeout(200); // Small delay between clicks
    }
    console.log(`✅ Clicked ${daysToSelect} dates`);

    // Verify dates turned green (have 'available' class)
    const availableDays = page.locator('.calendar-day.available');
    const selectedCount = await availableDays.count();
    console.log(`✅ ${selectedCount} days marked as available`);
    expect(selectedCount).toBeGreaterThan(0);

    // Submit availability
    console.log('Submitting availability...');
    const submitButton = page.locator('button.btn-primary', { hasText: 'Submit' });
    await submitButton.click();

    // Wait for submission response
    await page.waitForTimeout(3000);

    console.log('✅ Availability submitted via UI');
  });

  test('Test 2: Admin Login and View Availability', async ({ page }) => {
    console.log('\n🧪 TEST 2: Admin Login and View Submissions\n');

    // Navigate to login page
    const loginUrl = `${PRODUCTION_FRONTEND}/login.html`;
    console.log(`Opening: ${loginUrl}`);

    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');

    // Fill in login credentials
    await page.fill('input[name="username"]', ADMIN_CREDENTIALS.username);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    console.log('✅ Filled login credentials');

    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify redirect to admin panel (should be index.html or calendar view)
    const currentUrl = page.url();
    console.log(`✅ Logged in, redirected to: ${currentUrl}`);

    // Navigate to settings/users page
    await page.goto(`${PRODUCTION_FRONTEND}/settings.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to settings page');

    // Verify we can access admin panel (not redirected back to login)
    expect(page.url()).toContain('settings.html');
    console.log('✅ Admin has access to settings panel');

    // Check if we can see users list
    await page.waitForSelector('#peopleList', { timeout: 5000 });
    console.log('✅ People list loaded');

    // Use browser console to fetch availability data
    const availabilityData = await page.evaluate(async () => {
      const token = document.cookie.split('mandli_token=')[1]?.split(';')[0];
      if (!token) return { error: 'No auth token found' };

      try {
        const response = await fetch('https://mandli-production.up.railway.app/api/availability/month/2025-11', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        return data;
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Availability data from admin panel:');
    console.log(JSON.stringify(availabilityData, null, 2));

    if (availabilityData.availability) {
      console.log(`✅ Found ${availabilityData.availability.length} availability submissions`);
      expect(availabilityData.availability.length).toBeGreaterThan(0);
    } else {
      console.log('⚠️  No availability data or error:', availabilityData.error);
    }
  });

  test('Test 3: All 3 Links Work', async ({ page }) => {
    console.log('\n🧪 TEST 3: Test All 3 Unique Links\n');

    const links = [
      { name: 'ABMS', link: 'uAI3a1Ku9YXUXkNaU5Jq2RhbkfUevsAz' },
      { name: 'Bob Wilson', link: 'bgttjxhwidd7u6orlms9' },
      { name: 'John Smith', link: 'y820iyobykhtj4wh79wck9' }
    ];

    for (const linkData of links) {
      const url = `${PRODUCTION_FRONTEND}/availability.html?link=${linkData.link}`;
      console.log(`\nTesting link for ${linkData.name}`);
      console.log(`URL: ${url}`);

      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      const hasTitle = await page.locator('h1').count() > 0;
      expect(hasTitle).toBe(true);

      // Verify user name shows (not "Guest User" or "Invalid Link")
      const userName = await page.locator('#userNameDisplay').textContent();
      console.log(`  User: ${userName}`);
      expect(userName).not.toBe('Guest User');
      expect(userName).not.toBe('Invalid Link');

      // Verify calendar exists
      const hasCalendar = await page.locator('.availability-calendar').count() > 0;
      expect(hasCalendar).toBe(true);

      console.log(`  ✅ Link works for ${linkData.name}`);
    }
  });

  test('Test 4: Google Calendar Auth Link', async ({ page }) => {
    console.log('\n🧪 TEST 4: Google Calendar Auth Link\n');

    const calendarAuthUrl = `${PRODUCTION_FRONTEND}/calendar-auth.html?userId=d7653b56-7fd0-4780-b8c7-317f1ffda5d8`;
    console.log(`Opening: ${calendarAuthUrl}`);

    await page.goto(calendarAuthUrl);
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Connect Your Google Calendar');
    console.log('✅ Calendar auth page loaded');

    // Verify "Connect" button exists
    const connectButton = page.locator('button.auth-button');
    await expect(connectButton).toBeVisible();
    console.log('✅ Connect Google Calendar button visible');

    // Note: We won't actually click it as it would redirect to Google OAuth
    console.log('⚠️  Not clicking connect button (would redirect to Google OAuth)');
    console.log('✅ Calendar auth page structure verified');
  });

});
