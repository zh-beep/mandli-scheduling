#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { supabaseAdmin } = require('../src/config/supabase');

async function checkAvailability() {
  console.log('\n🔍 CHECKING DATABASE AVAILABILITY DATA');
  console.log('=' .repeat(60));

  // 1. Check all availability entries
  const { data: allAvailability, error: allError } = await supabaseAdmin
    .from('availability')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (allError) {
    console.log('❌ Error fetching availability:', allError.message);
    return;
  }

  console.log(`\n📊 Total availability entries: ${allAvailability?.length || 0}`);

  if (allAvailability && allAvailability.length > 0) {
    console.log('\nAll Availability Entries:');
    allAvailability.forEach((entry, i) => {
      console.log(`\n${i + 1}. Entry ID: ${entry.id}`);
      console.log(`   User ID: ${entry.user_id}`);
      console.log(`   Month: ${entry.month}`);
      console.log(`   Available Days: ${JSON.stringify(entry.available_days)}`);
      console.log(`   Submitted: ${entry.submitted_at}`);
      console.log(`   Updated: ${entry.updated_at}`);
    });
  }

  // 2. Check October 2025 specifically
  console.log('\n' + '-'.repeat(60));
  console.log('📅 OCTOBER 2025 ENTRIES:');

  const { data: octData, error: octError } = await supabaseAdmin
    .from('availability')
    .select('*')
    .eq('month', '2025-10');

  if (octError) {
    console.log('❌ Error fetching October data:', octError.message);
  } else if (octData && octData.length > 0) {
    console.log(`Found ${octData.length} entries for October 2025`);
    octData.forEach((entry) => {
      console.log(`- User: ${entry.user_id}, Days: ${entry.available_days.length} days`);
    });
  } else {
    console.log('No entries found for October 2025');
  }

  // 3. Check users table
  console.log('\n' + '-'.repeat(60));
  console.log('👥 CURRENT USERS:');

  const { data: users, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email')
    .order('created_at', { ascending: false });

  if (users) {
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.full_name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
    });
  }

  // 4. Join availability with users for October 2025
  console.log('\n' + '-'.repeat(60));
  console.log('🔗 OCTOBER 2025 WITH USER DETAILS:');

  const { data: joined, error: joinError } = await supabaseAdmin
    .from('availability')
    .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
    .eq('month', '2025-10');

  if (joinError) {
    console.log('❌ Error joining data:', joinError.message);
  } else if (joined && joined.length > 0) {
    joined.forEach((entry) => {
      console.log(`\n✅ ${entry.users?.full_name || 'Unknown User'}`);
      console.log(`   Available Days: ${entry.available_days.join(', ')}`);
      console.log(`   Total: ${entry.available_days.length} days`);
    });
  } else {
    console.log('No joined data found for October 2025');
  }
}

checkAvailability().catch(console.error);