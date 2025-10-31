#!/usr/bin/env node

/**
 * Run the filling algorithm for October 2025
 * This generates duty assignments based on user availability
 */

const API_BASE_URL = 'https://mandli-production.up.railway.app/api';

async function loginAsAdmin() {
  console.log('🔐 Logging in as admin...');

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'mandli',
      password: 'Mandli8'
    })
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Admin logged in\n');

  return data.token;
}

async function runFillingAlgorithm(token, month) {
  console.log(`🤖 Running filling algorithm for ${month}...`);
  console.log('-'.repeat(70));

  const response = await fetch(`${API_BASE_URL}/matching/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ month })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Algorithm failed: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data;
}

async function main() {
  console.log('\n🎯 RUNNING FILLING ALGORITHM FOR OCTOBER 2025');
  console.log('='.repeat(70));

  try {
    // Step 1: Login
    const token = await loginAsAdmin();

    // Step 2: Run algorithm for October 2025
    const result = await runFillingAlgorithm(token, '2025-10');

    // Step 3: Display results
    console.log('\n✅ SCHEDULE GENERATED AND APPLIED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`\n📊 Statistics:`);
    console.log(`   Month: ${result.month}`);
    console.log(`   Assignments Created: ${result.assignmentsCreated}`);
    console.log(`   Total Slots: ${result.stats.totalSlots}`);
    console.log(`   Filled Slots: ${result.stats.filledSlots}`);
    console.log(`   Empty Slots: ${result.stats.emptySlots}`);
    console.log(`   Coverage: ${result.stats.coveragePercentage}%`);
    console.log(`   Gents Slots: ${result.stats.gentsSlots}`);
    console.log(`   Ladies Slots: ${result.stats.ladiesSlots}`);

    console.log(`\n👥 Assignments by User:`);
    const userStats = Object.entries(result.stats.assignmentsByUser);
    if (userStats.length > 0) {
      userStats
        .sort((a, b) => b[1].count - a[1].count) // Sort by count descending
        .forEach(([userId, info]) => {
          console.log(`   ${info.name}: ${info.count} duties`);
        });
    } else {
      console.log('   No assignments made');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ You can now view the schedule at:');
    console.log('   https://mandli-scheduling.vercel.app/index.html');
    console.log('\n💡 Refresh the page to see the duty assignments!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

main();
