# Deploy Backend to Railway via CLI

Railway's GitHub auto-deploy isn't picking up the changes. You need to deploy manually using Railway CLI.

## Steps to Deploy

### 1. Open Terminal in Backend Directory
```bash
cd /Users/zanirhabib/dev/mandli/backend
```

### 2. Login to Railway (if not already logged in)
```bash
railway login
```
This will open a browser for authentication.

### 3. Link to Your Project
```bash
railway link
```
Select your `mandli-production` project when prompted.

### 4. Deploy to Railway
```bash
railway up
```

This will:
- Build your backend
- Deploy to Railway
- Pick up the availability API fix (`created_at` → `submitted_at`)

### 5. Verify Deployment
After deployment completes, test the API:
```bash
cd ..
node backend/scripts/test-vercel-login.js
```

You should see:
- ✅ Admin login works
- ✅ Users API works
- ✅ Availability API works (no more 500 error!)

## Alternative: Deploy via Railway Dashboard

If CLI doesn't work:
1. Go to https://railway.app/dashboard
2. Select `mandli-production` project
3. Click backend service
4. Go to **Deployments** tab
5. Click **Deploy** button or **Redeploy Latest**

## What This Fixes

The availability API endpoint `/api/availability/month/2025-10` will start working, which enables:
- ✅ Admin can view submitted availability
- ✅ Duty assignment can filter by available users
- ✅ Complete end-to-end flow works

## Current Status

**Frontend (Vercel):**
- ✅ Already auto-deploys from GitHub
- ✅ Navigation tabs now hidden for user links
- ✅ Users only see availability form

**Backend (Railway):**
- ⏳ Needs manual deployment
- Has the fix but hasn't deployed yet
- Waiting for `railway up` command