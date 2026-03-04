const jwt = require('jsonwebtoken');

/**
 * Verify JWT from Authorization header.
 * Returns decoded payload on success, null on failure.
 */
function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware wrapper: returns 401 if JWT is invalid.
 * Usage: module.exports = withAuth(async (req, res) => { ... });
 */
function withAuth(handler) {
  return async (req, res) => {
    const user = verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    req.user = user;
    return handler(req, res);
  };
}

module.exports = { verifyAuth, withAuth };
