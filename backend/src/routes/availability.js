const express = require('express');
const { supabaseClient, supabaseAdmin } = require('../config/supabase');
const { authenticateUserLink, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/availability/admin
 * Admin endpoint to directly create/update availability for any user
 * Requires admin authentication
 *
 * Request body:
 * {
 *   "user_id": "uuid",
 *   "month": "2025-01",
 *   "available_days": [1, 3, 5, 7, 15, 20, 25]
 * }
 */
router.post('/admin', authenticateAdmin, async (req, res) => {
  try {
    const { user_id, month, available_days } = req.body;

    // Validate input
    if (!user_id || !month || !available_days) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'user_id, month and available_days are required'
      });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month must be in YYYY-MM format'
      });
    }

    // Validate available_days is an array
    if (!Array.isArray(available_days)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'available_days must be an array of day numbers'
      });
    }

    // Validate day numbers (1-31)
    const invalidDays = available_days.filter(day => day < 1 || day > 31);
    if (invalidDays.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Day numbers must be between 1 and 31'
      });
    }

    // Upsert availability
    const { data, error } = await supabaseAdmin
      .from('availability')
      .upsert({
        user_id,
        month,
        available_days,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,month'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to save availability'
      });
    }

    res.json({
      message: 'Availability saved successfully',
      availability: data
    });

  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while saving availability'
    });
  }
});

/**
 * POST /api/availability
 * Submit availability for a specific month
 * Requires valid user link token
 *
 * Request body:
 * {
 *   "month": "2025-01",
 *   "available_days": [1, 3, 5, 7, 15, 20, 25]
 * }
 */
router.post('/', authenticateUserLink, async (req, res) => {
  try {
    const { month, available_days } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!month || !available_days) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month and available_days are required'
      });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month must be in YYYY-MM format'
      });
    }

    // Validate available_days is an array
    if (!Array.isArray(available_days)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'available_days must be an array of day numbers'
      });
    }

    // Validate day numbers (1-31)
    const invalidDays = available_days.filter(day => day < 1 || day > 31);
    if (invalidDays.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Day numbers must be between 1 and 31'
      });
    }

    // Check if availability already exists for this user/month
    const { data: existing, error: checkError } = await supabaseClient
      .from('availability')
      .select('id')
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database error:', checkError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check existing availability'
      });
    }

    let result;

    if (existing) {
      // Update existing availability
      const { data, error } = await supabaseClient
        .from('availability')
        .update({
          available_days,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update availability'
        });
      }

      result = data;
    } else {
      // Create new availability
      const { data, error } = await supabaseClient
        .from('availability')
        .insert([{
          user_id: userId,
          month,
          available_days
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create availability'
        });
      }

      result = data;
    }

    res.json({
      message: 'Availability saved successfully',
      availability: result
    });

  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while saving availability'
    });
  }
});

/**
 * GET /api/availability
 * Get availability for a specific user and month
 * Requires valid user link token
 *
 * Query params:
 * - month: YYYY-MM (required)
 */
router.get('/', authenticateUserLink, async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user.id;

    if (!month) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month query parameter is required'
      });
    }

    // Get availability
    const { data: availability, error } = await supabaseClient
      .from('availability')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch availability'
      });
    }

    res.json({
      availability: availability || null,
      user: req.user
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching availability'
    });
  }
});

/**
 * GET /api/availability/month/:month
 * Get all availability submissions for a specific month
 * Requires admin authentication
 */
router.get('/month/:month', authenticateAdmin, async (req, res) => {
  try {
    const { month } = req.params;

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month must be in YYYY-MM format'
      });
    }

    // Get all availability for the month with user details
    const { data: availability, error } = await supabaseAdmin
      .from('availability')
      .select(`
        *,
        users (
          id,
          full_name,
          email,
          gender,
          is_active
        )
      `)
      .eq('month', month)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch availability'
      });
    }

    res.json({
      month,
      availability: availability || []
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching availability'
    });
  }
});

/**
 * GET /api/availability/status/:month
 * Get availability submission status for all users for a specific month
 * Requires admin authentication
 */
router.get('/status/:month', authenticateAdmin, async (req, res) => {
  try {
    const { month } = req.params;

    // Use the user_availability_status view
    const { data: status, error } = await supabaseAdmin
      .from('user_availability_status')
      .select('*')
      .eq('month', month);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch availability status'
      });
    }

    res.json({
      month,
      status: status || []
    });

  } catch (error) {
    console.error('Error fetching availability status:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching availability status'
    });
  }
});

module.exports = router;
