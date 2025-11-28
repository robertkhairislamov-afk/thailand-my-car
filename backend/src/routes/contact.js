const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Submit contact form
router.post('/', [
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

    const { name, email, subject, message } = req.body;

    const result = await pool.query(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `, [name, email, subject || 'General Inquiry', message]);

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
