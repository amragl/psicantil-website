/**
 * Psicantil Static Site Generator
 *
 * Reads published posts from Vercel KV and generates:
 * 1. posts/{slug}.html — individual post pages
 * 2. posts/index.html — blog listing page
 * 3. Updates blog cards + posts[] array in index.html
 *
 * Run: node build.js
 * Requires: KV_REST_API_URL and KV_REST_API_TOKEN env vars
 */

const { kv } = require('@vercel/kv');
const fs = require('fs');
const path = require('path');

/**
 * Escape HTML entities for safe insertion into templates.
 */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Convert simplified markdown to HTML.
 * Supports: ## headings, **bold**, paragraph breaks (\n\n)
 */
function markdownToHtml(content) {
  if (!content) return '';
  return content
    .split('\n\n')
    .map(block => {
      const safe = escHtml(block);
      if (block.startsWith('## ')) {
        return `    <h2>${escHtml(block.slice(3))}</h2>`;
      }
      return `    <p>${safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    })
    .join('\n\n');
}

/**
 * Count words in content (strip markdown).
 */
function wordCount(content) {
  if (!content) return 0;
  return content
    .replace(/##\s*/g, '')
    .replace(/\*\*/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0).length;
}

/**
 * Map category to tag CSS class for the listing page.
 */
function categoryToTagClass(category) {
  const map = {
    'Desarrollo del lenguaje': 'tg-g',
    'Apego & Vínculo': 'tg-lv',
    'Emociones': 'tg-co',
    'Desarrollo del bebé': 'tg-sk',
    'Sueño infantil': 'tg-sk',
    'Crianza': 'tg-su',
  };
  return map[category] || 'tg-g';
}

/**
 * Default SVG for post hero and listing cards.
 */
function defaultSvg(size) {
  if (size === 'large') {
    return '<svg width="90" height="80" viewBox="0 0 90 80" fill="none"><circle cx="45" cy="40" r="30" fill="rgba(255,255,255,.5)" stroke="rgba(255,255,255,.8)" stroke-width="1.5"/><circle cx="45" cy="40" r="14" fill="rgba(255,255,255,.6)"/><circle cx="45" cy="40" r="6" fill="white" opacity=".9"/></svg>';
  }
  return '<svg width="150" height="140" viewBox="0 0 150 160" fill="none"><circle cx="75" cy="70" r="35" fill="white" opacity=".6" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/><circle cx="75" cy="70" r="16" fill="rgba(255,255,255,.5)"/><circle cx="75" cy="70" r="7" fill="white" opacity=".8"/></svg>';
}

/**
 * Replace all {{placeholder}} in a template string.
 */
function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

/**
 * Generate a blog card HTML for posts/index.html listing.
 */
function generateListingCard(post) {
  const tagClass = categoryToTagClass(post.category);
  const excerpt = post.description || (post.content || '').split('\n\n')[0].substring(0, 120) + '...';

  return `    <!-- Card: ${escHtml(post.title)} -->
    <a class="bc" href="/posts/${post.slug}.html">
      <div class="bc-art" style="background:${post.gradient || 'linear-gradient(135deg,#D4F5E4,#A8EEC8,#6EDBA0)'}">
        ${post.svgIllustration || defaultSvg('small')}
      </div>
      <div class="bc-body">
        <div class="bc-tag ${tagClass}">${escHtml(post.category)}</div>
        <h2 class="bc-title">${escHtml(post.title)}</h2>
        <p class="bc-exc">${escHtml(excerpt)}</p>
        <div class="bc-meta"><span>${escHtml(post.dateDisplay || '')}</span><span>${post.views || 0} lecturas</span></div>
      </div>
    </a>`;
}

/**
 * Generate homepage blog card HTML (with onclick for modal).
 */
function generateHomepageCard(post, index) {
  const isBig = post.featured;
  const delay = (index * 0.1 + 0.05).toFixed(2);
  const svgSize = isBig ? 'large' : 'small';

  return `    <!-- Card: ${escHtml(post.title)} -->
    <div class="bc${isBig ? ' big' : ''} rev" onclick="openPost(${index})" data-href="/posts/${escHtml(post.slug)}.html" tabindex="0" role="button" aria-label="Leer: ${escHtml(post.title)}" onkeydown="if(event.key==='Enter'||event.key===' '){openPost(${index})}" style="transition-delay:${delay}s;cursor:none">
      <div class="bc-art" style="background:${post.gradient || 'linear-gradient(135deg,#D4F5E4,#A8EEC8,#6EDBA0)'}">
        ${post.svgIllustration || defaultSvg(svgSize)}
      </div>
      <div class="bc-body">
        <div class="tag ${post.categoryTagClass || 'tg'}">${escHtml(post.category)}</div>
        <h3 class="bc-title">${escHtml(post.title)}</h3>
        <p class="bc-exc">${escHtml(post.description || '')}</p>
        <div class="bc-meta"><span>\u{1F4C5} ${escHtml(post.dateDisplay || '')}</span><span>\u{1F441} ${post.views || 0} lecturas</span></div>
      </div>
    </div>`;
}

/**
 * Generate the posts[] JS array for index.html modal.
 */
function generatePostsArray(posts) {
  const items = posts.map(p => {
    const content = (p.content || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    return `  {tag:'${escHtml(p.category)}',col:'${p.gradient || ''}',views:${p.views || 0},date:'${escHtml(p.dateDisplay || '')}',
   title:'${escHtml(p.title).replace(/'/g, "\\'")}',
   content:\`${content}\`}`;
  });
  return 'const posts=[\n' + items.join(',\n') + ',\n];';
}

/**
 * Update the blog-grid section in index.html with new cards.
 */
function updateBlogCards(indexHtml, posts) {
  // Replace content between <div class="blog-grid"> and its closing </div>
  const gridStart = indexHtml.indexOf('<div class="blog-grid">');
  if (gridStart === -1) {
    console.warn('Warning: could not find <div class="blog-grid"> in index.html');
    return indexHtml;
  }

  // Find the matching closing tag — count nested divs
  let depth = 0;
  let i = gridStart;
  let gridEnd = -1;
  while (i < indexHtml.length) {
    if (indexHtml.substring(i, i + 4) === '<div') {
      depth++;
    } else if (indexHtml.substring(i, i + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        gridEnd = i + 6;
        break;
      }
    }
    i++;
  }

  if (gridEnd === -1) {
    console.warn('Warning: could not find closing </div> for blog-grid');
    return indexHtml;
  }

  const cards = posts.map((p, idx) => generateHomepageCard(p, idx)).join('\n\n');
  const newGrid = `<div class="blog-grid">\n${cards}\n  </div>`;

  return indexHtml.substring(0, gridStart) + newGrid + indexHtml.substring(gridEnd);
}

/**
 * Update the const posts=[] array in index.html.
 */
function updatePostsJsArray(indexHtml, posts) {
  const arrayStart = indexHtml.indexOf('const posts=[');
  if (arrayStart === -1) {
    console.warn('Warning: could not find const posts=[ in index.html');
    return indexHtml;
  }

  const arrayEnd = indexHtml.indexOf('];', arrayStart);
  if (arrayEnd === -1) {
    console.warn('Warning: could not find ]; closing posts array');
    return indexHtml;
  }

  const newArray = generatePostsArray(posts);
  return indexHtml.substring(0, arrayStart) + newArray + indexHtml.substring(arrayEnd + 2);
}

/**
 * Main build function.
 */
async function build() {
  console.log('Psicantil build started...');

  // 1. Fetch all published posts from KV
  const slugs = (await kv.get('posts:index')) || [];
  console.log(`Found ${slugs.length} slugs in posts:index`);

  const posts = [];
  for (const slug of slugs) {
    const post = await kv.get(`post:${slug}`);
    if (!post) {
      console.warn(`Warning: post:${slug} referenced in index but not found in KV`);
      continue;
    }
    if (post.published) {
      posts.push(post);
    } else {
      console.log(`  Skipping draft: ${slug}`);
    }
  }
  console.log(`${posts.length} published posts to build`);

  if (posts.length === 0) {
    console.log('No published posts found. Skipping build.');
    return;
  }

  // 2. Read templates
  const postTemplate = fs.readFileSync(path.join(__dirname, 'templates/post.html'), 'utf8');
  const listingTemplate = fs.readFileSync(path.join(__dirname, 'templates/posts-index.html'), 'utf8');

  // 3. Ensure posts/ directory exists
  const postsDir = path.join(__dirname, 'posts');
  fs.mkdirSync(postsDir, { recursive: true });

  // 4. Generate individual post pages
  for (const post of posts) {
    const bodyHtml = markdownToHtml(post.content);
    const html = render(postTemplate, {
      title: escHtml(post.title),
      description: escHtml(post.description || ''),
      slug: post.slug,
      date: post.date || '',
      dateDisplay: escHtml(post.dateDisplay || ''),
      category: escHtml(post.category || ''),
      gradient: post.gradient || 'linear-gradient(135deg,#D4F5E4,#A8EEC8,#6EDBA0)',
      views: post.views || 0,
      ogImage: post.ogImage || '/assets/og-image.png',
      wordCount: wordCount(post.content),
      bodyHtml,
    });

    const postPath = path.join(postsDir, `${post.slug}.html`);
    fs.writeFileSync(postPath, html);
    console.log(`  Generated: posts/${post.slug}.html`);
  }

  // 5. Generate posts/index.html
  const cards = posts.map(p => generateListingCard(p)).join('\n\n');
  const listingHtml = listingTemplate.replace('{{cards}}', cards);
  fs.writeFileSync(path.join(postsDir, 'index.html'), listingHtml);
  console.log('  Generated: posts/index.html');

  // 6. Update index.html blog cards + posts array
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    indexHtml = updateBlogCards(indexHtml, posts);
    indexHtml = updatePostsJsArray(indexHtml, posts);
    fs.writeFileSync(indexPath, indexHtml);
    console.log('  Updated: index.html (blog cards + posts array)');
  } else {
    console.warn('Warning: index.html not found, skipping homepage update');
  }

  console.log(`\nBuild complete: ${posts.length} posts generated`);
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
