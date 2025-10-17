// Current month state
let currentDate = new Date();
let availabilityData = {}; // Format: { '2025-10-15': true, '2025-10-16': false, ... }
let currentUserName = 'Guest User'; // In production, this would come from auth
let currentUserId = null; // Unique ID from URL

// Swipe/drag selection state
let isMouseDown = false;
let dragMode = null; // 'available' or 'unavailable'

// PBS Days (placeholder - should match actual PBS schedule)
const pbsDays = {
    '2025-10-19': true, // Example PBS day
    '2025-10-26': true  // Example PBS day
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromURL();
    loadUserInfo();
    renderCalendar();
    attachEventListeners();
    loadSavedAvailability();
});

// Load user from URL parameter
function loadUserFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    currentUserId = urlParams.get('id');

    if (currentUserId) {
        // In production, fetch user details from backend using the ID
        // For now, use the ID to set the username
        currentUserName = urlParams.get('name') || `User ${currentUserId}`;
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

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
        const isPBS = pbsDays[dateStr] || false;
        const isAvailable = availabilityData[dateStr] === true;
        const isUnavailable = availabilityData[dateStr] === false;

        let classes = 'calendar-day selectable';
        if (isPBS) classes += ' pbs-day';
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
                 onclick="toggleAvailability('${dateStr}')">
                <div class="date-number">${day}</div>
                ${isPBS ? '<div class="pbs-indicator">PBS</div>' : ''}
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

// Toggle availability for a specific date
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
