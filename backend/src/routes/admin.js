const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [investments, users, messages, recentInvestments, tierStats, topInvestors] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'confirmed' OR status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COALESCE(SUM(amount_usdt), 0) as total_usdt,
          COALESCE(SUM(amount_baht), 0) as total_baht,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN return_amount ELSE 0 END), 0) as roi_paid
        FROM investments
      `),
      pool.query('SELECT COUNT(*) as total FROM users'),
      pool.query(`
        SELECT COUNT(*) as total,
               COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages
        FROM contact_messages
      `),
      pool.query(`
        SELECT i.*, t.name as tier_name, u.wallet_address, u.email as user_email
        FROM investments i
        JOIN investment_tiers t ON i.tier_id = t.id
        LEFT JOIN users u ON i.user_id = u.id
        ORDER BY i.invested_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT t.name, COUNT(i.id) as investors, COALESCE(SUM(i.amount_usdt), 0) as value
        FROM investment_tiers t
        LEFT JOIN investments i ON t.id = i.tier_id
        GROUP BY t.id, t.name
        ORDER BY t.id
      `),
      pool.query(`
        SELECT u.wallet_address as name, COALESCE(SUM(i.amount_usdt), 0) as amount
        FROM users u
        LEFT JOIN investments i ON u.id = i.user_id
        GROUP BY u.id, u.wallet_address
        HAVING COALESCE(SUM(i.amount_usdt), 0) > 0
        ORDER BY amount DESC
        LIMIT 5
      `)
    ]);

    const invData = investments.rows[0];

    // Format data for frontend Dashboard component
    res.json({
      stats: {
        total_invested: invData.total_usdt,
        active_investors: invData.active,
        pending_count: invData.pending,
        roi_paid: invData.roi_paid,
        monthly_revenue: 0, // Calculate from actual data when available
        previous_month_revenue: 0
      },
      tierDistribution: tierStats.rows.map(t => ({
        name: t.name,
        value: Number(t.value),
        investors: Number(t.investors)
      })).filter(t => t.value > 0),
      topInvestors: topInvestors.rows.map(i => ({
        name: i.name ? `${i.name.slice(0, 6)}...${i.name.slice(-4)}` : 'Unknown',
        amount: Number(i.amount)
      })),
      recentActivity: recentInvestments.rows.map(inv => ({
        type: 'investment',
        text: inv.status === 'pending'
          ? `Новая инвестиция от ${inv.wallet_address ? inv.wallet_address.slice(0,6) + '...' : 'Unknown'}`
          : `Инвестиция ${inv.status} от ${inv.wallet_address ? inv.wallet_address.slice(0,6) + '...' : 'Unknown'}`,
        amount: `$${Number(inv.amount_usdt || 0).toLocaleString()}`,
        time: inv.invested_at ? new Date(inv.invested_at).toLocaleDateString('ru-RU') : '-',
        status: inv.status
      })),
      trends: [], // Will be populated when we have historical data
      revenue: [], // Will be populated when we have historical data
      // Legacy format for compatibility
      investments: invData,
      users: users.rows[0],
      messages: messages.rows[0],
      recentInvestments: recentInvestments.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all investments with filters
router.get('/investments', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` WHERE i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      const searchCondition = `i.wallet_address ILIKE $${paramIndex}`;
      whereClause += whereClause ? ` AND ${searchCondition}` : ` WHERE ${searchCondition}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM investments i ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await pool.query(`
      SELECT i.*, t.name as tier_name, t.return_percentage, u.email as user_email
      FROM investments i
      JOIN investment_tiers t ON i.tier_id = t.id
      LEFT JOIN users u ON i.user_id = u.id
      ${whereClause}
      ORDER BY i.invested_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    res.json({
      investments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update investment status
router.patch('/investments/:id', [
  body('status').isIn(['pending', 'pending_confirmation', 'confirmed', 'active', 'completed', 'cancelled', 'refunded', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, notes, returnAmount, nftTokenId } = req.body;

    const updates = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];
    let paramIndex = 2;

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (returnAmount !== undefined) {
      updates.push(`return_amount = $${paramIndex}`);
      params.push(returnAmount);
      paramIndex++;
    }

    if (nftTokenId !== undefined) {
      updates.push(`nft_token_id = $${paramIndex}`);
      params.push(nftTokenId);
      paramIndex++;
    }

    if (status === 'completed') {
      updates.push(`returned_at = CURRENT_TIMESTAMP`);
    }

    params.push(id);

    const result = await pool.query(`
      UPDATE investments
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update investment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause = `WHERE wallet_address ILIKE $${paramIndex} OR email ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await pool.query(`
      SELECT u.*,
             COUNT(i.id) as total_investments,
             COALESCE(SUM(i.amount_usdt), 0) as total_invested_usdt
      FROM users u
      LEFT JOIN investments i ON u.id = i.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get contact messages
router.get('/messages', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause = `WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM contact_messages ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await pool.query(`
      SELECT * FROM contact_messages
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    res.json({
      messages: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update message status
router.patch('/messages/:id', [
  body('status').isIn(['new', 'read', 'replied', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updates = ['status = $1'];
    if (status === 'replied') {
      updates.push('replied_at = CURRENT_TIMESTAMP');
    }

    const result = await pool.query(`
      UPDATE contact_messages
      SET ${updates.join(', ')}
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Investment tiers management
router.get('/tiers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM investment_tiers ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/tiers/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, minInvestmentUsd, returnPercentage } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    if (minInvestmentUsd !== undefined) {
      updates.push(`min_investment_usd = $${paramIndex}`);
      params.push(minInvestmentUsd);
      paramIndex++;
    }

    if (returnPercentage !== undefined) {
      updates.push(`return_percentage = $${paramIndex}`);
      params.push(returnPercentage);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(id);

    const result = await pool.query(`
      UPDATE investment_tiers
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tier not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tier error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
