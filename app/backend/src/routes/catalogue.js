import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/catalogue?merchant_id=
router.get('/', asyncHandler(async (req, res) => {
  const { merchant_id } = req.query;
  if (!merchant_id) return res.status(400).json({ error: 'merchant_id required' });
  res.json(getDb().prepare('SELECT * FROM catalogue WHERE merchant_id = ? ORDER BY name').all(merchant_id));
}));

// POST /api/catalogue
router.post('/', asyncHandler(async (req, res) => {
  const { merchant_id, name, category, price, description, in_stock } = req.body;
  if (!merchant_id || !name) return res.status(400).json({ error: 'merchant_id and name required' });
  if (price == null || isNaN(Number(price))) return res.status(400).json({ error: 'valid price required' });
  const id = uuid();
  getDb().prepare(`
    INSERT INTO catalogue (id, merchant_id, name, category, price, description, in_stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, merchant_id, name, category ?? null, Number(price), description ?? null, in_stock !== false ? 1 : 0);
  res.status(201).json(getDb().prepare('SELECT * FROM catalogue WHERE id = ?').get(id));
}));

// PATCH /api/catalogue/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['name', 'category', 'price', 'description', 'in_stock'];
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  const set = updates.map(([k]) => `${k} = ?`).join(', ');
  getDb().prepare(`UPDATE catalogue SET ${set} WHERE id = ?`).run(...updates.map(([, v]) => v), req.params.id);
  res.json(getDb().prepare('SELECT * FROM catalogue WHERE id = ?').get(req.params.id));
}));

// DELETE /api/catalogue/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  getDb().prepare('DELETE FROM catalogue WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

export default router;
