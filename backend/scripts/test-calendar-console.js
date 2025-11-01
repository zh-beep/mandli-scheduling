#!/usr/bin/env node

const { chromium } = require('playwright');

async function testCalendarConsole() {
  const browser = await chromium.launch({ headless: false });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capture console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
    });

    // Capture errors
    page.on('pageerror', error => {
      console.error('[BROWSER ERROR]:', error.message);
    });

    // Login
    console.log('Logging in...');
    await page.goto('https://mandli-scheduling.vercel.app/login.html');
    await page.fill('input[name="username"]', 'mandli');
    await page.fill('input[name="password"]', 'Mandli8');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Go to calendar
    console.log('\nNavigating to calendar...');
    await page.goto('https://mandli-scheduling.vercel.app/index.html');
    await page.waitForTimeout(10000); // Wait longer to see all console messages

    console.log('\n=== Done listening to console ===');

    await page.screenshot({ path: '/tmp/calendar-debug.png', fullPage: true });

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testCalendarConsole();
