#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const calendarService = require('../backend/src/services/calendar');

// Get user ID from command line or use default
const userId = process.argv[2] || '22ea57f2-b16f-4f2b-a3ac-0094e5b36785';

const authUrl = calendarService.getAuthUrl(userId);

console.log('\n📱 Direct Google OAuth Link:');
console.log(authUrl);
console.log('\n📧 Send this link to the user to authenticate their calendar');
console.log('');
