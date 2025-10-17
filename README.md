# Mandli Scheduling System

A web-based scheduling application for managing duty assignments with availability tracking.

## Features

- **Weekly Schedule View**: 8 duty types × 7 days grid
- **Admin Settings**: Manage people list with emails
- **Availability Form**: Drag-to-select multiple dates
- **Unique Links**: Personal availability links for each person
- **Mobile Friendly**: Responsive design for all devices

## Local Development

```bash
npm install
npm start
```

Visit http://localhost:3000

## Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: mandli-scheduling
# - Directory: ./
# - Override settings: No
```

### Option 2: Using GitHub

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Option 3: Direct Upload

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Click "Upload Files"
4. Drag and drop all files (or upload the folder)
5. Click "Deploy"

## After Deployment

Your app will be available at:
- `https://your-project-name.vercel.app`

### Important URLs:

- Main Schedule: `https://your-project-name.vercel.app/`
- Settings: `https://your-project-name.vercel.app/settings.html`
- Availability Form: `https://your-project-name.vercel.app/availability.html`

### Generating Personal Links:

1. Go to Settings page
2. Click "Generate Availability Links"
3. Links will be copied to clipboard
4. Send each person their unique link

Example link format:
```
https://your-project-name.vercel.app/availability.html?id=UNIQUE_ID&name=Person_Name
```

## Data Storage

Currently uses localStorage (browser storage). For production, consider:
- Adding a database (Supabase, Firebase, MongoDB)
- Implementing authentication
- Adding email notifications

## Files Structure

```
mandli/
├── index.html          # Main schedule page
├── settings.html       # Admin settings
├── availability.html   # Availability form
├── script.js          # Main logic
├── settings.js        # Settings logic
├── availability.js    # Availability form logic
├── test-data.js       # Sample data
├── styles.css         # All styles
├── package.json       # Dependencies
├── vercel.json        # Vercel config
└── README.md          # This file
```

## Environment Variables (Future)

For production with backend:
- `DATABASE_URL` - Database connection
- `EMAIL_API_KEY` - Email service API key
- `AUTH_SECRET` - Authentication secret

## License

MIT