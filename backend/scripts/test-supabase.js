#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test connection by checking admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('username')
      .limit(1);

    if (adminError) {
      console.error('❌ Connection failed:', adminError.message);
      return false;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Found admin(s):', adminData);

    // Check users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('count');

    if (!userError) {
      console.log('✅ Users table exists');
    }

    // Check availability table
    const { data: availData, error: availError } = await supabase
      .from('availability')
      .select('count');

    if (!availError) {
      console.log('✅ Availability table exists');
    }

    // Check schedules table
    const { data: schedData, error: schedError } = await supabase
      .from('schedules')
      .select('count');

    if (!schedError) {
      console.log('✅ Schedules table exists');
    }

    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
