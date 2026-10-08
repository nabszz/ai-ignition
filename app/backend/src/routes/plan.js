import { Router } from 'express';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { buildDailyPlan } from '../services/scheduler.js';

const router = Router();

// GET /api/plan  — return today's scheduled blocks
router.get('/', asyncHandler(async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const db     = getDb();
  const today  = new Date().toISOString().slice(0, 10);
  const blocks = db.prepare(`
    SELECT * FROM calendar_blocks
    WHERE user_id = ? AND date(start_time) = ?
    ORDER BY start_time
  `).all(user_id, today);

  res.json(blocks);
}));

// POST /api/plan/refresh  — recompute the plan
router.post('/refresh', asyncHandler(async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const plan = await buildDailyPlan(user_id);
  res.json(plan);
}));

export default router;
