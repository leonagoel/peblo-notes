const express = require('express');
const db = require('../models/db');
const router = express.Router();

// GET /api/shared/:shareId — public, no auth
router.get('/:shareId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT n.id, n.title, n.body, n.category, n.tags,
              n.ai_summary, n.ai_action_items, n.ai_suggested_title,
              n.created_at, n.updated_at, u.name as author_name
       FROM notes n
       JOIN users u ON u.id = n.user_id
       WHERE n.share_id = $1 AND n.is_public = true AND n.archived = false`,
      [req.params.shareId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Note not found or not public' });
    const n = rows[0];
    res.json({
      note: {
        id: n.id,
        title: n.title,
        body: n.body,
        category: n.category,
        tags: n.tags || [],
        summary: n.ai_summary,
        actionItems: n.ai_action_items || [],
        suggestedTitle: n.ai_suggested_title,
        authorName: n.author_name,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
