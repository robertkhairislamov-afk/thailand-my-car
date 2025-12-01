const pool = require('./database');

const migrateProfile = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Add profile fields to users table
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS telegram VARCHAR(100),
      ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
      ADD COLUMN IF NOT EXISTS instagram VARCHAR(100),
      ADD COLUMN IF NOT EXISTS twitter VARCHAR(100),
      ADD COLUMN IF NOT EXISTS facebook VARCHAR(255),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'ru',
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
    `);

    await client.query('COMMIT');
    console.log('Profile migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Profile migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

migrateProfile().catch(console.error);
