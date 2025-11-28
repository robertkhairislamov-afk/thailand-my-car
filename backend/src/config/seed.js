const pool = require('./database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@thailandmycar.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await client.query(`
      INSERT INTO admins (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2
    `, [adminEmail, passwordHash, 'Administrator', 'superadmin']);

    // Create investment tiers
    const tiers = [
      {
        name: '6 месяцев +20%',
        description: 'Краткосрочная инвестиция с фиксированной доходностью',
        min_investment_baht: 404600,
        min_investment_usd: 12400,
        duration_months: 6,
        return_percentage: 20,
        features: JSON.stringify([
          'Гарантированный возврат +20%',
          'Возврат через 6 месяцев',
          'Бонус 1%/мес при досрочном выводе',
          'NFT-сертификат инвестора'
        ])
      },
      {
        name: 'Долгосрочное участие',
        description: 'Получайте долю от прибыли и автомобиль в собственность',
        min_investment_baht: 404600,
        min_investment_usd: 12400,
        duration_months: 36,
        return_percentage: null,
        features: JSON.stringify([
          'Автомобиль в собственность через 3 года',
          'Доля от ежемесячной прибыли',
          '100% дохода при своих клиентах',
          'Governance токены для голосования'
        ])
      }
    ];

    for (const tier of tiers) {
      await client.query(`
        INSERT INTO investment_tiers (name, description, min_investment_baht, min_investment_usd, duration_months, return_percentage, features)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [tier.name, tier.description, tier.min_investment_baht, tier.min_investment_usd, tier.duration_months, tier.return_percentage, tier.features]);
    }

    // Initialize platform stats
    await client.query(`
      INSERT INTO platform_stats (date)
      VALUES (CURRENT_DATE)
      ON CONFLICT (date) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully');
    console.log(`Admin credentials: ${adminEmail} / ${adminPassword}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(console.error);
