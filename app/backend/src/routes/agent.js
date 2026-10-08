import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { runAgentCycle } from '../services/agentService.js';

const router = Router();

// POST /api/agent/trigger  — manually trigger an agent observation cycle
router.post('/trigger', asyncHandler(async (req, res) => {
  const { user_id, event } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const result = await runAgentCycle(user_id, event);
  res.json(result);
}));

// GET /api/agent/status
router.get('/status', asyncHandler(async (_req, res) => {
  res.json({ status: 'idle', message: 'Agent is standing by. POST /api/agent/trigger to run a cycle.' });
}));

export default router;
