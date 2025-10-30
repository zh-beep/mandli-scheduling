const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateAdmin } = require('../middleware/auth');
const calendarService = require('../services/calendar');

const router = express.Router();

/**
 * POST /api/calendar/connect-by-email
 * Start OAuth flow using email address
 * Public endpoint - anyone can connect their calendar
 */
router.post('/connect-by-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email is required'
      });
    }

    // Look up user by email
    let { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('email', email)
      .single();

    // If user doesn't exist, create them
    if (error || !user) {
      console.log(`User not found for ${email}, creating new user...`);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          email: email,
          full_name: email.split('@')[0], // Use email prefix as default name
          cell_phone: null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({
          error: 'Server error',
          message: 'Failed to create user account'
        });
      }

      user = newUser;
    }

    // Generate OAuth URL
    const authUrl = calendarService.getAuthUrl(user.id);

    res.json({
      authUrl,
      message: 'Redirecting to Google Calendar authorization',
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error initiating OAuth:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to initiate calendar connection'
    });
  }
});

/**
 * POST /api/calendar/connect/:userId
 * Start OAuth flow for a user
 * Public endpoint - users can connect their own calendar
 */
router.post('/connect/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Generate OAuth URL
    const authUrl = calendarService.getAuthUrl(userId);

    res.json({
      authUrl,
      message: 'Send this URL to the user to authorize calendar access',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error initiating OAuth:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to initiate calendar connection'
    });
  }
});

/**
 * GET /api/calendar/callback
 * OAuth callback - handles Google's redirect
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state: userId, error } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: #e74c3c;">❌ Authorization Failed</h1>
            <p>You denied access or an error occurred: ${error}</p>
            <p>Please contact your administrator.</p>
          </body>
        </html>
      `);
    }

    if (!code || !userId) {
      return res.status(400).send('Missing authorization code or user ID');
    }

    // Exchange code for tokens
    const tokens = await calendarService.getTokensFromCode(code);

    // Store tokens in database
    // First, try to delete any existing entry for this user
    await supabaseAdmin
      .from('gmail_sender')
      .delete()
      .eq('user_email', userId);

    // Then insert the new tokens
    const { error: dbError } = await supabaseAdmin
      .from('gmail_sender')
      .insert({
        user_email: userId, // Using user_id here, but field is named user_email
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(tokens.expiry_date).toISOString(),
        authenticated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).send('Failed to save authorization');
    }

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Calendar Connected - Mandli Scheduler</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              max-width: 500px;
              width: 100%;
              padding: 40px;
              text-align: center;
            }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #27ae60; margin-bottom: 20px; font-size: 28px; }
            p { color: #666; margin: 10px 0; line-height: 1.6; }
            .info-box {
              background: #f0fff4;
              border-left: 4px solid #27ae60;
              padding: 20px;
              margin: 30px 0;
              text-align: left;
              border-radius: 8px;
            }
            .info-box ul {
              list-style: none;
              padding: 0;
            }
            .info-box li {
              margin: 10px 0;
              padding-left: 25px;
              position: relative;
            }
            .info-box li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #27ae60;
              font-weight: bold;
            }
            .close-button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 16px;
              font-weight: 600;
              border-radius: 8px;
              cursor: pointer;
              margin-top: 20px;
            }
            .close-button:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Calendar Connected!</h1>
            <p>Your Google Calendar has been successfully connected to Mandli Scheduler.</p>

            <div class="info-box">
              <ul>
                <li>Future duty assignments will automatically appear in your calendar</li>
                <li>You'll receive email and popup reminders before shifts</li>
                <li>No need to manually add events anymore</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #888; margin-top: 20px;">
              You can close this window now or click the button below.
            </p>

            <button class="close-button" onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1 style="color: #e74c3c;">❌ Error</h1>
          <p>Failed to complete authorization: ${error.message}</p>
          <p>Please try again or contact your administrator.</p>
        </body>
      </html>
    `);
  }
});

/**
 * POST /api/calendar/send-invite
 * Send calendar invite to a user
 * Admin endpoint
 */
router.post('/send-invite', authenticateAdmin, async (req, res) => {
  try {
    const { userId, title, description, startDateTime, endDateTime, timeZone, attendees } = req.body;

    // Validate input
    if (!userId || !title || !startDateTime || !endDateTime) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'userId, title, startDateTime, and endDateTime are required'
      });
    }

    // Get user's OAuth tokens
    const { data: authData, error: authError } = await supabaseAdmin
      .from('gmail_sender')
      .select('*')
      .eq('user_email', userId)
      .single();

    if (authError || !authData) {
      return res.status(404).json({
        error: 'Not authorized',
        message: 'User has not connected their Google Calendar. Please have them authorize first.'
      });
    }

    // Check if token needs refresh
    let tokens = {
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expiry_date: new Date(authData.expires_at).getTime()
    };

    // If token expired, refresh it
    if (new Date(authData.expires_at) < new Date()) {
      console.log('Token expired, refreshing...');
      tokens = await calendarService.refreshAccessToken(authData.refresh_token);

      // Update database with new tokens
      await supabaseAdmin
        .from('gmail_sender')
        .update({
          access_token: tokens.access_token,
          expires_at: new Date(tokens.expiry_date).toISOString()
        })
        .eq('user_email', userId);
    }

    // Create calendar event
    const event = await calendarService.createCalendarEvent(tokens, {
      title,
      description,
      startDateTime,
      endDateTime,
      timeZone: timeZone || 'America/New_York',
      attendees: attendees || []
    });

    // Get user info
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    res.json({
      success: true,
      message: `Calendar event created for ${user?.full_name || 'user'}`,
      event: {
        id: event.id,
        title: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
        htmlLink: event.htmlLink
      }
    });

  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message || 'Failed to create calendar event'
    });
  }
});

/**
 * GET /api/calendar/status/:userId
 * Check if user has connected their calendar
 */
router.get('/status/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: authData, error } = await supabaseAdmin
      .from('gmail_sender')
      .select('authenticated_at, expires_at')
      .eq('user_email', userId)
      .single();

    if (error || !authData) {
      return res.json({
        connected: false,
        message: 'Calendar not connected'
      });
    }

    const isExpired = new Date(authData.expires_at) < new Date();

    res.json({
      connected: true,
      authenticatedAt: authData.authenticated_at,
      tokenExpired: isExpired
    });

  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to check calendar status'
    });
  }
});

module.exports = router;
