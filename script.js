// API Configuration
const API_BASE_URL = 'https://mandli-production.up.railway.app/api';

// Duty types configuration
const dutyTypes = [
    { id: 'ep_g1', name: 'Paat Volunteer - Early Paat (Gents)', shortName: 'Early Paat (G)', color: '#4A90E2', bgColor: '#E3F2FD' },
    { id: 'ep_l1', name: 'Paat Volunteer - Early Paat (Ladies)', shortName: 'Early Paat (L)', color: '#E91E63', bgColor: '#FCE4EC' },
    { id: 'ep_g2', name: 'Paat Volunteer - Early Paat (Gents)', shortName: 'Early Paat (G)', color: '#2196F3', bgColor: '#E1F5FE' },
    { id: 'ep_l2', name: 'Paat Volunteer - Early Paat (Ladies)', shortName: 'Early Paat (L)', color: '#FF4081', bgColor: '#F8BBD0' },
    { id: 'lp_g1', name: 'Paat Volunteer - Late Paat (Gents)', shortName: 'Late Paat (G)', color: '#9C27B0', bgColor: '#F3E5F5' },
    { id: 'lp_l1', name: 'Paat Volunteer - Late Paat (Ladies)', shortName: 'Late Paat (L)', color: '#FF5722', bgColor: '#FBE9E7' },
    { id: 'lp_g2', name: 'Paat Volunteer - Late Paat (Gents)', shortName: 'Late Paat (G)', color: '#673AB7', bgColor: '#EDE7F6' },
    { id: 'lp_l2', name: 'Paat Volunteer - Late Paat (Ladies)', shortName: 'Late Paat (L)', color: '#FF6F00', bgColor: '#FFF3E0' }
];

// Global state
let currentWeekStartDate = getStartOfWeek(new Date());
let currentWeekKey = formatWeekKey(currentWeekStartDate);
let isAdmin = true; // In production, this would come from authentication
let currentEditingCell = null;
let weeklyScheduleData = {}; // Will be populated from API

// People database with emails
let peopleDatabase = {
    'OF MS': { email: 'ofms@example.com', color: { bg: '#E3F2FD', text: '#1976D2' } },
    'OF MM': { email: 'ofmm@example.com', color: { bg: '#E3F2FD', text: '#1976D2' } },
    'OF KS': { email: 'ofks@example.com', color: { bg: '#E3F2FD', text: '#1976D2' } },
    'OF KM': { email: 'ofkm@example.com', color: { bg: '#E3F2FD', text: '#1976D2' } },
    'RJ MS': { email: 'rjms@example.com', color: { bg: '#F3E5F5', text: '#7B1FA2' } },
    'RJ MM': { email: 'rjmm@example.com', color: { bg: '#F3E5F5', text: '#7B1FA2' } },
    'RJ KS': { email: 'rjks@example.com', color: { bg: '#F3E5F5', text: '#7B1FA2' } },
    'RJ KM': { email: 'rjkm@example.com', color: { bg: '#F3E5F5', text: '#7B1FA2' } },
    'CR MS': { email: 'crms@example.com', color: { bg: '#FFF9C4', text: '#F57F17' } },
    'CR MM': { email: 'crmm@example.com', color: { bg: '#FFF9C4', text: '#F57F17' } },
    'BK MM': { email: 'bkmm@example.com', color: { bg: '#FFECB3', text: '#E65100' } },
    'BK KS': { email: 'bkks@example.com', color: { bg: '#FFECB3', text: '#E65100' } },
    'BK KM': { email: 'bkkm@example.com', color: { bg: '#FFECB3', text: '#E65100' } },
    'HPB MM': { email: 'hpbmm@example.com', color: { bg: '#E1F5FE', text: '#0277BD' } },
    'Zyka': { email: 'zyka@example.com', color: { bg: '#FFEBEE', text: '#C62828' } }
};

// DEBUG
console.log('=== SCHEDULE DEBUG v3 ===');
console.log('Today:', new Date().toLocaleDateString());
console.log('Week start:', currentWeekStartDate.toLocaleDateString());
console.log('Week key:', currentWeekKey);
console.log('Available keys:', Object.keys(weeklyScheduleData));
console.log('Data found?', !!weeklyScheduleData[currentWeekKey]);
console.log('Admin mode:', isAdmin);

// DEBUG: Log initial state
console.log('=== MANDLI SCHEDULE DEBUG ===');
console.log('Today:', new Date().toLocaleDateString());
console.log('Current week start date:', currentWeekStartDate.toLocaleDateString());
console.log('Current week key:', currentWeekKey);
console.log('Available week keys:', Object.keys(weeklyScheduleData));
console.log('Week data found:', weeklyScheduleData[currentWeekKey] ? 'YES' : 'NO');

// Get start of week (Sunday) for given date
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.

    // Calculate days to subtract to get to Sunday
    const diff = day; // Simply go back to Sunday (day 0)

    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Format week key (YYYY-MM-DD of week start)
function formatWeekKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
}

// Format short date (MM/DD)
function formatShortDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}

// Get person badge colors for specific initials
function getPersonColor(person) {
    if (!person || person === 'null') return { bg: '#F0F0F0', text: '#999' };

    // Map specific people to colors matching the image
    const colorMap = {
        'OF': { bg: '#E3F2FD', text: '#1976D2' },
        'RJ': { bg: '#F3E5F5', text: '#7B1FA2' },
        'CR': { bg: '#FFF9C4', text: '#F57F17' },
        'BK': { bg: '#FFECB3', text: '#E65100' },
        'HPB': { bg: '#E1F5FE', text: '#0277BD' },
        'Zyka': { bg: '#FFEBEE', text: '#C62828' }
    };

    const prefix = person.split(' ')[0];
    return colorMap[prefix] || { bg: '#E0E0E0', text: '#616161' };
}

// Calculate statistics for the current week
function calculateStats() {
    const weekData = weeklyScheduleData[currentWeekKey];

    if (!weekData) {
        return {
            totalDuties: 0,
            assignedDuties: 0,
            activeMandlis: 0,
            coverageRate: '0%'
        };
    }

    const totalSlots = weekData.days.length * 8; // 8 duty types per day
    let assignedSlots = 0;
    const mandlis = new Set();

    weekData.days.forEach(day => {
        dutyTypes.forEach(dutyType => {
            const assigned = day.assignments[dutyType.id];
            if (assigned) {
                assignedSlots++;
                mandlis.add(assigned);
            }
        });
    });

    const coverageRate = totalSlots > 0 ? Math.round((assignedSlots / totalSlots) * 100) : 0;

    return {
        totalDuties: totalSlots,
        assignedDuties: assignedSlots,
        activeMandlis: mandlis.size,
        coverageRate: `${coverageRate}%`
    };
}

// Update stats display
function updateStats() {
    const stats = calculateStats();

    document.getElementById('totalDuties').textContent = stats.totalDuties;
    document.getElementById('assignedDuties').textContent = stats.assignedDuties;
    document.getElementById('activeMandlis').textContent = stats.activeMandlis;
    document.getElementById('coverageRate').textContent = stats.coverageRate;
}

// Render the weekly view
function renderWeeklyView() {
    const weekData = weeklyScheduleData[currentWeekKey];
    const weekGrid = document.getElementById('weekGrid');

    // Generate week label from date even if no data
    const startDate = currentWeekStartDate;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const weekLabel = `Week of ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    document.getElementById('currentWeek').textContent = weekLabel;

    // If no data, create empty week structure
    if (!weekData) {
        const emptyDays = [];
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(dayDate.getDate() + i);
            emptyDays.push({
                date: dayDate.toISOString().split('T')[0],
                dayName: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
                assignments: {
                    ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null,
                    lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null
                }
            });
        }
        renderGridWithDays(emptyDays);
        return;
    }

    renderGridWithDays(weekData.days);
}

// Render grid with given days data
function renderGridWithDays(days) {
    const weekGrid = document.getElementById('weekGrid');

    // Set grid columns dynamically based on number of days
    const numDays = days.length;
    weekGrid.style.gridTemplateColumns = `150px repeat(${numDays}, 1fr)`;

    let htmlContent = '';

    // Header row with day labels
    htmlContent += '<div class="weekly-header-cell"></div>'; // Empty corner cell

    days.forEach(day => {
        htmlContent += `
            <div class="weekly-header-cell day-header">
                <div class="day-date">${formatShortDate(day.date)}</div>
                <div class="day-name">${day.dayName.substring(0, 3)}</div>
            </div>
        `;
    });

    // Data rows - one for each duty type
    dutyTypes.forEach(dutyType => {
        // Duty type label cell
        htmlContent += `
            <div class="weekly-duty-label" style="border-left: 4px solid ${dutyType.color};">
                <div class="duty-type-name">${dutyType.shortName}</div>
            </div>
        `;

        // Assignment cells for each day
        days.forEach(day => {
            const assigned = day.assignments[dutyType.id];
            const isPBS = day.isPBS;
            const pbsClass = isPBS ? 'pbs-day' : '';

            if (assigned) {
                const colors = getPersonColor(assigned);
                htmlContent += `
                    <div class="weekly-assignment-cell ${pbsClass}" style="background: ${colors.bg};">
                        <div class="cell-content">
                            <div class="duty-type-label" style="color: ${colors.text};">${dutyType.shortName}</div>
                            <div class="person-initials" style="color: ${colors.text};">${assigned}</div>
                        </div>
                    </div>
                `;
            } else {
                htmlContent += `
                    <div class="weekly-assignment-cell empty ${pbsClass}">
                        <div class="cell-content">
                            <div class="duty-type-label-empty">${dutyType.shortName}</div>
                            <div class="person-initials-empty">Open</div>
                        </div>
                    </div>
                `;
            }
        });
    });

    weekGrid.innerHTML = htmlContent;
}

// Update week display
function updateWeekDisplay() {
    currentWeekKey = formatWeekKey(currentWeekStartDate);
    renderWeeklyView();
    updateStats();
    updateLastSent();
}

// Update last sent display
function updateLastSent() {
    const weekData = weeklyScheduleData[currentWeekKey];
    const lastSentEl = document.getElementById('lastSent');

    if (!weekData || !lastSentEl) return;

    if (weekData.lastSent) {
        lastSentEl.textContent = `Last sent: ${weekData.lastSent}`;
        lastSentEl.style.color = '#4CAF50';
    } else {
        lastSentEl.textContent = 'Last sent: Never';
        lastSentEl.style.color = '#999';
    }
}

// Navigate to previous week
function previousWeek() {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    updateWeekDisplay();
}

// Navigate to next week
function nextWeek() {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
    updateWeekDisplay();
}

// Export schedule to CSV
function exportSchedule() {
    const weekData = weeklyScheduleData[currentWeekKey];
    if (!weekData) {
        alert('No schedule available to export for this week.');
        return;
    }

    // Create CSV header
    let csv = 'Duty Type,' + weekData.days.map(d => `${d.dayName} (${formatShortDate(d.date)})`).join(',') + '\n';

    // Add rows for each duty type
    dutyTypes.forEach(dutyType => {
        const row = [dutyType.name];
        weekData.days.forEach(day => {
            row.push(day.assignments[dutyType.id] || 'Open - Volunteer to Assign');
        });
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandli-schedule-week-${currentWeekKey}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Approve and send invites (simulation)
function approveAndSendInvites() {
    const weekData = weeklyScheduleData[currentWeekKey];
    if (!weekData) {
        alert('No schedule available to approve for this week.');
        return;
    }

    const stats = calculateStats();
    let shouldSend = false;

    if (stats.coverageRate === '100%') {
        shouldSend = true;
        alert(`✅ Schedule approved successfully!\n\n📧 Calendar invites have been sent to all ${stats.activeMandlis} Mandlis for ${weekData.weekLabel}.`);
    } else {
        const confirmSend = confirm(`⚠️ Warning: Schedule is only ${stats.coverageRate} complete.\n\nSome shifts are still unassigned. Do you want to approve and send invites anyway?`);
        if (confirmSend) {
            shouldSend = true;
            alert(`✅ Schedule approved with gaps.\n\n📧 Calendar invites have been sent to all ${stats.activeMandlis} Mandlis for ${weekData.weekLabel}.`);
        }
    }

    if (shouldSend) {
        // Record the send time
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        weekData.lastSent = `${dateStr.replace(/\//g, '-')} ${timeStr}`;

        // Update display
        updateLastSent();
    }
}

// Modal functions
async function openEditModal(date, dutyTypeId, currentAssignment) {
    if (!isAdmin) return;

    currentEditingCell = { date, dutyTypeId, currentAssignment };

    const dutyType = dutyTypes.find(dt => dt.id === dutyTypeId);
    const modal = document.getElementById('editModal');

    // Update modal content
    document.getElementById('modalDate').textContent = formatDateDisplay(date);
    document.getElementById('modalDutyType').textContent = dutyType.name;

    // Parse date to get month and day
    const [year, month, dayOfMonth] = date.split('-');
    const monthKey = `${year}-${month}`;
    const dayNum = parseInt(dayOfMonth, 10);

    // Determine required gender from duty type
    // dutyTypeId format: "ep_g1" (gents) or "ep_l1" (ladies)
    const requiredGender = dutyTypeId.includes('_g') ? 'gents' : 'ladies';

    // Populate person select - show loading state
    const personSelect = document.getElementById('personSelect');
    personSelect.innerHTML = '<option value="">Loading...</option>';

    try {
        // Fetch availability data for the month
        const response = await fetch(`${API_BASE_URL}/availability/month/${monthKey}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch availability data');
        }

        const data = await response.json();

        // Get all assignments for this date to prevent double-booking
        const weekData = weeklyScheduleData[currentWeekKey];
        const dayData = weekData?.days.find(d => d.date === date);
        const assignedUserIds = new Set();

        if (dayData?.assignments) {
            // Collect all user IDs already assigned on this date (across all OTHER duty types)
            Object.entries(dayData.assignments).forEach(([dutId, assignedName]) => {
                // Skip the current duty type (allow re-assigning same slot)
                if (dutId !== dutyTypeId && assignedName) {
                    // Find the user ID from the name
                    const matchingAvail = data.availability.find(
                        avail => avail.users?.full_name === assignedName
                    );
                    if (matchingAvail) {
                        assignedUserIds.add(matchingAvail.user_id);
                    }
                }
            });
        }

        // Filter users by: correct gender AND available on this specific day AND not already assigned
        const availableUsers = data.availability
            .filter(avail => {
                const user = avail.users;
                return user &&
                       user.is_active &&
                       user.gender === requiredGender &&
                       avail.available_days &&
                       avail.available_days.includes(dayNum) &&
                       !assignedUserIds.has(avail.user_id);  // Prevent double-booking
            })
            .map(avail => ({
                id: avail.user_id,
                name: avail.users.full_name,
                email: avail.users.email
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Populate dropdown
        personSelect.innerHTML = '<option value="">-- Unassigned --</option>';

        if (availableUsers.length === 0) {
            const noAvailOption = document.createElement('option');
            noAvailOption.disabled = true;
            noAvailOption.textContent = `No ${requiredGender} available on this day`;
            personSelect.appendChild(noAvailOption);
        } else {
            availableUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.email})`;
                // TODO: Match by user_id instead of name for currentAssignment
                if (user.name === currentAssignment) {
                    option.selected = true;
                }
                personSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error('Error loading available users:', error);
        personSelect.innerHTML = '<option value="">Error loading users</option>';
    }

    // Show modal
    modal.classList.remove('hidden');
}

// Helper function to get auth token from cookie
function getAuthToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; mandli_token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    currentEditingCell = null;
}

async function saveAssignment() {
    if (!currentEditingCell) return;

    const { date, dutyTypeId } = currentEditingCell;
    const selectedUserId = document.getElementById('personSelect').value;

    // Convert frontend dutyTypeId to backend duty_type format
    const dutyTypeMap = {
        'ep_g1': 'early_paat_gents_1',
        'ep_l1': 'early_paat_ladies_1',
        'ep_g2': 'early_paat_gents_2',
        'ep_l2': 'early_paat_ladies_2',
        'lp_g1': 'late_paat_gents_1',
        'lp_l1': 'late_paat_ladies_1',
        'lp_g2': 'late_paat_gents_2',
        'lp_l2': 'late_paat_ladies_2'
    };

    const dutyType = dutyTypeMap[dutyTypeId];
    if (!dutyType) {
        console.error('Unknown duty type:', dutyTypeId);
        return;
    }

    // Parse date to get month and day
    const [year, month, dayOfMonth] = date.split('-');
    const monthKey = `${year}-${month}`;
    const dayNum = parseInt(dayOfMonth, 10);

    try {
        // Call backend API to save assignment
        const response = await fetch(`${API_BASE_URL}/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                month: monthKey,
                day: dayNum,
                duty_type: dutyType,
                user_id: selectedUserId || null
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save assignment');
        }

        const result = await response.json();
        console.log('Assignment saved:', result);

        // Reload schedule data for the current week to get fresh data with full names
        await loadAndRenderWeek();

        // Close modal
        closeEditModal();

    } catch (error) {
        console.error('Error saving assignment:', error);
        alert('Failed to save assignment. Please try again.');
    }
}


// Attach click handlers to cells
function attachCellClickHandlers() {
    if (!isAdmin) return;

    const weekData = weeklyScheduleData[currentWeekKey];
    if (!weekData) return;

    // Get all assignment cells
    const cells = document.querySelectorAll('.weekly-assignment-cell');

    let cellIndex = 0;
    dutyTypes.forEach(dutyType => {
        weekData.days.forEach(day => {
            const cell = cells[cellIndex];
            if (cell) {
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', () => {
                    const currentAssignment = day.assignments[dutyType.id];
                    openEditModal(day.date, dutyType.id, currentAssignment);
                });
            }
            cellIndex++;
        });
    });
}

// Fetch schedule data from API
async function fetchWeekSchedule(weekStartDate) {
    const dateStr = weekStartDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
        const response = await fetch(`${API_BASE_URL}/schedules?week_start=${dateStr}`);

        if (!response.ok) {
            console.error('Failed to fetch schedule:', response.status);
            return null;
        }

        const data = await response.json();
        return data.days || [];
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return null;
    }
}

// Load schedule data and render
async function loadAndRenderWeek() {
    const days = await fetchWeekSchedule(currentWeekStartDate);

    if (days) {
        // Store in weeklyScheduleData for compatibility
        const weekData = {
            weekLabel: `Week of ${currentWeekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            lastSent: null,
            days: days
        };
        weeklyScheduleData[currentWeekKey] = weekData;
    }

    // Render the view
    renderWeeklyView();
    updateStats();
    attachCellClickHandlers();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Set up event listeners
    document.getElementById('prevWeek').addEventListener('click', async () => {
        previousWeek();
        await loadAndRenderWeek();
    });
    document.getElementById('nextWeek').addEventListener('click', async () => {
        nextWeek();
        await loadAndRenderWeek();
    });
    document.getElementById('approveBtn').addEventListener('click', approveAndSendInvites);

    // Modal event listeners
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveBtn').addEventListener('click', saveAssignment);

    // Close modal on background click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });

    // Initial render - load data from API
    await loadAndRenderWeek();
});
