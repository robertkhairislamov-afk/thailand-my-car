const pool = require('./database');

/**
 * Migration for missing tables and columns
 * Run: npm run db:migrate:missing
 */
const migrateMissing = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('[Migrate] Starting missing tables migration...');

    // 1. car_assignments table
    console.log('[Migrate] Creating car_assignments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS car_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        car_number INTEGER NOT NULL UNIQUE,
        investment_id UUID REFERENCES investments(id),
        wallet_address VARCHAR(42),
        status VARCHAR(50) DEFAULT 'reserved',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_car_assignments_investment ON car_assignments(investment_id)
    `);

    // 2. activity_logs table
    console.log('[Migrate] Creating activity_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id UUID,
        user_id UUID,
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)
    `);

    // 3. page_views table
    console.log('[Migrate] Creating page_views table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address VARCHAR(45),
        country VARCHAR(100),
        country_code VARCHAR(5),
        city VARCHAR(100),
        page VARCHAR(500),
        referrer TEXT,
        user_agent TEXT,
        session_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id)
    `);

    // 4. refresh_tokens table
    console.log('[Migrate] Creating refresh_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP,
        user_agent TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_admin ON refresh_tokens(admin_id)
    `);

    // 5. wallet_nonces table
    console.log('[Migrate] Creating wallet_nonces table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_nonces (
        wallet_address VARCHAR(42) PRIMARY KEY,
        nonce VARCHAR(64) NOT NULL,
        message TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. staking_log table
    console.log('[Migrate] Creating staking_log table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS staking_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(15,2),
        rate_applied DECIMAL(5,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_staking_log_investment ON staking_log(investment_id)
    `);

    // 7. platform_settings table
    console.log('[Migrate] Creating platform_settings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Add missing columns to investments table
    console.log('[Migrate] Adding missing columns to investments table...');

    const columnsToAdd = [
      { name: 'total_withdrawn_earnings', definition: 'DECIMAL(15,2) DEFAULT 0' },
      { name: 'staking_earned', definition: 'DECIMAL(15,2) DEFAULT 0' },
      { name: 'last_staking_calc', definition: 'TIMESTAMP' },
      { name: 'tier_type', definition: 'VARCHAR(50)' },
      { name: 'car_assigned', definition: 'BOOLEAN DEFAULT false' },
      { name: 'car_number', definition: 'INTEGER' },
      { name: 'withdrawal_type', definition: 'VARCHAR(50)' },
      { name: 'withdrawal_wallet', definition: 'VARCHAR(42)' },
      { name: 'payout_tx_hash', definition: 'VARCHAR(66)' },
      { name: 'payout_receipt_url', definition: 'TEXT' },
      { name: 'payout_bank_details', definition: 'JSONB' },
      { name: 'network', definition: "VARCHAR(20) DEFAULT 'mainnet'" },
      { name: 'tx_verified', definition: 'BOOLEAN DEFAULT false' },
      { name: 'tx_verification_status', definition: 'VARCHAR(50)' },
      { name: 'tx_verification_details', definition: 'JSONB' },
      { name: 'tx_verified_at', definition: 'TIMESTAMP' },
      { name: 'integrity_hash', definition: 'VARCHAR(64)' },
      { name: 'ip_address', definition: 'VARCHAR(45)' },
      { name: 'form_timing_seconds', definition: 'INTEGER' }
    ];

    for (const col of columnsToAdd) {
      try {
        await client.query(`
          ALTER TABLE investments ADD COLUMN IF NOT EXISTS ${col.name} ${col.definition}
        `);
        console.log(`  [OK] Added column: ${col.name}`);
      } catch (err) {
        // Column might already exist
        if (!err.message.includes('already exists')) {
          console.log(`  [SKIP] Column ${col.name}: ${err.message}`);
        }
      }
    }

    // 9. Add missing columns to users table
    console.log('[Migrate] Adding missing columns to users table...');

    const userColumns = [
      { name: 'name', definition: 'VARCHAR(255)' },
      { name: 'telegram', definition: 'VARCHAR(255)' },
      { name: 'whatsapp', definition: 'VARCHAR(255)' },
      { name: 'instagram', definition: 'VARCHAR(255)' },
      { name: 'twitter', definition: 'VARCHAR(255)' },
      { name: 'facebook', definition: 'VARCHAR(255)' },
      { name: 'avatar_url', definition: 'TEXT' },
      { name: 'bio', definition: 'TEXT' },
      { name: 'preferred_language', definition: 'VARCHAR(10)' },
      { name: 'email_verified', definition: 'BOOLEAN DEFAULT false' },
      { name: 'last_login_at', definition: 'TIMESTAMP' }
    ];

    for (const col of userColumns) {
      try {
        await client.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.definition}
        `);
        console.log(`  [OK] Added column: ${col.name}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`  [SKIP] Column ${col.name}: ${err.message}`);
        }
      }
    }

    // 10. Insert default platform settings if not exist
    console.log('[Migrate] Inserting default platform settings...');

    const defaultSettings = [
      { key: 'platform_wallet', value: '', description: 'BEP-20 wallet address for receiving investments' },
      { key: 'staking_monthly_rate', value: '2', description: 'Monthly staking rate percentage' },
      { key: 'staking_annual_rate', value: '24', description: 'Annual staking rate percentage' },
      { key: 'large_investor_return', value: '100', description: 'Return percentage for large investors' },
      { key: 'early_withdrawal_fee', value: '10', description: 'Early withdrawal fee percentage' },
      { key: 'min_staking_investment_usd', value: '1000', description: 'Minimum staking investment in USD' },
      { key: 'min_car_investment_usd', value: '12400', description: 'Minimum car share investment in USD' },
      { key: 'total_cars_available', value: '9', description: 'Total number of cars available' },
      { key: 'exchange_rate_thb_usd', value: '35', description: 'THB to USD exchange rate' }
    ];

    for (const setting of defaultSettings) {
      await client.query(`
        INSERT INTO platform_settings (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO NOTHING
      `, [setting.key, setting.value, setting.description]);
    }
    console.log('  [OK] Default settings inserted');

    await client.query('COMMIT');
    console.log('[Migrate] Missing tables migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Migrate] Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

migrateMissing().catch(console.error);
