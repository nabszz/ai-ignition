/**
 * Central Express error handler.
 * Returns a consistent { error: message } JSON response.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('[error]', err.message ?? err);
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal server error' });
}

/**
 * Wraps an async route handler and forwards errors to errorHandler.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
