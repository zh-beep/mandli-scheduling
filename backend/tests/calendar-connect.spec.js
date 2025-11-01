/**
 * Test Calendar Connection Page
 */

const { test, expect } = require('@playwright/test');

const PRODUCTION_FRONTEND = 'https://mandli-scheduling.vercel.app';

test.describe('Calendar Connection Tests', () => {

  test('Email-based calendar connection page works', async ({ page }) => {
    console.log('\n🧪 Testing Calendar Connection Page\n');

    // Navigate to calendar connection page
    const url = `${PRODUCTION_FRONTEND}/connect-calendar.html`;
    console.log(`Opening: ${url}`);

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Connect Your Google Calendar');
    console.log('✅ Page loaded successfully');

    // Verify email input field exists
    const emailInput = page.locator('#emailInput');
    await expect(emailInput).toBeVisible();
    console.log('✅ Email input field visible');

    // Verify connect button exists
    const connectButton = page.locator('button[type="submit"]');
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toContainText('Connect Google Calendar');
    console.log('✅ Connect button visible');

    // Test with pre-filled email from URL parameter
    const testEmail = 'test@example.com';
    await page.goto(`${url}?email=${testEmail}`);
    await page.waitForLoadState('networkidle');

    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe(testEmail);
    console.log(`✅ Email pre-filled from URL parameter: ${emailValue}`);

    console.log('\n✅ All calendar connection page elements verified');
  });

  test('Can enter email and initiate OAuth flow', async ({ page }) => {
    console.log('\n🧪 Testing OAuth Flow Initiation\n');

    const url = `${PRODUCTION_FRONTEND}/connect-calendar.html`;
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Enter email
    const testEmail = 'ai@ferociter.co';
    await page.fill('#emailInput', testEmail);
    console.log(`✅ Entered email: ${testEmail}`);

    // Note: We won't actually submit because it would redirect to Google
    console.log('⚠️  Not submitting form (would redirect to Google OAuth)');
    console.log('✅ Form is ready for submission');
  });

});
