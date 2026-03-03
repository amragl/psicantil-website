# FEATURE-09 — 404 Page & Error Handling

## Goal

A branded 404 page that matches the site design, plus Vercel config to serve it correctly.

---

## File to create: `/404.html`

Same nav, fonts, and design tokens as `index.html`. Light and friendly — consistent with the site's warmth.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página no encontrada · Psicantil</title>
  <meta name="robots" content="noindex">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400&family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet">
  <style>
    /* copy :root, body, nav, footer CSS from index.html */

    .notfound {
      min-height: calc(100vh - 68px);
      padding-top: 68px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 120px 32px 80px;
      background: var(--paper);
    }
    .notfound-num {
      font-family: 'Fraunces', serif;
      font-weight: 900;
      font-size: clamp(6rem, 20vw, 14rem);
      line-height: 1;
      letter-spacing: -.06em;
      background: linear-gradient(135deg, var(--g2), var(--g0), #22D472);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    .notfound-title {
      font-family: 'Fraunces', serif;
      font-weight: 900;
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      color: var(--ink);
      letter-spacing: -.04em;
      margin-bottom: 16px;
    }
    .notfound-sub {
      font-size: 1rem;
      color: var(--ink2);
      line-height: 1.8;
      max-width: 420px;
      margin-bottom: 44px;
    }
    .notfound-actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
    }
  </style>
</head>
<body>
  <nav><!-- exact copy from index.html --></nav>

  <div class="notfound">
    <!-- Friendly SVG illustration — reuse the leaf SVG from footer -->
    <svg width="80" height="80" viewBox="0 0 50 50" fill="none" style="margin-bottom:24px;opacity:.4">
      <circle cx="25" cy="25" r="23" stroke="#16B05A" stroke-width="1.5" fill="none"/>
      <path d="M25 6 Q17 16 17 26 Q17 40 25 44 Q33 40 33 26 Q33 16 25 6Z" fill="#16B05A" opacity=".7"/>
      <path d="M25 6 Q25 30 19 42" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M25 24 Q31 28 33 36" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>

    <div class="notfound-num">404</div>
    <h1 class="notfound-title">Esta página se ha perdido</h1>
    <p class="notfound-sub">
      Como un niño explorando, a veces nos perdemos por el camino.
      Vuelve al inicio y encontrarás todo lo que buscas.
    </p>

    <div class="notfound-actions">
      <a href="/" class="btn btn-g" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px">
        Volver al inicio
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10"/>
        </svg>
      </a>
      <a href="/posts/" class="btn btn-outline" style="text-decoration:none;display:inline-flex">
        Ver el blog
      </a>
    </div>
  </div>

  <footer><!-- exact copy from index.html --></footer>
</body>
</html>
```

---

## Wire it up in `vercel.json`

Add a `404` custom error page entry. In `vercel.json`, add:

```json
{
  "version": 2,
  "routes": [
    ...existing routes...,
    {
      "src": "/(.*)",
      "dest": "/404.html",
      "status": 404
    }
  ]
}
```

The catch-all `404` route must be **last** in the routes array — Vercel matches top to bottom.

---

## Acceptance criteria

- [ ] Visiting `/anything-that-doesnt-exist` serves `/404.html` with HTTP status 404
- [ ] 404 page has correct nav and footer
- [ ] "Volver al inicio" → navigates to `/`
- [ ] "Ver el blog" → navigates to `/posts/`
- [ ] Page looks correct on mobile (375px)
- [ ] Response header `HTTP/2 404` (not 200) — verify with `curl -I https://psicantil.com/no-existe`
