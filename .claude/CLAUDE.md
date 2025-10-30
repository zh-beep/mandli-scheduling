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

### Client Demo Points
1. **Visual Appeal**: Professional design with gradient header and color coding
2. **Data Visualization**: Calendar clearly shows coverage gaps
3. **Admin Controls**: Statistics and approval workflow
4. **Flexibility**: Toggle between calendar/list views
5. **Export Capability**: Download schedules as CSV
6. **Responsive**: Works on all device sizes
7. **Realistic Data**: Shows various coverage scenarios
