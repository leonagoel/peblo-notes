const express = require('express');
const db = require('../models/db');
const { authenticate } = require('../middleware/auth');
const { generateAI } = require('../services/ai');

const router = express.Router();
router.use(authenticate);

const noteShape = (row) => ({
  id: row.id,
  title: row.title,
  body: row.body,
  category: row.category,
  tags: row.tags || [],
  archived: row.archived,
  shareId: row.share_id,
  isPublic: row.is_public,
  summary: row.ai_summary,
  actionItems: row.ai_action_items || [],
  suggestedTitle: row.ai_suggested_title,
  aiGenerated: row.ai_generated,
  aiCallCount: row.ai_call_count,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// GET /api/notes — list with search & filter
router.get('/', async (req, res) => {
  try {
    const { q, tag, category, archived, sort = 'updated' } = req.query;
    let query = `SELECT * FROM notes WHERE user_id = $1`;
    const params = [req.user.id];
    let idx = 2;

    query += ` AND archived = $${idx++}`;
    params.push(archived === 'true');

    if (q) {
      query += ` AND (title ILIKE $${idx} OR body ILIKE $${idx})`;
      params.push(`%${q}%`);
      idx++;
    }
    if (tag) {
      query += ` AND $${idx} = ANY(tags)`;
      params.push(tag);
      idx++;
    }
    if (category) {
      query += ` AND category = $${idx++}`;
      params.push(category);
    }

    const orderMap = { updated: 'updated_at DESC', created: 'created_at DESC', alpha: 'title ASC' };
    query += ` ORDER BY ${orderMap[sort] || 'updated_at DESC'}`;

    const { rows } = await db.query(query, params);
    res.json({ notes: rows.map(noteShape), total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes — create
router.post('/', async (req, res) => {
  try {
    const { title = '', body = '', category = '', tags = [] } = req.body;
    const { rows } = await db.query(
      `INSERT INTO notes (user_id, title, body, category, tags)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [req.user.id, title, body, category, tags]
    );
    res.status(201).json({ note: noteShape(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notes WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
    res.json({ note: noteShape(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notes/:id — update
router.patch('/:id', async (req, res) => {
  try {
    const { title, body, category, tags, archived, isPublic } = req.body;
    const fields = [];
    const params = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title=$${idx++}`); params.push(title); }
    if (body !== undefined) { fields.push(`body=$${idx++}`); params.push(body); }
    if (category !== undefined) { fields.push(`category=$${idx++}`); params.push(category); }
    if (tags !== undefined) { fields.push(`tags=$${idx++}`); params.push(tags); }
    if (archived !== undefined) { fields.push(`archived=$${idx++}`); params.push(archived); }
    if (isPublic !== undefined) { fields.push(`is_public=$${idx++}`); params.push(isPublic); }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id, req.user.id);
    const { rows } = await db.query(
      `UPDATE notes SET ${fields.join(',')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`,
      params
    );
    if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
    res.json({ note: noteShape(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM notes WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes/:id/generate-summary
router.post('/:id/generate-summary', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM notes WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
    const note = rows[0];
    if (!note.body?.trim()) return res.status(400).json({ error: 'Note has no content to summarize' });

    const result = await generateAI('summary', note.body, req.user.id, note.id);

    await db.query(
      `UPDATE notes SET ai_summary=$1, ai_generated=true, ai_call_count=ai_call_count+1 WHERE id=$2`,
      [result.summary, note.id]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes/:id/generate-actions
router.post('/:id/generate-actions', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM notes WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
    const note = rows[0];
    if (!note.body?.trim()) return res.status(400).json({ error: 'Note has no content' });

    const result = await generateAI('actions', note.body, req.user.id, note.id);

    await db.query(
      `UPDATE notes SET ai_action_items=$1, ai_generated=true, ai_call_count=ai_call_count+1 WHERE id=$2`,
      [result.actionItems, note.id]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes/:id/generate-title
router.post('/:id/generate-title', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM notes WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
    const note = rows[0];
    if (!note.body?.trim()) return res.status(400).json({ error: 'Note has no content' });

    const result = await generateAI('title', note.body, req.user.id, note.id);

    await db.query(
      `UPDATE notes SET ai_suggested_title=$1, ai_generated=true, ai_call_count=ai_call_count+1 WHERE id=$2`,
      [result.suggestedTitle, note.id]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
