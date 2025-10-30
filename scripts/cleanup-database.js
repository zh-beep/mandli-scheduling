#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function cleanupDatabase() {
  console.log('\n🧹 DATABASE CLEANUP');
  console.log('=' .repeat(50));

  try {
    // Get all current users
    console.log('\n📋 Current users in database:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, cell_phone, created_at')
      .order('created_at');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users:`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.full_name} (${user.email || 'no email'})`);
    });

    // Check for related data
    console.log('\n📊 Checking related data:');

    const { count: availabilityCount } = await supabase
      .from('availability')
      .select('*', { count: 'exact', head: true });
    console.log(`- Availability records: ${availabilityCount || 0}`);

    const { count: scheduleCount } = await supabase
      .from('schedules')
      .select('*', { count: 'exact', head: true });
    console.log(`- Schedule records: ${scheduleCount || 0}`);

    const { count: adminCount } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true });
    console.log(`- Admin accounts: ${adminCount || 0}`);

    const { count: gmailCount } = await supabase
      .from('gmail_sender')
      .select('*', { count: 'exact', head: true });
    console.log(`- Gmail OAuth tokens: ${gmailCount || 0}`);

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n⚠️  WARNING: This will delete ALL data!');
    console.log('This includes all users, schedules, availability, and OAuth tokens.');

    const answer = await new Promise((resolve) => {
      rl.question('\nType "DELETE ALL" to confirm deletion: ', resolve);
    });
    rl.close();

    if (answer !== 'DELETE ALL') {
      console.log('❌ Cleanup cancelled');
      return;
    }

    console.log('\n🗑️  Deleting all data...');

    // Delete in order to respect foreign key constraints
    console.log('- Deleting schedules...');
    await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('- Deleting availability...');
    await supabase.from('availability').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('- Deleting gmail tokens...');
    await supabase.from('gmail_sender').delete().neq('user_email', '');

    console.log('- Deleting users...');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Keep admin accounts for now
    console.log('- Keeping admin accounts (mandli user)');

    console.log('\n✅ Database cleaned!');

    // Show final status
    const { count: finalUserCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    console.log(`\n📊 Final status: ${finalUserCount || 0} users remaining`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanupDatabase();