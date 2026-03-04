const { kv } = require('@vercel/kv');
const { withAuth } = require('./_utils/auth');

/**
 * Generate a URL-safe slug from a Spanish title.
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

module.exports = withAuth(async function handler(req, res) {
  const { method } = req;

  // GET — list all posts, or fetch single post by ?slug=
  if (method === 'GET') {
    // Single post fetch (includes content)
    const querySlug = req.query && req.query.slug;
    if (querySlug) {
      const post = await kv.get(`post:${querySlug}`);
      if (!post) return res.status(404).json({ error: 'Artículo no encontrado' });
      return res.status(200).json({ post });
    }

    // List all posts (lightweight, no content)
    const slugs = (await kv.get('posts:index')) || [];
    const posts = [];
    for (const slug of slugs) {
      const post = await kv.get(`post:${slug}`);
      if (post) {
        const { content, svgIllustration, ...summary } = post;
        posts.push(summary);
      }
    }
    return res.status(200).json({ posts, total: posts.length });
  }

  // POST — create new post
  if (method === 'POST') {
    const data = req.body;
    if (!data || !data.title) {
      return res.status(400).json({ error: 'Título requerido' });
    }

    const slug = data.slug || slugify(data.title);

    const existing = await kv.get(`post:${slug}`);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un artículo con ese slug' });
    }

    const now = new Date().toISOString();
    const post = {
      slug,
      title: data.title,
      description: data.description || '',
      content: data.content || '',
      category: data.category || '',
      categoryTagClass: data.categoryTagClass || 'tg',
      gradient: data.gradient || 'linear-gradient(135deg,#D4F5E4,#A8EEC8,#6EDBA0)',
      svgIllustration: data.svgIllustration || '',
      featured: data.featured || false,
      published: data.published || false,
      date: data.date || now.split('T')[0],
      dateDisplay: data.dateDisplay || '',
      views: data.views || 0,
      ogImage: data.ogImage || '/assets/og-image.png',
      createdAt: now,
      updatedAt: now,
    };

    // Fetch index once for both featured-unset and append
    const currentSlugs = (await kv.get('posts:index')) || [];

    // If this post is featured, unset featured on all others
    if (post.featured) {
      for (const s of currentSlugs) {
        const p = await kv.get(`post:${s}`);
        if (p && p.featured) {
          await kv.set(`post:${s}`, { ...p, featured: false });
        }
      }
    }

    await kv.set(`post:${slug}`, post);

    currentSlugs.push(slug);
    await kv.set('posts:index', currentSlugs);

    return res.status(201).json({ slug, created: true });
  }

  // PUT — update existing post
  if (method === 'PUT') {
    const data = req.body;
    if (!data || !data.slug) {
      return res.status(400).json({ error: 'Slug requerido' });
    }

    const existing = await kv.get(`post:${data.slug}`);
    if (!existing) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    // Only allow updating known post fields (protect createdAt, slug)
    const allowedFields = [
      'title', 'description', 'content', 'category', 'categoryTagClass',
      'gradient', 'svgIllustration', 'featured', 'published',
      'date', 'dateDisplay', 'views', 'ogImage',
    ];
    const changes = {};
    for (const key of allowedFields) {
      if (key in data) changes[key] = data[key];
    }

    const updated = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    // If setting featured, unset on all others
    if (data.featured && !existing.featured) {
      const slugs = (await kv.get('posts:index')) || [];
      for (const s of slugs) {
        if (s === data.slug) continue;
        const p = await kv.get(`post:${s}`);
        if (p && p.featured) {
          await kv.set(`post:${s}`, { ...p, featured: false });
        }
      }
    }

    // If slug changed, migrate the key
    if (data.newSlug && data.newSlug !== data.slug) {
      const conflicting = await kv.get(`post:${data.newSlug}`);
      if (conflicting) {
        return res.status(409).json({ error: 'Ya existe un artículo con ese slug' });
      }
      updated.slug = data.newSlug;
      await kv.del(`post:${data.slug}`);
      await kv.set(`post:${data.newSlug}`, updated);

      const slugs = (await kv.get('posts:index')) || [];
      const idx = slugs.indexOf(data.slug);
      if (idx !== -1) slugs[idx] = data.newSlug;
      await kv.set('posts:index', slugs);

      return res.status(200).json({ slug: data.newSlug, updated: true });
    }

    await kv.set(`post:${data.slug}`, updated);
    return res.status(200).json({ slug: data.slug, updated: true });
  }

  // DELETE — remove post
  if (method === 'DELETE') {
    const { slug } = req.body || {};
    if (!slug) {
      return res.status(400).json({ error: 'Slug requerido' });
    }

    const existing = await kv.get(`post:${slug}`);
    if (!existing) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    await kv.del(`post:${slug}`);

    const slugs = (await kv.get('posts:index')) || [];
    const filtered = slugs.filter(s => s !== slug);
    await kv.set('posts:index', filtered);

    return res.status(200).json({ deleted: true });
  }

  return res.status(405).json({ error: 'Método no permitido' });
});
