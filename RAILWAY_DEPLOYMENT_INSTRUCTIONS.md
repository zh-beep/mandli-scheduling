# Railway Deployment Instructions

## Current Status

✅ Environment variable `ALLOWED_ORIGINS` has been set to:
```
https://mandli-scheduling.vercel.app,http://localhost:8080,http://localhost:3000
```

⚠️ Railway deployment needs to restart to pick up the new environment variable.

## How to Trigger Railway Redeployment

### Option 1: Restart from Railway Dashboard (Recommended)
1. Go to https://railway.app/dashboard
2. Select your `mandli-production` project
3. Click on the backend service
4. Go to **Settings** tab
5. Scroll down to **Service Settings**
6. Click **Restart** or **Redeploy**

### Option 2: Force Push a Commit
```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "Trigger Railway redeployment for CORS config"
git push origin main
```

### Option 3: Use Railway CLI
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Restart the service
railway restart
```

## Verification After Redeployment

Once Railway has redeployed, run this test to verify:

```bash
cd backend
node scripts/test-vercel-deployment.js
```

You should see:
- ✅ Admin Login via Railway Backend
- ✅ Test Availability API with Admin Token
- ✅ Test User Availability Link
- ✅ Test CORS Headers (showing Vercel origin)

## What the CORS Configuration Does

The backend `src/server.js` is configured to allow:

1. **Specific origins from ALLOWED_ORIGINS env var**:
   - `https://mandli-scheduling.vercel.app`
   - `http://localhost:8080`
   - `http://localhost:3000`

2. **Plus automatic regex patterns**:
   - Any subdomain on `.vercel.app` → `/^https:\/\/.*\.vercel\.app$/`
   - Any Vercel deployment with "mandli" → `/^https:\/\/mandli.*\.vercel\.app$/`

3. **Frontend URL from FRONTEND_URL env var**

This means even if you deploy to a new Vercel preview URL like `mandli-scheduling-abc123.vercel.app`, it will automatically be allowed due to the regex patterns.

## Current Railway Configuration

Based on the test output, Railway is currently responding with:
```
Access-Control-Allow-Origin: http://localhost:3000
```

This indicates it's still using the old FRONTEND_URL value and hasn't picked up the ALLOWED_ORIGINS yet.

## Expected Behavior After Restart

After Railway restarts, requests from Vercel should receive:
```
Access-Control-Allow-Origin: https://mandli-scheduling.vercel.app
```

And all API calls from the Vercel frontend will work correctly.