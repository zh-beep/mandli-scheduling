#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const config = require('../src/config');

async function addTestUsers() {
  const users = [
    { full_name: 'John Smith', email: 'john@example.com', phone: '555-0101', gender: 'gents' },
    { full_name: 'Jane Doe', email: 'jane@example.com', phone: '555-0102', gender: 'ladies' },
    { full_name: 'Bob Wilson', email: 'bob@example.com', phone: '555-0103', gender: 'gents' }
  ];

  for (const user of users) {
    const uniqueLink = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const { data, error } = await supabase
      .from('users')
      .insert({
        full_name: user.full_name,
        email: user.email,
        cell_phone: user.phone,
        gender: user.gender,
        unique_link: uniqueLink
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating ${user.full_name}:`, error.message);
    } else {
      console.log(`✅ Created ${user.full_name}`);

      // Generate availability link
      const token = jwt.sign(
        {
          userId: data.id,
          name: data.full_name,
          role: 'user'
        },
        config.jwt.secret,
        { expiresIn: '90d' }
      );

      const availabilityLink = `https://mandli-scheduling.vercel.app/availability.html?token=${token}`;
      console.log(`   Availability link: ${availabilityLink}`);
      console.log('');
    }
  }
}

addTestUsers();