const pool = require('./database');

async function migrateNetwork() {
  const client = await pool.connect();

  try {
    console.log('Starting network migration...');

    // Add network column to investments table
    await client.query(`
      ALTER TABLE investments
      ADD COLUMN IF NOT EXISTS network VARCHAR(20) DEFAULT 'mainnet'
    `);
    console.log('Added network column to investments table');

    // Create index for faster filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_investments_network ON investments(network)
    `);
    console.log('Created index on network column');

    // Add network to users table for tracking which network they connected from
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS last_network VARCHAR(20) DEFAULT 'mainnet'
    `);
    console.log('Added last_network column to users table');

    console.log('Network migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}

migrateNetwork()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
