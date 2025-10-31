// Current month state
let currentDate = new Date();
let availabilityData = {}; // Format: { '2025-10-15': true, '2025-10-16': false, ... }
let currentUserName = 'Guest User'; // In production, this would come from auth
let currentUserId = null; // Unique ID from URL

// Swipe/drag selection state
let isMouseDown = false;
let dragMode = null; // 'available' or 'unavailable'

// PBS Days removed - no longer needed

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserFromURL(); // Wait for user info to load
    loadUserInfo();
    renderCalendar();
    attachEventListeners();
    loadSavedAvailability();
});

// API Configuration
const API_BASE_URL = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('mandli')
    ? 'https://mandli-production.up.railway.app/api'
    : 'http://localhost:3001/api';

// Load user from URL parameter
async function loadUserFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkToken = urlParams.get('link');
    const jwtToken = urlParams.get('token');

    // Priority 1: Permanent link token (preferred method)
    if (linkToken) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/by-link/${linkToken}`);

            if (response.ok) {
                const data = await response.json();
                currentUserId = data.user.id;
                currentUserName = data.user.name || 'Guest User';
                console.log('User loaded via permanent link:', currentUserName);
            } else {
                console.error('Invalid link token');
                currentUserName = 'Invalid Link';
            }
        } catch (error) {
            console.error('Error validating link:', error);
            currentUserName = 'Error Loading User';
        }
    }
    // Priority 2: JWT token (temporary links)
    else if (jwtToken) {
        try {
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            currentUserId = payload.userId;
            currentUserName = payload.name || 'Guest User';
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            currentUserName = 'Guest User';
        }
    }
    // Priority 3: Fallback for old URL format with ?id and ?name
    else {
        currentUserId = urlParams.get('id');
        if (currentUserId) {
            currentUserName = urlParams.get('name') || `User ${currentUserId}`;
        }
    }
}

// Load user information
function loadUserInfo() {
    // In production, this would come from authentication
    const saved = localStorage.getItem('current_user_name');
    if (saved && !currentUserId) {
        currentUserName = saved;
    }
    document.getElementById('userNameDisplay').textContent = currentUserName;
}

// Render calendar for current month
function renderCalendar() {
    const calendar = document.getElementById('availabilityCalendar');
    const monthDisplay = document.getElementById('currentMonth');
    const monthDisplayHeader = document.getElementById('monthDisplay');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Format month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = `${monthNames[month]} ${year}`;

    monthDisplay.textContent = monthName;
    monthDisplayHeader.textContent = monthName;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Build calendar HTML
    let html = '<div class="calendar-grid">';

    // Day headers - use single letters on mobile
    const isMobile = window.innerWidth <= 480;
    const dayHeaders = isMobile
        ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const isAvailable = availabilityData[dateStr] === true;
        const isUnavailable = availabilityData[dateStr] === false;

        let classes = 'calendar-day selectable';
        if (isAvailable) classes += ' available';
        if (isUnavailable) classes += ' unavailable';

        // Check if it's today
        const today = new Date();
        const isToday = (year === today.getFullYear() &&
                        month === today.getMonth() &&
                        day === today.getDate());

        if (isToday) classes += ' today';

        html += `
            <div class="${classes}"
                 data-date="${dateStr}"
                 onmousedown="startDragSelection('${dateStr}')"
                 onmouseenter="continueDragSelection('${dateStr}')"
                 onmouseup="endDragSelection()"
                 ontouchstart="handleTouchStart(event, '${dateStr}')"
                 ontouchmove="handleTouchMove(event)"
                 ontouchend="endDragSelection()">
                <div class="date-number">${day}</div>
                ${isAvailable ? '<div class="status-icon">✓</div>' : ''}
                ${isUnavailable ? '<div class="status-icon">✗</div>' : ''}
            </div>
        `;
    }

    html += '</div>';
    calendar.innerHTML = html;
}

// Format date as YYYY-MM-DD
function formatDate(year, month, day) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
}

// Start drag selection
function startDragSelection(dateStr) {
    isMouseDown = true;

    // Determine drag mode based on current state
    if (availabilityData[dateStr] === true) {
        dragMode = 'clear'; // Clear if already available
    } else {
        dragMode = 'available'; // Mark as available
    }

    applyDragToDate(dateStr);
}

// Continue drag selection
function continueDragSelection(dateStr) {
    if (isMouseDown) {
        applyDragToDate(dateStr);
    }
}

// End drag selection
function endDragSelection() {
    isMouseDown = false;
    dragMode = null;
}

// Apply drag mode to a date
function applyDragToDate(dateStr) {
    if (dragMode === 'available') {
        availabilityData[dateStr] = true;
    } else if (dragMode === 'clear') {
        delete availabilityData[dateStr];
    }

    renderCalendar();
}

// Handle touch start for mobile
function handleTouchStart(event, dateStr) {
    event.preventDefault();
    startDragSelection(dateStr);
}

// Handle touch move for mobile
function handleTouchMove(event) {
    if (!isMouseDown) return;

    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.dataset.date) {
        continueDragSelection(element.dataset.date);
    }
}

// Single click/tap to toggle (fallback)
function toggleAvailability(dateStr) {
    if (availabilityData[dateStr] === true) {
        delete availabilityData[dateStr];
    } else {
        availabilityData[dateStr] = true;
    }

    renderCalendar();
}

// Clear all availability selections
function clearAllDates() {
    if (confirm('Are you sure you want to clear all your availability selections?')) {
        availabilityData = {};
        renderCalendar();
    }
}

// Submit availability
function submitAvailability() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = `${monthNames[month]} ${year}`;

    // Count available days
    const availableDays = Object.values(availabilityData).filter(v => v === true).length;

    if (availableDays === 0) {
        alert('⚠️ You haven\'t marked any days as available. Please select at least one date.');
        return;
    }

    // In production, this would send to backend
    saveAvailability();

    alert(`✅ Availability submitted successfully!\n\nYou marked ${availableDays} day(s) as available for ${monthName}.\n\nThe admin will review your availability and assign duties accordingly.`);
}

// Save availability to localStorage
function saveAvailability() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const key = `availability_${currentUserName}_${year}_${month}`;

    localStorage.setItem(key, JSON.stringify(availabilityData));
}

// Load saved availability from localStorage
function loadSavedAvailability() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const key = `availability_${currentUserName}_${year}_${month}`;

    const saved = localStorage.getItem(key);
    if (saved) {
        availabilityData = JSON.parse(saved);
        renderCalendar();
    }
}

// Attach event listeners
function attachEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', previousMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);

    // Global mouse up to end drag selection
    document.addEventListener('mouseup', endDragSelection);
    document.addEventListener('touchend', endDragSelection);

    // Prevent text selection while dragging
    document.addEventListener('selectstart', (e) => {
        if (isMouseDown) e.preventDefault();
    });

    // Redraw calendar on window resize for responsive day headers
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            renderCalendar();
        }, 250);
    });
}

// Navigate to previous month
function previousMonth() {
    saveAvailability(); // Save before changing month
    currentDate.setMonth(currentDate.getMonth() - 1);
    availabilityData = {}; // Reset for new month
    loadSavedAvailability();
    renderCalendar();
}

// Navigate to next month
function nextMonth() {
    saveAvailability(); // Save before changing month
    currentDate.setMonth(currentDate.getMonth() + 1);
    availabilityData = {}; // Reset for new month
    loadSavedAvailability();
    renderCalendar();
}
