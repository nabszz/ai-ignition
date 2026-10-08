import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/approvals
router.get('/', asyncHandler(async (req, res) => {
  const db        = getDb();
  const approvals = db.prepare('SELECT * FROM approvals ORDER BY created_at DESC').all();
  // Parse JSON actions column
  res.json(approvals.map((a) => ({ ...a, actions: JSON.parse(a.actions) })));
}));

// POST /api/approvals  (create a new approval request)
router.post('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const { user_id, type, title, description, actions, source_ref } = req.body;

  if (!user_id || !title || !actions) {
    return res.status(400).json({ error: 'user_id, title and actions are required' });
  }

  const id = uuid();
  db.prepare(`
    INSERT INTO approvals (id, user_id, type, title, description, actions, source_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, user_id, type ?? 'general', title, description ?? null,
         JSON.stringify(actions), source_ref ?? null);

  const approval = db.prepare('SELECT * FROM approvals WHERE id = ?').get(id);
  res.status(201).json({ ...approval, actions: JSON.parse(approval.actions) });
}));

// POST /api/approvals/:id/approve
router.post('/:id/approve', asyncHandler(async (req, res) => {
  const db       = getDb();
  const approval = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
  if (!approval)                     return res.status(404).json({ error: 'Approval not found' });
  if (approval.status !== 'pending') return res.status(409).json({ error: 'Approval already resolved' });

  db.prepare(`
    UPDATE approvals SET status = 'approved', resolved_at = datetime('now') WHERE id = ?
  `).run(req.params.id);

  // Log each action to activity_log
  const actions = JSON.parse(approval.actions);
  const insert  = db.prepare(`
    INSERT INTO activity_log (id, user_id, icon, title) VALUES (?, ?, ?, ?)
  `);
  actions.forEach((action) => {
    insert.run(uuid(), approval.user_id, '✅', `[${action.tool}] ${action.action}: ${action.details}`);
  });
  insert.run(uuid(), approval.user_id, '🔐', `Approval granted: "${approval.title}"`);

  res.json({ status: 'approved' });
}));

// POST /api/approvals/:id/reject
router.post('/:id/reject', asyncHandler(async (req, res) => {
  const db       = getDb();
  const approval = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
  if (!approval)                     return res.status(404).json({ error: 'Approval not found' });
  if (approval.status !== 'pending') return res.status(409).json({ error: 'Approval already resolved' });

  db.prepare(`
    UPDATE approvals SET status = 'rejected', resolved_at = datetime('now') WHERE id = ?
  `).run(req.params.id);

  db.prepare('INSERT INTO activity_log (id, user_id, icon, title) VALUES (?, ?, ?, ?)')
    .run(uuid(), approval.user_id, '✕', `Approval rejected: "${approval.title}"`);

  res.json({ status: 'rejected' });
}));

export default router;
