import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/tasks
router.get('/', asyncHandler(async (req, res) => {
  const db    = getDb();
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY due_date, due_time').all();
  res.json(tasks);
}));

// POST /api/tasks
router.post('/', asyncHandler(async (req, res) => {
  const db = getDb();
  const { title, description, due_date, due_time, estimated_minutes, priority, weight, user_id, source_ref } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'title is required' });
  if (!user_id)        return res.status(400).json({ error: 'user_id is required' });

  const id = uuid();
  db.prepare(`
    INSERT INTO tasks (id, user_id, title, description, due_date, due_time, estimated_minutes, priority, weight, source_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user_id, title.trim(), description ?? null, due_date ?? null, due_time ?? null,
         estimated_minutes ?? 60, priority ?? 'medium', weight ?? null, source_ref ?? 'manual');

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.status(201).json(task);
}));

// PATCH /api/tasks/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const fields = req.body;

  const allowed = ['title', 'description', 'due_date', 'due_time', 'estimated_minutes', 'priority', 'weight', 'status'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
  const values     = updates.map(([, v]) => v);

  db.prepare(`UPDATE tasks SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}));

// DELETE /api/tasks/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).end();
}));

export default router;
