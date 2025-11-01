#!/usr/bin/env node

const { supabaseAdmin } = require('../src/config/supabase');
const fetch = require('node-fetch');

const API_URL = 'https://mandli-production.up.railway.app/api';
const TEST_MONTH = '2025-10';

async function test31Days() {
  console.log('🧪 Testing: 31 days availability for October 2025');
  console.log('='.repeat(50));

  // Get Bob Wilson
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', 'bob@example.com')
    .single();

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  console.log(`User: ${user.full_name} (${user.email})`);
  console.log(`Gender: ${user.gender}`);
  console.log(`Link: https://mandli-scheduling.vercel.app/availability.html?link=${user.unique_link}`);

  // All days in October (31 days)
  const allDays = Array.from({length: 31}, (_, i) => i + 1);
  console.log('\nSubmitting availability for ALL 31 days of October...');

  const response = await fetch(`${API_URL}/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      link_token: user.unique_link,
      month: TEST_MONTH,
      available_days: allDays
    })
  });

  if (!response.ok) {
    console.error('Failed:', await response.text());
    process.exit(1);
  }

  console.log('✅ Availability submitted');
  console.log('⏳ Waiting 5 seconds for algorithm to run...');

  await new Promise(r => setTimeout(r, 5000));

  // Check assignments
  const { data: assignments } = await supabaseAdmin
    .from('schedules')
    .select('*')
    .eq('month', TEST_MONTH)
    .eq('assigned_user_id', user.id)
    .order('day');

  console.log('\n📊 Results:');
  console.log(`  Total assignments: ${assignments.length}`);

  const assignedDays = [...new Set(assignments.map(a => a.day))].sort((a,b) => a-b);
  console.log(`  Days with assignments: ${assignedDays.length}`);
  console.log(`  Days: ${assignedDays.join(', ')}`);

  if (assignedDays.length === 31) {
    console.log('\n✅ SUCCESS: User assigned to all 31 days!');
  } else {
    console.log(`\n⚠️  User assigned to ${assignedDays.length}/31 days`);
    const missingDays = allDays.filter(d => !assignedDays.includes(d));
    console.log(`  Missing days: ${missingDays.join(', ')}`);
  }

  console.log('\n💡 Open https://mandli-scheduling.vercel.app/index.html to verify');
}

test31Days().catch(console.error);
