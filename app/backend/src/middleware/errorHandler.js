/**
 * Central Express error handler.
 * Catches errors thrown in route handlers and returns a consistent JSON shape.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);

  const status  = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';

  res.status(status).json({ error: message });
}

/**
 * Wrap an async route handler so errors are forwarded to errorHandler
 * without needing try/catch in every route.
 *
 * Usage:  router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
