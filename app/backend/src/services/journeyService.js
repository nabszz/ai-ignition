/**
 * Journey service — business logic for triggering, advancing and
 * exiting customer journeys.
 *
 * This service is called by the routes layer and encapsulates the
 * rules described in the markdown spec (§7 Business Process).
 *
 * Key rules enforced here:
 *   - Contact limit per customer per day.
 *   - Block customers with unresolved issues or opted-out status.
 *   - Recheck stock and price before presenting an offer.
 *   - Escalate to support when needed; pause sales prompts.
 *   - Exit after purchase, opt-out or contact limit.
 */
import { getDb }  from '../db/init.js';
import { v4 as uuid } from 'uuid';

/**
 * Determine the most appropriate next conversation for a customer.
 * Returns a plain description — the route layer handles the DB write.
 *
 * @param {string} merchantId
 * @param {string} customerId
 * @returns {{ trigger: string, reason: string, productId?: string } | null}
 */
export function selectNextConversation(merchantId, customerId) {
  const db       = getDb();
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
  if (!customer) return null;

  // Hard exits
  if (customer.segment === 'opted_out')       return null;
  if (customer.segment === 'unresolved_issue') return null;

  // Check daily contact limit
  const merchant  = db.prepare('SELECT * FROM merchant_profiles WHERE id = ?').get(merchantId);
  const limit     = merchant?.contact_limit_daily ?? 2;
  const today     = new Date().toISOString().slice(0, 10);
  const todayCount = db.prepare(
    "SELECT COUNT(*) AS n FROM journeys WHERE merchant_id = ? AND customer_id = ? AND date(created_at) = ?"
  ).get(merchantId, customerId, today)?.n ?? 0;
  if (todayCount >= limit) return null;

  // Pick trigger by segment
  switch (customer.segment) {
    case 'first_time':
      return { trigger: 'first_order', reason: 'First order delivered — offer product guidance and satisfaction check.' };
    case 'returning_customer':
      return { trigger: 'replenishment', reason: 'Multiple orders — check if replenishment would be useful.' };
    case 'replenishment':
      return { trigger: 'replenishment', reason: 'Repeat-use product detected — ask whether more is needed.' };
    case 'inactive':
      return { trigger: 'inactivity', reason: 'No order beyond merchant-defined interval — ask what changed.' };
    default:
      return null;
  }
}

/**
 * Verify a product is still available before presenting an offer.
 * Returns { available: boolean, currentPrice: number | null, note?: string }
 */
export function verifyProductAvailability(productId) {
  const db      = getDb();
  const product = db.prepare('SELECT * FROM catalogue WHERE id = ?').get(productId);
  if (!product) return { available: false, currentPrice: null, note: 'Product not found in catalogue.' };
  if (!product.in_stock) return { available: false, currentPrice: product.price, note: 'Product is currently out of stock.' };
  return { available: true, currentPrice: product.price };
}

/**
 * Create a support handover and update the customer segment.
 * Called when a journey is escalated.
 */
export function escalateToSupport(merchantId, journeyId, customerId, customerName, reason) {
  const db = getDb();
  db.prepare(`
    INSERT INTO support_handovers (id, merchant_id, journey_id, customer_name, reason)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuid(), merchantId, journeyId, customerName, reason ?? 'Escalated from journey');
  db.prepare("UPDATE customers SET segment = 'unresolved_issue' WHERE id = ?").run(customerId);
  db.prepare("UPDATE journeys SET status = 'closed', outcome = 'support_needed', closed_at = datetime('now') WHERE id = ?")
    .run(journeyId);
}
