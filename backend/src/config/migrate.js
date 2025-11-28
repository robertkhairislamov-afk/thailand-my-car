const pool = require('./database');

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address VARCHAR(42) UNIQUE,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Investment tiers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS investment_tiers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        min_investment_baht DECIMAL(15,2) NOT NULL,
        min_investment_usd DECIMAL(15,2) NOT NULL,
        duration_months INTEGER,
        return_percentage DECIMAL(5,2),
        features JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Investments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        tier_id INTEGER REFERENCES investment_tiers(id),
        wallet_address VARCHAR(42) NOT NULL,
        amount_usdt DECIMAL(15,2) NOT NULL,
        amount_baht DECIMAL(15,2) NOT NULL,
        tx_hash VARCHAR(66),
        status VARCHAR(50) DEFAULT 'pending',
        nft_token_id VARCHAR(255),
        invested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        maturity_date TIMESTAMP,
        returned_at TIMESTAMP,
        return_amount DECIMAL(15,2),
        notes TEXT
      )
    `);

    // Contact messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        replied_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analytics/Stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS platform_stats (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE DEFAULT CURRENT_DATE,
        total_investments DECIMAL(15,2) DEFAULT 0,
        total_investors INTEGER DEFAULT 0,
        active_investments INTEGER DEFAULT 0,
        completed_investments INTEGER DEFAULT 0,
        total_returns_paid DECIMAL(15,2) DEFAULT 0
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
      CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
      CREATE INDEX IF NOT EXISTS idx_investments_wallet ON investments(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
    `);

    await client.query('COMMIT');
    console.log('Database migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch(console.error);
