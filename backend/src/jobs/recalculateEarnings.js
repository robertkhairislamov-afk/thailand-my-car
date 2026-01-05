/**
 * Ежедневный перерасчёт процентов для всех активных инвестиций
 * Запускается через cron каждую ночь в 00:05
 */

const pool = require('../config/database');

// Получить настройку из БД
async function getSetting(key, defaultValue) {
  try {
    const result = await pool.query(
      'SELECT value FROM platform_settings WHERE key = $1',
      [key]
    );
    return result.rows.length > 0 ? result.rows[0].value : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

async function recalculateEarnings() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting earnings recalculation...`);

  try {
    // Получить настройки
    const stakingMonthlyRate = parseFloat(await getSetting('staking_monthly_rate', '2.5')) / 100;
    const carShareReturn = parseFloat(await getSetting('large_investor_return', '20')) / 100;

    // Получить все активные инвестиции
    const investments = await pool.query(`
      SELECT id, amount_usdt, tier_type, invested_at, staking_earned, last_staking_calc, network
      FROM investments
      WHERE status = 'active'
    `);

    console.log(`Found ${investments.rows.length} active investments`);

    let updated = 0;
    let totalNewEarnings = 0;

    for (const inv of investments.rows) {
      const principal = parseFloat(inv.amount_usdt);
      const investedAt = new Date(inv.invested_at);
      const now = new Date();

      // Рассчитать дни с момента инвестиции
      const daysPassed = Math.floor((now.getTime() - investedAt.getTime()) / (1000 * 60 * 60 * 24));
      const monthsPassed = daysPassed / 30.44;

      let totalEarnings = 0;
      let lockPeriodMonths = 0;

      if (inv.tier_type === 'staking') {
        // Стейкинг: 2.5% в месяц, лок 12 месяцев
        lockPeriodMonths = 12;
        const effectiveMonths = Math.min(monthsPassed, lockPeriodMonths);
        totalEarnings = principal * stakingMonthlyRate * effectiveMonths;
      } else if (inv.tier_type === 'car_share') {
        // Доля в авто: 20% за 6 месяцев
        lockPeriodMonths = 6;
        const effectiveMonths = Math.min(monthsPassed, lockPeriodMonths);
        totalEarnings = principal * carShareReturn * (effectiveMonths / lockPeriodMonths);
      }

      // Округлить до 2 знаков
      totalEarnings = Math.round(totalEarnings * 100) / 100;

      const previousEarnings = parseFloat(inv.staking_earned) || 0;
      const newEarnings = totalEarnings - previousEarnings;

      // Обновить только если есть изменения
      if (Math.abs(totalEarnings - previousEarnings) >= 0.01) {
        await pool.query(`
          UPDATE investments
          SET staking_earned = $1,
              last_staking_calc = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [totalEarnings, inv.id]);

        // Записать в лог
        if (newEarnings > 0) {
          await pool.query(`
            INSERT INTO staking_log (investment_id, type, amount, rate_applied, notes)
            VALUES ($1, 'daily_accrual', $2, $3, $4)
          `, [
            inv.id,
            newEarnings,
            inv.tier_type === 'staking' ? stakingMonthlyRate * 100 : carShareReturn * 100,
            `Daily recalc: ${daysPassed} days, ${monthsPassed.toFixed(2)} months`
          ]);
        }

        updated++;
        totalNewEarnings += newEarnings;

        console.log(`  [${inv.network}] ${inv.id.substring(0, 8)}... $${principal} ${inv.tier_type}: $${previousEarnings.toFixed(2)} -> $${totalEarnings.toFixed(2)} (+$${newEarnings.toFixed(2)})`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[${new Date().toISOString()}] Recalculation complete!`);
    console.log(`  Updated: ${updated}/${investments.rows.length} investments`);
    console.log(`  New earnings: $${totalNewEarnings.toFixed(2)}`);
    console.log(`  Duration: ${duration}s`);

    return {
      success: true,
      updated,
      total: investments.rows.length,
      newEarnings: totalNewEarnings,
      duration: parseFloat(duration)
    };

  } catch (error) {
    console.error('Recalculation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Если запущен напрямую (node recalculateEarnings.js)
if (require.main === module) {
  recalculateEarnings()
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { recalculateEarnings };
