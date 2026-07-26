/**
 * Wraps async route handlers — eliminates try/catch boilerplate
 * Usage: router.get('/path', asyncWrapper(async (req, res, next) => { ... }))
 */
const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;
