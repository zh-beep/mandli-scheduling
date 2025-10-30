#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const config = require('../backend/src/config');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function generateAvailabilityLinks() {
  console.log('Generating unique availability links for all users...\n');
  console.log('=' .repeat(80));
  console.log('\n');

  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email, cell_phone')
    .order('full_name');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users:\n`);

  users.forEach((user, index) => {
    // Generate JWT token for this user
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.full_name,
        role: 'user'
      },
      config.jwt.secret,
      { expiresIn: '90d' } // Link valid for 90 days
    );

    const availabilityLink = `http://localhost:8080/availability.html?token=${token}`;

    console.log(`${index + 1}. ${user.full_name}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Phone: ${user.cell_phone || 'N/A'}`);
    console.log(`   Availability Link: ${availabilityLink}`);
    console.log('');
  });

  console.log('=' .repeat(80));
  console.log('\n📧 Send these links to users via email or text message');
  console.log('📝 Users click the link and submit their weekly availability');
  console.log('⏰ Links expire in 90 days');
  console.log('\n');
}

generateAvailabilityLinks().catch(console.error);
