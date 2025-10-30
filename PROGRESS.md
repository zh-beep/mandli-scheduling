# Mandli Scheduling System - Implementation Progress

## Current Status: Phase 1 - Database & Backend Structure (In Progress)

Last updated: 2025-10-29

---

## ✅ Completed

### 1. Database Schema Created
- **File**: `database/schema.sql`
- **Tables Created**:
  - `admins` - Admin accounts (username: mandli, password: Mandli8)
  - `users` - Team members with gender field (gents/ladies)
  - `availability` - Monthly availability (just available days)
  - `schedules` - 8 slots per day (2 Early Gents, 2 Early Ladies, 2 Late Gents, 2 Late Ladies)
  - `invites_sent` - Calendar invite tracking
  - `alerts` - Dashboard warnings
  - `gmail_sender` - OAuth token storage
- **Views Created**:
  - `schedule_details` - Schedule with user info
  - `user_availability_status` - Who has/hasn't filled
  - `monthly_coverage` - Coverage percentage
- **Features**:
  - RLS enabled
  - Indexes for performance
  - Triggers for auto-updating timestamps

### 2. Seed Data Created
- **File**: `database/seed.sql`
- **Contains**:
  - Admin account (mandli/Mandli8 - hashed)
  - 10 test users (5 gents, 5 ladies)
  - Sample availability for January 2025
  - Sample schedules for first 3 days
  - Sample alerts (missing slots, no availability)

### 3. Backend Structure Created
- **Directory**: `backend/`
- **Files Created**:
  - `package.json` - Dependencies
  - `.env.example` - Template
  - `.env` - Local config (needs Supabase keys)
  - `src/config/index.js` - Config loader
  - `src/config/supabase.js` - Supabase clients

---

## 🚧 Next Steps (Resume Here)

### Immediate Tasks:
1. **Apply Database Schema**
   - Run SQL in Supabase Dashboard → SQL Editor
   - Or use Supabase CLI: `supabase db push`

2. **Get Supabase API Keys**
   - Go to Supabase Dashboard → Settings → API
   - Copy `anon/public` key
   - Copy `service_role` key
   - Update `backend/.env`

3. **Continue Backend Implementation**
   - Create middleware/auth.js
   - Create routes/auth.js (admin login)
   - Create routes/users.js (user management)
   - Create routes/availability.js (public form)
   - Create routes/schedules.js (assignments)
   - Create routes/alerts.js
   - Create routes/gmail.js (OAuth)
   - Create services/assignment.js (algorithm)
   - Create services/emailer.js (Gmail)
   - Create cron jobs
   - Create server.js

---

## 📁 Current File Structure

```
mandli/
├── database/
│   ├── schema.sql          ✅ Complete
│   └── seed.sql            ✅ Complete
├── scripts/
│   └── setup-database.sh   ✅ Complete
└── backend/
    ├── package.json        ✅ Complete
    ├── .env.example        ✅ Complete
    ├── .env                ⚠️  Needs Supabase keys
    └── src/
        └── config/
            ├── index.js    ✅ Complete
            └── supabase.js ✅ Complete
```

---

## 🔑 Required Credentials (To Do)

### Supabase (Urgent)
- [ ] Project URL: `https://wfywbiryulnopmkwtixg.supabase.co` ✅
- [ ] Anon Key: Get from dashboard
- [ ] Service Key: Get from dashboard

### Google OAuth (Later)
- [ ] Client ID
- [ ] Client Secret
- [ ] Redirect URI configured

---

## 📋 Implementation Plan (6 Weeks)

### Week 1: Foundation ✅ (Current)
- [x] Database schema
- [x] Seed data
- [x] Backend structure
- [ ] Authentication endpoints
- [ ] User management endpoints
- [ ] Availability endpoints

### Week 2: Core Features
- [ ] Assignment algorithm
- [ ] Gmail OAuth integration
- [ ] Schedule management

### Week 3: Automation
- [ ] Cron jobs (reminders, alerts)
- [ ] Admin dashboard updates
- [ ] Alerts system

### Week 4: Frontend
- [ ] Login page
- [ ] Weekly calendar (8 rows)
- [ ] Monthly overview
- [ ] User management page
- [ ] Availability form
- [ ] Settings page

### Week 5: Deployment
- [ ] Railway deployment
- [ ] Environment setup
- [ ] Domain configuration

### Week 6: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual QA

---

## 🎯 Key Design Decisions

1. **8 Slots Per Day**
   - Early Paat (Gents) x2
   - Early Paat (Ladies) x2
   - Late Paat (Gents) x2
   - Late Paat (Ladies) x2

2. **Availability Simplified**
   - Users only select available days (1-31)
   - System decides early vs late
   - Fair distribution algorithm

3. **Authentication**
   - Admin: Username/password (mandli/Mandli8)
   - Users: Unique links (no login needed)
   - Gmail: OAuth (designated sender)

4. **Calendar Invites**
   - Just say "Early Paat" or "Late Paat"
   - No "Morning Shift" terminology
   - Sent via authenticated Gmail account

---

## 🐛 Issues to Fix

1. **MCP Configuration** (Current Issue)
   - Supabase MCP server not loading
   - Need to restart Claude Code
   - Configuration exists in `.claude.json`

---

## 📝 Notes

- Admin password: Mandli8 (bcrypt hash in seed.sql)
- Project ID: wfywbiryulnopmkwtixg
- Access token: sbp_4ad1e226d3ca8cad7b0ac93ee486b2bd74548bf8
- All times in UTC (adjust timezone as needed)

---

## 🚀 Quick Start (After Setup)

```bash
# 1. Apply database schema
# Go to Supabase Dashboard → SQL Editor
# Copy contents of database/schema.sql and run

# 2. Seed data
# Copy contents of database/seed.sql and run

# 3. Update .env with Supabase keys
cd backend
nano .env

# 4. Install dependencies
npm install

# 5. Start server
npm run dev

# 6. Visit
# http://localhost:3001/health
```

---

## 📧 Contact

For questions or issues, refer to the complete plan in the conversation history.
