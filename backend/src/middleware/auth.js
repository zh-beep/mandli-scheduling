const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to verify JWT tokens for admin authentication
 */
const authenticateAdmin = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if token is for admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin access required'
      });
    }

    // Attach admin info to request
    req.admin = {
      id: decoded.adminId,
      username: decoded.username
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication failed'
      });
    }

    return res.status(500).json({
      error: 'Authentication error',
      message: error.message
    });
  }
};

/**
 * Middleware to verify unique user links (for availability form)
 * Supports both JWT tokens (legacy) and permanent link tokens (preferred)
 */
const authenticateUserLink = async (req, res, next) => {
  try {
    // Try permanent link token first (preferred method)
    const linkToken = req.query.link || req.headers['x-link-token'];

    if (linkToken) {
      // Validate permanent link token via database
      const { supabaseAdmin } = require('../config/supabase');

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, gender, is_active')
        .eq('unique_link', linkToken)
        .single();

      if (error || !user) {
        return res.status(401).json({
          error: 'Invalid link',
          message: 'Link not found or invalid'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          error: 'Account disabled',
          message: 'This user account has been deactivated'
        });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        name: user.full_name,
        email: user.email,
        gender: user.gender
      };

      return next();
    }

    // Fallback to JWT token (legacy support)
    const jwtToken = req.query.token;

    if (!jwtToken) {
      return res.status(401).json({
        error: 'Invalid link',
        message: 'No authentication token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(jwtToken, config.jwt.secret);

    // Check if token is for user link
    if (decoded.role !== 'user') {
      return res.status(403).json({
        error: 'Invalid link',
        message: 'This link is not valid'
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      name: decoded.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Link expired',
        message: 'This link has expired. Please contact admin.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid link',
        message: 'This link is not valid'
      });
    }

    return res.status(500).json({
      error: 'Authentication error',
      message: error.message
    });
  }
};

module.exports = {
  authenticateAdmin,
  authenticateUserLink
};
