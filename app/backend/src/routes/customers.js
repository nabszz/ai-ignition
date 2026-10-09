import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const VALID_SEGMENTS = [
  'first_time', 'returning_customer', 'replenishment',
  'inactive', 'unresolved_issue', 'opted_out',
];

// GET /api/customers?merchant_id=&segment=
router.get('/', asyncHandler(async (req, res) => {
  const { merchant_id, segment } = req.query;
  if (!merchant_id) return res.status(400).json({ error: 'merchant_id required' });
  let sql    = 'SELECT * FROM customers WHERE merchant_id = ?';
  const args = [merchant_id];
  if (segment) { sql += ' AND segment = ?'; args.push(segment); }
  sql += ' ORDER BY name';
  res.json(getDb().prepare(sql).all(...args));
}));

// GET /api/customers/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const row = getDb().prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Customer not found' });
  res.json(row);
}));

// POST /api/customers
router.post('/', asyncHandler(async (req, res) => {
  const { merchant_id, name, email, segment, orders, last_order, notes } = req.body;
  if (!merchant_id || !name) return res.status(400).json({ error: 'merchant_id and name required' });
  const seg = VALID_SEGMENTS.includes(segment) ? segment : 'first_time';
  const id  = uuid();
  getDb().prepare(`
    INSERT INTO customers (id, merchant_id, name, email, segment, orders, last_order, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, merchant_id, name, email ?? null, seg, orders ?? 0, last_order ?? null, notes ?? null);
  res.status(201).json(getDb().prepare('SELECT * FROM customers WHERE id = ?').get(id));
}));

// POST /api/customers/import  — bulk import for merchant onboarding
router.post('/import', asyncHandler(async (req, res) => {
  const { merchant_id, records } = req.body;
  if (!merchant_id || !Array.isArray(records)) {
    return res.status(400).json({ error: 'merchant_id and records[] required' });
  }
  const db     = getDb();
  const insert = db.prepare(`
    INSERT INTO customers (id, merchant_id, name, email, segment, orders, last_order, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const ids = [];
  db.transaction(() => {
    for (const r of records) {
      if (!r.name) continue;
      const seg = VALID_SEGMENTS.includes(r.segment) ? r.segment : 'first_time';
      const id  = uuid();
      insert.run(id, merchant_id, r.name, r.email ?? null, seg, r.orders ?? 0, r.last_order ?? null, r.notes ?? null);
      ids.push(id);
    }
  })();
  res.status(201).json({ imported: ids.length, ids });
}));

// PATCH /api/customers/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['name', 'email', 'segment', 'orders', 'last_order', 'notes'];
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  // Validate segment if provided
  const segUpdate = updates.find(([k]) => k === 'segment');
  if (segUpdate && !VALID_SEGMENTS.includes(segUpdate[1])) {
    return res.status(400).json({ error: `Invalid segment. Must be one of: ${VALID_SEGMENTS.join(', ')}` });
  }
  const set = updates.map(([k]) => `${k} = ?`).join(', ');
  getDb().prepare(`UPDATE customers SET ${set} WHERE id = ?`).run(...updates.map(([, v]) => v), req.params.id);
  res.json(getDb().prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id));
}));

export default router;
