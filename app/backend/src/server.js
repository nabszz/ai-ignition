import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import wishlistRouter      from './routes/wishlist.js';
import conversationRouter  from './routes/conversations.js';
import remindersRouter     from './routes/reminders.js';
import catalogueRouter     from './routes/catalogue.js';
import customersRouter     from './routes/customers.js';
import journeysRouter      from './routes/journeys.js';
import dashboardRouter     from './routes/dashboard.js';
import { errorHandler }    from './middleware/errorHandler.js';
import { initDb }          from './db/init.js';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3003', credentials: true }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/wishlist',      wishlistRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/reminders',     remindersRouter);
app.use('/api/catalogue',     catalogueRouter);
app.use('/api/customers',     customersRouter);
app.use('/api/journeys',      journeysRouter);
app.use('/api/dashboard',     dashboardRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
initDb();
app.listen(PORT, () => {
  console.log(`[2am-shoppers] Backend running on http://localhost:${PORT}`);
});
