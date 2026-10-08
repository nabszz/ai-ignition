import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret_change_me';

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const db = getDb();
  const { name, email, mode, timezone, preferences } = req.body;

  if (!name || !mode) return res.status(400).json({ error: 'name and mode are required' });

  const id = uuid();
  try {
    db.prepare(`
      INSERT INTO users (id, name, email, mode, timezone, preferences)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email ?? null, mode, timezone ?? 'UTC', preferences ? JSON.stringify(preferences) : null);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err;
  }

  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, userId: id });
}));

// POST /api/auth/login  (simplified — no password in MVP, token-based)
router.post('/login', asyncHandler(async (req, res) => {
  const db   = getDb();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'User not found' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, userId: user.id, name: user.name, mode: user.mode });
}));

export default router;
