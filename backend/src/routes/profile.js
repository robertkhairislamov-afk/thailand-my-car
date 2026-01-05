const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logActivity, getClientIp } = require('../utils/logger');

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { network = 'mainnet' } = req.query;

    const result = await pool.query(
      `SELECT
        id, wallet_address, email, name, telegram, whatsapp,
        instagram, twitter, facebook, avatar_url, bio,
        preferred_language, email_verified, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get investment stats (filtered by network)
    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_investments,
        COALESCE(SUM(amount_usdt), 0) as total_invested_usdt,
        COALESCE(SUM(amount_baht), 0) as total_invested_baht,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_investments
       FROM investments WHERE user_id = $1 AND COALESCE(network, 'mainnet') = $2`,
      [userId, network]
    );

    const stats = statsResult.rows[0];

    res.json({
      profile: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        name: user.name,
        telegram: user.telegram,
        whatsapp: user.whatsapp,
        instagram: user.instagram,
        twitter: user.twitter,
        facebook: user.facebook,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        preferredLanguage: user.preferred_language,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      },
      stats: {
        totalInvestments: parseInt(stats.total_investments),
        totalInvestedUsdt: parseFloat(stats.total_invested_usdt),
        totalInvestedBaht: parseFloat(stats.total_invested_baht),
        activeInvestments: parseInt(stats.active_investments)
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/', authenticateToken, [
  body('name').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('telegram').optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('whatsapp').optional({ checkFalsy: true }).isLength({ max: 20 }),
  body('instagram').optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('twitter').optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('facebook').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('bio').optional({ checkFalsy: true }).isLength({ max: 1000 }),
  body('preferredLanguage').optional({ checkFalsy: true }).isIn(['ru', 'en', 'th'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      name, email, telegram, whatsapp,
      instagram, twitter, facebook, bio, preferredLanguage
    } = req.body;

    // Check if email already exists (for another user)
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        telegram = COALESCE($3, telegram),
        whatsapp = COALESCE($4, whatsapp),
        instagram = COALESCE($5, instagram),
        twitter = COALESCE($6, twitter),
        facebook = COALESCE($7, facebook),
        bio = COALESCE($8, bio),
        preferred_language = COALESCE($9, preferred_language),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING id, wallet_address, email, name, telegram, whatsapp,
                 instagram, twitter, facebook, avatar_url, bio,
                 preferred_language, email_verified, created_at`,
      [name, email, telegram, whatsapp, instagram, twitter, facebook, bio, preferredLanguage, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Log profile update
    await logActivity({
      action: 'profile_update',
      entityType: 'user',
      entityId: userId,
      userType: 'user',
      userId: userId,
      userEmail: user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: {
        walletAddress: user.wallet_address,
        updatedFields: Object.keys(req.body).filter(k => req.body[k] !== undefined)
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        name: user.name,
        telegram: user.telegram,
        whatsapp: user.whatsapp,
        instagram: user.instagram,
        twitter: user.twitter,
        facebook: user.facebook,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        preferredLanguage: user.preferred_language,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user investments
router.get('/investments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { network = 'mainnet' } = req.query;

    const result = await pool.query(
      `SELECT
        i.id, i.amount_usdt, i.amount_baht, i.status,
        i.invested_at, i.maturity_date, i.return_amount,
        COALESCE(i.network, 'mainnet') as network,
        t.name as tier_name, t.return_percentage, t.duration_months
       FROM investments i
       LEFT JOIN investment_tiers t ON i.tier_id = t.id
       WHERE i.user_id = $1 AND COALESCE(i.network, 'mainnet') = $2
       ORDER BY i.invested_at DESC`,
      [userId, network]
    );

    res.json({
      investments: result.rows.map(inv => ({
        id: inv.id,
        amountUsdt: parseFloat(inv.amount_usdt),
        amountBaht: parseFloat(inv.amount_baht),
        status: inv.status,
        investedAt: inv.invested_at,
        maturityDate: inv.maturity_date,
        returnAmount: inv.return_amount ? parseFloat(inv.return_amount) : null,
        tierName: inv.tier_name,
        returnPercentage: inv.return_percentage ? parseFloat(inv.return_percentage) : null,
        durationMonths: inv.duration_months
      }))
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
