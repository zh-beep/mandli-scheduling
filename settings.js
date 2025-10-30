// Settings state
let settings = {
    notificationTiming: 7, // days before month
    reminderFrequency: 'none'
};

const API_BASE_URL = 'http://localhost:3001/api';
let usersCache = []; // Cache users from Supabase

// Helper to get auth token
function getAuthToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; mandli_token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Load and render people list from Supabase
async function renderPeopleList() {
    const peopleList = document.getElementById('peopleList');
    peopleList.innerHTML = '<div style="padding: 20px; text-align: center;">Loading users...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        usersCache = data.users;

        // Filter to only show active users and sort by name
        const sortedUsers = usersCache
            .filter(user => user.is_active)
            .sort((a, b) => a.full_name.localeCompare(b.full_name));

        let html = '<div class="people-table">';
        html += '<div class="people-header">';
        html += '<div class="col-name">Name</div>';
        html += '<div class="col-email">Email</div>';
        html += '<div class="col-phone">Phone</div>';
        html += '<div class="col-gender">Gender</div>';
        html += '<div class="col-actions">Actions</div>';
        html += '</div>';

        sortedUsers.forEach(user => {
            const statusBadge = user.is_active ?
                '<span style="color: green;">●</span>' :
                '<span style="color: red;">●</span>';

            html += '<div class="people-row">';
            html += `<div class="col-name">${statusBadge} <strong>${user.full_name}</strong></div>`;
            html += `<div class="col-email">${user.email}</div>`;
            html += `<div class="col-phone">${user.cell_phone || '-'}</div>`;
            html += `<div class="col-gender">${user.gender}</div>`;
            html += `<div class="col-actions">
                <button class="btn-icon" onclick="generateUserLink('${user.id}')" title="Get Link">🔗</button>
                <button class="btn-icon" onclick="toggleUserActive('${user.id}', ${user.is_active})" title="${user.is_active ? 'Deactivate' : 'Activate'}">${user.is_active ? '🚫' : '✅'}</button>
            </div>`;
            html += '</div>';
        });

        html += '</div>';
        peopleList.innerHTML = html;

    } catch (error) {
        console.error('Error loading users:', error);
        peopleList.innerHTML = '<div style="padding: 20px; color: red;">Error loading users. Please refresh the page.</div>';
    }
}

// Save notification settings
function saveNotificationSettings() {
    settings.notificationTiming = document.getElementById('notificationTiming').value;
    settings.reminderFrequency = document.getElementById('reminderFrequency').value;

    // In production, this would save to backend
    localStorage.setItem('mandli_settings', JSON.stringify(settings));

    alert('✅ Notification settings saved!');
}

// Generate unique link for a user
async function generateUserLink(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/link`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate link');
        }

        const data = await response.json();

        // Show link in a modal - truncate to last 20 characters for display
        const linkText = data.link;
        const shortLink = '...' + linkText.slice(-20);

        // Use modal with copy button
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
        modal.innerHTML = `
            <div style="background:white;padding:30px;border-radius:15px;max-width:500px;width:90%;">
                <h3 style="margin-bottom:15px;">📧 Unique Link for ${data.user.name}</h3>
                <p style="margin-bottom:15px;color:#666;">Link: ${shortLink}</p>
                <input type="text" id="fullLinkInput" value="${linkText}" style="width:100%;padding:10px;border:2px solid #E0E0E0;border-radius:8px;font-family:monospace;font-size:12px;margin-bottom:15px;" readonly>
                <div style="display:flex;gap:10px;">
                    <button onclick="navigator.clipboard.writeText('${linkText}').then(() => alert('✅ Link copied!')); this.closest('div').parentElement.parentElement.remove();" style="flex:1;padding:12px;background:#4A90E2;color:white;border:none;border-radius:10px;cursor:pointer;">Copy Link</button>
                    <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding:12px 20px;background:#ccc;color:#333;border:none;border-radius:10px;cursor:pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error generating link:', error);
        alert('Failed to generate link. Please try again.');
    }
}

// Toggle user active/inactive status
async function toggleUserActive(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                is_active: !currentStatus
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        alert(`✅ User ${action}d successfully!`);
        renderPeopleList(); // Reload list

    } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user. Please try again.');
    }
}

// Add person from settings
async function addPersonFromSettings() {
    const name = document.getElementById('newPersonNameSettings').value.trim();
    const email = document.getElementById('newPersonEmailSettings').value.trim();
    const phone = document.getElementById('newPersonPhone').value.trim();

    if (!name || !email) {
        alert('Please enter both name and email address.');
        return;
    }

    // Get gender from a new dropdown (you'll need to add this to the HTML)
    const gender = prompt('Enter gender (gents/ladies):', 'gents');
    if (!gender || !['gents', 'ladies'].includes(gender)) {
        alert('Please enter either "gents" or "ladies"');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                full_name: name,
                email: email,
                cell_phone: phone || null,
                gender: gender
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }

        const data = await response.json();

        // Clear form
        document.getElementById('newPersonNameSettings').value = '';
        document.getElementById('newPersonEmailSettings').value = '';
        document.getElementById('newPersonPhone').value = '';

        // Re-render list
        await renderPeopleList();

        // Offer to generate link
        if (confirm(`✅ ${name} has been added successfully!\n\nWould you like to generate their unique availability link now?`)) {
            await generateUserLink(data.user.id);
        }

    } catch (error) {
        console.error('Error adding user:', error);
        alert(`Failed to add user: ${error.message}`);
    }
}

// Edit person
function editPerson(name) {
    const person = peopleDatabase[name];
    const newEmail = prompt(`Edit email for ${name}:`, person.email);

    if (newEmail && newEmail !== person.email) {
        person.email = newEmail;
        renderPeopleList();
        alert('✅ Email updated!');
    }
}

// Delete person
function deletePerson(name) {
    if (confirm(`Are you sure you want to remove ${name} from the system?\n\nThis will not affect existing assignments.`)) {
        delete peopleDatabase[name];
        renderPeopleList();
        alert(`✅ ${name} has been removed.`);
    }
}

// Export people data
function exportPeopleData() {
    let csv = 'Name,Email,Phone\n';

    Object.keys(peopleDatabase).sort().forEach(person => {
        const data = peopleDatabase[person];
        csv += `${person},${data.email},${data.phone || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mandli-people-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Export schedule data
function exportScheduleData() {
    alert('📥 Exporting all schedule data...\n\nIn production, this would export all weeks from the database.');
    // In production, this would call the backend API
}

// Generate unique availability links
function generateAvailabilityLinks() {
    const baseUrl = window.location.origin + '/availability.html';
    let linksText = 'AVAILABILITY LINKS FOR ALL PEOPLE\n';
    linksText += '=' .repeat(50) + '\n\n';

    Object.keys(peopleDatabase).sort().forEach(person => {
        const data = peopleDatabase[person];
        // Generate unique ID (in production, this would be a secure UUID)
        const uniqueId = btoa(person + ':' + data.email).substring(0, 16);
        const personalLink = `${baseUrl}?id=${uniqueId}&name=${encodeURIComponent(person)}`;

        linksText += `${person} (${data.email})\n`;
        linksText += `${personalLink}\n\n`;
    });

    // Copy to clipboard
    navigator.clipboard.writeText(linksText).then(() => {
        alert('✅ Availability links generated and copied to clipboard!\n\nYou can now paste them into emails to send to each person.');
    }).catch(() => {
        // Fallback: show in a text area
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
        modal.innerHTML = `
            <div style="background:white;padding:30px;border-radius:15px;max-width:800px;width:90%;">
                <h3 style="margin-bottom:20px;">Availability Links</h3>
                <textarea readonly style="width:100%;height:400px;padding:15px;border:2px solid #E0E0E0;border-radius:10px;font-family:monospace;font-size:12px;">${linksText}</textarea>
                <button onclick="this.closest('div').parentElement.remove()" style="margin-top:20px;padding:12px 30px;background:#4A90E2;color:white;border:none;border-radius:10px;cursor:pointer;">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    });
}

// Send test notification
function sendTestNotification() {
    const testEmail = prompt('Enter your email address to receive a test notification:');

    if (testEmail) {
        alert(`✅ Test notification sent to ${testEmail}!\n\nCheck your inbox (and spam folder) for the availability request email.`);
        // In production, this would call the backend API to send actual email
    }
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('mandli_settings');
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById('notificationTiming').value = settings.notificationTiming;
        document.getElementById('reminderFrequency').value = settings.reminderFrequency;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    renderPeopleList();
});
