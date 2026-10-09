import { Router } from 'express';
import { getDb } from '../db/init.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/dashboard/summary?merchant_id=
router.get('/summary', asyncHandler(async (req, res) => {
  const { merchant_id } = req.query;
  if (!merchant_id) return res.status(400).json({ error: 'merchant_id required' });

  const db = getDb();

  const totalCustomers   = db.prepare('SELECT COUNT(*) AS n FROM customers WHERE merchant_id = ?').get(merchant_id).n;
  const activeJourneys   = db.prepare("SELECT COUNT(*) AS n FROM journeys WHERE merchant_id = ? AND status = 'active'").get(merchant_id).n;
  const closedJourneys   = db.prepare("SELECT COUNT(*) AS n FROM journeys WHERE merchant_id = ? AND status = 'closed'").get(merchant_id).n;
  const purchases        = db.prepare("SELECT COUNT(*) AS n FROM journeys WHERE merchant_id = ? AND outcome = 'purchased'").get(merchant_id).n;
  const openHandovers    = db.prepare('SELECT COUNT(*) AS n FROM support_handovers WHERE merchant_id = ? AND resolved = 0').get(merchant_id).n;
  const optOuts          = db.prepare("SELECT COUNT(*) AS n FROM customers WHERE merchant_id = ? AND segment = 'opted_out'").get(merchant_id).n;

  const convToPurchase = closedJourneys > 0
    ? Math.round((purchases / closedJourneys) * 100)
    : 0;

  res.json({
    totalCustomers,
    activeJourneys,
    closedJourneys,
    purchases,
    openHandovers,
    optOuts,
    convToPurchaseRate: convToPurchase,
    note: 'Figures are based on demo data. They do not prove real retention improvements.',
  });
}));

// GET /api/dashboard/segments?merchant_id=
router.get('/segments', asyncHandler(async (req, res) => {
  const { merchant_id } = req.query;
  if (!merchant_id) return res.status(400).json({ error: 'merchant_id required' });

  const db   = getDb();
  const rows = db.prepare(`
    SELECT segment, COUNT(*) AS count
    FROM customers
    WHERE merchant_id = ?
    GROUP BY segment
    ORDER BY count DESC
  `).all(merchant_id);

  res.json(rows);
}));

export default router;
