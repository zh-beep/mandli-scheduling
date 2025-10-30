#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const config = require('../src/config');

async function addUser() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node add-user.js "Full Name" "email@example.com" "phone-number"');
    console.log('Example: node add-user.js "John Smith" "john@example.com" "555-1234"');
    return;
  }

  const [fullName, email, phone] = args;

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log(`❌ User with email ${email} already exists`);
      return;
    }

    // Generate unique link
    const uniqueLink = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        email: email,
        cell_phone: phone,
        gender: 'male', // Default to male, can be enhanced later
        unique_link: uniqueLink
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      return;
    }

    console.log(`✅ User created successfully!`);
    console.log(`   Name: ${newUser.full_name}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Phone: ${newUser.cell_phone}`);
    console.log(`   ID: ${newUser.id}`);

    // Generate availability link
    const token = jwt.sign(
      {
        userId: newUser.id,
        name: newUser.full_name,
        role: 'user'
      },
      config.jwt.secret,
      { expiresIn: '90d' }
    );

    const availabilityLink = `https://mandli-scheduling.vercel.app/availability.html?token=${token}`;

    console.log(`\n📧 Send this link to ${fullName}:`);
    console.log(`   ${availabilityLink}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addUser();