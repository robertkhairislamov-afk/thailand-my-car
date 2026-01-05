const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const { logActivity, getClientIp } = require('../utils/logger');

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { network = 'mainnet' } = req.query;

    const [investments, users, messages, recentInvestments, tierStats, topInvestors, investmentTrends, revenueTrends] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status NOT IN ('rejected', 'cancelled', 'refunded')) as total,
          COUNT(CASE WHEN status = 'pending' OR status = 'pending_confirmation' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'confirmed' OR status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status IN ('rejected', 'cancelled', 'refunded') THEN 1 END) as rejected,
          COALESCE(SUM(amount_usdt) FILTER (WHERE status NOT IN ('rejected', 'cancelled', 'refunded')), 0) as total_usdt,
          COALESCE(SUM(amount_baht) FILTER (WHERE status NOT IN ('rejected', 'cancelled', 'refunded')), 0) as total_baht,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN return_amount ELSE 0 END), 0) as roi_paid,
          COUNT(CASE WHEN (status = 'confirmed' OR status = 'active') AND amount_usdt >= 12400 THEN 1 END) as car_investors,
          COUNT(CASE WHEN (status = 'confirmed' OR status = 'active') AND amount_usdt < 12400 THEN 1 END) as staking_investors
        FROM investments
        WHERE COALESCE(network, 'mainnet') = $1
      `, [network]),
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
        WHERE i.status NOT IN ('rejected', 'cancelled', 'refunded')
          AND COALESCE(i.network, 'mainnet') = $1
        ORDER BY i.invested_at DESC
        LIMIT 10
      `, [network]),
      pool.query(`
        SELECT t.name,
               COUNT(CASE WHEN i.status NOT IN ('rejected', 'cancelled', 'refunded') AND COALESCE(i.network, 'mainnet') = $1 THEN i.id END) as investors,
               COALESCE(SUM(CASE WHEN i.status NOT IN ('rejected', 'cancelled', 'refunded') AND COALESCE(i.network, 'mainnet') = $1 THEN i.amount_usdt ELSE 0 END), 0) as value
        FROM investment_tiers t
        LEFT JOIN investments i ON t.id = i.tier_id
        GROUP BY t.id, t.name
        ORDER BY t.id
      `, [network]),
      pool.query(`
        SELECT u.wallet_address as name,
               COALESCE(SUM(CASE WHEN i.status NOT IN ('rejected', 'cancelled', 'refunded') AND COALESCE(i.network, 'mainnet') = $1 THEN i.amount_usdt ELSE 0 END), 0) as amount
        FROM users u
        LEFT JOIN investments i ON u.id = i.user_id
        GROUP BY u.id, u.wallet_address
        HAVING COALESCE(SUM(CASE WHEN i.status NOT IN ('rejected', 'cancelled', 'refunded') AND COALESCE(i.network, 'mainnet') = $1 THEN i.amount_usdt ELSE 0 END), 0) > 0
        ORDER BY amount DESC
        LIMIT 5
      `, [network]),
      // Investment trends by day (last 30 days)
      pool.query(`
        SELECT
          DATE(invested_at) as date,
          SUM(amount_usdt) as daily_amount,
          SUM(SUM(amount_usdt)) OVER (ORDER BY DATE(invested_at)) as cumulative
        FROM investments
        WHERE COALESCE(network, 'mainnet') = $1
          AND status NOT IN ('rejected', 'cancelled', 'refunded')
          AND invested_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(invested_at)
        ORDER BY date
      `, [network]),
      // Revenue trends by month
      pool.query(`
        SELECT
          DATE_TRUNC('month', returned_at) as month,
          SUM(return_amount) as monthly_revenue
        FROM investments
        WHERE COALESCE(network, 'mainnet') = $1
          AND status = 'completed'
          AND returned_at IS NOT NULL
        GROUP BY DATE_TRUNC('month', returned_at)
        ORDER BY month
        LIMIT 12
      `, [network])
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
        previous_month_revenue: 0,
        car_investors: Number(invData.car_investors) || 0,
        staking_investors: Number(invData.staking_investors) || 0
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
      trends: investmentTrends.rows.map(t => ({
        month: new Date(t.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
        amount: Number(t.daily_amount),
        cumulative: Number(t.cumulative)
      })),
      revenue: revenueTrends.rows.map(r => ({
        month: new Date(r.month).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
        revenue: Number(r.monthly_revenue)
      })),
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
    const { status, page = 1, limit = 20, search, network = 'mainnet' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    // Always filter by network
    whereClause = ` WHERE COALESCE(i.network, 'mainnet') = $${paramIndex}`;
    params.push(network);
    paramIndex++;

    if (status) {
      whereClause += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      const searchCondition = `i.wallet_address ILIKE $${paramIndex}`;
      whereClause += ` AND ${searchCondition}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM investments i ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await pool.query(`
      SELECT i.*, t.name as tier_name, t.return_percentage, u.email as user_email,
             i.tx_verified, i.tx_verification_status, i.tx_verification_details, i.tx_verified_at,
             i.integrity_hash, i.ip_address, i.form_timing_seconds,
             COALESCE(i.network, 'mainnet') as network
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
    const { status, notes, returnAmount } = req.body;

    const updates = ['status = $1'];
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

    // Log the activity
    await logActivity({
      action: 'investment_status_update',
      entityType: 'investment',
      entityId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { newStatus: status, notes, returnAmount }
    });

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

    // Log the activity
    await logActivity({
      action: 'message_status_update',
      entityType: 'message',
      entityId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { newStatus: status }
    });

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

// Get activity logs
router.get('/logs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      userId,
      startDate,
      endDate
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    const conditions = [];

    if (action) {
      conditions.push(`action = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (entityType) {
      conditions.push(`entity_type = $${paramIndex}`);
      params.push(entityType);
      paramIndex++;
    }

    if (userId) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM activity_logs ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await pool.query(`
      SELECT * FROM activity_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    // Get unique actions and entity types for filters
    const actionsResult = await pool.query(
      'SELECT DISTINCT action FROM activity_logs ORDER BY action'
    );
    const entityTypesResult = await pool.query(
      'SELECT DISTINCT entity_type FROM activity_logs WHERE entity_type IS NOT NULL ORDER BY entity_type'
    );

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      filters: {
        actions: actionsResult.rows.map(r => r.action),
        entityTypes: entityTypesResult.rows.map(r => r.entity_type)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get platform settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT key, value, description, updated_at FROM platform_settings ORDER BY key'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Validate BEP-20/Ethereum address format
function isValidBEP20Address(address) {
  if (!address || typeof address !== 'string') return false;
  // Must start with 0x and be exactly 42 characters (0x + 40 hex chars)
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}

// Update platform setting
router.patch('/settings/:key', [
  body('value').notEmpty().withMessage('Value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value, pin } = req.body;

    // Special validation for platform_wallet
    if (key === 'platform_wallet') {
      // Require PIN code from environment
      const walletPin = process.env.WALLET_CHANGE_PIN;
      if (!walletPin) {
        console.error('WALLET_CHANGE_PIN not configured');
        return res.status(500).json({ error: 'Security configuration error' });
      }
      if (!pin || pin !== walletPin) {
        return res.status(403).json({ error: 'Неверный PIN-код' });
      }

      // Validate BEP-20 address format
      if (!isValidBEP20Address(value)) {
        return res.status(400).json({ error: 'Неверный формат BEP-20 адреса. Адрес должен начинаться с 0x и содержать 40 символов (a-f, 0-9)' });
      }
    }

    const result = await pool.query(`
      UPDATE platform_settings
      SET value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE key = $2
      RETURNING *
    `, [value, key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Auto-update investment_tiers when exchange rate changes
    if (key === 'exchange_rate_thb_usd') {
      const newRate = parseFloat(value);
      if (!isNaN(newRate) && newRate > 0) {
        await pool.query(`
          UPDATE investment_tiers
          SET min_investment_baht = min_investment_usd * $1
          WHERE is_active = true
        `, [newRate]);
      }
    }

    // Log the activity
    await logActivity({
      action: 'setting_update',
      entityType: 'setting',
      entityId: key,
      userId: req.user.id,
      userEmail: req.user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { key, newValue: value }
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get withdrawal requests
router.get('/withdrawals', async (req, res) => {
  try {
    const { network = 'mainnet', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`
      SELECT COUNT(*) FROM investments
      WHERE status = 'withdrawal_requested'
        AND COALESCE(network, 'mainnet') = $1
    `, [network]);

    const result = await pool.query(`
      SELECT i.*, t.name as tier_name, t.return_percentage, u.email as user_email, u.wallet_address,
             COALESCE(i.network, 'mainnet') as network
      FROM investments i
      JOIN investment_tiers t ON i.tier_id = t.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.status = 'withdrawal_requested'
        AND COALESCE(i.network, 'mainnet') = $1
      ORDER BY i.invested_at DESC
      LIMIT $2 OFFSET $3
    `, [network, limit, offset]);

    res.json({
      withdrawals: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process withdrawal - crypto (with TX hash)
router.post('/withdrawals/:id/process-crypto', [
  body('txHash').notEmpty().withMessage('Transaction hash is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { txHash } = req.body;

    // Get the investment
    const investment = await pool.query(
      'SELECT * FROM investments WHERE id = $1 AND status = $2',
      [id, 'withdrawal_requested']
    );

    if (investment.rows.length === 0) {
      // Try without status filter to give better error
      const anyInv = await pool.query('SELECT status FROM investments WHERE id = $1', [id]);
      if (anyInv.rows.length === 0) {
        return res.status(404).json({ error: 'Investment not found' });
      }
      return res.status(400).json({ error: `Investment status is '${anyInv.rows[0].status}', expected 'withdrawal_requested'` });
    }

    // Determine new status based on withdrawal type
    // For earnings-only: return to 'active' so investment continues earning
    // For principal or all: mark as 'completed'
    const inv = investment.rows[0];
    const isEarningsOnly = inv.withdrawal_type === 'earnings';
    const newStatus = isEarningsOnly ? 'active' : 'completed';

    let result;
    if (isEarningsOnly) {
      // For earnings withdrawal: reset staking_earned and add to total_withdrawn_earnings
      result = await pool.query(`
        UPDATE investments
        SET status = $1,
            payout_tx_hash = $2,
            total_withdrawn_earnings = COALESCE(total_withdrawn_earnings, 0) + COALESCE(staking_earned, 0),
            staking_earned = 0,
            withdrawal_type = NULL,
            withdrawal_wallet = NULL
        WHERE id = $3
        RETURNING *
      `, [newStatus, txHash, id]);
    } else {
      // For principal or all: mark as completed
      result = await pool.query(`
        UPDATE investments
        SET status = $1,
            payout_tx_hash = $2,
            returned_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `, [newStatus, txHash, id]);
    }

    // Log the activity
    await logActivity({
      action: 'withdrawal_processed_crypto',
      entityType: 'investment',
      entityId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { txHash, returnAmount: result.rows[0].return_amount }
    });

    res.json({ success: true, investment: result.rows[0] });
  } catch (error) {
    console.error('Process crypto withdrawal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process withdrawal - bank transfer (with receipt)
router.post('/withdrawals/:id/process-bank', [
  body('receiptUrl').optional(),
  body('bankDetails').optional(),
  body('notes').optional()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { receiptUrl, bankDetails, notes } = req.body;

    // Get the investment
    const investment = await pool.query(
      'SELECT * FROM investments WHERE id = $1',
      [id]
    );

    if (investment.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const inv = investment.rows[0];
    if (inv.status !== 'withdrawal_requested') {
      return res.status(400).json({ error: `Investment status is '${inv.status}', expected 'withdrawal_requested'` });
    }

    // Determine new status based on withdrawal type
    const isEarningsOnly = inv.withdrawal_type === 'earnings';
    const newStatus = isEarningsOnly ? 'active' : 'completed';

    let result;
    if (isEarningsOnly) {
      // For earnings withdrawal: reset staking_earned and add to total_withdrawn_earnings
      result = await pool.query(`
        UPDATE investments
        SET status = $1,
            payout_receipt_url = $2,
            payout_bank_details = $3,
            notes = COALESCE(notes, '') || $4,
            total_withdrawn_earnings = COALESCE(total_withdrawn_earnings, 0) + COALESCE(staking_earned, 0),
            staking_earned = 0,
            withdrawal_type = NULL,
            withdrawal_wallet = NULL
        WHERE id = $5
        RETURNING *
      `, [newStatus, receiptUrl, bankDetails, notes ? '\n' + notes : '', id]);
    } else {
      // For principal or all: mark as completed
      result = await pool.query(`
        UPDATE investments
        SET status = $1,
            payout_receipt_url = $2,
            payout_bank_details = $3,
            notes = COALESCE(notes, '') || $4,
            returned_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [newStatus, receiptUrl, bankDetails, notes ? '\n' + notes : '', id]);
    }

    // Log the activity
    await logActivity({
      action: 'withdrawal_processed_bank',
      entityType: 'investment',
      entityId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { receiptUrl, bankDetails, notes, returnAmount: result.rows[0].return_amount }
    });

    res.json({ success: true, investment: result.rows[0] });
  } catch (error) {
    console.error('Process bank withdrawal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject withdrawal request
router.post('/withdrawals/:id/reject', [
  body('reason').optional()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get the investment
    const investment = await pool.query(
      'SELECT * FROM investments WHERE id = $1',
      [id]
    );

    if (investment.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.rows[0].status !== 'withdrawal_requested') {
      return res.status(400).json({ error: `Investment status is '${investment.rows[0].status}', expected 'withdrawal_requested'` });
    }

    // Revert to active status
    const result = await pool.query(`
      UPDATE investments
      SET status = 'active',
          notes = COALESCE(notes, '') || $1
      WHERE id = $2
      RETURNING *
    `, [reason ? '\nОтклонено: ' + reason : '', id]);

    // Log the activity
    await logActivity({
      action: 'withdrawal_rejected',
      entityType: 'investment',
      entityId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { reason }
    });

    res.json({ success: true, investment: result.rows[0] });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get logs statistics
router.get('/logs/stats', async (req, res) => {
  try {
    const [total, today, byAction, byEntity] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM activity_logs'),
      pool.query("SELECT COUNT(*) FROM activity_logs WHERE created_at >= CURRENT_DATE"),
      pool.query(`
        SELECT action, COUNT(*) as count
        FROM activity_logs
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT entity_type, COUNT(*) as count
        FROM activity_logs
        WHERE entity_type IS NOT NULL
        GROUP BY entity_type
        ORDER BY count DESC
      `)
    ]);

    res.json({
      total: parseInt(total.rows[0].count),
      today: parseInt(today.rows[0].count),
      byAction: byAction.rows,
      byEntity: byEntity.rows
    });
  } catch (error) {
    console.error('Get logs stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Recalculate earnings for all active investments (admin only)
router.post('/recalculate-earnings', requireSuperAdmin, async (req, res) => {
  try {
    const { recalculateEarnings } = require('../jobs/recalculateEarnings');
    const result = await recalculateEarnings();

    // Log the action
    await logActivity({
      userId: req.user.id,
      action: 'recalculate_earnings',
      entityType: 'investment',
      details: {
        updated: result.updated,
        total: result.total,
        newEarnings: result.newEarnings
      },
      ipAddress: getClientIp(req)
    });

    res.json(result);
  } catch (error) {
    console.error('Recalculate earnings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get earnings stats
router.get('/earnings-stats', async (req, res) => {
  try {
    const { network } = req.query;

    const result = await pool.query(`
      SELECT
        COUNT(*) as total_investments,
        COUNT(*) FILTER (WHERE status = 'active') as active_investments,
        COALESCE(SUM(staking_earned), 0) as total_earnings,
        COALESCE(SUM(amount_usdt), 0) as total_principal,
        MIN(last_staking_calc) as oldest_calc,
        MAX(last_staking_calc) as newest_calc
      FROM investments
      WHERE ($1::text IS NULL OR network = $1)
    `, [network || null]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get earnings stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Admin: Create manual investment deposit
router.post("/investments/create", requireSuperAdmin, [
  body("wallet_address").isString().isLength({ min: 42, max: 42 }).matches(/^0x[a-fA-F0-9]{40}$/),
  body("amount_usdt").isInt({ min: 1000 }),
  body("tier_type").isIn(["staking", "car_share"]),
  body("network").isIn(["mainnet", "testnet"])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { wallet_address, amount_usdt, tier_type, network } = req.body;
  const lowerAddress = wallet_address.toLowerCase();

  try {
    if (tier_type === "staking" && amount_usdt < 1000) {
      return res.status(400).json({ error: "Минимум для стейкинга: \$1,000" });
    }
    if (tier_type === "car_share" && amount_usdt < 12400) {
      return res.status(400).json({ error: "Минимум для доли в авто: \$12,400" });
    }

    let userResult = await pool.query("SELECT id FROM users WHERE LOWER(wallet_address) = \$1", [lowerAddress]);
    let userId;
    
    if (userResult.rows.length === 0) {
      const newUser = await pool.query(
        "INSERT INTO users (wallet_address, created_at) VALUES (\$1, NOW()) RETURNING id",
        [lowerAddress]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    if (tier_type === "car_share") {
      const carsUsed = await pool.query(
        "SELECT COUNT(*) as used FROM investments WHERE tier_type = 'car_share' AND status NOT IN ('rejected', 'cancelled', 'refunded') AND COALESCE(network, 'mainnet') = \$1",
        [network]
      );
      if (parseInt(carsUsed.rows[0].used) >= 9) {
        return res.status(400).json({ error: "Все 9 машин уже заняты" });
      }
    }

    const tierResult = await pool.query("SELECT id FROM investment_tiers LIMIT 1");
    const tierId = tierResult.rows[0]?.id || 1;

    const lockMonths = tier_type === "staking" ? 12 : 6;
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + lockMonths);

    const amountBaht = amount_usdt * 35;
    const txHash = "admin_" + Date.now();

    const result = await pool.query(
      "INSERT INTO investments (user_id, tier_id, wallet_address, amount_usdt, amount_baht, tx_hash, maturity_date, status, tier_type, last_staking_calc, tx_verified, tx_verification_status, network, invested_at) VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, 'active', \$8, NOW(), true, 'admin_created', \$9, NOW()) RETURNING *",
      [userId, tierId, lowerAddress, amount_usdt, amountBaht, txHash, maturityDate, tier_type, network]
    );

    const investment = result.rows[0];

    if (tier_type === "car_share") {
      const usedCars = await pool.query("SELECT car_number FROM car_assignments ORDER BY car_number");
      const usedNumbers = new Set(usedCars.rows.map(r => r.car_number));
      let carNumber = 1;
      while (usedNumbers.has(carNumber) && carNumber <= 9) {
        carNumber++;
      }
      if (carNumber <= 9) {
        await pool.query(
          "INSERT INTO car_assignments (car_number, investment_id, wallet_address, status) VALUES (\$1, \$2, \$3, 'reserved')",
          [carNumber, investment.id, lowerAddress]
        );
        await pool.query(
          "UPDATE investments SET car_assigned = true, car_number = \$1 WHERE id = \$2",
          [carNumber, investment.id]
        );
      }
    }

    await logActivity({
      userId: req.user.id,
      action: "admin_create_investment",
      entityType: "investment",
      entityId: investment.id,
      details: { wallet: lowerAddress, amount: amount_usdt, tier_type, network },
      ipAddress: getClientIp(req)
    });

    res.json({
      success: true,
      investment: { id: investment.id, amount_usdt, tier_type, status: "active", network, wallet_address: lowerAddress }
    });

  } catch (error) {
    console.error("Admin create investment error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

module.exports = router;
