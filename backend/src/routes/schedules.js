const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/schedules
 * Get schedules for a specific date range
 * Public endpoint (no auth required for viewing)
 *
 * Query params:
 * - week_start: YYYY-MM-DD (week starting Tuesday)
 * OR
 * - start_date: YYYY-MM-DD (required)
 * - end_date: YYYY-MM-DD (required)
 */
router.get('/', async (req, res) => {
  try {
    let { start_date, end_date, week_start } = req.query;

    // If week_start is provided, calculate the week range (Tuesday to Monday)
    if (week_start) {
      start_date = week_start;
      const startDate = new Date(week_start + 'T00:00:00');
      startDate.setDate(startDate.getDate() + 6); // Add 6 days for Monday
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      end_date = `${year}-${month}-${day}`;
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Either week_start OR (start_date AND end_date) are required'
      });
    }

    // Get schedules using the schedule_details view
    const { data: schedules, error } = await supabaseAdmin
      .from('schedule_details')
      .select('*')
      .gte('date', start_date)
      .lte('date', end_date)
      .order('date', { ascending: true })
      .order('slot_number', { ascending: true});

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch schedules'
      });
    }

    // Transform data to frontend format
    // Group by date
    const dayMap = {};
    schedules.forEach(schedule => {
      if (!dayMap[schedule.date]) {
        dayMap[schedule.date] = {
          date: schedule.date,
          dayName: new Date(schedule.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
          isPBS: schedule.is_pbs || false,
          assignments: {}
        };
      }

      // Map slot_number to duty type ID
      const slotMap = {
        1: 'ep_g1',
        2: 'ep_l1',
        3: 'ep_g2',
        4: 'ep_l2',
        5: 'lp_g1',
        6: 'lp_l1',
        7: 'lp_g2',
        8: 'lp_l2'
      };

      const dutyTypeId = slotMap[schedule.slot_number];
      dayMap[schedule.date].assignments[dutyTypeId] = schedule.name || null;
    });

    const days = Object.values(dayMap);

    res.json({
      weekLabel: `Week of ${new Date(start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      days
    });

  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching schedules'
    });
  }
});

/**
 * GET /api/schedules/date/:date
 * Get all schedules for a specific date (all 8 slots)
 * Requires admin authentication
 */
router.get('/date/:date', authenticateAdmin, async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    // Get schedules for the date
    const { data: schedules, error } = await supabaseAdmin
      .from('schedule_details')
      .select('*')
      .eq('date', date)
      .order('slot_number', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch schedules'
      });
    }

    res.json({
      date,
      schedules: schedules || []
    });

  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching schedules'
    });
  }
});

/**
 * POST /api/schedules
 * Create or update a schedule assignment
 * Requires admin authentication
 *
 * Request body:
 * {
 *   "date": "2025-01-15",
 *   "slot_number": 1,  // 1-8
 *   "user_id": "uuid",
 *   "notes": "Optional notes"
 * }
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { date, slot_number, user_id, notes } = req.body;

    // Validate input
    if (!date || !slot_number) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Date and slot_number are required'
      });
    }

    if (slot_number < 1 || slot_number > 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'slot_number must be between 1 and 8'
      });
    }

    // Check if schedule already exists for this date/slot
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('schedules')
      .select('id')
      .eq('date', date)
      .eq('slot_number', slot_number)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database error:', checkError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check existing schedule'
      });
    }

    let result;

    if (existing) {
      // Update existing schedule
      const updates = {
        user_id: user_id || null,
        updated_at: new Date().toISOString()
      };
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabaseAdmin
        .from('schedules')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update schedule'
        });
      }

      result = data;
    } else {
      // Create new schedule
      const { data, error } = await supabaseAdmin
        .from('schedules')
        .insert([{
          date,
          slot_number,
          user_id: user_id || null,
          notes: notes || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create schedule'
        });
      }

      result = data;
    }

    // Get full schedule details with user info
    const { data: fullSchedule, error: detailsError } = await supabaseAdmin
      .from('schedule_details')
      .select('*')
      .eq('date', date)
      .eq('slot_number', slot_number)
      .single();

    if (detailsError) {
      console.error('Error fetching schedule details:', detailsError);
    }

    res.json({
      message: existing ? 'Schedule updated successfully' : 'Schedule created successfully',
      schedule: fullSchedule || result
    });

  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while saving schedule'
    });
  }
});

/**
 * DELETE /api/schedules/:id
 * Delete a schedule assignment
 * Requires admin authentication
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete schedule'
      });
    }

    res.json({
      message: 'Schedule deleted successfully',
      id
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while deleting schedule'
    });
  }
});

/**
 * DELETE /api/schedules/slot
 * Clear a specific slot (set user_id to null)
 * Requires admin authentication
 *
 * Request body:
 * {
 *   "date": "2025-01-15",
 *   "slot_number": 1
 * }
 */
router.delete('/slot', authenticateAdmin, async (req, res) => {
  try {
    const { date, slot_number } = req.body;

    if (!date || !slot_number) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Date and slot_number are required'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .update({ user_id: null })
      .eq('date', date)
      .eq('slot_number', slot_number)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to clear slot'
      });
    }

    res.json({
      message: 'Slot cleared successfully',
      schedule: data
    });

  } catch (error) {
    console.error('Error clearing slot:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while clearing slot'
    });
  }
});

/**
 * GET /api/schedules/coverage/:month
 * Get coverage statistics for a specific month
 * Requires admin authentication
 */
router.get('/coverage/:month', authenticateAdmin, async (req, res) => {
  try {
    const { month } = req.params;

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month must be in YYYY-MM format'
      });
    }

    // Use the monthly_coverage view
    const { data: coverage, error } = await supabaseAdmin
      .from('monthly_coverage')
      .select('*')
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch coverage'
      });
    }

    res.json({
      month,
      coverage: coverage || {
        month,
        total_slots: 0,
        assigned_slots: 0,
        empty_slots: 0,
        coverage_percentage: 0
      }
    });

  } catch (error) {
    console.error('Error fetching coverage:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching coverage'
    });
  }
});

module.exports = router;
