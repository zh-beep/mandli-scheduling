const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const config = require('../config');

const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 *
 * Request body:
 * {
 *   "username": "mandli",
 *   "password": "Mandli8"
 * }
 *
 * Response:
 * {
 *   "token": "jwt_token_here",
 *   "admin": {
 *     "id": "uuid",
 *     "username": "mandli"
 *   }
 * }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username and password are required'
      });
    }

    // Find admin by username
    const { data: admins, error: queryError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (queryError) {
      console.error('Database error:', queryError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to query admin account'
      });
    }

    if (!admins || admins.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    const admin = admins[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        role: 'admin'
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn
      }
    );

    // Return token and admin info
    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred during login'
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify if the current token is valid
 * Requires Authorization header with Bearer token
 */
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        valid: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    res.json({
      valid: true,
      admin: {
        id: decoded.adminId,
        username: decoded.username
      }
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;
