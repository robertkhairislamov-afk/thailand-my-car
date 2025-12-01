/**
 * Migration for anti-fraud and TX verification features
 */

const pool = require('./database');

const migrateAntifraud = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Adding anti-fraud tables and columns...');

    // Add fraud_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fraud_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add TX verification columns to investments
    await client.query(`
      ALTER TABLE investments
      ADD COLUMN IF NOT EXISTS tx_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS tx_verification_status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS tx_verification_details JSONB,
      ADD COLUMN IF NOT EXISTS tx_verified_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS integrity_hash VARCHAR(64),
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS form_timing_seconds INTEGER,
      ADD COLUMN IF NOT EXISTS submission_timestamp BIGINT
    `);

    // Add index for verification status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_investments_tx_verified ON investments(tx_verified);
      CREATE INDEX IF NOT EXISTS idx_investments_verification_status ON investments(tx_verification_status);
      CREATE INDEX IF NOT EXISTS idx_fraud_logs_type ON fraud_logs(type);
      CREATE INDEX IF NOT EXISTS idx_fraud_logs_ip ON fraud_logs(ip_address);
    `);

    // Add platform_settings entries for BSCScan API
    await client.query(`
      INSERT INTO platform_settings (key, value, description)
      VALUES
        ('bscscan_api_key', '', 'BSCScan API key for TX verification'),
        ('tx_verification_enabled', 'true', 'Enable automatic TX verification'),
        ('auto_approve_verified', 'false', 'Auto-approve verified transactions')
      ON CONFLICT (key) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('Anti-fraud migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

migrateAntifraud().catch(console.error);
