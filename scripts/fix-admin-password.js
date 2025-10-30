#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPassword() {
  try {
    console.log('Generating new password hash for "Mandli8"...\n');

    const password = 'Mandli8';
    const hash = await bcrypt.hash(password, 10);

    console.log('New hash:', hash);

    // Update admin password
    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: hash })
      .eq('username', 'mandli')
      .select();

    if (error) {
      console.error('❌ Error updating password:', error.message);
      return;
    }

    console.log('\n✅ Admin password updated successfully!');
    console.log('Username: mandli');
    console.log('Password: Mandli8');

    // Test the new password
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('username', 'mandli')
      .single();

    const isValid = await bcrypt.compare(password, admin.password_hash);
    console.log('\nPassword verification:', isValid ? '✅ PASS' : '❌ FAIL');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixPassword().then(() => process.exit(0));
