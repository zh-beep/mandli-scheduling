// Test the week calculation
const today = new Date('2025-10-16'); // Thursday
console.log('Today:', today.toLocaleDateString(), '(', today.getDay(), ')');

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
    
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

const weekStart = getStartOfWeek(today);
console.log('Week start:', weekStart.toLocaleDateString());
console.log('Expected: 10/14/2025 (Tuesday)');

function formatWeekKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

console.log('Week key:', formatWeekKey(weekStart));
console.log('Expected: 2025-10-14');
