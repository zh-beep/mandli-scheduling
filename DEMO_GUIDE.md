# Mandli Scheduling App - Demo Guide

## Live Demo URLs
- **Frontend**: https://mandli-scheduling.vercel.app
- **Admin Login**: https://mandli-scheduling.vercel.app/login.html
  - Username: `mandli`
  - Password: `Mandli8`

## Demo Flow

### 1️⃣ **Admin Dashboard Overview**
1. **Login as Admin**: https://mandli-scheduling.vercel.app/login.html
2. **Show Calendar View**:
   - Monthly grid with 8 duty slots per day
   - Color-coded assignments by person
   - Toggle between Calendar/List views
3. **Show Statistics**:
   - Total coverage percentage
   - Assignments by user
   - Empty slots tracking

### 2️⃣ **User Management - Add/Remove Users**
1. **Navigate to Settings**: Click "Settings" button
2. **Add New User**:
   ```
   Name: Demo User
   Email: demo@example.com
   Gender: Gents/Ladies
   ```
   - Click "Add Person"
   - System generates unique availability link
   - Copy the link for testing

3. **Show User List**:
   - All active users displayed
   - Unique links for each user
   - Delete button for each user

4. **Delete User Demo**:
   - Delete a user who has assignments
   - **AUTOMATIC**: Schedule regenerates
   - Duties redistributed to remaining users
   - No manual intervention needed!

### 3️⃣ **Availability Submission Flow**
1. **User Receives Link**:
   ```
   https://mandli-scheduling.vercel.app/availability.html?link=UNIQUE_CODE
   ```

2. **User Submits Availability**:
   - Opens link in browser
   - Sees personalized greeting
   - Clicks available dates on calendar
   - Submits availability

3. **Incremental Scheduling** (NEW!):
   - When FIRST user submits → Full schedule generation
   - When NEW user submits → Only fills empty slots
   - Existing assignments preserved
   - No disruption to current schedule

### 4️⃣ **Google Calendar Integration**
1. **Calendar Connection Portal**:
   ```
   https://mandli-scheduling.vercel.app/connect-calendar.html
   ```

2. **Connection Flow**:
   - User enters email
   - Clicks "Connect Google Calendar"
   - Authorizes via Google OAuth
   - Tokens stored securely

3. **Automatic Calendar Updates**:
   - When schedule is finalized
   - System sends calendar invites
   - Events appear in user's Google Calendar
   - With reminders and notifications

### 5️⃣ **Advanced Scheduling Algorithm**

#### **Initial Setup** (Month starts empty)
```javascript
// First 4 users submit availability
User 1: Available days 1, 5, 10, 15, 20, 25
User 2: Available days 2, 7, 12, 17, 22, 27
User 3: Available days 3, 8, 13, 18, 23, 28
User 4: Available days 1, 6, 11, 16, 21, 26

// Algorithm runs FULL scheduling
// Optimal distribution across all users
```

#### **New User Joins** (Month has assignments)
```javascript
// New user submits availability
New User: Available all days

// Algorithm runs INCREMENTAL scheduling
// Only assigns to EMPTY slots
// Preserves all existing assignments
```

#### **User Deletion** (Reassignment needed)
```javascript
// Admin deletes User 2

// Algorithm REGENERATES schedule
// User 2's duties redistributed
// Maintains optimal balance
```

### 6️⃣ **Live Test Scenarios**

#### **Scenario A: Add User Without Disruption**
1. Show current schedule with gaps
2. Add new user via Settings
3. User submits availability
4. Only empty slots get filled
5. Existing assignments unchanged

#### **Scenario B: Remove User With Regeneration**
1. Show user with multiple assignments
2. Delete user from Settings
3. Schedule automatically regenerates
4. Duties redistributed fairly

#### **Scenario C: Calendar Integration**
1. User connects calendar
2. Admin finalizes schedule
3. Calendar events automatically created
4. Show event in Google Calendar

### 7️⃣ **API Endpoints for Testing**

```bash
# Admin Login
curl -X POST https://mandli-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "mandli", "password": "Mandli8"}'

# Get Schedule
curl https://mandli-production.up.railway.app/api/schedules/month/2025-11 \
  -H "Authorization: Bearer TOKEN"

# Submit Availability (with unique link)
curl -X POST https://mandli-production.up.railway.app/api/availability \
  -H "x-link-token: UNIQUE_LINK" \
  -H "Content-Type: application/json" \
  -d '{
    "month": "2025-11",
    "available_days": [1, 5, 10, 15, 20, 25]
  }'
```

### 8️⃣ **Key Features to Emphasize**

✅ **Smart Scheduling**:
- First submission → Full optimization
- New users → Incremental assignment
- User deletion → Automatic regeneration

✅ **Self-Service Portal**:
- Users submit via unique links
- No login required
- Mobile-friendly interface

✅ **Calendar Integration**:
- OAuth2 secure connection
- Automatic event creation
- Real-time synchronization

✅ **Admin Control**:
- Full user management
- Schedule overview
- Manual adjustments possible

### 9️⃣ **Demo Script**

**Opening**: "Let me show you how Mandli Scheduling streamlines duty management..."

**Act 1 - Current State**:
1. Login as admin
2. Show existing schedule with gaps
3. Point out coverage statistics

**Act 2 - Add User**:
1. Add new user "Demo Person"
2. Copy their unique link
3. Open link in new tab
4. Submit availability
5. Return to admin - show new assignments
6. **Emphasize**: Only empty slots filled!

**Act 3 - Remove User**:
1. Identify user with assignments
2. Delete user
3. Watch schedule regenerate
4. **Emphasize**: Automatic redistribution!

**Act 4 - Calendar Integration**:
1. Show calendar connection page
2. User connects Google Calendar
3. Finalize schedule
4. Show events in Google Calendar

**Closing**: "Complete automation from availability to calendar - no manual work!"

### 🎯 **Key Talking Points**

1. **Efficiency**: "Reduces scheduling from hours to minutes"
2. **Fairness**: "Algorithm ensures balanced distribution"
3. **Flexibility**: "Add/remove users anytime without disruption"
4. **Integration**: "Direct to Google Calendar - no manual entry"
5. **Accessibility**: "No app install, works on any device"

### 🚀 **Quick Demo Links**

- **Admin Panel**: [Login Here](https://mandli-scheduling.vercel.app/login.html)
- **Calendar Connect**: [Connect Calendar](https://mandli-scheduling.vercel.app/connect-calendar.html)
- **Test Availability Links**:
  - [ABMS](https://mandli-scheduling.vercel.app/availability.html?link=uAI3a1Ku9YXUXkNaU5Jq2RhbkfUevsAz)
  - [Bob Wilson](https://mandli-scheduling.vercel.app/availability.html?link=bgttjxhwidd7u6orlms9)
  - [John Smith](https://mandli-scheduling.vercel.app/availability.html?link=y820iyobykhtj4wh79wck9)

---

## Summary

The Mandli Scheduling App demonstrates:
- **Intelligent scheduling** that adapts to changes
- **User-friendly interfaces** for all participants
- **Seamless integrations** with existing tools
- **Automated workflows** that save time

Perfect for organizations managing rotating duties, shifts, or volunteer schedules!