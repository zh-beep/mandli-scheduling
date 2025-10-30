# Railway Deployment CORS Fix

## Critical Issue
Railway is not accepting requests from Vercel deployment (https://mandli-scheduling.vercel.app) due to CORS configuration.

## Immediate Fix Required
You need to manually update Railway environment variables:

### Steps to Fix:
1. Go to https://railway.app/dashboard
2. Open your `mandli-production` project
3. Click on the backend service
4. Go to Variables tab
5. Add this environment variable:
   ```
   ALLOWED_ORIGINS=https://mandli-scheduling.vercel.app,http://localhost:8080,http://localhost:3000
   ```
6. Railway should automatically redeploy

### Alternative: Manual Deployment
If Railway isn't auto-deploying from GitHub:
1. In Railway dashboard, go to Settings
2. Check if GitHub repo is connected to `zh-beep/mandli-scheduling`
3. Ensure "Deploy on push" is enabled
4. If not working, manually trigger deployment

## Testing Deployment
Run this command to test CORS:
```bash
node scripts/test-deployment.js
```

## Environment Variables on Railway
Make sure these are set:
- `NODE_ENV=production`
- `FRONTEND_URL=https://mandli-scheduling.vercel.app`
- `ALLOWED_ORIGINS=https://mandli-scheduling.vercel.app,http://localhost:8080,http://localhost:3000`
- `GOOGLE_REDIRECT_URI=https://mandli-production.up.railway.app/api/calendar/callback`
- All Supabase keys (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)
- JWT_SECRET
- Google OAuth credentials

## Current Status
- Frontend on Vercel: ✅ Deployed and working
- Backend on Railway: ⚠️ Deployed but CORS blocking Vercel
- Solution: Add ALLOWED_ORIGINS environment variable on Railway

## Verification
Once fixed, you should be able to:
1. Login at https://mandli-scheduling.vercel.app/login.html
2. Use username: `mandli` password: `Mandli8`
3. Access the admin dashboard