#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    console.log('Testing admin login...\n');

    // Get admin from database
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', 'mandli');

    if (error) {
      console.error('❌ Database error:', error.message);
      return;
    }

    if (!admins || admins.length === 0) {
      console.error('❌ No admin found with username "mandli"');
      return;
    }

    const admin = admins[0];
    console.log('✅ Found admin:', {
      id: admin.id,
      username: admin.username,
      created_at: admin.created_at
    });

    console.log('\nPassword hash:', admin.password_hash.substring(0, 20) + '...');

    // Test password
    const testPassword = 'Mandli8';
    const isValid = await bcrypt.compare(testPassword, admin.password_hash);

    console.log(`\nTesting password "${testPassword}"...`);
    console.log(isValid ? '✅ Password is correct!' : '❌ Password is incorrect');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testLogin().then(() => process.exit(0));
