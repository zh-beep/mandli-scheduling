#!/usr/bin/env node

const { chromium } = require('playwright');

async function testVercelLogin() {
  console.log('\n🌐 TESTING VERCEL LOGIN WITH REAL BROWSER');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Load login page
    console.log('\n1️⃣  Loading login page...');
    console.log('   URL: https://mandli-scheduling.vercel.app/login.html');

    await page.goto('https://mandli-scheduling.vercel.app/login.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   ✅ Page loaded successfully');

    // Take screenshot
    await page.screenshot({ path: '/tmp/login-page.png' });
    console.log('   📸 Screenshot saved to /tmp/login-page.png');

    // Test 2: Fill in login form
    console.log('\n2️⃣  Filling in login credentials...');

    // Wait for username field
    await page.waitForSelector('input[name="username"], input#username, input[type="text"]', { timeout: 5000 });
    await page.fill('input[name="username"], input#username, input[type="text"]', 'mandli');
    console.log('   ✅ Username filled: mandli');

    // Wait for password field
    await page.waitForSelector('input[name="password"], input#password, input[type="password"]', { timeout: 5000 });
    await page.fill('input[name="password"], input#password, input[type="password"]', 'Mandli8');
    console.log('   ✅ Password filled: ********');

    // Test 3: Submit login
    console.log('\n3️⃣  Submitting login form...');

    // Listen for network responses
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login'),
      { timeout: 10000 }
    );

    // Click login button
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    console.log('   ✅ Login button clicked');

    // Wait for API response
    const response = await responsePromise;
    const status = response.status();
    console.log(`   📡 API Response: ${status}`);

    if (status === 200) {
      const data = await response.json();
      console.log('   ✅ Login successful!');
      console.log(`   🎟️  Token received: ${data.token ? data.token.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   👤 Admin: ${data.admin?.username}`);
    } else {
      const text = await response.text();
      console.log(`   ❌ Login failed with status ${status}`);
      console.log(`   Response: ${text}`);
    }

    // Test 4: Check for redirect or dashboard load
    console.log('\n4️⃣  Checking post-login behavior...');

    await page.waitForTimeout(2000); // Wait for redirect or UI update

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
      console.log('   ✅ Redirected to dashboard');
    } else if (currentUrl.includes('login')) {
      console.log('   ⚠️  Still on login page');

      // Check for error messages
      const errorText = await page.textContent('body').catch(() => '');
      if (errorText.toLowerCase().includes('error') || errorText.toLowerCase().includes('failed')) {
        console.log('   ❌ Error message detected on page');
      }
    }

    // Take final screenshot
    await page.screenshot({ path: '/tmp/after-login.png' });
    console.log('   📸 Screenshot saved to /tmp/after-login.png');

    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (token) {
      console.log('   ✅ Token stored in localStorage');
    } else {
      console.log('   ⚠️  No token found in localStorage');
    }

    // Test 5: Check console errors
    console.log('\n5️⃣  Checking browser console...');
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));

    await page.waitForTimeout(1000);

    const errors = logs.filter(log => log.startsWith('error:'));
    if (errors.length > 0) {
      console.log('   ⚠️  Console errors found:');
      errors.forEach(err => console.log(`      ${err}`));
    } else {
      console.log('   ✅ No console errors');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ BROWSER TEST COMPLETED');
    console.log('\nView screenshots:');
    console.log('  open /tmp/login-page.png');
    console.log('  open /tmp/after-login.png');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);

    // Take error screenshot
    await page.screenshot({ path: '/tmp/error.png' }).catch(() => {});
    console.log('📸 Error screenshot saved to /tmp/error.png');

    throw error;
  } finally {
    await browser.close();
  }
}

testVercelLogin().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});