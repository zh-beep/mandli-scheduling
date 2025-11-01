# Mandli Scheduling App (2025-10-15)

## Project Overview
Lightweight web application for managing monthly duty schedules among team members ("Mandlis") and administrators. Built as a single-page application demonstrating the PRD concept for client presentation.

### Project Location
- **Directory**: `/Users/zanirhabib/dev/mandli/`
- **Running at**: http://localhost:3000
- **Status**: Development server active with npm/http-server

### Features Implemented

#### 1. Calendar View
- Full monthly calendar grid with 7-day week layout
- Each day shows 3 duty shifts:
  - 🌅 Morning (6 AM - 12 PM)
  - ☀️ Afternoon (12 PM - 6 PM)
  - 🌙 Evening (6 PM - 12 AM)
- Color-coded badges for each team member
- Visual indicators for unassigned slots
- Today's date highlighted with blue circle

#### 2. List View
- Alternative view showing duties in chronological list
- Easy to scan daily assignments
- Toggle between Calendar and List views
- Color-coded person badges

#### 3. Admin Interface
- "Admin" indicator in top-right corner
- Statistics Dashboard showing:
  - Total Duties count
  - Assigned Duties count
  - Active Mandlis (unique team members)
  - Coverage percentage
- Month navigation (previous/next arrows)
- Export to CSV functionality
- "Approve & Send Invites" simulation

#### 4. Visual Design
- Professional gradient header (blue to purple)
- 12 unique colors for different team members
- Responsive design (mobile/tablet/desktop)
- Clean, modern interface with shadows and hover effects
- Dynamic legend showing all active Mandlis

### Test Data Configuration

#### Team Members (12 people with unique colors)
- Ahmed Khan (#FF6B6B)
- Sarah Johnson (#4ECDC4)
- Raj Patel (#45B7D1)
- Maria Garcia (#96CEB4)
- David Chen (#FFEAA7)
- Emily Wilson (#DDA0DD)
- Fatima Al-Rashid (#FFB6C1)
- John Smith (#98D8C8)
- Priya Sharma (#B19CD9)
- Michael Brown (#87CEEB)
- Aisha Malik (#F4A460)
- Carlos Rodriguez (#90EE90)

#### Sample Data Coverage
- **January 2025**: Full month, 85% coverage
- **February 2025**: Complete month with gaps
- **March 2025**: Partially scheduled (10 days)
- **October 2025**: Current month, high coverage
- **November 2025**: 75% coverage
- **December 2025**: Holiday season, 65% coverage

#### Realistic Scenarios
- Holidays with no coverage (New Year's, Christmas)
- Weekend reduced coverage patterns
- Intentional gaps demonstrating unassigned handling
- Various coverage levels (65%-85%)

### Technical Implementation

#### File Structure
```
/mandli/
├── index.html          # Main HTML with admin indicator
├── styles.css          # Styling with person colors
├── script.js           # Core logic and rendering
├── test-data.js        # Comprehensive sample data
├── package.json        # NPM configuration
└── node_modules/       # Dependencies
```

#### Technologies Used
- Pure JavaScript (no framework)
- CSS3 with CSS variables
- HTML5 semantic markup
- NPM with http-server
- CSV export functionality

#### Key Functions
- `renderCalendarView()` - Generates calendar grid
- `renderListView()` - Generates list display
- `toggleView()` - Switches between views
- `calculateStats()` - Computes coverage metrics
- `exportSchedule()` - CSV download
- `generateLegend()` - Dynamic person legend

### Running the Application
```bash
cd /Users/zanirhabib/dev/mandli
npm start  # Starts server on port 3000, opens browser
# OR
npm run dev  # Starts server without auto-open
```

### Deployment Process (CRITICAL - READ THIS)

#### 🏗️ Architecture
- **Single GitHub Repository**: `zh-beep/mandli-scheduling`
- **Frontend Files**: Root directory (`*.html`, `*.css`, `*.js`)
- **Backend Files**: `/backend` folder (Node.js API)

#### 🎨 Frontend (Vercel) - Auto-Deploy ✅
- **URL**: https://mandli-scheduling.vercel.app
- **Auto-deploy**: Connected to GitHub repo `zh-beep/mandli-scheduling`
- **Trigger**: Automatic deployment on push to `main` branch
- **Deploys**: Only root files (ignores `/backend` folder)
```bash
# Frontend deployment (automatic)
git add .
git commit -m "feat: Frontend changes"
git push origin main
# Vercel deploys in 1-2 minutes
```

#### 🔧 Backend (Railway) - Manual Deploy ⚠️
- **URL**: https://mandli-production.up.railway.app
- **Method**: Railway CLI **ONLY** (NO auto-deploy)
- **Location**: `/opt/homebrew/bin/railway`
```bash
# Backend deployment (manual)
cd backend
railway up  # Deploy when YOU decide
```

**⚠️ DEPLOYMENT RULES:**
1. Backend NEVER auto-deploys
2. Test backend locally BEFORE `railway up`
3. Frontend = deploy anytime (safe)
4. Backend = deploy carefully (can break app)

#### 📋 Workflow
```bash
# Daily workflow
git add .
git commit -m "changes"
git push              # Frontend auto-deploys

# When backend is ready
cd backend
railway up           # Manual backend deploy
```

### Client Demo Points
1. **Visual Appeal**: Professional design with gradient header and color coding
2. **Data Visualization**: Calendar clearly shows coverage gaps
3. **Admin Controls**: Statistics and approval workflow
4. **Flexibility**: Toggle between calendar/list views
5. **Export Capability**: Download schedules as CSV
6. **Responsive**: Works on all device sizes
7. **Realistic Data**: Shows various coverage scenarios

---

## Backend Integration Tests

### Overview
Comprehensive integration tests covering end-to-end workflows from user availability submission through scheduling algorithm to admin assignment views.

### Test Suite Location
- **File**: `backend/src/__tests__/integration/workflow.test.js`
- **Config**: `backend/jest.config.js`
- **Framework**: Jest with 30s timeout for integration tests

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run integration tests only
npm test -- workflow.test.js

# Run with coverage report
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

### Test Coverage (3 Tests - All Passing ✅)

#### Test 1: User Availability → Scheduling → Admin View
**Workflow:**
1. User accesses unique link
2. User submits availability for specific days (1, 5, 10, 15, 20, 25)
3. Admin runs scheduling algorithm (`generateMonthlySchedule()`)
4. System applies schedule to database (`applySchedule()`)
5. Admin views schedule and sees user's assignments
6. Verifies user only assigned to available days

**Validates:**
- Unique link authentication works
- Availability submission saves to database
- Scheduling algorithm respects availability
- Assignments appear in admin portal
- Users only assigned to days they're available

#### Test 2: Remove User → Reassign
**Workflow:**
1. Generate initial schedule with user assignments
2. Admin removes user from specific day (day 10)
3. Verify assignment deleted from database
4. Reassign same user to same day
5. Confirm no duplicate assignments exist

**Validates:**
- Assignment deletion works correctly
- Users can be reassigned to previously removed days
- No duplicate assignments created
- Database constraints working properly

#### Test 3: Availability Constraints
**Workflow:**
1. User submits limited availability (days 1, 15, 30 only)
2. Run scheduling algorithm with multiple users
3. Verify ALL assignments only on available days

**Validates:**
- Scheduling algorithm strictly respects availability
- No assignments on unavailable days
- Load balancing works within constraints

### Test Database Setup
- **Database**: Supabase (real database, not mocked)
- **Cleanup**: Automatic cleanup after each test
- **Test Users**: Creates 4 test users (2 gents, 2 ladies)
- **Test Month**: 2025-11 (November 2025)
- **Isolation**: Each test independent and idempotent

### Code Coverage
- **Overall**: 90.69% of matching.js service
- **Lines**: 90.24%
- **Branches**: 78.94%
- **Functions**: 100%

### Key Test Functions

```javascript
// Helper: Clean up test data
cleanupTestData(testUserIds, testMonth)

// Setup: Create test users before each test
beforeEach() → Creates 4 users with unique links

// Teardown: Remove test data after each test
afterEach() → Cleans schedules, availability, users
```

### Test Data Structure

**Test Users Created:**
```javascript
[
  { name: 'Test User Gents 1', gender: 'gents', unique_link: 'test-gents-1-unique-link' },
  { name: 'Test User Gents 2', gender: 'gents', unique_link: 'test-gents-2-unique-link' },
  { name: 'Test User Ladies 1', gender: 'ladies', unique_link: 'test-ladies-1-unique-link' },
  { name: 'Test User Ladies 2', gender: 'ladies', unique_link: 'test-ladies-2-unique-link' }
]
```

### Continuous Integration
- Tests run automatically on push to main branch
- Railway deployment includes test verification
- All tests must pass before deployment

### Future Test Ideas
- [ ] Test scheduling algorithm with insufficient availability
- [ ] Test handling of conflicting assignments
- [ ] Test gender-based slot assignments
- [ ] Test load balancing across users
- [ ] Test calendar view API endpoints
- [ ] Test notification system (when implemented)
