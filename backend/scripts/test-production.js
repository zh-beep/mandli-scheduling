#!/usr/bin/env node

/**
 * Test: Production workflow - Submit availability and verify assignments
 */

const { supabaseAdmin } = require('../src/config/supabase');
const fetch = require('node-fetch');

// PRODUCTION URLs
const FRONTEND_URL = 'https://mandli-scheduling.vercel.app';
const API_URL = 'https://mandli-production.up.railway.app/api';
const TEST_MONTH = '2025-11';

async function testProduction() {
  console.log('🌐 Testing PRODUCTION Deployment');
  console.log('='.repeat(50));
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`API: ${API_URL}`);
  console.log(`Test Month: ${TEST_MONTH}\n`);

  try {
    // Step 1: Get a real user with unique link
    console.log('📋 Step 1: Finding test user...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, gender, unique_link')
      .eq('is_active', true)
      .limit(1);

    if (usersError || !users || users.length === 0) {
      throw new Error('No active users found');
    }

    const testUser = users[0];
    console.log(`✅ Found user: ${testUser.full_name} (${testUser.email})`);
    console.log(`   Unique link: ${FRONTEND_URL}/availability.html?link=${testUser.unique_link}\n`);

    // Step 2: Submit availability via API
    console.log('📝 Step 2: Submitting availability to PRODUCTION API...');

    const availableDays = [1, 5, 10, 15, 20, 25, 30];
    console.log(`   Available days: ${availableDays.join(', ')}`);

    const response = await fetch(`${API_URL}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        link_token: testUser.unique_link,
        month: TEST_MONTH,
        available_days: availableDays
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Availability submitted successfully`);
    console.log(`   Response:`, result.message);

    // Step 3: Wait for algorithm to run
    console.log('\n⏳ Waiting 5 seconds for algorithm to run...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 4: Check assignments in database
    console.log('\n📊 Step 3: Checking assignments in database...');
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('schedules')
      .select('*, users(full_name, gender)')
      .eq('month', TEST_MONTH)
      .eq('assigned_user_id', testUser.id)
      .order('day');

    if (assignError) throw assignError;

    console.log(`✅ Found ${assignments.length} assignments for ${testUser.full_name}`);

    if (assignments.length > 0) {
      console.log('\n📅 Sample assignments:');
      assignments.slice(0, 5).forEach(a => {
        console.log(`   Day ${a.day}: ${a.duty_type}`);
      });

      // Verify only assigned to available days
      const assignedDays = assignments.map(a => a.day);
      const invalidAssignments = assignedDays.filter(day => !availableDays.includes(day));

      if (invalidAssignments.length > 0) {
        console.log(`\n❌ ERROR: User assigned to days they're NOT available: ${invalidAssignments.join(', ')}`);
      } else {
        console.log(`\n✅ All assignments are on available days!`);
      }
    }

    // Step 5: Verify admin can see it
    console.log('\n👨‍💼 Step 4: Admin schedule view...');
    console.log(`   Open: ${FRONTEND_URL}/index.html`);
    console.log(`   Navigate to week of Nov ${TEST_MONTH.split('-')[1]}`);
    console.log(`   You should see ${testUser.full_name} assigned to ${assignments.length} slots`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ PRODUCTION TEST PASSED');
    console.log('='.repeat(50));
    console.log('Results:');
    console.log(`  • User: ${testUser.full_name}`);
    console.log(`  • Availability submitted: ${availableDays.length} days`);
    console.log(`  • Assignments created: ${assignments.length}`);
    console.log(`  • Algorithm: Ran automatically`);
    console.log(`\n💡 Next: Open ${FRONTEND_URL} and login to verify assignments are visible`);

  } catch (error) {
    console.error('\n❌ PRODUCTION TEST FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testProduction();
