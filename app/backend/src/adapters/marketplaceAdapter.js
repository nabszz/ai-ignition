/**
 * Marketplace adapter — abstraction layer for reading product data
 * from external platforms (Shopee, SHEIN, Taobao, etc.).
 *
 * All methods have a mock implementation that works without API keys.
 * Replace mock bodies with real API calls when credentials are available
 * and integrations have been validated.
 *
 * IMPORTANT from the spec:
 *   - The app cannot automatically read every marketplace's private
 *     search history. External activity is used only when a supported
 *     integration makes it available with appropriate permission.
 *   - Do not assume accounts on different marketplaces belong to the
 *     same person.
 *   - Price, stock and deal claims must come from verified product or
 *     merchant information. If unavailable, ask the user to check the
 *     listing instead of presenting an unverified offer.
 */

/**
 * Fetch current product details (price, stock, title) from a supported
 * marketplace using a product URL or ID.
 *
 * @param {string} url       — product URL
 * @param {string} provider  — 'mock' | 'shopee' | 'shein' (future)
 * @returns {Promise<{ title: string, price: number, inStock: boolean, source: string }>}
 */
export async function fetchProductDetails(url, provider = 'mock') {
  if (provider !== 'mock') {
    // TODO: implement real marketplace API call per provider
    throw new Error(`Provider "${provider}" not yet implemented. Validate integration access before building.`);
  }

  // Mock — returns generic placeholder data
  // Real implementation would call the provider's product API
  return {
    title:   'Product from saved link',
    price:   null,    // null signals "unverified — ask user to check listing"
    inStock: null,    // null signals "status unknown"
    source:  'mock',
    note:    'Price and stock are unverified. The app will ask the customer to check the listing.',
  };
}

/**
 * Search a merchant's connected catalogue for products matching a query.
 * In the MVP this queries the local catalogue table, not an external API.
 *
 * @param {string} merchantId
 * @param {string} query
 * @param {number} budgetMax  — filter by max price
 */
export async function searchCatalogue(merchantId, query, budgetMax = null) {
  const { getDb } = await import('../db/init.js');
  const db = getDb();

  let sql    = 'SELECT * FROM catalogue WHERE merchant_id = ? AND in_stock = 1';
  const args = [merchantId];

  if (query) {
    sql  += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
    const like = `%${query}%`;
    args.push(like, like, like);
  }

  if (budgetMax != null) {
    sql  += ' AND price <= ?';
    args.push(budgetMax);
  }

  sql += ' ORDER BY price LIMIT 10';
  return db.prepare(sql).all(...args);
}

/**
 * Check whether a group deal is available for a product.
 * Returns the deal details or null if none applies.
 *
 * In the MVP: returns a mock deal for demo purposes.
 * In production: query the merchant's approved offer rules.
 */
export async function checkGroupDeal(merchantId, productId) {
  // TODO: query merchant-approved group deals table when built
  // For now return a clearly labelled mock
  return {
    available:   true,
    minPeople:   3,
    maxPeople:   5,
    discountPct: 10,
    note:        'SIMULATED — group-buy checkout not yet built. Merchant approval required before activating.',
  };
}
