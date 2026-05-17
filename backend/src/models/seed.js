require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    const hash = await bcrypt.hash('password123', 12);
    const { rows: [user] } = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ('Demo User', 'demo@peblo.com', $1)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [hash]
    );

    const notes = [
      {
        title: 'Sprint Planning Notes',
        body: `Discussed Q2 roadmap priorities.\n\nKey decisions:\n- Ship AI notes feature by end of month\n- Refactor auth module\n- Improve search performance\n\nBlockers: Need design review for new dashboard.`,
        tags: ['sprint', 'planning', 'work'],
        category: 'work',
        ai_summary: 'Q2 sprint planning covering AI features, auth refactor, and search improvements.',
        ai_action_items: ['Ship AI notes feature', 'Refactor auth module', 'Get design review'],
        ai_generated: true,
      },
      {
        title: 'Book Notes: Deep Work',
        body: `Key insight: Deep work is the ability to focus without distraction.\n\nRules:\n1. Work deeply\n2. Embrace boredom\n3. Quit social media\n4. Drain the shallows\n\nMy takeaway: Block 2 hours every morning for deep work.`,
        tags: ['book', 'productivity', 'learning'],
        category: 'learning',
        ai_summary: "Notes from Cal Newport's Deep Work covering the four rules for cultivating focused work.",
        ai_action_items: ['Schedule daily 2-hour deep work block', 'Audit social media usage'],
        ai_generated: true,
      },
      {
        title: 'Weekend Project Ideas',
        body: `Build a habit tracker app.\n- Simple daily check-ins\n- Streak visualization\n- Reminder notifications\n\nTech stack: React Native + Supabase\nTimeline: 2 weekends`,
        tags: ['ideas', 'coding', 'personal'],
        category: 'ideas',
        ai_summary: null,
        ai_action_items: [],
        ai_generated: false,
      },
    ];

    for (const note of notes) {
      await client.query(
        `INSERT INTO notes (user_id, title, body, tags, category, ai_summary, ai_action_items, ai_generated, is_public)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)`,
        [user.id, note.title, note.body, note.tags, note.category, note.ai_summary, note.ai_action_items, note.ai_generated]
      );
    }

    console.log('✅ Seed complete! Login: demo@peblo.com / password123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
