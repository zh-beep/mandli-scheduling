// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Global state
let currentWeekStartDate = getStartOfWeek(new Date());
let currentWeekKey = formatWeekKey(currentWeekStartDate);
let isAdmin = true; // In production, this would come from authentication
let currentEditingCell = null;
let scheduleData = {}; // Will be loaded from API

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

// Get start of week (Tuesday) for given date
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.

    // Calculate days to subtract to get to Tuesday
    let diff;
    if (day === 0) { // Sunday
        diff = 5; // Go back 5 days to Tuesday
    } else if (day === 1) { // Monday
        diff = 6; // Go back 6 days to last Tuesday
    } else { // Tuesday through Saturday
        diff = day - 2; // Go back to Tuesday
    }

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

// API Functions
async function fetchScheduleData(weekKey) {
    try {
        const startDate = weekKey;
        const response = await fetch(`${API_BASE_URL}/schedules?week_start=${startDate}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching schedule data:', error);
        return null;
    }
}

async function loadScheduleData() {
    const data = await fetchScheduleData(currentWeekKey);
    if (data) {
        scheduleData[currentWeekKey] = data;
    }
    return data;
}

// Calculate statistics for the current week
function calculateStats() {
    const weekData = scheduleData[currentWeekKey];

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
async function renderWeeklyView() {
    const weekData = scheduleData[currentWeekKey];
    const weekGrid = document.getElementById('weekGrid');

    if (!weekData) {
        weekGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6C757D;">
                <h3 style="margin-bottom: 10px;">No Schedule Available</h3>
                <p>No duty assignments have been created for this week yet.</p>
            </div>
        `;
        return;
    }

    // Update week label
    document.getElementById('currentWeek').textContent = weekData.weekLabel;

    let htmlContent = '';

    // Header row with duty type labels
    htmlContent += '<div class="weekly-header-cell"></div>'; // Empty corner cell

    weekData.days.forEach(day => {
        const isPBS = day.isPBS;
        const pbsClass = isPBS ? 'pbs-day' : '';
        htmlContent += `
            <div class="weekly-header-cell day-header ${pbsClass}">
                <div class="day-date">${formatShortDate(day.date)}</div>
                <div class="day-name">${day.dayName.substring(0, 3)}</div>
                ${isPBS ? '<div class="pbs-badge">PBS</div>' : ''}
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
        weekData.days.forEach(day => {
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
async function updateWeekDisplay() {
    currentWeekKey = formatWeekKey(currentWeekStartDate);

    // Load data from API if not cached
    if (!scheduleData[currentWeekKey]) {
        await loadScheduleData();
    }

    await renderWeeklyView();
    updateStats();
}

// Navigate to previous week
async function previousWeek() {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    await updateWeekDisplay();
}

// Navigate to next week
async function nextWeek() {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
    await updateWeekDisplay();
}

// Export schedule to CSV
function exportSchedule() {
    const weekData = scheduleData[currentWeekKey];
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
    const weekData = scheduleData[currentWeekKey];
    if (!weekData) {
        alert('No schedule available to approve for this week.');
        return;
    }

    const stats = calculateStats();
    if (stats.coverageRate === '100%') {
        alert(`✅ Schedule approved successfully!\n\n📧 Calendar invites have been sent to all ${stats.activeMandlis} Mandlis for ${weekData.weekLabel}.`);
    } else {
        const confirmSend = confirm(`⚠️ Warning: Schedule is only ${stats.coverageRate} complete.\n\nSome shifts are still unassigned. Do you want to approve and send invites anyway?`);
        if (confirmSend) {
            alert(`✅ Schedule approved with gaps.\n\n📧 Calendar invites have been sent to all ${stats.activeMandlis} Mandlis for ${weekData.weekLabel}.`);
        }
    }
}

// Modal functions
function openEditModal(date, dutyTypeId, currentAssignment) {
    if (!isAdmin) return;

    currentEditingCell = { date, dutyTypeId, currentAssignment };

    const dutyType = dutyTypes.find(dt => dt.id === dutyTypeId);
    const modal = document.getElementById('editModal');

    // Update modal content
    document.getElementById('modalDate').textContent = formatDateDisplay(date);
    document.getElementById('modalDutyType').textContent = dutyType.name;

    // Populate person select
    const personSelect = document.getElementById('personSelect');
    personSelect.innerHTML = '<option value="">-- Unassigned --</option>';

    Object.keys(peopleDatabase).sort().forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = `${person} (${peopleDatabase[person].email})`;
        if (person === currentAssignment) {
            option.selected = true;
        }
        personSelect.appendChild(option);
    });


    // Show modal
    modal.classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    currentEditingCell = null;
}

async function saveAssignment() {
    if (!currentEditingCell) return;

    const { date, dutyTypeId } = currentEditingCell;
    const selectedPerson = document.getElementById('personSelect').value;

    // TODO: Save to API
    // For now, update local data
    const weekData = scheduleData[currentWeekKey];
    const day = weekData.days.find(d => d.date === date);

    if (day) {
        // Update assignment locally
        day.assignments[dutyTypeId] = selectedPerson || null;

        // Re-render
        await renderWeeklyView();
        updateStats();
        attachCellClickHandlers();

        // Close modal
        closeEditModal();
    }
}


// Attach click handlers to cells
function attachCellClickHandlers() {
    if (!isAdmin) return;

    const weekData = scheduleData[currentWeekKey];
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

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Set up event listeners
    document.getElementById('prevWeek').addEventListener('click', async () => {
        await previousWeek();
        attachCellClickHandlers();
    });
    document.getElementById('nextWeek').addEventListener('click', async () => {
        await nextWeek();
        attachCellClickHandlers();
    });
    document.getElementById('exportBtn').addEventListener('click', exportSchedule);
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
    console.log('Loading schedule data from API...');
    await updateWeekDisplay();
    attachCellClickHandlers();
});
