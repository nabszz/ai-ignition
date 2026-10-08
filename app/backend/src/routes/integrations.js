import { Router } from 'express';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { v4 as uuid } from 'uuid';

const router = Router();

// GET /api/integrations
router.get('/', asyncHandler(async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const db   = getDb();
  const rows = db.prepare('SELECT key, connected FROM integrations WHERE user_id = ?').all(user_id);
  res.json(rows);
}));

// POST /api/integrations/:key/connect  (mock — real OAuth TBD)
router.post('/:key/connect', asyncHandler(async (req, res) => {
  const db      = getDb();
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const { key } = req.params;
  const id      = uuid();

  db.prepare(`
    INSERT INTO integrations (id, user_id, key, connected)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(user_id, key) DO UPDATE SET connected = 1
  `).run(id, user_id, key);

  // TODO: Replace with real OAuth flow per integration
  res.json({ key, connected: true, note: 'Mock connection. Replace with OAuth in production.' });
}));

// DELETE /api/integrations/:key
router.delete('/:key', asyncHandler(async (req, res) => {
  const db      = getDb();
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  db.prepare('UPDATE integrations SET connected = 0 WHERE user_id = ? AND key = ?')
    .run(user_id, req.params.key);

  res.status(204).end();
}));

export default router;
