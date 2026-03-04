const { kv } = require('@vercel/kv');
const { withAuth } = require('./_utils/auth');

module.exports = withAuth(async function handler(req, res) {
  const { method } = req;

  // GET — list all categories
  if (method === 'GET') {
    const categories = (await kv.get('categories')) || [];
    return res.status(200).json({ categories });
  }

  // PUT — replace all categories
  if (method === 'PUT') {
    const { categories } = req.body || {};

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Array de categorías requerido' });
    }

    // Validate each category has required fields
    for (const cat of categories) {
      if (!cat.name || !cat.tagClass || !cat.color) {
        return res.status(400).json({
          error: 'Cada categoría necesita: name, tagClass, color',
        });
      }
    }

    await kv.set('categories', categories);
    return res.status(200).json({ categories, updated: true });
  }

  return res.status(405).json({ error: 'Método no permitido' });
});
