# Manual Testing Guide for Mandli App

This guide will help you test all the features mentioned in your notes:
- Test all 3 links work
- Admin Panel - Can add & send
- People get emails to fill them out
- Auth Link works

## Prerequisites
- Backend running on http://localhost:3001
- Frontend running on http://localhost:3000 (or http://localhost:8080)
- Admin credentials: username=`mandli`, password=`Mandli8`

## Test 1: Admin Login & Add Users

###  Step 1.1: Login to Admin Panel
1. Open http://localhost:3000/login.html
2. Enter credentials:
   - Username: `mandli`
   - Password: `Mandli8`
3. Click "Login"
4. ✅ **Expected**: Should redirect to index.html with calendar view

### Step 1.2: Add New Users
1. Navigate to http://localhost:3000/settings.html
2. Scroll to "Manage People" section
3. Click "Add Person"
4. Fill in:
   - Name: Test User 1
   - Email: testuser1@example.com
   - Phone: +1234567890
   - Gender: gents
5. Click "Save"
6. ✅ **Expected**: User appears in the people list

### Step 1.3: Repeat for 2 More Users
- Test User 2 (ladies)
- Test User 3 (gents)

---

## Test 2: Get Unique Links

### Step 2.1: Generate Links for All 3 Users
1. In settings.html, find each test user in the people list
2. Click the 🔗 icon next to each user
3. ✅ **Expected**: Modal appears with unique link
4. Copy each link to a text file for later use

**Example link format:**
```
http://localhost:3000/availability.html?link=uAI3a1Ku9YXUXkNaU5Jq2RhbkfUevsAz
```

---

## Test 3: Submit Availability via Unique Links

### Step 3.1: Test Link 1
1. Open the first unique link in a NEW INCOGNITO WINDOW
2. ✅ **Expected**: Page shows "Welcome, Test User 1"
3. Select current month (should show October or November 2025)
4. Click on several dates to mark as available (turn green)
5. Click "Submit Availability"
6. ✅ **Expected**: Success message appears

### Step 3.2: Test Link 2 & 3
Repeat Step 3.1 for the other two users

---

## Test 4: Verify Availability Shows in Admin Panel

### Step 4.1: Check via API (Browser Console)
1. Open http://localhost:3000/index.html (admin panel)
2. Open browser console (F12)
3. Run this command:
```javascript
fetch('http://localhost:3001/api/availability/month/2025-11', {
  headers: {
    'Authorization': 'Bearer ' + document.cookie.split('mandli_token=')[1].split(';')[0]
  }
})
.then(r => r.json())
.then(d => console.log('Availability submissions:', d))
```
4. ✅ **Expected**: Should see availability data for all 3 users

### Step 4.2: Check Availability Status
```javascript
fetch('http://localhost:3001/api/availability/status/2025-11', {
  headers: {
    'Authorization': 'Bearer ' + document.cookie.split('mandli_token=')[1].split(';')[0]
  }
})
.then(r => r.json())
.then(d => console.log('Availability status:', d))
```
5. ✅ **Expected**: Shows which users have submitted availability

---

## Test 5: Google Calendar Auth Flow

### Step 5.1: Get Calendar Auth Link
1. In admin panel, go to settings.html
2. Find a user and click their 🔗 icon
3. The link format for calendar connection is:
```
http://localhost:3000/calendar-auth.html?userId=<user_id>
```

### Step 5.2: Test Google OAuth Flow
1. Open the calendar auth link
2. Click "Connect Google Calendar"
3. ✅ **Expected**: Redirects to Google OAuth consent screen
4. ✅ **Expected**: After authorization, adds calendar events for the user

**Note**: This requires Google Calendar API credentials to be configured in backend.

---

## Test 6: Email Notifications (TODO - Not Implemented Yet)

### Current Status
❌ The email notification endpoint does NOT exist yet.

### To Implement:
Need to create `POST /api/users/send-notifications` endpoint that:
1. Gets all active users
2. Generates unique links for each
3. Sends emails with links to submit availability

### Recommended Email Service:
- SendGrid (free tier: 100 emails/day)
- Mailgun
- Nodemailer with SMTP

---

## Quick Verification Script

Run this script to verify all features programmatically:

```bash
cd backend
node scripts/test-all-features.js
```

This will:
1. ✅ Test admin login
2. ✅ Create 3 test users
3. ✅ Generate unique links
4. ✅ Test link authentication
5. ✅ Submit availability
6. ✅ Verify availability in database
7. ⚠️  Check email endpoint (shows as not implemented)

---

## Troubleshooting

### Issue: Link doesn't work
- Check that backend is running on port 3001
- Check that the link token is valid
- Verify user is active in database

### Issue: Availability not showing
- Check browser console for errors
- Verify API call succeeded
- Check backend logs for errors

### Issue: Google auth fails
- Verify Google Calendar API credentials are set
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Ensure redirect URI is whitelisted in Google Console

---

## Summary Checklist

- [ ] Admin can login
- [ ] Admin can add users
- [ ] Unique links are generated
- [ ] Link 1 works - user can submit availability
- [ ] Link 2 works - user can submit availability
- [ ] Link 3 works - user can submit availability
- [ ] Availability shows in admin panel (via API)
- [ ] Google Calendar auth redirect works
- [ ] Email notifications (needs implementation)

