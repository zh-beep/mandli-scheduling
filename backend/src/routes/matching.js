const express = require('express');
const { authenticateAdmin } = require('../middleware/auth');
const { generateMonthlySchedule, applySchedule } = require('../services/matching');

const router = express.Router();

/**
 * POST /api/matching/generate
 * Generate schedule for a month using availability data
 * Does not save to database - preview only
 * Requires admin authentication
 *
 * Request body:
 * {
 *   "month": "2025-11"
 * }
 */
router.post('/generate', authenticateAdmin, async (req, res) => {
  try {
    const { month } = req.body;

    // Validate month format
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month is required in YYYY-MM format'
      });
    }

    const result = await generateMonthlySchedule(month);

    if (!result.success) {
      return res.status(500).json({
        error: 'Generation failed',
        message: result.error
      });
    }

    res.json({
      message: 'Schedule generated successfully',
      ...result
    });

  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while generating schedule'
    });
  }
});

/**
 * POST /api/matching/apply
 * Generate and apply schedule for a month
 * Clears existing schedules and saves new ones
 * Requires admin authentication
 *
 * Request body:
 * {
 *   "month": "2025-11"
 * }
 */
router.post('/apply', authenticateAdmin, async (req, res) => {
  try {
    const { month } = req.body;

    // Validate month format
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Month is required in YYYY-MM format'
      });
    }

    // Generate schedule
    const generateResult = await generateMonthlySchedule(month);

    if (!generateResult.success) {
      return res.status(500).json({
        error: 'Generation failed',
        message: generateResult.error
      });
    }

    // Apply to database
    const applyResult = await applySchedule(month, generateResult.assignments);

    if (!applyResult.success) {
      return res.status(500).json({
        error: 'Application failed',
        message: applyResult.error
      });
    }

    res.json({
      message: 'Schedule generated and applied successfully',
      month,
      stats: generateResult.stats,
      assignmentsCreated: applyResult.assignmentsCreated
    });

  } catch (error) {
    console.error('Error applying schedule:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while applying schedule'
    });
  }
});

module.exports = router;
