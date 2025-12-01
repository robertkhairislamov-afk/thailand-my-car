const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Rate limiting: in-memory store (for production, use Redis)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // Max 3 requests per minute per IP
const MIN_FORM_TIME = 2000; // 2 seconds minimum to fill form (anti-bot)

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Get client IP (handles proxies)
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip ||
         'unknown';
}

// Rate limit middleware
function checkRateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();

  let ipData = rateLimitStore.get(ip);

  if (!ipData || now - ipData.windowStart > RATE_LIMIT_WINDOW) {
    // New window
    ipData = { windowStart: now, count: 1 };
    rateLimitStore.set(ip, ipData);
    return next();
  }

  ipData.count++;

  if (ipData.count > RATE_LIMIT_MAX_REQUESTS) {
    console.log(`Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute before trying again.'
    });
  }

  next();
}

// Submit contact form
router.post('/', checkRateLimit, [
  body('name').trim().isLength({ min: 2, max: 255 }),
  body('email').isEmail().normalizeEmail(),
  body('subject').optional().trim().isLength({ max: 255 }),
  body('message').trim().isLength({ min: 10, max: 5000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message, website, _formStartTime, _source } = req.body;

    // Anti-spam check 1: Honeypot field
    if (website) {
      console.log('Bot detected via honeypot:', { ip: getClientIp(req), website });
      // Return success to not alert bots, but don't save
      return res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully',
        id: 'blocked'
      });
    }

    // Anti-spam check 2: Form fill time (if provided)
    if (_formStartTime) {
      const fillTime = Date.now() - parseInt(_formStartTime, 10);
      if (fillTime < MIN_FORM_TIME) {
        console.log('Bot detected via fast form fill:', { ip: getClientIp(req), fillTime });
        return res.status(201).json({
          success: true,
          message: 'Your message has been sent successfully',
          id: 'blocked'
        });
      }
    }

    // Check for duplicate messages in last 5 minutes
    const duplicateCheck = await pool.query(`
      SELECT id FROM contact_messages
      WHERE email = $1 AND message = $2
      AND created_at > NOW() - INTERVAL '5 minutes'
    `, [email, message]);

    if (duplicateCheck.rows.length > 0) {
      console.log('Duplicate message blocked:', { ip: getClientIp(req), email });
      return res.status(429).json({
        error: 'This message was already sent. Please wait before sending again.'
      });
    }

    // Save message with source info
    const fullSubject = _source ? `[${_source}] ${subject || 'General Inquiry'}` : (subject || 'General Inquiry');

    const result = await pool.query(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `, [name, email, fullSubject, message]);

    console.log('Contact message saved:', { id: result.rows[0].id, source: _source || 'direct', ip: getClientIp(req) });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
