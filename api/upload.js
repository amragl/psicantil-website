const { put } = require('@vercel/blob');
const { verifyAuth } = require('./_utils/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Auth check
  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const filename = req.query.filename;
  if (!filename) {
    return res.status(400).json({ error: 'Parámetro filename requerido' });
  }

  // Validate file extension
  const ext = filename.split('.').pop().toLowerCase();
  const allowed = ['png', 'jpg', 'jpeg', 'webp'];
  if (!allowed.includes(ext)) {
    return res.status(400).json({
      error: 'Formato no permitido. Usa PNG, JPG o WebP.',
    });
  }

  // Validate size (2MB max)
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 2 * 1024 * 1024;
  if (contentLength > maxSize) {
    return res.status(400).json({
      error: 'Archivo demasiado grande. Máximo 2MB.',
    });
  }

  try {
    const blob = await put(filename, req, {
      access: 'public',
      contentType: req.headers['content-type'] || 'application/octet-stream',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: 'Error al subir el archivo' });
  }
};
