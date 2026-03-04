const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ error: 'Contraseña requerida' });
  }

  const expected = process.env.ADMIN_PASSWORD || '';
  const pwBuf = Buffer.from(String(password));
  const expBuf = Buffer.from(expected);
  if (pwBuf.length !== expBuf.length || !crypto.timingSafeEqual(pwBuf, expBuf)) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const token = jwt.sign(
    { role: 'admin', iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(200).json({ token });
};
