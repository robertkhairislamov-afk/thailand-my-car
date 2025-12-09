const pool = require('./database');

async function migrateChatTables() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Chat sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255),
        user_wallet VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        needs_admin BOOLEAN DEFAULT false,
        admin_id UUID REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chat messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
        sender VARCHAR(50) NOT NULL,
        sender_name VARCHAR(255),
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_needs_admin ON chat_sessions(needs_admin);
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
    `);

    await client.query('COMMIT');
    console.log('Chat tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}

migrateChatTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
