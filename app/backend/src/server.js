import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import tasksRouter      from './routes/tasks.js';
import planRouter       from './routes/plan.js';
import approvalsRouter  from './routes/approvals.js';
import agentRouter      from './routes/agent.js';
import integrationsRouter from './routes/integrations.js';
import authRouter       from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initDb }       from './db/init.js';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/tasks',        tasksRouter);
app.use('/api/plan',         planRouter);
app.use('/api/approvals',    approvalsRouter);
app.use('/api/agent',        agentRouter);
app.use('/api/integrations', integrationsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Error handler ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
initDb();
app.listen(PORT, () => {
  console.log(`[2am-deployers] Backend running on http://localhost:${PORT}`);
});
