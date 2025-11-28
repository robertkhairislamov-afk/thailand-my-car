const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Helper: Get platform setting
async function getSetting(key, defaultValue = null) {
  const result = await pool.query(
    'SELECT value FROM platform_settings WHERE key = $1',
    [key]
  );
  return result.rows[0]?.value || defaultValue;
}

// Get platform settings (public - for wallet address)
router.get('/settings', async (req, res) => {
  try {
    const settings = await pool.query(
      `SELECT key, value FROM platform_settings
       WHERE key IN ('platform_wallet', 'staking_monthly_rate', 'staking_annual_rate',
                     'large_investor_return', 'early_withdrawal_fee',
                     'min_staking_investment_usd', 'min_car_investment_usd', 'total_cars_available')`
    );

    const result = {};
    settings.rows.forEach(row => {
      result[row.key] = row.value;
    });

    res.json(result);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all investment tiers (public)
router.get('/tiers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM investment_tiers WHERE is_active = true ORDER BY min_investment_usd ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available cars count
router.get('/cars/available', async (req, res) => {
  try {
    const totalCars = parseInt(await getSetting('total_cars_available', '9'));

    const assigned = await pool.query(
      'SELECT COUNT(*) as count FROM car_assignments WHERE status IN ($1, $2)',
      ['reserved', 'owned']
    );

    const assignedCount = parseInt(assigned.rows[0].count) || 0;
    const available = totalCars - assignedCount;

    res.json({
      total: totalCars,
      assigned: assignedCount,
      available: available
    });
  } catch (error) {
    console.error('Get available cars error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new investment
router.post('/', [
  body('tierId').isInt(),
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/),
  body('amountUsdt').isFloat({ min: 0 }),
  body('txHash').optional().matches(/^0x[a-fA-F0-9]{64}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tierId, walletAddress, amountUsdt, txHash } = req.body;
    const lowerAddress = walletAddress.toLowerCase();

    // Get tier info
    const tierResult = await pool.query(
      'SELECT * FROM investment_tiers WHERE id = $1 AND is_active = true',
      [tierId]
    );

    if (tierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Investment tier not found' });
    }

    const tier = tierResult.rows[0];
    const minCarInvestment = parseFloat(await getSetting('min_car_investment_usd', '12400'));

    if (amountUsdt < parseFloat(tier.min_investment_usd)) {
      return res.status(400).json({
        error: `Minimum investment is $${tier.min_investment_usd}`
      });
    }

    // Determine tier type based on investment amount
    const tierType = amountUsdt >= minCarInvestment ? 'car_share' : 'staking';

    // For car_share, check if cars are available
    if (tierType === 'car_share') {
      const totalCars = parseInt(await getSetting('total_cars_available', '9'));
      const assigned = await pool.query(
        'SELECT COUNT(*) as count FROM car_assignments'
      );
      const assignedCount = parseInt(assigned.rows[0].count) || 0;

      if (assignedCount >= totalCars) {
        return res.status(400).json({
          error: 'All cars are already reserved. You can still invest in staking tier.'
        });
      }
    }

    // Find or create user
    let userResult = await pool.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [lowerAddress]
    );

    let userId;
    if (userResult.rows.length === 0) {
      const newUser = await pool.query(
        'INSERT INTO users (wallet_address) VALUES ($1) RETURNING id',
        [lowerAddress]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // Calculate amounts
    const exchangeRate = parseFloat(await getSetting('exchange_rate_thb_usd', '32.65'));
    const amountBaht = amountUsdt * exchangeRate;
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + 6); // 6 months for both tiers

    // Create investment
    const result = await pool.query(`
      INSERT INTO investments (user_id, tier_id, wallet_address, amount_usdt, amount_baht,
                               tx_hash, maturity_date, status, tier_type, last_staking_calc)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [userId, tierId, lowerAddress, amountUsdt, amountBaht, txHash, maturityDate,
        txHash ? 'pending_confirmation' : 'pending', tierType, new Date()]);

    const investment = result.rows[0];

    // For car_share tier, reserve a car
    if (tierType === 'car_share') {
      // Find next available car number
      const usedCars = await pool.query('SELECT car_number FROM car_assignments ORDER BY car_number');
      const usedNumbers = new Set(usedCars.rows.map(r => r.car_number));
      let carNumber = 1;
      while (usedNumbers.has(carNumber) && carNumber <= 9) {
        carNumber++;
      }

      if (carNumber <= 9) {
        await pool.query(`
          INSERT INTO car_assignments (car_number, investment_id, wallet_address, status)
          VALUES ($1, $2, $3, 'reserved')
        `, [carNumber, investment.id, lowerAddress]);

        await pool.query(`
          UPDATE investments SET car_assigned = true, car_number = $1 WHERE id = $2
        `, [carNumber, investment.id]);
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Make investor choice (for car_share investors after 6 months)
router.post('/choice', [
  body('investmentId').isUUID(),
  body('choice').isIn(['take_profit', 'wait_for_car'])
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { investmentId, choice } = req.body;
    const userId = req.user.id;

    // Get investment
    const investment = await pool.query(
      `SELECT * FROM investments WHERE id = $1 AND user_id = $2`,
      [investmentId, userId]
    );

    if (investment.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const inv = investment.rows[0];

    // Must be car_share tier
    if (inv.tier_type !== 'car_share') {
      return res.status(400).json({ error: 'Choice is only available for car share investors' });
    }

    // Update choice
    await pool.query(`
      UPDATE investments
      SET investor_choice = $1, choice_made_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [choice, investmentId]);

    // If taking profit, release the car assignment
    if (choice === 'take_profit') {
      await pool.query(`
        DELETE FROM car_assignments WHERE investment_id = $1
      `, [investmentId]);

      await pool.query(`
        UPDATE investments SET car_assigned = false, car_number = NULL WHERE id = $1
      `, [investmentId]);
    }

    res.json({ success: true, choice });
  } catch (error) {
    console.error('Make choice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Calculate staking earnings for an investment
router.post('/staking/calculate/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await pool.query(
      `SELECT * FROM investments WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (investment.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const inv = investment.rows[0];

    if (inv.tier_type !== 'staking') {
      return res.status(400).json({ error: 'Only staking investments earn monthly interest' });
    }

    if (inv.status !== 'active') {
      return res.status(400).json({ error: 'Investment must be active' });
    }

    // Calculate months since last calculation
    const lastCalc = new Date(inv.last_staking_calc || inv.invested_at);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - lastCalc.getFullYear()) * 12 +
                       (now.getMonth() - lastCalc.getMonth());

    if (monthsDiff < 1) {
      return res.json({
        message: 'No new earnings to calculate yet',
        current_earnings: parseFloat(inv.staking_earned) || 0
      });
    }

    const monthlyRate = parseFloat(await getSetting('staking_monthly_rate', '2.5')) / 100;
    const principal = parseFloat(inv.amount_usdt);
    const newEarnings = principal * monthlyRate * monthsDiff;
    const totalEarnings = (parseFloat(inv.staking_earned) || 0) + newEarnings;

    // Update investment
    await pool.query(`
      UPDATE investments
      SET staking_earned = $1, last_staking_calc = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [totalEarnings, id]);

    // Log the calculation
    await pool.query(`
      INSERT INTO staking_log (investment_id, type, amount, rate_applied, notes)
      VALUES ($1, 'earning', $2, $3, $4)
    `, [id, newEarnings, monthlyRate * 100, `${monthsDiff} month(s) interest`]);

    res.json({
      months_calculated: monthsDiff,
      new_earnings: newEarnings,
      total_earnings: totalEarnings
    });
  } catch (error) {
    console.error('Calculate staking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Withdraw investment
router.post('/withdraw/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await pool.query(
      `SELECT * FROM investments WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (investment.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const inv = investment.rows[0];

    if (inv.status !== 'active') {
      return res.status(400).json({ error: 'Investment must be active to withdraw' });
    }

    const maturityDate = new Date(inv.maturity_date);
    const now = new Date();
    const isEarlyWithdrawal = now < maturityDate;

    let returnAmount = parseFloat(inv.amount_usdt);
    let earlyFee = 0;

    if (inv.tier_type === 'staking') {
      // Add staking earnings
      returnAmount += parseFloat(inv.staking_earned) || 0;

      // Apply early withdrawal fee if before 6 months
      if (isEarlyWithdrawal) {
        const feePercent = parseFloat(await getSetting('early_withdrawal_fee', '5')) / 100;
        earlyFee = returnAmount * feePercent;
        returnAmount -= earlyFee;
      }
    } else if (inv.tier_type === 'car_share') {
      // For car_share, must have made a choice first if matured
      if (!isEarlyWithdrawal && !inv.investor_choice) {
        return res.status(400).json({
          error: 'Please make a choice first: take profit (+20%) or wait for car'
        });
      }

      if (inv.investor_choice === 'take_profit' || isEarlyWithdrawal) {
        // +20% return
        const returnPercent = parseFloat(await getSetting('large_investor_return', '20')) / 100;
        returnAmount = parseFloat(inv.amount_usdt) * (1 + returnPercent);

        // Apply early fee if early
        if (isEarlyWithdrawal) {
          const feePercent = parseFloat(await getSetting('early_withdrawal_fee', '5')) / 100;
          earlyFee = returnAmount * feePercent;
          returnAmount -= earlyFee;
        }
      } else {
        return res.status(400).json({
          error: 'You chose to wait for car. Contact admin for car transfer process.'
        });
      }
    }

    // Update investment status
    await pool.query(`
      UPDATE investments
      SET status = 'completed', return_amount = $1, early_withdrawal_fee = $2, returned_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [returnAmount, earlyFee, id]);

    // Log withdrawal
    if (inv.tier_type === 'staking') {
      await pool.query(`
        INSERT INTO staking_log (investment_id, type, amount, notes)
        VALUES ($1, 'withdrawal', $2, $3)
      `, [id, returnAmount, isEarlyWithdrawal ? 'Early withdrawal with fee' : 'Full withdrawal']);
    }

    // Remove car assignment if any
    await pool.query(`DELETE FROM car_assignments WHERE investment_id = $1`, [id]);

    res.json({
      success: true,
      return_amount: returnAmount,
      early_withdrawal_fee: earlyFee,
      is_early: isEarlyWithdrawal
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user investments
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT i.*, t.name as tier_name, t.return_percentage,
             ca.car_number as assigned_car
      FROM investments i
      JOIN investment_tiers t ON i.tier_id = t.id
      LEFT JOIN car_assignments ca ON i.id = ca.investment_id
      WHERE i.user_id = $1
      ORDER BY i.invested_at DESC
    `, [userId]);

    // Calculate current staking earnings for each active staking investment
    const investments = await Promise.all(result.rows.map(async (inv) => {
      if (inv.tier_type === 'staking' && inv.status === 'active') {
        const lastCalc = new Date(inv.last_staking_calc || inv.invested_at);
        const now = new Date();
        const monthsDiff = (now.getFullYear() - lastCalc.getFullYear()) * 12 +
                           (now.getMonth() - lastCalc.getMonth());

        const monthlyRate = parseFloat(await getSetting('staking_monthly_rate', '2.5')) / 100;
        const pendingEarnings = parseFloat(inv.amount_usdt) * monthlyRate * monthsDiff;

        inv.pending_earnings = pendingEarnings;
        inv.total_earnings = (parseFloat(inv.staking_earned) || 0) + pendingEarnings;
      }
      return inv;
    }));

    res.json(investments);
  } catch (error) {
    console.error('Get my investments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get investments by wallet (public)
router.get('/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const lowerAddress = address.toLowerCase();

    const result = await pool.query(`
      SELECT i.id, i.amount_usdt, i.amount_baht, i.status, i.invested_at, i.maturity_date,
             i.tier_type, i.staking_earned, i.investor_choice, i.car_assigned, i.car_number,
             t.name as tier_name, t.return_percentage
      FROM investments i
      JOIN investment_tiers t ON i.tier_id = t.id
      WHERE i.wallet_address = $1
      ORDER BY i.invested_at DESC
    `, [lowerAddress]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get wallet investments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get platform stats (public)
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COALESCE(SUM(amount_usdt), 0) as total_invested_usdt,
        COUNT(DISTINCT wallet_address) as total_investors,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_investments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_investments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN return_amount END), 0) as total_returns_paid,
        COUNT(CASE WHEN tier_type = 'staking' THEN 1 END) as staking_investments,
        COUNT(CASE WHEN tier_type = 'car_share' THEN 1 END) as car_share_investments
      FROM investments
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get fundraising data (public)
router.get('/fundraising', async (req, res) => {
  try {
    const investmentStats = await pool.query(`
      SELECT
        COALESCE(SUM(amount_usdt), 0) as current_usd,
        COALESCE(SUM(amount_baht), 0) as current_baht,
        COUNT(DISTINCT wallet_address) as investors_count
      FROM investments
      WHERE status IN ('pending', 'pending_confirmation', 'confirmed', 'active')
    `);

    const stats = investmentStats.rows[0];

    // Get settings from DB
    const totalCars = parseInt(await getSetting('total_cars_available', '9'));
    const exchangeRate = parseFloat(await getSetting('exchange_rate_thb_usd', '32.65'));
    const minCarInvestment = parseFloat(await getSetting('min_car_investment_usd', '12400'));

    // Target: all 9 cars fully invested
    const targetUSD = totalCars * minCarInvestment;
    const targetBaht = targetUSD * exchangeRate;
    const deadline = '2026-01-31T23:59:59';

    const currentBaht = parseFloat(stats.current_baht) || 0;
    const currentUSD = parseFloat(stats.current_usd) || 0;
    const investorsCount = parseInt(stats.investors_count) || 0;
    const progress = targetBaht > 0 ? (currentBaht / targetBaht) * 100 : 0;

    // Get cars available
    const assigned = await pool.query(
      'SELECT COUNT(*) as count FROM car_assignments'
    );
    const carsAssigned = parseInt(assigned.rows[0].count) || 0;

    res.json({
      target: {
        baht: targetBaht,
        usd: targetUSD
      },
      current: {
        baht: currentBaht,
        usd: currentUSD
      },
      progress: Math.min(progress, 100),
      investors: {
        current: investorsCount,
        max: totalCars
      },
      cars: {
        total: totalCars,
        assigned: carsAssigned,
        available: totalCars - carsAssigned
      },
      deadline,
      isActive: new Date() < new Date(deadline) && progress < 100
    });
  } catch (error) {
    console.error('Get fundraising error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
