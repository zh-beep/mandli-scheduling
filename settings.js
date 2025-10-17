// Load people from script.js peopleDatabase
let settings = {
    notificationTiming: 7, // days before month
    reminderFrequency: 'none'
};

// Render people list
function renderPeopleList() {
    const peopleList = document.getElementById('peopleList');
    const sortedPeople = Object.keys(peopleDatabase).sort();

    let html = '<div class="people-table">';
    html += '<div class="people-header">';
    html += '<div class="col-name">Name</div>';
    html += '<div class="col-email">Email</div>';
    html += '<div class="col-phone">Phone</div>';
    html += '<div class="col-actions">Actions</div>';
    html += '</div>';

    sortedPeople.forEach(person => {
        const data = peopleDatabase[person];
        html += '<div class="people-row">';
        html += `<div class="col-name"><strong>${person}</strong></div>`;
        html += `<div class="col-email">${data.email}</div>`;
        html += `<div class="col-phone">${data.phone || '-'}</div>`;
        html += `<div class="col-actions">
            <button class="btn-icon" onclick="editPerson('${person}')" title="Edit">✏️</button>
            <button class="btn-icon" onclick="deletePerson('${person}')" title="Delete">🗑️</button>
        </div>`;
        html += '</div>';
    });

    html += '</div>';
    peopleList.innerHTML = html;
}

// Save notification settings
function saveNotificationSettings() {
    settings.notificationTiming = document.getElementById('notificationTiming').value;
    settings.reminderFrequency = document.getElementById('reminderFrequency').value;

    // In production, this would save to backend
    localStorage.setItem('mandli_settings', JSON.stringify(settings));

    alert('✅ Notification settings saved!');
}

// Add person from settings
function addPersonFromSettings() {
    const name = document.getElementById('newPersonNameSettings').value.trim();
    const email = document.getElementById('newPersonEmailSettings').value.trim();
    const phone = document.getElementById('newPersonPhone').value.trim();

    if (!name || !email) {
        alert('Please enter both name and email address.');
        return;
    }

    if (peopleDatabase[name]) {
        alert('This person already exists. Use the edit button to update their information.');
        return;
    }

    // Add to database with a generated color
    const colors = [
        { bg: '#E8F5E9', text: '#2E7D32' },
        { bg: '#FFF3E0', text: '#E65100' },
        { bg: '#F3E5F5', text: '#6A1B9A' },
        { bg: '#E1F5FE', text: '#01579B' },
        { bg: '#FFF9C4', text: '#F57F17' },
        { bg: '#FFECB3', text: '#E65100' }
    ];
    const randomColor = colors[Object.keys(peopleDatabase).length % colors.length];

    peopleDatabase[name] = {
        email,
        phone: phone || null,
        color: randomColor
    };

    // Clear form
    document.getElementById('newPersonNameSettings').value = '';
    document.getElementById('newPersonEmailSettings').value = '';
    document.getElementById('newPersonPhone').value = '';

    // Re-render list
    renderPeopleList();

    alert(`✅ ${name} has been added successfully!`);
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
