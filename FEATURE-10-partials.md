# FEATURE-10 — Shared Partials & Final File Structure

## Goal

Nav and footer are copy-pasted across every page. Before shipping, establish a single source of truth for these components so future edits (e.g., adding a nav link) only need to happen in one place.

Since the stack is static HTML with no build step for phase 1, use a **minimal vanilla JS include system** — no bundler, no framework.

---

## Strategy: JS-injected partials

Create two small files containing the HTML for nav and footer. Every page loads them via a tiny `fetch` + `innerHTML` pattern. This is SSR-compatible if you later migrate to Next.js (just convert to React components).

---

## Files to create

### `/partials/nav.html`

```html
<nav>
  <a class="logo" href="/">
    <span class="logo-word">Psic</span><span class="logo-dot"></span><span class="logo-word">antil</span>
  </a>
  <div class="nav-links">
    <a class="npill" href="/#blog">Blog</a>
    <a class="npill" href="/#sobre">Sobre mí</a>
    <a class="npill" href="/#suscribir">Suscríbete</a>
    <a class="npill solid" href="/admin">⚙ Admin</a>
  </div>
</nav>
```

> Note: links use `/#blog` (absolute anchor to homepage) instead of `#blog`, so they work from any page (post pages, legal pages, 404, etc.)

### `/partials/footer.html`

```html
<footer>
  <div>
    <div class="fl">Psicantil</div>
    <div class="fl-sub">Psicología Infantil · Cristina Góngora González</div>
  </div>
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" style="opacity:.35">
    <circle cx="25" cy="25" r="23" stroke="#22D472" stroke-width="1.5" fill="none"/>
    <path d="M25 6 Q17 16 17 26 Q17 40 25 44 Q33 40 33 26 Q33 16 25 6Z" fill="#22D472" opacity=".7"/>
    <path d="M25 6 Q25 30 19 42" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M25 24 Q31 28 33 36" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </svg>
  <div class="fr">
    <p>© <span class="footer-year"></span> Psicantil · <a href="https://psicantil.com" style="color:inherit;text-decoration:none">psicantil.com</a></p>
    <p style="margin-top:5px">
      <a href="/privacidad.html">Política de privacidad</a> ·
      <a href="/cookies.html" style="color:var(--g-light)">Cookies</a>
    </p>
  </div>
</footer>
```

### `/partials/loader.js`

```js
/**
 * Psicantil partial loader
 * Usage: <script src="/partials/loader.js" data-nav data-footer></script>
 * Add data-nav to inject nav, data-footer to inject footer.
 */
(async function () {
  const script = document.currentScript;

  async function loadPartial(selector, url, position) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const r = await fetch(url);
      const html = await r.text();
      el.outerHTML = html;
    } catch (e) {
      console.warn('Psicantil: could not load partial', url);
    }
  }

  // Nav: replace <nav data-partial="nav"> placeholder
  if (script.hasAttribute('data-nav')) {
    await loadPartial('[data-partial="nav"]', '/partials/nav.html');
  }

  // Footer: replace <footer data-partial="footer"> placeholder
  if (script.hasAttribute('data-footer')) {
    await loadPartial('[data-partial="footer"]', '/partials/footer.html');
  }

  // Set current year in all .footer-year spans
  document.querySelectorAll('.footer-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Highlight active nav link
  const path = window.location.pathname;
  document.querySelectorAll('nav .npill').forEach(a => {
    if (a.getAttribute('href') === path || a.getAttribute('href') === path + '/') {
      a.classList.add('active');
    }
  });
})();
```

---

## How to use in each page

Replace the hardcoded `<nav>...</nav>` and `<footer>...</footer>` in every HTML file with:

```html
<!-- NAV placeholder -->
<nav data-partial="nav"></nav>

<!-- ... page content ... -->

<!-- FOOTER placeholder -->
<footer data-partial="footer"></footer>

<!-- Load partials (just before </body>) -->
<script src="/partials/loader.js" data-nav data-footer></script>
```

### Important: pages that use nav CSS

Every page that uses the shared nav still needs the nav CSS (`.logo`, `.npill`, etc.). Options:

**Option A (recommended for phase 1):** Create `/partials/shared.css` with the nav + footer CSS and link it from every page:
```html
<link rel="stylesheet" href="/partials/shared.css">
```

**Option B:** Keep nav/footer CSS inline in every page's `<style>` block (more duplication but simpler).

Use Option A — it's cleaner and Vercel will cache it aggressively.

### `/partials/shared.css`

Extract from `index.html` the following rule groups and put them in this file:
- `:root` (all CSS variables)
- `*,*::before,*::after` reset
- `html`, `body`
- All `nav`, `.logo`, `.logo-word`, `.logo-dot`, `.nav-links`, `.npill` rules
- All `footer`, `.fl`, `.fl-sub`, `.fr` rules
- `#cookie-banner` rules (from FEATURE-07)
- `@keyframes dotPulse`

Each page keeps its own page-specific styles in its `<style>` block.

---

## Final file structure (after all features implemented)

```
/
├── index.html                        ← Homepage
├── 404.html                          ← 404 error page
├── privacidad.html                   ← Privacy policy
├── cookies.html                      ← Cookie policy
├── vercel.json                       ← Vercel routing + headers
├── package.json                      ← Node 18 declaration (for API functions)
├── .gitignore
├── .env.example
│
├── /posts/
│   ├── index.html                    ← Blog listing page
│   ├── desarrollo-lenguaje.html      ← Post: language development
│   ├── apego-seguro.html             ← Post: secure attachment
│   └── rabietas.html                 ← Post: tantrums
│
├── /admin/
│   └── index.html                    ← Admin dashboard
│
├── /api/
│   ├── subscribe.js                  ← Newsletter signup (Vercel function)
│   └── subscribers.js                ← Subscriber list for admin
│
├── /partials/
│   ├── nav.html                      ← Shared nav HTML
│   ├── footer.html                   ← Shared footer HTML
│   ├── loader.js                     ← Partial injection script
│   └── shared.css                    ← Shared nav/footer/root CSS
│
└── /assets/
    ├── og-image.png                  ← Homepage OG image (1200×630)
    ├── og-desarrollo-lenguaje.png    ← Post OG image
    ├── og-apego-seguro.png           ← Post OG image
    └── og-rabietas.png               ← Post OG image
```

---

## Implementation order

Do this **last**, after all other features are working in their copy-paste form:

1. Create `/partials/shared.css` — extract shared CSS from `index.html`
2. Create `/partials/nav.html` — extract nav HTML
3. Create `/partials/footer.html` — extract footer HTML
4. Create `/partials/loader.js`
5. Update `index.html` to use partials
6. Update each post page, legal pages, 404, admin to use partials
7. Verify every page still looks identical

---

## Acceptance criteria

- [ ] `/partials/nav.html` exists and is valid HTML fragment
- [ ] `/partials/footer.html` exists and is valid HTML fragment
- [ ] `/partials/shared.css` exists and contains all shared styles
- [ ] Nav renders correctly on every page without any flash of unstyled content
- [ ] Footer renders correctly on every page
- [ ] Footer year is current on every page
- [ ] Active nav link is highlighted on `/posts/` and `/posts/[slug].html` pages
- [ ] Editing `/partials/nav.html` once updates the nav on all pages
- [ ] No page has a hardcoded `<nav>` or `<footer>` block (only `index.html` may keep inline until migrated)
- [ ] All pages pass HTML validation (https://validator.w3.org)
