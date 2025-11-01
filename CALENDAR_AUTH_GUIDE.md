# Google Calendar Authorization Guide

## 📅 New Feature: Email-Based Calendar Connection

I've created a new page where users can connect their Google Calendar by just entering their email address.

### **Link to Share:**
```
https://mandli-scheduling.vercel.app/connect-calendar.html
```

### **How It Works:**

1. **User visits the link** → Sees a form asking for their email
2. **User enters email** → e.g., `user@example.com`
3. **User clicks "Connect Google Calendar"** → Backend creates/finds user account
4. **Redirects to Google** → User sees Google OAuth consent screen
5. **User authorizes** → Grants calendar access
6. **Success!** → User calendar is now connected

### **What Happens After Authorization:**

- User's access tokens are stored in database (`gmail_sender` table)
- You can now add calendar events directly to their Google Calendar
- Events will automatically appear in their calendar with reminders

---

## 🔗 **Two Ways to Connect:**

### **Method 1: Email-Based (NEW)** ✅
**Link:** `https://mandli-scheduling.vercel.app/connect-calendar.html`

- User enters their email
- If user doesn't exist, account is auto-created
- Then redirects to Google OAuth

**You can also pre-fill email:**
```
https://mandli-scheduling.vercel.app/connect-calendar.html?email=user@example.com
```

### **Method 2: User ID-Based (Existing)**
**Link:** `https://mandli-scheduling.vercel.app/calendar-auth.html?userId=<USER_ID>`

- Requires you to know the user's ID from database
- Used when user already exists in system

---

## 📧 **Adding Events to User Calendars**

Once a user has authorized, you can add events using the API:

### **API Endpoint:**
```
POST https://mandli-production.up.railway.app/api/calendar/send-invite
```

### **Request:**
```json
{
  "userId": "user-id-from-database",
  "title": "Mandli Duty - Morning Shift",
  "description": "Your duty assignment for today",
  "startDateTime": "2025-11-01T06:00:00",
  "endDateTime": "2025-11-01T12:00:00",
  "timeZone": "America/New_York"
}
```

### **Response:**
```json
{
  "success": true,
  "message": "Calendar event created for John Smith",
  "event": {
    "id": "event-id-from-google",
    "title": "Mandli Duty - Morning Shift",
    "start": "2025-11-01T06:00:00-04:00",
    "end": "2025-11-01T12:00:00-04:00",
    "htmlLink": "https://calendar.google.com/event?eid=..."
  }
}
```

---

## 🧪 **Testing the Flow**

### **Step 1: Deploy the New Page**
The file `connect-calendar.html` has been created. To deploy it:

```bash
# Add the new file
git add connect-calendar.html

# Commit
git commit -m "feat: Add email-based calendar connection page"

# Push to GitHub (Vercel will auto-deploy)
git push origin main
```

### **Step 2: Test the Connection Flow**

1. Open: https://mandli-scheduling.vercel.app/connect-calendar.html
2. Enter your email (e.g., `ai@ferociter.co`)
3. Click "Connect Google Calendar"
4. You'll be redirected to Google
5. Sign in and authorize
6. You'll see "Calendar Connected!" success page

### **Step 3: Verify Authorization**

Check if user is connected:
```bash
curl https://mandli-production.up.railway.app/api/calendar/status/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 🔄 **Complete Workflow**

### **Onboarding New Users:**

1. **Send them the calendar connection link:**
   ```
   https://mandli-scheduling.vercel.app/connect-calendar.html?email=user@example.com
   ```

2. **They authorize their calendar** (one-time setup)

3. **You assign them duties** (via admin panel)

4. **System automatically adds events to their calendar** (via API)

### **Monthly Schedule Distribution:**

```javascript
// Pseudo-code for your workflow
async function distributeMonthlySchedule(month) {
  // 1. Get all assignments for the month
  const assignments = await getAssignments(month);

  // 2. For each assignment
  for (const assignment of assignments) {
    // 3. Check if user has authorized calendar
    const isConnected = await checkCalendarStatus(assignment.userId);

    if (isConnected) {
      // 4. Add event to their calendar
      await sendCalendarInvite({
        userId: assignment.userId,
        title: `Mandli Duty - ${assignment.shift}`,
        startDateTime: `${assignment.date}T${assignment.startTime}`,
        endDateTime: `${assignment.date}T${assignment.endTime}`
      });
    } else {
      // 5. Send email reminder to connect calendar
      await sendEmailReminder(assignment.userEmail);
    }
  }
}
```

---

## 📋 **Summary**

### **What's Working:**
- ✅ Email-based calendar connection page (needs deployment)
- ✅ Google OAuth flow
- ✅ Token storage in database
- ✅ API to add events to user calendars
- ✅ Automatic token refresh

### **To Deploy:**
```bash
git add connect-calendar.html CALENDAR_AUTH_GUIDE.md
git commit -m "feat: Add email-based calendar connection"
git push origin main
```

### **Links to Share:**
- **Connect Calendar:** https://mandli-scheduling.vercel.app/connect-calendar.html
- **With Email Pre-filled:** https://mandli-scheduling.vercel.app/connect-calendar.html?email=user@example.com

---

## 🚀 **Next Steps:**

1. Deploy the new file to Vercel (push to GitHub)
2. Test the flow with your own email
3. Integrate calendar invites into your scheduling workflow
4. (Optional) Add email notifications for users who haven't connected

