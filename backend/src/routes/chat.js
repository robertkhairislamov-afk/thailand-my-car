const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get or create chat session
router.post('/session', async (req, res) => {
  try {
    const { sessionId, userName, userEmail, userWallet } = req.body;

    if (!userName) {
      return res.status(400).json({ error: 'User name is required' });
    }

    // Check if session exists
    let session;
    if (sessionId) {
      const existing = await pool.query(
        'SELECT * FROM chat_sessions WHERE id = $1',
        [sessionId]
      );
      if (existing.rows.length > 0) {
        session = existing.rows[0];
      }
    }

    // Create new session if not found
    if (!session) {
      const result = await pool.query(`
        INSERT INTO chat_sessions (user_name, user_email, user_wallet)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [userName, userEmail || null, userWallet || null]);
      session = result.rows[0];
    }

    res.json({ session });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/message', async (req, res) => {
  try {
    const { sessionId, sender, senderName, message } = req.body;

    if (!sessionId || !sender || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save message
    const result = await pool.query(`
      INSERT INTO chat_messages (session_id, sender, sender_name, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [sessionId, sender, senderName || null, message]);

    // Update session timestamp
    await pool.query(`
      UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [sessionId]);

    res.json({ message: result.rows[0] });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Request admin help
router.post('/request-admin', async (req, res) => {
  try {
    const { sessionId } = req.body;

    await pool.query(`
      UPDATE chat_sessions
      SET needs_admin = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [sessionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Request admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for session (client)
router.get('/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { after } = req.query;

    let query = `
      SELECT * FROM chat_messages
      WHERE session_id = $1
    `;
    const params = [sessionId];

    if (after) {
      query += ` AND created_at > $2`;
      params.push(after);
    }

    query += ` ORDER BY created_at ASC`;

    const result = await pool.query(query, params);
    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ ADMIN ROUTES ============

// Get all chat sessions (admin)
router.get('/admin/sessions', authenticateToken, async (req, res) => {
  try {
    const { status, needsAdmin } = req.query;

    let query = `
      SELECT
        cs.*,
        (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id AND sender = 'user' AND read = false) as unread_count,
        (SELECT message FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_sessions cs
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND cs.status = $${params.length}`;
    }

    if (needsAdmin === 'true') {
      query += ` AND cs.needs_admin = true`;
    }

    query += ` ORDER BY cs.updated_at DESC`;

    const result = await pool.query(query, params);
    res.json({ sessions: result.rows });
  } catch (error) {
    console.error('Admin sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for session (admin)
router.get('/admin/messages/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session info
    const session = await pool.query(
      'SELECT * FROM chat_sessions WHERE id = $1',
      [sessionId]
    );

    // Get messages
    const messages = await pool.query(`
      SELECT * FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [sessionId]);

    // Mark user messages as read
    await pool.query(`
      UPDATE chat_messages
      SET read = true
      WHERE session_id = $1 AND sender = 'user'
    `, [sessionId]);

    res.json({
      session: session.rows[0],
      messages: messages.rows
    });
  } catch (error) {
    console.error('Admin messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin send message
router.post('/admin/message', authenticateToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const adminId = req.user.id;
    const adminEmail = req.user.email;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save admin message
    const result = await pool.query(`
      INSERT INTO chat_messages (session_id, sender, sender_name, message)
      VALUES ($1, 'admin', $2, $3)
      RETURNING *
    `, [sessionId, adminEmail, message]);

    // Update session - admin is handling it
    await pool.query(`
      UPDATE chat_sessions
      SET admin_id = $1, needs_admin = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [adminId, sessionId]);

    res.json({ message: result.rows[0] });
  } catch (error) {
    console.error('Admin message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Close chat session
router.post('/admin/close/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    await pool.query(`
      UPDATE chat_sessions
      SET status = 'closed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [sessionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread count for admin
router.get('/admin/unread', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.sender = 'user' AND cm.read = false AND cs.status = 'active'
    `);

    res.json({ unread: parseInt(result.rows[0].count) || 0 });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
