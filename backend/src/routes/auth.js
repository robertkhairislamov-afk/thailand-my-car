const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logActivity, getClientIp } = require('../utils/logger');

// In-memory nonce store (for production, use Redis)
const nonceStore = new Map();
const NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Clean expired nonces every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of nonceStore.entries()) {
    if (now - data.createdAt > NONCE_EXPIRY) {
      nonceStore.delete(key);
    }
  }
}, 60 * 1000);

// Admin login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log successful login
    await logActivity({
      action: 'admin_login',
      entityType: 'admin',
      entityId: admin.id,
      userId: admin.id,
      userEmail: admin.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { role: admin.role }
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Change admin password
router.post('/admin/change-password', [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    // Get admin from database
    const result = await pool.query(
      'SELECT * FROM admins WHERE id = $1',
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = result.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, adminId]
    );

    // Log password change
    await logActivity({
      action: 'password_change',
      entityType: 'admin',
      entityId: adminId,
      userId: adminId,
      userEmail: req.user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: null
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get nonce for wallet signature
router.post('/wallet/nonce', [
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress } = req.body;
    const lowerAddress = walletAddress.toLowerCase();

    // Generate random nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    const message = `Sign this message to connect to Thailand My Car.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

    // Store nonce
    nonceStore.set(lowerAddress, {
      nonce,
      message,
      createdAt: Date.now()
    });

    res.json({ message, nonce });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register user by wallet with signature verification
router.post('/wallet/connect', [
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/),
  body('signature').matches(/^0x[a-fA-F0-9]+$/).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, signature } = req.body;
    const lowerAddress = walletAddress.toLowerCase();

    // Verify signature if provided
    if (signature) {
      const storedData = nonceStore.get(lowerAddress);

      if (!storedData) {
        return res.status(400).json({
          error: 'No nonce found. Please request a new nonce first.',
          code: 'NONCE_EXPIRED'
        });
      }

      // Check nonce expiry
      if (Date.now() - storedData.createdAt > NONCE_EXPIRY) {
        nonceStore.delete(lowerAddress);
        return res.status(400).json({
          error: 'Nonce expired. Please request a new one.',
          code: 'NONCE_EXPIRED'
        });
      }

      try {
        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(storedData.message, signature);

        if (recoveredAddress.toLowerCase() !== lowerAddress) {
          console.log(`Signature verification failed: expected ${lowerAddress}, got ${recoveredAddress.toLowerCase()}`);
          return res.status(401).json({
            error: 'Invalid signature. Wallet address does not match.',
            code: 'INVALID_SIGNATURE'
          });
        }

        // Clear used nonce
        nonceStore.delete(lowerAddress);
      } catch (sigError) {
        console.error('Signature verification error:', sigError);
        return res.status(401).json({
          error: 'Invalid signature format.',
          code: 'INVALID_SIGNATURE'
        });
      }
    }

    // Find or create user
    let result = await pool.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [lowerAddress]
    );

    if (result.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO users (wallet_address) VALUES ($1) RETURNING *',
        [lowerAddress]
      );
    }

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, walletAddress: user.wallet_address, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log wallet connection
    await logActivity({
      action: 'wallet_connect',
      entityType: 'user',
      entityId: user.id,
      userType: 'user',
      userId: user.id,
      userEmail: null,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: {
        walletAddress: lowerAddress,
        isNewUser: result.command === 'INSERT',
        signatureVerified: !!signature
      }
    });

    res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Wallet connect error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
