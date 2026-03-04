const { kv } = require('@vercel/kv');
const { withAuth } = require('../_utils/auth');

module.exports = withAuth(async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { slugs } = req.body || {};

  if (!Array.isArray(slugs) || slugs.length === 0) {
    return res.status(400).json({ error: 'Array de slugs requerido' });
  }

  // Verify all slugs exist
  for (const slug of slugs) {
    const post = await kv.get(`post:${slug}`);
    if (!post) {
      return res.status(404).json({ error: `Artículo no encontrado: ${slug}` });
    }
  }

  await kv.set('posts:index', slugs);

  return res.status(200).json({ reordered: true });
});
