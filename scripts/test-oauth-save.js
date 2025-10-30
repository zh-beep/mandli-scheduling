#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOAuthSave() {
  console.log('Testing OAuth token save...\n');

  const testUserId = '22ea57f2-b16f-4f2b-a3ac-0094e5b36785';
  const testTokens = {
    access_token: 'test_access_token_123',
    refresh_token: 'test_refresh_token_456',
    expiry_date: new Date(Date.now() + 3600000).getTime()
  };

  // Try to delete first
  console.log('Deleting any existing entry...');
  const { error: deleteError } = await supabase
    .from('gmail_sender')
    .delete()
    .eq('user_email', testUserId);

  if (deleteError) {
    console.log('Delete result:', deleteError.message || 'OK');
  }

  // Try to insert
  console.log('\nInserting new entry...');
  const { data, error: insertError } = await supabase
    .from('gmail_sender')
    .insert({
      user_email: testUserId,
      access_token: testTokens.access_token,
      refresh_token: testTokens.refresh_token,
      expires_at: new Date(testTokens.expiry_date).toISOString(),
      authenticated_at: new Date().toISOString()
    })
    .select();

  if (insertError) {
    console.error('❌ Insert failed:', insertError);
    return false;
  }

  console.log('✅ Insert successful:', data);

  // Verify it's there
  const { data: checkData, error: checkError } = await supabase
    .from('gmail_sender')
    .select('*')
    .eq('user_email', testUserId)
    .single();

  if (checkError) {
    console.error('❌ Verification failed:', checkError);
    return false;
  }

  console.log('\n✅ Verified in database:', checkData);
  return true;
}

testOAuthSave().then(success => process.exit(success ? 0 : 1));
