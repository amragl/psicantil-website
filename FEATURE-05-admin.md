# FEATURE-05 — Admin Dashboard (Post Management + Social Helpers)

## Goal

A password-protected admin panel at `/admin/` where Cristina can create, edit, reorder, and publish blog posts without touching HTML files. Uses **Vercel KV** (key-value store) for post data and settings, **Vercel Blob** for uploaded images, and a **Node.js build script** (`build.js`) that generates static HTML at deploy time.

---

## Architecture overview

```
┌──────────────┐       ┌───────────────┐       ┌──────────────────┐
│  /admin/     │──API──▶│  /api/ routes  │──────▶│  Vercel KV       │
│  (SPA, JS)   │       │  (serverless)  │       │  (post data)     │
└──────────────┘       └───────┬───────┘       └──────────────────┘
                               │
                               ├──────────────▶ Vercel Blob (images)
                               │
                               └──────────────▶ Deploy Hook (rebuild)
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  build.js     │
                                               │  (generates   │
                                               │  static HTML) │
                                               └──────────────┘
```

- **Admin SPA** (`/admin/index.html`) — vanilla HTML/CSS/JS, no framework
- **API layer** (`/api/`) — Vercel serverless functions (Node.js 18)
- **Data store** — Vercel KV for post objects, categories, settings
- **File store** — Vercel Blob for uploaded images (OG images, post illustrations)
- **Build step** — `build.js` reads KV data and generates all static post HTML + updates `index.html` blog cards
- **Deploy trigger** — after saving/publishing, call Vercel Deploy Hook to rebuild the site

---

## Authentication

### Login flow

1. Admin visits `/admin/` → sees login screen
2. Submits password via `POST /api/auth`
3. Server compares against `ADMIN_PASSWORD` env var (bcrypt-hashed comparison)
4. On success: returns a JWT (24h expiry, signed with `JWT_SECRET` env var)
5. JWT stored in `sessionStorage` (cleared when tab closes)
6. All subsequent API calls include `Authorization: Bearer <token>` header

### Auth middleware

Every `/api/` route (except `POST /api/auth`) validates the JWT before processing. Invalid/expired token → `401 Unauthorized`.

```js
// api/_middleware.js (shared auth check)
const jwt = require('jsonwebtoken');

function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { verifyAuth };
```

---

## Data model (Vercel KV)

### Post index

**Key:** `posts:index`
**Value:** ordered array of slugs (controls display order on the site)

```json
[
  "desarrollo-lenguaje",
  "apego-seguro",
  "rabietas",
  "grunidos-bebe",
  "como-dormir-bebe",
  "poner-limites"
]
```

### Individual post

**Key:** `post:{slug}` (e.g., `post:desarrollo-lenguaje`)
**Value:** post object

```json
{
  "slug": "desarrollo-lenguaje",
  "title": "Desarrollo del lenguaje: orientaciones para favorecer el habla de tu peque desde casa",
  "description": "Pequeños gestos cotidianos marcan grandes diferencias en el desarrollo del lenguaje.",
  "content": "El desarrollo del lenguaje es uno de los hitos más apasionantes...\n\n## Claves para favorecer el lenguaje\n\nLa forma más natural...",
  "category": "Desarrollo del lenguaje",
  "categoryTagClass": "tg",
  "gradient": "linear-gradient(135deg,#D4F5E4,#A8EEC8,#6EDBA0)",
  "svgIllustration": "<svg width=\"220\" height=\"200\" ...>...</svg>",
  "featured": true,
  "published": true,
  "date": "2021-06-15",
  "dateDisplay": "15 Jun 2021",
  "views": 521,
  "ogImage": "/assets/og-image.png",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:00:00Z"
}
```

**Field reference:**

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | string | yes | URL slug, auto-generated from title, editable |
| `title` | string | yes | Full post title |
| `description` | string | yes | Meta description (for SEO + OG tags), max 160 chars |
| `content` | string | yes | Post body in simplified markdown (## headings, **bold**, paragraphs separated by `\n\n`) |
| `category` | string | yes | Category name (e.g., "Apego & Vínculo") |
| `categoryTagClass` | string | yes | CSS class for the tag pill (e.g., "tg", "tp", "ts") |
| `gradient` | string | yes | CSS gradient for the card art background |
| `svgIllustration` | string | no | SVG markup for the card illustration (falls back to default circles) |
| `featured` | boolean | yes | Whether the post gets the "big" card layout |
| `published` | boolean | yes | Only published posts appear on the live site |
| `date` | string | yes | ISO date string for sorting and SEO |
| `dateDisplay` | string | yes | Human-readable date in Spanish (e.g., "15 Jun 2021") |
| `views` | number | yes | View count (manually set for now, auto-tracking in phase 2) |
| `ogImage` | string | no | Path to OG image (uploaded via Blob or default) |
| `createdAt` | string | auto | ISO timestamp, set on creation |
| `updatedAt` | string | auto | ISO timestamp, updated on every save |

### Categories

**Key:** `categories`
**Value:** array of category objects

```json
[
  { "name": "Desarrollo del lenguaje", "tagClass": "tg", "color": "#16B05A" },
  { "name": "Apego & Vínculo", "tagClass": "tp", "color": "#7C3AED" },
  { "name": "Emociones", "tagClass": "ts", "color": "#FF6A30" },
  { "name": "Desarrollo del bebé", "tagClass": "tsk", "color": "#0088BB" },
  { "name": "Sueño infantil", "tagClass": "tsl", "color": "#7290F5" },
  { "name": "Crianza", "tagClass": "tc", "color": "#FFA800" }
]
```

### Settings

**Key:** `settings`
**Value:** site settings object

```json
{
  "siteTitle": "Psicantil",
  "siteDescription": "Psicología infantil por Cristina Góngora González",
  "lastDeployAt": "2025-01-20T14:00:00Z",
  "lastDeployStatus": "success"
}
```

---

## API routes (Vercel serverless functions, Node.js 18)

All routes live in `/api/`. All except `POST /api/auth` require a valid JWT.

### `POST /api/auth` — Login

```
Request:  { "password": "..." }
Response: { "token": "eyJ..." }
Error:    401 { "error": "Contraseña incorrecta" }
```

Compares `password` against `ADMIN_PASSWORD` env var. Returns signed JWT (24h expiry).

---

### `GET /api/posts` — List all posts

```
Response: {
  "posts": [ { slug, title, category, published, featured, date, views } ],
  "total": 6
}
```

Returns all posts (published + drafts), ordered by `posts:index`. Lightweight — excludes `content` and `svgIllustration` for the list view.

---

### `POST /api/posts` — Create post

```
Request: {
  "title": "...",
  "description": "...",
  "content": "...",
  "category": "Emociones",
  "categoryTagClass": "ts",
  "gradient": "linear-gradient(135deg,#FFE8D0,#FF9A5C)",
  "featured": false,
  "published": false,
  "date": "2025-02-01",
  "dateDisplay": "1 Feb 2025",
  "views": 0
}
Response: { "slug": "nuevo-articulo", "created": true }
```

- Auto-generates `slug` from title (lowercase, remove accents, replace spaces with hyphens)
- Sets `createdAt` and `updatedAt` to now
- Appends slug to `posts:index`

---

### `PUT /api/posts` — Update post

```
Request: { "slug": "desarrollo-lenguaje", ...fields to update... }
Response: { "slug": "desarrollo-lenguaje", "updated": true }
```

- Merges provided fields into existing post object
- Updates `updatedAt` timestamp
- If `slug` changed: removes old key, creates new key, updates `posts:index`

---

### `DELETE /api/posts` — Delete post

```
Request: { "slug": "desarrollo-lenguaje" }
Response: { "deleted": true }
```

- Removes `post:{slug}` from KV
- Removes slug from `posts:index`

---

### `PUT /api/posts/reorder` — Change post order

```
Request: { "slugs": ["apego-seguro", "rabietas", "desarrollo-lenguaje", ...] }
Response: { "reordered": true }
```

Replaces `posts:index` with the new ordered array. The first post with `featured: true` gets the "big card" layout on the homepage.

---

### `POST /api/upload` — Upload image to Vercel Blob

```
Request:  multipart/form-data with file field "image"
Response: { "url": "https://xxxxx.public.blob.vercel-storage.com/og-image.png" }
```

- Accepts PNG, JPG, WebP (max 2MB)
- Returns the public Blob URL
- Used for OG images and custom post illustrations

---

### `POST /api/deploy` — Trigger site rebuild

```
Request:  (empty body)
Response: { "triggered": true, "deployId": "dpl_xxxx" }
```

- Calls the Vercel Deploy Hook URL (`DEPLOY_HOOK_URL` env var)
- Updates `settings.lastDeployAt` in KV
- Returns the deploy ID so the admin UI can poll for status

---

## Admin UI (`/admin/index.html`)

A single-page application with client-side routing via hash fragments. Styled to match the Psicantil design system (same fonts, colors, parchment background).

### Views

#### 1. Login view (`#login`)

```
┌──────────────────────────────────┐
│         🌿 Psicantil             │
│      Panel de Administración     │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Contraseña                 │  │
│  └────────────────────────────┘  │
│  ┌──────────┐                    │
│  │ Entrar → │                    │
│  └──────────┘                    │
│                                  │
│  Error: Contraseña incorrecta    │
└──────────────────────────────────┘
```

- Password input + submit button
- Shows error message on 401
- On success: stores JWT in `sessionStorage`, navigates to `#dashboard`

---

#### 2. Dashboard view (`#dashboard`)

```
┌──────────────────────────────────────────────────────┐
│  Psicantil Admin          [Cerrar sesión]             │
│  ─────────────────────────────────────────            │
│  Artículos   Categorías   Ajustes                     │
│                                                       │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│  │  6        │ │  3,597    │ │  20 Ene   │            │
│  │ artículos │ │ lecturas  │ │ último    │            │
│  │           │ │ totales   │ │ despliegue│            │
│  └───────────┘ └───────────┘ └───────────┘            │
│                                                       │
│  [+ Nuevo artículo]  [🚀 Desplegar]                   │
│                                                       │
│  ─── Artículos recientes ───                          │
│  (last 3 posts listed here)                           │
└──────────────────────────────────────────────────────┘
```

- Stat cards: total posts, total views (sum of all post views), last deploy date
- Quick action buttons: create new post, trigger deploy
- Recent posts list (last 3)

---

#### 3. Posts list view (`#posts`)

```
┌──────────────────────────────────────────────────────────────┐
│  [+ Nuevo artículo]                    [🚀 Desplegar]        │
│                                                              │
│  ┌──┬───────────────────────────┬──────────┬───┬─────┬────┐  │
│  │⋮⋮│ Título                    │ Categoría│ ⭐│Estado│    │  │
│  ├──┼───────────────────────────┼──────────┼───┼─────┼────┤  │
│  │⋮⋮│ Desarrollo del lenguaje…  │ 🟢 Leng. │ ★ │ ✅  │ ✏🗑│  │
│  │⋮⋮│ Apego seguro…             │ 🟣 Apego │   │ ✅  │ ✏🗑│  │
│  │⋮⋮│ Rabietas…                 │ 🟠 Emoc. │   │ ✅  │ ✏🗑│  │
│  │⋮⋮│ Gruñidos del bebé…        │ 🔵 Bebé  │   │ ✅  │ ✏🗑│  │
│  │⋮⋮│ Cómo dormir al bebé…     │ 🔵 Sueño │   │ ✅  │ ✏🗑│  │
│  │⋮⋮│ Poner límites…            │ 🟡 Cria. │   │ ✅  │ ✏🗑│  │
│  └──┴───────────────────────────┴──────────┴───┴─────┴────┘  │
└──────────────────────────────────────────────────────────────┘

⋮⋮ = drag handle for reordering
⭐ = featured (big card on homepage)
✅ = published  /  📝 = draft
✏ = edit  /  🗑 = delete (with confirmation)
```

- Draggable rows for reordering (calls `PUT /api/posts/reorder` on drop)
- Click "featured" star to toggle (only one post can be featured at a time)
- Click status to toggle published/draft
- Edit → navigates to `#edit/{slug}`
- Delete → confirm dialog ("¿Eliminar este artículo? Esta acción no se puede deshacer.") → calls `DELETE /api/posts`

---

#### 4. Post editor view (`#edit/{slug}` or `#new`)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Volver a artículos            [Guardar borrador] [Publicar]  │
│                                                                  │
│  ┌── Datos del artículo ─────────────────────────────────────┐   │
│  │ Título: [______________________________________]          │   │
│  │ Slug:   [______________________________________] (auto)   │   │
│  │ Descripción: [_________________________________] (160 ch) │   │
│  │ Categoría: [dropdown ▼]    Fecha: [____-__-__]            │   │
│  │ Gradiente: [_______________] [■ preview]                  │   │
│  │ Lecturas: [____]                                          │   │
│  │ ☐ Destacado (tarjeta grande)                              │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌── Contenido ──────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  Toolbar: [H2] [**B**] [enlace] [---]                     │   │
│  │  ┌─────────────────────┬─────────────────────┐            │   │
│  │  │  Markdown editor    │  Vista previa       │            │   │
│  │  │                     │                     │            │   │
│  │  │  ## Mi título       │  <h2>Mi título</h2> │            │   │
│  │  │                     │                     │            │   │
│  │  │  Un párrafo con     │  Un párrafo con     │            │   │
│  │  │  **negrita**.       │  <b>negrita</b>.    │            │   │
│  │  │                     │                     │            │   │
│  │  └─────────────────────┴─────────────────────┘            │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌── Redes Sociales ─────────────────────────────────────────┐   │
│  │  (social helper panel — see section below)                │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

**Form fields:**
- **Título** — text input, required
- **Slug** — auto-generated from title, editable (validated: lowercase, hyphens only)
- **Descripción** — textarea, max 160 chars, with character counter
- **Categoría** — dropdown populated from `categories` KV key
- **Fecha** — date input, defaults to today
- **Gradiente** — text input with live color preview swatch
- **Lecturas** — number input (manual count for now)
- **Destacado** — checkbox, toggling this unsets the previous featured post

**Content editor:**
- Left pane: `<textarea>` with simplified markdown (same format currently used in `posts[]` array)
- Right pane: live preview rendered using the same parsing logic as `openPost()`
- Toolbar buttons insert markdown syntax at cursor position
- Supported syntax: `## headings`, `**bold**`, blank line = new paragraph

**Actions:**
- "Guardar borrador" — saves with `published: false`
- "Publicar" — saves with `published: true`
- Both call `POST /api/posts` (new) or `PUT /api/posts` (edit)

---

#### 5. Social media helper panel (inside post editor)

For each post, generate optimized copy-paste text for sharing on social media.

```
┌── Redes Sociales ─────────────────────────────────────────────┐
│                                                               │
│  Instagram                                          [Copiar]  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🌿 Desarrollo del lenguaje: orientaciones para         │  │
│  │ favorecer el habla de tu peque desde casa               │  │
│  │                                                         │  │
│  │ El desarrollo del lenguaje es uno de los hitos más      │  │
│  │ apasionantes de los primeros años...                    │  │
│  │                                                         │  │
│  │ 👉 Lee el artículo completo en el link de la bio        │  │
│  │                                                         │  │
│  │ #psicologiainfantil #desarrolloinfantil #crianza        │  │
│  │ #lenguaje #estimulacion #maternidad #paternidad         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Facebook                                           [Copiar]  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📖 Nuevo artículo en Psicantil:                         │  │
│  │                                                         │  │
│  │ "Desarrollo del lenguaje: orientaciones para            │  │
│  │ favorecer el habla de tu peque desde casa"              │  │
│  │                                                         │  │
│  │ El desarrollo del lenguaje es uno de los hitos más      │  │
│  │ apasionantes...                                         │  │
│  │                                                         │  │
│  │ 🔗 https://psicantil.com/posts/desarrollo-lenguaje.html │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  LinkedIn                                           [Copiar]  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ✍️ Nuevo artículo en mi blog Psicantil:                 │  │
│  │                                                         │  │
│  │ "Desarrollo del lenguaje: orientaciones para            │  │
│  │ favorecer el habla de tu peque desde casa"              │  │
│  │                                                         │  │
│  │ Pequeños gestos cotidianos marcan grandes diferencias   │  │
│  │ en el desarrollo del lenguaje de tu hijo.               │  │
│  │                                                         │  │
│  │ Descúbrelo en 👇                                        │  │
│  │ https://psicantil.com/posts/desarrollo-lenguaje.html    │  │
│  │                                                         │  │
│  │ #psicologiainfantil #crianza #desarrolloinfantil        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Twitter / X                                        [Copiar]  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🌿 Desarrollo del lenguaje: orientaciones para         │  │
│  │ favorecer el habla de tu peque desde casa               │  │
│  │                                                         │  │
│  │ Lee más 👇                                              │  │
│  │ https://psicantil.com/posts/desarrollo-lenguaje.html    │  │
│  │                                                         │  │
│  │ #psicologiainfantil #crianza                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**How the text is generated (client-side):**

```js
function generateSocialText(post) {
  const url = `https://psicantil.com/posts/${post.slug}.html`;
  const excerpt = post.content.split('\n\n')[0].substring(0, 150);
  const tags = '#psicologiainfantil #desarrolloinfantil #crianza #maternidad #paternidad';
  const categoryTag = '#' + post.category.toLowerCase().replace(/\s+/g, '').replace(/&/g, '');

  return {
    instagram: `🌿 ${post.title}\n\n${excerpt}...\n\n👉 Lee el artículo completo en el link de la bio\n\n${tags} ${categoryTag}`,
    facebook: `📖 Nuevo artículo en Psicantil:\n\n"${post.title}"\n\n${excerpt}...\n\n🔗 ${url}`,
    linkedin: `✍️ Nuevo artículo en mi blog Psicantil:\n\n"${post.title}"\n\n${post.description}\n\nDescúbrelo en 👇\n${url}\n\n${tags}`,
    twitter: `🌿 ${post.title}\n\nLee más 👇\n${url}\n\n#psicologiainfantil #crianza`
  };
}
```

Each platform box has a **"Copiar"** button that copies the text to clipboard using `navigator.clipboard.writeText()` and shows brief "¡Copiado!" feedback.

---

#### 6. Categories view (`#categories`)

```
┌──────────────────────────────────────────────────────┐
│  Categorías                       [+ Nueva categoría]│
│                                                       │
│  ┌──────────────────────┬──────────┬────────┬───────┐ │
│  │ Nombre               │ Tag CSS  │ Color  │       │ │
│  ├──────────────────────┼──────────┼────────┼───────┤ │
│  │ Desarrollo del leng. │ tg       │ 🟢     │  ✏ 🗑 │ │
│  │ Apego & Vínculo      │ tp       │ 🟣     │  ✏ 🗑 │ │
│  │ Emociones            │ ts       │ 🟠     │  ✏ 🗑 │ │
│  │ Desarrollo del bebé  │ tsk      │ 🔵     │  ✏ 🗑 │ │
│  │ Sueño infantil       │ tsl      │ 🔵     │  ✏ 🗑 │ │
│  │ Crianza              │ tc       │ 🟡     │  ✏ 🗑 │ │
│  └──────────────────────┴──────────┴────────┴───────┘ │
└──────────────────────────────────────────────────────┘
```

- Categories are stored in `categories` KV key
- Edit inline: name, tagClass, color
- Delete only if no posts use that category (show warning otherwise)
- No dedicated API route — categories are managed via `GET/PUT /api/categories`

**Additional API routes for categories:**

```
GET  /api/categories → { "categories": [...] }
PUT  /api/categories → { "categories": [...] } (replaces entire array)
```

---

#### 7. Settings view (`#settings`)

```
┌──────────────────────────────────────────────────────┐
│  Ajustes                                              │
│                                                       │
│  Título del sitio: [Psicantil_____________]           │
│  Descripción:      [Psicología infantil por...]       │
│                                                       │
│  ─── Estado del despliegue ───                        │
│  Último despliegue: 20 Ene 2025, 14:00                │
│  Estado: ✅ Exitoso                                    │
│                                                       │
│  [🚀 Desplegar ahora]                                 │
│                                                       │
│  ─── Datos ───                                        │
│  Total artículos: 6                                   │
│  Total lecturas: 3,597                                │
└──────────────────────────────────────────────────────┘
```

---

## Build script (`build.js`)

Runs as the Vercel build command. Reads all published posts from KV and generates static HTML.

### What it generates

1. **`posts/index.html`** — Blog listing page with all published post cards
2. **`posts/{slug}.html`** — Individual post pages (one per published post)
3. **Updates `index.html`** — Replaces the blog cards section with current data

### How it works

```js
// build.js (simplified)
const { kv } = require('@vercel/kv');
const fs = require('fs');
const path = require('path');

async function build() {
  // 1. Fetch all published posts from KV
  const slugs = await kv.get('posts:index') || [];
  const posts = [];
  for (const slug of slugs) {
    const post = await kv.get(`post:${slug}`);
    if (post && post.published) posts.push(post);
  }

  // 2. Read templates
  const postTemplate = fs.readFileSync('templates/post.html', 'utf8');
  const listingTemplate = fs.readFileSync('templates/posts-index.html', 'utf8');

  // 3. Generate individual post pages
  fs.mkdirSync('posts', { recursive: true });
  for (const post of posts) {
    const html = renderPost(postTemplate, post);
    fs.writeFileSync(`posts/${post.slug}.html`, html);
  }

  // 4. Generate posts/index.html
  const listingHtml = renderListing(listingTemplate, posts);
  fs.writeFileSync('posts/index.html', listingHtml);

  // 5. Update blog cards in index.html
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const updatedIndex = updateBlogCards(indexHtml, posts);
  fs.writeFileSync('index.html', updatedIndex);

  // 6. Update posts[] JS array in index.html for modal
  const finalIndex = updatePostsArray(updatedIndex, posts);
  fs.writeFileSync('index.html', finalIndex);

  console.log(`Built ${posts.length} posts`);
}

build().catch(console.error);
```

### Template structure

Create a `/templates/` directory with HTML templates that use `{{placeholder}}` syntax:

**`templates/post.html`** — matches the current post page structure (same as `posts/desarrollo-lenguaje.html`):
- Full `<head>` with OG tags, JSON-LD, canonical URL (all using `{{title}}`, `{{description}}`, `{{slug}}`, `{{date}}`, etc.)
- Same nav, typography, layout as existing post pages
- Content rendered from simplified markdown → HTML

**`templates/posts-index.html`** — matches `posts/index.html`:
- Blog listing with `{{cards}}` placeholder replaced by generated card HTML

### Blog card HTML generation

The build script generates blog card HTML matching the current structure:

```js
function generateCardHtml(post, index) {
  const isBig = post.featured;
  return `
    <div class="bc${isBig ? ' big' : ''} rev"
         onclick="openPost(${index})"
         data-href="/posts/${post.slug}.html"
         tabindex="0" role="button"
         aria-label="Leer: ${post.title}"
         onkeydown="if(event.key==='Enter'||event.key===' '){openPost(${index})}"
         style="transition-delay:${(index * 0.1 + 0.05).toFixed(2)}s">
      <div class="bc-art" style="background:${post.gradient}">
        ${post.svgIllustration || defaultSvg(isBig)}
      </div>
      <div class="bc-body">
        <div class="tag ${post.categoryTagClass}">${post.category}</div>
        <h3 class="bc-title">${post.title}</h3>
        <p class="bc-exc">${post.description}</p>
        <div class="bc-meta">
          <span>📅 ${post.dateDisplay}</span>
          <span>👁 ${post.views} lecturas</span>
        </div>
      </div>
    </div>`;
}
```

---

## Data migration

On first deploy, seed KV with the 6 existing posts. Create a one-time migration script:

### `scripts/seed-kv.js`

```js
// Run once: node scripts/seed-kv.js
// Requires KV_REST_API_URL and KV_REST_API_TOKEN env vars

const { kv } = require('@vercel/kv');

const existingPosts = [
  {
    slug: 'desarrollo-lenguaje',
    title: 'Desarrollo del lenguaje: orientaciones para favorecer el habla de tu peque desde casa',
    description: 'Pequeños gestos cotidianos marcan grandes diferencias en el desarrollo del lenguaje.',
    content: '...existing content from posts[] array...',
    category: 'Desarrollo del lenguaje',
    categoryTagClass: 'tg',
    gradient: 'linear-gradient(135deg,#D4F5E4,#A8EEC8,#6EDBA0)',
    featured: true,
    published: true,
    date: '2021-06-15',
    dateDisplay: '15 Jun 2021',
    views: 521,
    ogImage: '/assets/og-image.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // ... repeat for all 6 posts
];

async function seed() {
  const slugs = existingPosts.map(p => p.slug);
  await kv.set('posts:index', slugs);
  for (const post of existingPosts) {
    await kv.set(`post:${post.slug}`, post);
  }
  await kv.set('categories', [
    { name: 'Desarrollo del lenguaje', tagClass: 'tg', color: '#16B05A' },
    { name: 'Apego & Vínculo', tagClass: 'tp', color: '#7C3AED' },
    { name: 'Emociones', tagClass: 'ts', color: '#FF6A30' },
    { name: 'Desarrollo del bebé', tagClass: 'tsk', color: '#0088BB' },
    { name: 'Sueño infantil', tagClass: 'tsl', color: '#7290F5' },
    { name: 'Crianza', tagClass: 'tc', color: '#FFA800' }
  ]);
  await kv.set('settings', {
    siteTitle: 'Psicantil',
    siteDescription: 'Psicología infantil por Cristina Góngora González',
    lastDeployAt: null,
    lastDeployStatus: null
  });
  console.log('Seeded KV with', slugs.length, 'posts');
}

seed().catch(console.error);
```

---

## Admin UI styling

The admin panel uses the same design tokens as the main site. Key CSS patterns:

```css
/* Admin layout */
.admin-shell {
  min-height: 100vh;
  background: var(--paper);
  font-family: 'Nunito', sans-serif;
}
.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  background: white;
  border-right: 1.5px solid var(--border);
  padding: 28px 0;
}
.admin-main {
  margin-left: 220px;
  padding: 40px;
}

/* Admin cards */
.admin-stat-card {
  background: var(--card);
  border-radius: 18px;
  padding: 24px;
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 8px var(--shadow);
}

/* Admin buttons — reuse .btn .btn-g from index.html */
.admin-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 50px;
  border: none;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: .88rem;
  cursor: pointer;
  transition: all .2s;
}
.admin-btn-primary {
  background: linear-gradient(135deg, var(--g2), var(--g0));
  color: white;
}
.admin-btn-outline {
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--ink2);
}

/* Responsive: collapse sidebar on mobile */
@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-main { margin-left: 0; }
  /* Show hamburger menu instead */
}
```

---

## Vercel config changes

Update `vercel.json`:

```json
{
  "buildCommand": "node build.js",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/admin/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" },
        { "key": "X-Robots-Tag", "value": "noindex" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/admin", "destination": "/admin/index.html" },
    { "source": "/((?!api/|assets/|admin/|partials/|posts/).*)", "destination": "/404.html" }
  ]
}
```

---

## Environment variables

Add to Vercel project settings (and `.env.example`):

```
# Auth
ADMIN_PASSWORD=          # password for admin login
JWT_SECRET=              # random string for signing JWTs

# Vercel KV (auto-populated when you add KV to the project)
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_URL=

# Vercel Blob (auto-populated when you add Blob to the project)
BLOB_READ_WRITE_TOKEN=

# Deploy hook (create in Vercel dashboard → Settings → Git → Deploy Hooks)
DEPLOY_HOOK_URL=
```

---

## Files to create / modify

### New files

```
/admin/index.html            ← Admin SPA (login + dashboard + editor + social helpers)
/api/auth.js                 ← POST /api/auth (login)
/api/posts.js                ← GET/POST/PUT/DELETE /api/posts
/api/posts/reorder.js        ← PUT /api/posts/reorder
/api/upload.js               ← POST /api/upload (Blob)
/api/deploy.js               ← POST /api/deploy (trigger rebuild)
/api/categories.js           ← GET/PUT /api/categories
/api/_middleware.js           ← Shared auth verification
/build.js                    ← Static site generator (reads KV, writes HTML)
/templates/post.html         ← Post page HTML template
/templates/posts-index.html  ← Blog listing page template
/scripts/seed-kv.js          ← One-time KV data migration
```

### Modified files

```
/vercel.json                 ← Add buildCommand, admin headers, rewrites
/package.json                ← Add dependencies (jsonwebtoken, @vercel/kv, @vercel/blob)
/.env.example                ← Add new env vars
```

---

## Dependencies (`package.json`)

```json
{
  "private": true,
  "engines": { "node": "18.x" },
  "dependencies": {
    "@vercel/kv": "^2.0.0",
    "@vercel/blob": "^0.27.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

---

## Acceptance criteria

### Auth
- [ ] `/admin/` shows login screen when not authenticated
- [ ] Correct password → JWT issued, dashboard shown
- [ ] Wrong password → "Contraseña incorrecta" error, no token
- [ ] JWT expires after 24 hours, user must re-login
- [ ] All API routes return 401 without valid JWT (except `POST /api/auth`)
- [ ] Closing the browser tab clears the session (`sessionStorage`)

### Post CRUD
- [ ] Can create a new post with all fields
- [ ] Slug is auto-generated from title (lowercase, no accents, hyphens)
- [ ] Can edit an existing post, all fields save correctly
- [ ] Can delete a post (with confirmation dialog)
- [ ] Deleted post is removed from KV and `posts:index`
- [ ] Can reorder posts via drag-and-drop
- [ ] Can toggle published/draft status
- [ ] Can set one post as featured (only one at a time)

### Editor
- [ ] Markdown textarea with live preview side-by-side
- [ ] Supported: `## headings`, `**bold**`, paragraph breaks
- [ ] Toolbar buttons insert syntax at cursor position
- [ ] Description field shows character count (max 160)
- [ ] Gradient field shows live color preview

### Social helpers
- [ ] Each saved post shows generated text for Instagram, Facebook, LinkedIn, Twitter
- [ ] "Copiar" button copies text to clipboard
- [ ] Shows "¡Copiado!" feedback for 2 seconds
- [ ] Generated text includes correct post URL, title, excerpt, and hashtags

### Categories
- [ ] Can view all categories
- [ ] Can add a new category (name, tagClass, color)
- [ ] Can edit existing category
- [ ] Cannot delete category if posts use it

### Build & deploy
- [ ] `node build.js` generates correct `posts/{slug}.html` for each published post
- [ ] `node build.js` generates correct `posts/index.html` listing
- [ ] `node build.js` updates blog cards in `index.html`
- [ ] `node build.js` updates `const posts=[]` array in `index.html`
- [ ] Generated HTML matches the existing page structure (same CSS classes, same layout)
- [ ] "Desplegar" button triggers Vercel Deploy Hook
- [ ] Deploy status shown in settings panel

### Image upload
- [ ] Can upload PNG/JPG/WebP (max 2MB)
- [ ] Uploaded image URL is returned and saved to post
- [ ] Rejects files over 2MB or wrong format

### UI / UX
- [ ] Admin panel matches Psicantil design (same fonts, colors, parchment)
- [ ] Responsive at 375px, 768px, 1280px
- [ ] Login screen is centered and clean
- [ ] Navigation between views works (hash routing)
- [ ] `<meta name="robots" content="noindex">` on admin page
- [ ] Admin page not cached (no-store)

### Data migration
- [ ] `scripts/seed-kv.js` successfully seeds all 6 existing posts into KV
- [ ] Seeded posts match the current hardcoded data exactly
- [ ] Categories seeded correctly
- [ ] After seeding + build, the site looks identical to current version
