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

// Token configuration
const ACCESS_TOKEN_EXPIRY = '2h';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const NONCE_EXPIRY_MINUTES = 5;

// Clean expired nonces every 5 minutes
setInterval(async () => {
  try {
    await pool.query('DELETE FROM wallet_nonces WHERE expires_at < NOW()');
  } catch (e) {
    console.error('Nonce cleanup error:', e.message);
  }
}, 5 * 60 * 1000);

// ============ REFRESH TOKEN FUNCTIONS ============

async function generateRefreshToken(userId, adminId, req) {
  const token = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  
  await pool.query(`
    INSERT INTO refresh_tokens (user_id, admin_id, token_hash, expires_at, user_agent, ip_address)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [userId, adminId, tokenHash, expiresAt, req.headers['user-agent'], getClientIp(req)]);
  
  return token;
}

async function validateRefreshToken(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  const result = await pool.query(`
    SELECT rt.*, u.wallet_address, a.email as admin_email, a.role as admin_role
    FROM refresh_tokens rt
    LEFT JOIN users u ON rt.user_id = u.id
    LEFT JOIN admins a ON rt.admin_id = a.id
    WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()
  `, [tokenHash]);
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function revokeRefreshToken(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
}

async function revokeAllTokens(userId, adminId) {
  if (userId) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
  }
  if (adminId) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE admin_id = $1 AND revoked_at IS NULL', [adminId]);
  }
}

// ============ NONCE FUNCTIONS (PostgreSQL) ============

async function storeNonce(walletAddress, nonce, message) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + NONCE_EXPIRY_MINUTES);
  
  await pool.query(`
    INSERT INTO wallet_nonces (wallet_address, nonce, message, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (wallet_address) DO UPDATE SET nonce = $2, message = $3, expires_at = $4, created_at = NOW()
  `, [walletAddress, nonce, message, expiresAt]);
}

async function getNonce(walletAddress) {
  const result = await pool.query(
    'SELECT * FROM wallet_nonces WHERE wallet_address = $1 AND expires_at > NOW()',
    [walletAddress]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function deleteNonce(walletAddress) {
  await pool.query('DELETE FROM wallet_nonces WHERE wallet_address = $1', [walletAddress]);
}

// ============ ROUTES ============

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

    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = await generateRefreshToken(null, admin.id, req);

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
      accessToken,
      refreshToken,
      expiresIn: 7200,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const tokenData = await validateRefreshToken(refreshToken);
    
    if (!tokenData) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    await revokeRefreshToken(refreshToken);

    let accessToken, newRefreshToken;

    if (tokenData.admin_id) {
      accessToken = jwt.sign(
        { id: tokenData.admin_id, email: tokenData.admin_email, role: tokenData.admin_role, type: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );
      newRefreshToken = await generateRefreshToken(null, tokenData.admin_id, req);
    } else {
      accessToken = jwt.sign(
        { id: tokenData.user_id, walletAddress: tokenData.wallet_address, type: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );
      newRefreshToken = await generateRefreshToken(tokenData.user_id, null, req);
    }

    res.json({ accessToken, refreshToken: newRefreshToken, expiresIn: 7200 });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
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

    const result = await pool.query('SELECT * FROM admins WHERE id = $1', [adminId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newPasswordHash, adminId]);
    await revokeAllTokens(null, adminId);

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

    res.json({ message: 'Password changed successfully. Please login again.' });
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

    const nonce = crypto.randomBytes(32).toString('hex');
    const message = `Sign this message to connect to Thailand My Car.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

    await storeNonce(lowerAddress, nonce, message);

    res.json({ message, nonce });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register user by wallet with signature verification
// Supports both external wallets (with signature) and embedded wallets (social login, without signature)
router.post('/wallet/connect', [
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/),
  body('signature').optional().matches(/^0x[a-fA-F0-9]+$/),
  body('isEmbeddedWallet').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, signature, isEmbeddedWallet } = req.body;
    const lowerAddress = walletAddress.toLowerCase();

    // For external wallets: signature is REQUIRED
    // For embedded wallets (social login): signature is skipped
    if (!isEmbeddedWallet && !signature) {
      return res.status(401).json({
        error: 'Signature is required for wallet authentication.',
        code: 'SIGNATURE_REQUIRED'
      });
    }

    // Verify signature for external wallets
    if (signature && !isEmbeddedWallet) {
      const storedData = await getNonce(lowerAddress);

      if (!storedData) {
        return res.status(400).json({
          error: 'No nonce found or nonce expired. Please request a new nonce first.',
          code: 'NONCE_EXPIRED'
        });
      }

      try {
        const recoveredAddress = ethers.verifyMessage(storedData.message, signature);

        if (recoveredAddress.toLowerCase() !== lowerAddress) {
          console.log(`Signature verification failed: expected ${lowerAddress}, got ${recoveredAddress.toLowerCase()}`);
          return res.status(401).json({
            error: 'Invalid signature. Wallet address does not match.',
            code: 'INVALID_SIGNATURE'
          });
        }

        await deleteNonce(lowerAddress);
      } catch (sigError) {
        console.error('Signature verification error:', sigError);
        return res.status(401).json({
          error: 'Invalid signature format.',
          code: 'INVALID_SIGNATURE'
        });
      }
    }


    let result = await pool.query('SELECT * FROM users WHERE wallet_address = $1', [lowerAddress]);

    if (result.rows.length === 0) {
      result = await pool.query('INSERT INTO users (wallet_address) VALUES ($1) RETURNING *', [lowerAddress]);
    }

    const user = result.rows[0];

    const accessToken = jwt.sign(
      { id: user.id, walletAddress: user.wallet_address, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = await generateRefreshToken(user.id, null, req);

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
        signatureVerified: !!signature,
        isEmbeddedWallet: !!isEmbeddedWallet
      }
    });

    res.json({
      accessToken,
      refreshToken,
      expiresIn: 7200,
      user: { id: user.id, walletAddress: user.wallet_address, createdAt: user.created_at }
    });
  } catch (error) {
    console.error('Wallet connect error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
