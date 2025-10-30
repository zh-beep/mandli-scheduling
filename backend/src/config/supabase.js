const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create Supabase client with anon key for public operations (availability form)
const supabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

module.exports = {
  supabaseAdmin,
  supabaseClient
};
