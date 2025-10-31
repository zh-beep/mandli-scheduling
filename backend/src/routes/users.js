const express = require('express');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateAdmin } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

/**
 * GET /api/users
 * Get all users
 * Requires admin authentication
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch users'
      });
    }

    res.json({ users });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching users'
    });
  }
});

/**
 * POST /api/users
 * Create a new user
 * Requires admin authentication
 *
 * Request body:
 * {
 *   "name": "Ahmed Khan",
 *   "email": "ahmed@example.com",
 *   "phone": "+1234567890",
 *   "gender": "gents"  // or "ladies"
 * }
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { full_name, email, cell_phone, gender } = req.body;

    // Validate input
    if (!full_name || !email || !gender) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name, email, and gender are required'
      });
    }

    if (!['gents', 'ladies'].includes(gender)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Gender must be either "gents" or "ladies"'
      });
    }

    // Generate unique link token
    const linkToken = nanoid(32);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        full_name,
        email,
        cell_phone,
        gender,
        unique_link: linkToken
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);

      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A user with this email already exists'
        });
      }

      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create user'
      });
    }

    res.status(201).json({ user });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while creating user'
    });
  }
});

/**
 * PUT /api/users/:id
 * Update a user
 * Requires admin authentication
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, cell_phone, gender, is_active } = req.body;

    // Build update object (only include provided fields)
    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (cell_phone !== undefined) updates.cell_phone = cell_phone;
    if (gender !== undefined) {
      if (!['gents', 'ladies'].includes(gender)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Gender must be either "gents" or "ladies"'
        });
      }
      updates.gender = gender;
    }
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No fields to update'
      });
    }

    // Update user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);

      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not found',
          message: 'User not found'
        });
      }

      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update user'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while updating user'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 * Requires admin authentication
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete user'
      });
    }

    res.json({
      message: 'User deleted successfully',
      id
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while deleting user'
    });
  }
});

/**
 * GET /api/users/:id/link
 * Generate or retrieve unique availability form link for a user
 * Requires admin authentication
 *
 * Response:
 * {
 *   "link": "http://localhost:3000/availability.html?token=..."
 * }
 */
router.get('/:id/link', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, unique_link')
      .eq('id', id)
      .single();

    if (error || !user) {
      console.error('Database error:', error);
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Generate JWT token for the link (expires in 90 days)
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.full_name,
        role: 'user',
        linkToken: user.unique_link
      },
      config.jwt.secret,
      {
        expiresIn: '90d'
      }
    );

    // Build full URL
    const link = `${config.frontendUrl}/availability.html?token=${token}`;

    res.json({
      link,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error generating link:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while generating link'
    });
  }
});

/**
 * POST /api/users/:id/regenerate-link
 * Regenerate unique link token for a user (invalidates old link)
 * Requires admin authentication
 */
router.post('/:id/regenerate-link', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Generate new token
    const newLinkToken = nanoid(32);

    // Update user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ unique_link: newLinkToken })
      .eq('id', id)
      .select()
      .single();

    if (error || !user) {
      console.error('Database error:', error);
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Generate new JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.full_name,
        role: 'user',
        linkToken: user.unique_link
      },
      config.jwt.secret,
      {
        expiresIn: '90d'
      }
    );

    const link = `${config.frontendUrl}/availability.html?token=${token}`;

    res.json({
      link,
      message: 'Link regenerated successfully',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error regenerating link:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while regenerating link'
    });
  }
});

/**
 * GET /api/users/by-link/:linkToken
 * Get user information by their unique link token (public endpoint)
 * Used for validating permanent availability links
 */
router.get('/by-link/:linkToken', async (req, res) => {
  try {
    const { linkToken } = req.params;

    // Find user by unique link
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, gender, is_active')
      .eq('unique_link', linkToken)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Invalid or expired link'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This user account has been deactivated'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        gender: user.gender
      }
    });

  } catch (error) {
    console.error('Error validating link:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while validating link'
    });
  }
});

module.exports = router;
