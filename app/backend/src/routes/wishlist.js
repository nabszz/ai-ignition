import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/wishlist?customer_id=
router.get('/', asyncHandler(async (req, res) => {
  const { customer_id } = req.query;
  if (!customer_id) return res.status(400).json({ error: 'customer_id required' });
  const rows = getDb().prepare(
    'SELECT * FROM wishlist WHERE customer_id = ? ORDER BY saved_at DESC'
  ).all(customer_id);
  res.json(rows);
}));

// POST /api/wishlist
router.post('/', asyncHandler(async (req, res) => {
  const { customer_id, title, url, price, budget, reminder_date, notes } = req.body;
  if (!customer_id || !title) return res.status(400).json({ error: 'customer_id and title required' });
  const id = uuid();
  getDb().prepare(`
    INSERT INTO wishlist (id, customer_id, title, url, price, budget, reminder_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, customer_id, title, url ?? null, price ?? null, budget ?? null, reminder_date ?? null, notes ?? null);
  res.status(201).json(getDb().prepare('SELECT * FROM wishlist WHERE id = ?').get(id));
}));

// PATCH /api/wishlist/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['title', 'url', 'price', 'budget', 'reminder_date', 'notes'];
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  const set = updates.map(([k]) => `${k} = ?`).join(', ');
  getDb().prepare(`UPDATE wishlist SET ${set} WHERE id = ?`).run(...updates.map(([, v]) => v), req.params.id);
  res.json(getDb().prepare('SELECT * FROM wishlist WHERE id = ?').get(req.params.id));
}));

// DELETE /api/wishlist/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  getDb().prepare('DELETE FROM wishlist WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

export default router;
