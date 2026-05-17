const express = require('express');
const db = require('../models/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);

// GET /api/insights
router.get('/', async (req, res) => {
  try {
    const uid = req.user.id;

    const [totals, tagRows, recentRows, aiRows, weekRows] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE NOT archived) AS total_notes,
          COUNT(*) FILTER (WHERE archived) AS archived_notes,
          COUNT(*) FILTER (WHERE ai_generated AND NOT archived) AS ai_notes,
          COUNT(*) FILTER (WHERE is_public AND NOT archived) AS public_notes
        FROM notes WHERE user_id = $1`, [uid]),

      db.query(`
        SELECT tag, COUNT(*) AS count
        FROM notes, unnest(tags) AS tag
        WHERE user_id = $1 AND NOT archived
        GROUP BY tag ORDER BY count DESC LIMIT 8`, [uid]),

      db.query(`
        SELECT id, title, category, updated_at, ai_generated
        FROM notes WHERE user_id = $1 AND NOT archived
        ORDER BY updated_at DESC LIMIT 5`, [uid]),

      db.query(`
        SELECT action_type, COUNT(*) AS count
        FROM ai_usage WHERE user_id = $1
        GROUP BY action_type`, [uid]),

      db.query(`
        SELECT DATE(updated_at) AS day, COUNT(*) AS count
        FROM notes WHERE user_id = $1
          AND updated_at >= NOW() - INTERVAL '7 days'
        GROUP BY day ORDER BY day`, [uid]),
    ]);

    res.json({
      totals: totals.rows[0],
      topTags: tagRows.rows,
      recentNotes: recentRows.rows,
      aiUsage: aiRows.rows,
      weeklyActivity: weekRows.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
