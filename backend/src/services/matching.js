const { supabaseAdmin } = require('../config/supabase');

/**
 * Duty slot configuration
 * Each slot has a gender requirement (gents/ladies)
 * Slot numbers: 1-8 map to:
 * 1: Early Paat Gents 1
 * 2: Early Paat Ladies 1
 * 3: Early Paat Gents 2
 * 4: Early Paat Ladies 2
 * 5: Late Paat Gents 1
 * 6: Late Paat Ladies 1
 * 7: Late Paat Gents 2
 * 8: Late Paat Ladies 2
 */
const SLOT_CONFIG = [
  { slot_number: 1, gender: 'gents', duty_type: 'early_paat_gents_1' },
  { slot_number: 2, gender: 'ladies', duty_type: 'early_paat_ladies_1' },
  { slot_number: 3, gender: 'gents', duty_type: 'early_paat_gents_2' },
  { slot_number: 4, gender: 'ladies', duty_type: 'early_paat_ladies_2' },
  { slot_number: 5, gender: 'gents', duty_type: 'late_paat_gents_1' },
  { slot_number: 6, gender: 'ladies', duty_type: 'late_paat_ladies_1' },
  { slot_number: 7, gender: 'gents', duty_type: 'late_paat_gents_2' },
  { slot_number: 8, gender: 'ladies', duty_type: 'late_paat_ladies_2' }
];

/**
 * Get number of days in a month
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Check if a user is available on a specific day
 */
function isUserAvailable(availability, day) {
  return availability.available_days && availability.available_days.includes(day);
}

/**
 * Select best candidate from available users
 * Prioritizes users with fewer assignments
 */
function selectBestCandidate(candidates, assignmentCounts) {
  if (candidates.length === 0) return null;

  // Sort by assignment count (ascending) to balance the load
  const sorted = candidates.sort((a, b) => {
    const countA = assignmentCounts[a.user_id] || 0;
    const countB = assignmentCounts[b.user_id] || 0;
    return countA - countB;
  });

  return sorted[0];
}

/**
 * Generate schedule for a month using availability data
 *
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<Object>} Generated schedule with statistics
 */
async function generateMonthlySchedule(month) {
  try {
    // Parse month
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, monthNum);

    console.log(`Generating schedule for ${month} (${daysInMonth} days)`);

    // Get all availability data for this month
    const { data: availability, error: availError } = await supabaseAdmin
      .from('availability')
      .select(`
        user_id,
        available_days,
        users (
          id,
          full_name,
          gender,
          is_active
        )
      `)
      .eq('month', month);

    if (availError) {
      throw new Error(`Failed to fetch availability: ${availError.message}`);
    }

    if (!availability || availability.length === 0) {
      throw new Error('No availability data found for this month');
    }

    console.log(`Found availability for ${availability.length} users`);

    // Filter active users and flatten structure
    const activeUsers = availability
      .filter(a => a.users && a.users.is_active)
      .map(a => ({
        user_id: a.user_id,
        full_name: a.users.full_name,
        gender: a.users.gender,
        available_days: a.available_days || []
      }));

    console.log(`Active users: ${activeUsers.length}`);

    // Separate by gender
    const gentsByUserId = {};
    const ladiesByUserId = {};

    activeUsers.forEach(user => {
      if (user.gender === 'gents') {
        gentsByUserId[user.user_id] = user;
      } else if (user.gender === 'ladies') {
        ladiesByUserId[user.user_id] = user;
      }
    });

    console.log(`Gents: ${Object.keys(gentsByUserId).length}, Ladies: ${Object.keys(ladiesByUserId).length}`);

    // Track assignment counts for balancing
    const assignmentCounts = {};
    activeUsers.forEach(user => {
      assignmentCounts[user.user_id] = 0;
    });

    // Generate assignments
    const assignments = [];
    const stats = {
      totalSlots: daysInMonth * 8,
      filledSlots: 0,
      emptySlots: 0,
      gentsSlots: 0,
      ladiesSlots: 0,
      assignmentsByUser: {}
    };

    // For each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Track who's assigned today to avoid double-booking
      const assignedToday = new Set();

      // For each slot
      for (const slot of SLOT_CONFIG) {
        const pool = slot.gender === 'gents' ? gentsByUserId : ladiesByUserId;

        // Find available candidates for this slot
        const candidates = Object.values(pool).filter(user =>
          isUserAvailable(user, day) && !assignedToday.has(user.user_id)
        );

        // Select best candidate
        const selected = selectBestCandidate(candidates, assignmentCounts);

        if (selected) {
          assignments.push({
            date: dateStr,
            slot_number: slot.slot_number,
            user_id: selected.user_id
          });

          // Update tracking
          assignedToday.add(selected.user_id);
          assignmentCounts[selected.user_id]++;
          stats.filledSlots++;

          if (slot.gender === 'gents') {
            stats.gentsSlots++;
          } else {
            stats.ladiesSlots++;
          }
        } else {
          // No one available for this slot
          stats.emptySlots++;
          console.log(`No candidate for ${dateStr} slot ${slot.slot_number} (${slot.duty_type})`);
        }
      }
    }

    // Calculate per-user stats
    Object.entries(assignmentCounts).forEach(([userId, count]) => {
      if (count > 0) {
        const user = activeUsers.find(u => u.user_id === userId);
        stats.assignmentsByUser[userId] = {
          name: user.full_name,
          count: count
        };
      }
    });

    stats.coveragePercentage = ((stats.filledSlots / stats.totalSlots) * 100).toFixed(1);

    return {
      success: true,
      month,
      assignments,
      stats
    };

  } catch (error) {
    console.error('Error generating schedule:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Apply generated schedule to database
 * Clears existing schedules for the month first
 *
 * @param {string} month - Month in YYYY-MM format
 * @param {Array} assignments - Array of assignment objects with date field
 * @returns {Promise<Object>} Result of application
 */
async function applySchedule(month, assignments) {
  try {
    console.log(`Applying schedule for ${month}...`);

    // Delete existing schedules for this month
    const { error: deleteError } = await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('month', month);

    if (deleteError) {
      throw new Error(`Failed to clear existing schedules: ${deleteError.message}`);
    }

    console.log(`Cleared existing schedules for ${month}`);

    // Transform assignments from date format to month/day/duty_type format
    const transformedAssignments = assignments.map(a => {
      const [year, monthStr, dayStr] = a.date.split('-');
      const slot = SLOT_CONFIG.find(s => s.slot_number === a.slot_number);
      return {
        month: `${year}-${monthStr}`,
        day: parseInt(dayStr, 10),
        duty_type: slot.duty_type,
        assigned_user_id: a.user_id
      };
    });

    // Insert new assignments
    if (transformedAssignments.length > 0) {
      const { data, error: insertError } = await supabaseAdmin
        .from('schedules')
        .insert(transformedAssignments);

      if (insertError) {
        throw new Error(`Failed to insert schedules: ${insertError.message}`);
      }

      console.log(`Inserted ${transformedAssignments.length} assignments`);
    }

    return {
      success: true,
      message: `Schedule applied successfully for ${month}`,
      assignmentsCreated: transformedAssignments.length
    };

  } catch (error) {
    console.error('Error applying schedule:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate incremental schedule for a specific user
 * Only fills empty slots, preserves existing assignments
 *
 * @param {string} month - Month in YYYY-MM format
 * @param {string} userId - User ID who submitted availability
 * @returns {Promise<Object>} Generated assignments for this user
 */
async function generateIncrementalSchedule(month, userId) {
  try {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, monthNum);

    console.log(`Generating incremental schedule for user ${userId} in ${month}`);

    // Get user details and availability
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, gender')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data: availabilityData, error: availError } = await supabaseAdmin
      .from('availability')
      .select('available_days')
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (availError || !availabilityData) {
      throw new Error('No availability data found for user');
    }

    const userAvailability = availabilityData.available_days || [];
    console.log(`User ${userData.full_name} available on ${userAvailability.length} days`);

    // Get existing assignments for this month
    const { data: existingSchedules, error: schedError } = await supabaseAdmin
      .from('schedules')
      .select('day, duty_type, assigned_user_id')
      .eq('month', month);

    if (schedError) {
      throw new Error('Failed to fetch existing schedules');
    }

    // Build a map of filled slots
    const filledSlots = new Map();
    existingSchedules.forEach(schedule => {
      const key = `${schedule.day}-${schedule.duty_type}`;
      filledSlots.set(key, schedule.assigned_user_id);
    });

    // Get slots that match user's gender
    const userSlots = SLOT_CONFIG.filter(slot => slot.gender === userData.gender);

    // Track how many assignments this user already has
    const currentUserAssignments = existingSchedules.filter(s => s.assigned_user_id === userId).length;

    // Find empty slots where user is available
    const newAssignments = [];
    const maxAssignmentsPerUser = Math.ceil((daysInMonth * userSlots.length) / 10); // Fair distribution

    for (let day = 1; day <= daysInMonth; day++) {
      // Skip if user not available this day
      if (!userAvailability.includes(day)) continue;

      // Check if user already has enough assignments
      if (currentUserAssignments + newAssignments.length >= maxAssignmentsPerUser) {
        console.log(`User has reached max assignments (${maxAssignmentsPerUser})`);
        break;
      }

      // Check if user is already assigned on this day
      const userAlreadyAssignedToday = existingSchedules.some(s =>
        s.day === day && s.assigned_user_id === userId
      );

      if (userAlreadyAssignedToday) continue;

      // Try to assign to an empty slot
      for (const slot of userSlots) {
        const slotKey = `${day}-${slot.duty_type}`;

        if (!filledSlots.has(slotKey)) {
          // Slot is empty, assign user
          newAssignments.push({
            month,
            day,
            duty_type: slot.duty_type,
            assigned_user_id: userId
          });

          // Mark slot as filled
          filledSlots.set(slotKey, userId);

          // Only one assignment per day per user
          break;
        }
      }
    }

    console.log(`Generated ${newAssignments.length} new assignments for ${userData.full_name}`);

    return {
      success: true,
      user: userData,
      newAssignments,
      stats: {
        availableDays: userAvailability.length,
        assignedSlots: newAssignments.length,
        existingAssignments: currentUserAssignments
      }
    };

  } catch (error) {
    console.error('Error generating incremental schedule:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Apply incremental assignments (only adds, doesn't delete)
 *
 * @param {Array} assignments - New assignments to add
 * @returns {Promise<Object>} Result of application
 */
async function applyIncrementalSchedule(assignments) {
  try {
    if (!assignments || assignments.length === 0) {
      return {
        success: true,
        message: 'No new assignments to apply',
        assignmentsCreated: 0
      };
    }

    console.log(`Applying ${assignments.length} incremental assignments...`);

    // Insert new assignments (without deleting existing ones)
    const { data, error: insertError } = await supabaseAdmin
      .from('schedules')
      .insert(assignments);

    if (insertError) {
      throw new Error(`Failed to insert schedules: ${insertError.message}`);
    }

    return {
      success: true,
      message: `Added ${assignments.length} new assignments`,
      assignmentsCreated: assignments.length
    };

  } catch (error) {
    console.error('Error applying incremental schedule:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remove all assignments for a deleted user and regenerate schedule
 *
 * @param {string} userId - User ID being deleted
 * @param {string} month - Month to regenerate
 * @returns {Promise<Object>} Result of regeneration
 */
async function handleUserDeletion(userId, month) {
  try {
    console.log(`Handling deletion of user ${userId} for month ${month}`);

    // Remove user's assignments
    const { error: deleteError } = await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('assigned_user_id', userId)
      .eq('month', month);

    if (deleteError) {
      throw new Error(`Failed to remove user assignments: ${deleteError.message}`);
    }

    console.log(`Removed assignments for user ${userId}`);

    // Now regenerate the entire schedule
    const schedule = await generateMonthlySchedule(month);

    if (schedule.success && schedule.assignments.length > 0) {
      const applied = await applySchedule(month, schedule.assignments);
      return {
        success: true,
        message: 'User removed and schedule regenerated',
        ...applied
      };
    }

    return {
      success: false,
      error: 'Failed to regenerate schedule after user removal'
    };

  } catch (error) {
    console.error('Error handling user deletion:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateMonthlySchedule,
  applySchedule,
  generateIncrementalSchedule,
  applyIncrementalSchedule,
  handleUserDeletion
};
