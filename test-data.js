// Duty type definitions - First 8 from the schedule
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

// Sample weekly data structure
// Each week contains dates, and each date has assignments for the 8 duty types
const weeklyScheduleData = {
    // Week starting Sep 23, 2025
    '2025-09-23': {
        weekLabel: 'Week of Sep 23 - 29, 2025',
        lastSent: '2025-09-20 10:30 AM',
        days: [
            {
                date: '2025-09-23',
                dayName: 'Tuesday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-09-24',
                dayName: 'Wednesday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null, // Open slot
                    lp_l1: 'CR MM',
                    lp_g2: null, // Open slot
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-09-25',
                dayName: 'Thursday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-09-26',
                dayName: 'Friday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-09-27',
                dayName: 'Saturday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-09-28',
                dayName: 'Sunday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-09-29',
                dayName: 'Monday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            }
        ]
    },
    // Week starting Sep 30, 2025 (PBS week)
    '2025-09-30': {
        lastSent: '2025-09-27 2:15 PM',
        weekLabel: 'Week of Sep 30 - Oct 6, 2025',
        days: [
            {
                date: '2025-09-30',
                dayName: 'Tuesday',
                isPBS: true, // PBS date
                pbsLabel: 'PBS: 09/30/2025',
                assignments: {
                    ep_g1: 'Zyka',
                    ep_l1: 'Zyka',
                    ep_g2: 'Zyka',
                    ep_l2: 'Zyka',
                    lp_g1: 'Zyka',
                    lp_l1: 'Zyka',
                    lp_g2: 'Zyka',
                    lp_l2: 'Zyka'
                }
            },
            {
                date: '2025-10-01',
                dayName: 'Wednesday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-02',
                dayName: 'Thursday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-03',
                dayName: 'Friday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-04',
                dayName: 'Saturday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-05',
                dayName: 'Sunday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-06',
                dayName: 'Monday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            }
        ]
    },
    // Week starting Oct 7, 2025
    '2025-10-07': {
        lastSent: '2025-10-04 9:45 AM',
        weekLabel: 'Week of Oct 7 - 13, 2025',
        days: [
            {
                date: '2025-10-07',
                dayName: 'Tuesday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-08',
                dayName: 'Wednesday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-09',
                dayName: 'Thursday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: null
                }
            },
            {
                date: '2025-10-10',
                dayName: 'Friday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-11',
                dayName: 'Saturday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-12',
                dayName: 'Sunday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-13',
                dayName: 'Monday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            }
        ]
    },
    // Week starting Oct 14, 2025
    '2025-10-14': {
        lastSent: '2025-10-11 11:20 AM',
        weekLabel: 'Week of Oct 14 - 20, 2025',
        days: [
            {
                date: '2025-10-14',
                dayName: 'Tuesday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-15',
                dayName: 'Wednesday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-16',
                dayName: 'Thursday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-17',
                dayName: 'Friday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-18',
                dayName: 'Saturday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            },
            {
                date: '2025-10-19',
                dayName: 'Sunday',
                isPBS: false,
                assignments: {
                    ep_g1: 'CR MS',
                    ep_l1: 'BK MM',
                    ep_g2: 'BK KS',
                    ep_l2: 'BK KM',
                    lp_g1: null,
                    lp_l1: 'CR MM',
                    lp_g2: null,
                    lp_l2: 'HPB MM'
                }
            },
            {
                date: '2025-10-20',
                dayName: 'Monday',
                isPBS: false,
                assignments: {
                    ep_g1: 'OF MS',
                    ep_l1: 'OF MM',
                    ep_g2: 'OF KS',
                    ep_l2: 'OF KM',
                    lp_g1: 'RJ MS',
                    lp_l1: 'RJ MM',
                    lp_g2: 'RJ KS',
                    lp_l2: 'RJ KM'
                }
            }
        ]
    },
    // Week starting Oct 21, 2025
    '2025-10-21': {
        lastSent: '2025-10-18 3:00 PM',
        weekLabel: 'Week of Oct 21 - 27, 2025',
        days: [
            { date: '2025-10-21', dayName: 'Tuesday', isPBS: false, assignments: { ep_g1: 'OF MS', ep_l1: 'OF MM', ep_g2: 'OF KS', ep_l2: 'OF KM', lp_g1: 'RJ MS', lp_l1: 'RJ MM', lp_g2: 'RJ KS', lp_l2: 'RJ KM' } },
            { date: '2025-10-22', dayName: 'Wednesday', isPBS: false, assignments: { ep_g1: 'CR MS', ep_l1: 'BK MM', ep_g2: 'BK KS', ep_l2: 'BK KM', lp_g1: null, lp_l1: 'CR MM', lp_g2: null, lp_l2: 'HPB MM' } },
            { date: '2025-10-23', dayName: 'Thursday', isPBS: false, assignments: { ep_g1: 'OF MS', ep_l1: 'OF MM', ep_g2: 'OF KS', ep_l2: 'OF KM', lp_g1: 'RJ MS', lp_l1: 'RJ MM', lp_g2: 'RJ KS', lp_l2: 'RJ KM' } },
            { date: '2025-10-24', dayName: 'Friday', isPBS: false, assignments: { ep_g1: 'CR MS', ep_l1: 'BK MM', ep_g2: 'BK KS', ep_l2: 'BK KM', lp_g1: null, lp_l1: 'CR MM', lp_g2: null, lp_l2: 'HPB MM' } },
            { date: '2025-10-25', dayName: 'Saturday', isPBS: false, assignments: { ep_g1: 'OF MS', ep_l1: 'OF MM', ep_g2: 'OF KS', ep_l2: 'OF KM', lp_g1: 'RJ MS', lp_l1: 'RJ MM', lp_g2: 'RJ KS', lp_l2: 'RJ KM' } },
            { date: '2025-10-26', dayName: 'Sunday', isPBS: false, assignments: { ep_g1: 'CR MS', ep_l1: 'BK MM', ep_g2: 'BK KS', ep_l2: 'BK KM', lp_g1: null, lp_l1: 'CR MM', lp_g2: null, lp_l2: 'HPB MM' } },
            { date: '2025-10-27', dayName: 'Monday', isPBS: false, assignments: { ep_g1: 'OF MS', ep_l1: 'OF MM', ep_g2: 'OF KS', ep_l2: 'OF KM', lp_g1: 'RJ MS', lp_l1: 'RJ MM', lp_g2: 'RJ KS', lp_l2: 'RJ KM' } }
        ]
    },
    // Week starting Oct 28, 2025 (CURRENT WEEK - EMPTY)
    '2025-10-28': {
        lastSent: null,
        weekLabel: 'Week of Oct 28 - Nov 3, 2025',
        days: [
            { date: '2025-10-28', dayName: 'Tuesday', isPBS: false, assignments: { ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null, lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null } },
            { date: '2025-10-29', dayName: 'Wednesday', isPBS: false, assignments: { ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null, lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null } },
            { date: '2025-10-30', dayName: 'Thursday', isPBS: false, assignments: { ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null, lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null } },
            { date: '2025-10-31', dayName: 'Friday', isPBS: false, assignments: { ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null, lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null } },
            { date: '2025-11-01', dayName: 'Saturday', isPBS: false, assignments: { ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null, lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null } },
            { date: '2025-11-02', dayName: 'Sunday', isPBS: false, assignments: { ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null, lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null } },
            { date: '2025-11-03', dayName: 'Monday', isPBS: false, assignments: { ep_g1: null, ep_l1: null, ep_g2: null, ep_l2: null, lp_g1: null, lp_l1: null, lp_g2: null, lp_l2: null } }
        ]
    }
};

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dutyTypes, weeklyScheduleData };
}
