import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/reminders?customer_id=
router.get('/', asyncHandler(async (req, res) => {
  const { customer_id } = req.query;
  if (!customer_id) return res.status(400).json({ error: 'customer_id required' });
  res.json(getDb().prepare('SELECT * FROM reminders WHERE customer_id = ? ORDER BY date').all(customer_id));
}));

// POST /api/reminders
router.post('/', asyncHandler(async (req, res) => {
  const { customer_id, product_id, date } = req.body;
  if (!customer_id || !date) return res.status(400).json({ error: 'customer_id and date required' });
  const id = uuid();
  getDb().prepare('INSERT INTO reminders (id, customer_id, product_id, date) VALUES (?, ?, ?, ?)')
    .run(id, customer_id, product_id ?? null, date);
  res.status(201).json(getDb().prepare('SELECT * FROM reminders WHERE id = ?').get(id));
}));

// DELETE /api/reminders/:id  (dismiss)
router.delete('/:id', asyncHandler(async (req, res) => {
  getDb().prepare('UPDATE reminders SET fired = 1 WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

export default router;
