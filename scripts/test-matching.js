const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  // Login
  console.log('Logging in...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'mandli', password: 'Mandli8' })
  });

  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✓ Logged in\n');

  // Test generate (preview only)
  console.log('='.repeat(60));
  console.log('TESTING: Generate schedule for November 2025');
  console.log('='.repeat(60));

  const generateResponse = await fetch(`${API_BASE_URL}/matching/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ month: '2025-11' })
  });

  const generateData = await generateResponse.json();

  if (!generateResponse.ok) {
    console.error('✗ Generation failed:', generateData);
    return;
  }

  console.log('\n✓ Schedule generated successfully!\n');
  console.log('STATISTICS:');
  console.log('-'.repeat(60));
  console.log(`Total Slots:        ${generateData.stats.totalSlots}`);
  console.log(`Filled Slots:       ${generateData.stats.filledSlots}`);
  console.log(`Empty Slots:        ${generateData.stats.emptySlots}`);
  console.log(`Gents Slots:        ${generateData.stats.gentsSlots}`);
  console.log(`Ladies Slots:       ${generateData.stats.ladiesSlots}`);
  console.log(`Coverage:           ${generateData.stats.coveragePercentage}%`);
  console.log('-'.repeat(60));

  console.log('\nASSIGNMENTS PER USER:');
  console.log('-'.repeat(60));
  Object.entries(generateData.stats.assignmentsByUser).forEach(([userId, info]) => {
    console.log(`${info.name.padEnd(20)} ${info.count} duties`);
  });
  console.log('-'.repeat(60));

  console.log(`\nSample assignments (first 10):`);
  generateData.assignments.slice(0, 10).forEach(a => {
    console.log(`  ${a.date} - Slot ${a.slot_number}`);
  });

  // Apply schedule to database
  console.log('\n\n' + '='.repeat(60));
  console.log('APPLYING: Schedule to database');
  console.log('='.repeat(60));

  const applyResponse = await fetch(`${API_BASE_URL}/matching/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ month: '2025-11' })
  });

  const applyData = await applyResponse.json();

  if (!applyResponse.ok) {
    console.error('✗ Application failed:', applyData);
    return;
  }

  console.log('\n✓ Schedule applied to database!\n');
  console.log('RESULTS:');
  console.log('-'.repeat(60));
  console.log(`Month:              ${applyData.month}`);
  console.log(`Assignments Created: ${applyData.assignmentsCreated}`);
  console.log(`Coverage:           ${applyData.stats.coveragePercentage}%`);
  console.log('-'.repeat(60));

  // Verify data in database
  console.log('\n\n' + '='.repeat(60));
  console.log('VERIFYING: Checking database');
  console.log('='.repeat(60));

  const verifyResponse = await fetch(`${API_BASE_URL}/schedules?week_start=2025-11-04`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const verifyData = await verifyResponse.json();

  console.log(`\nWeek of Nov 4-10, 2025:`);
  if (verifyData.days && verifyData.days.length > 0) {
    verifyData.days.slice(0, 3).forEach(day => {
      console.log(`\n  ${day.dayName} ${day.date}:`);
      Object.entries(day.assignments).forEach(([slot, name]) => {
        if (name) {
          console.log(`    ${slot}: ${name}`);
        }
      });
    });
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✓ MATCHING ALGORITHM TEST COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
