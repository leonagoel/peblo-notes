require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) DEFAULT '',
        body TEXT DEFAULT '',
        category VARCHAR(50) DEFAULT '',
        tags TEXT[] DEFAULT '{}',
        archived BOOLEAN DEFAULT false,
        share_id VARCHAR(32) UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
        is_public BOOLEAN DEFAULT false,
        ai_summary TEXT,
        ai_action_items TEXT[],
        ai_suggested_title VARCHAR(500),
        ai_generated BOOLEAN DEFAULT false,
        ai_call_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
        action_type VARCHAR(50) NOT NULL,
        tokens_used INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_notes_share_id ON notes(share_id);
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
      CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage(user_id);
    `);

    // Auto-update updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
      CREATE TRIGGER update_notes_updated_at
        BEFORE UPDATE ON notes
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
    `);

    console.log('✅ Migrations complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
