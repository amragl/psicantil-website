# FEATURE-06 — Fix All Dead Links & Stubs in `index.html`

## Goal

Every link, button, and interactive element in `index.html` must go somewhere real. This is a targeted surgical task — change only what's listed below, touch nothing else.

---

## Complete list of stubs to fix

### 1. Logo link — line ~603
```html
<!-- BEFORE -->
<a class="logo" href="#">

<!-- AFTER -->
<a class="logo" href="/">
```

---

### 2. Admin nav button — line ~610
```html
<!-- BEFORE -->
<a class="npill solid" onclick="alert('Panel de administración — próximamente')">⚙ Admin</a>

<!-- AFTER -->
<a class="npill solid" href="/admin">⚙ Admin</a>
```

---

### 3. "Ver todos ↗" blog button — line ~874
```html
<!-- BEFORE -->
<button class="see-all">Ver todos ↗</button>

<!-- AFTER -->
<a class="see-all" href="/posts/">Ver todos ↗</a>
```
Change tag from `<button>` to `<a>` so it navigates. The `.see-all` CSS already works on both.

---

### 4. Blog card 1 — line ~879
```html
<!-- BEFORE -->
<div class="bc big rev" onclick="openPost(0)" style="transition-delay:.05s;cursor:none">

<!-- AFTER -->
<div class="bc big rev" onclick="openPost(0)" data-href="/posts/desarrollo-lenguaje.html" style="transition-delay:.05s;cursor:none">
```
Add `data-href`. The updated `openPost()` JS (see below) will use this.

---

### 5. Blog card 2 — line ~909
```html
<!-- BEFORE -->
<div class="bc rev" onclick="openPost(1)" style="transition-delay:.15s;cursor:none">

<!-- AFTER -->
<div class="bc rev" onclick="openPost(1)" data-href="/posts/apego-seguro.html" style="transition-delay:.15s;cursor:none">
```

---

### 6. Blog card 3 — line ~931
```html
<!-- BEFORE -->
<div class="bc rev" onclick="openPost(2)" style="transition-delay:.25s;cursor:none">

<!-- AFTER -->
<div class="bc rev" onclick="openPost(2)" data-href="/posts/rabietas.html" style="transition-delay:.25s;cursor:none">
```

---

### 7. LinkedIn social chip — line ~1027
```html
<!-- BEFORE -->
<a class="schip" href="#" target="_blank">
  <svg ...></svg>LinkedIn
</a>

<!-- AFTER -->
<a class="schip" href="https://www.linkedin.com/in/cristina-gongora-gonzalez" target="_blank" rel="noopener noreferrer">
  <svg ...></svg>LinkedIn
</a>
```
> **Note for Cristina:** Replace the LinkedIn URL with her real profile URL before deploying.

---

### 8. Privacy policy footer link — line ~1063
```html
<!-- BEFORE -->
<a href="#">Política de privacidad</a>

<!-- AFTER -->
<a href="/privacidad.html">Política de privacidad</a>
```
The `/privacidad.html` page is created in FEATURE-07.

---

### 9. Footer copyright year
```html
<!-- BEFORE -->
<p>© 2025 Psicantil · psicantil.com</p>

<!-- AFTER -->
<p>© <span id="footer-year">2025</span> Psicantil · <a href="https://psicantil.com" style="color:inherit;text-decoration:none">psicantil.com</a></p>
```
Add this JS at the bottom of the `<script>` block to keep the year current:
```js
document.getElementById('footer-year').textContent = new Date().getFullYear();
```

---

### 10. "Intro" card links — lines ~797, ~825, ~856

The three `.clink` "Leer artículos" links all point to `#blog` (the blog section anchor). This is fine for now — they scroll to the blog section on the homepage. No change needed unless you want them to go to `/posts/?category=X` (defer to later).

---

## Update `openPost()` to add a "Read full article" link in the modal

Inside the `openPost()` function, the modal currently has no link to the full post page. Add a CTA at the bottom of the modal body:

```js
function openPost(i) {
  const p = posts[i];
  // ... existing html building code ...

  // ADD THIS: append a "read full article" link
  const slugs = ['desarrollo-lenguaje', 'apego-seguro', 'rabietas'];
  document.getElementById('mbody').innerHTML = `
    ...existing modal HTML...
    <div class="share-row">...</div>
    <div style="text-align:center;margin-top:32px;padding-top:28px;border-top:1.5px solid var(--border)">
      <a href="/posts/${slugs[i]}.html"
         class="btn btn-g"
         style="display:inline-flex;text-decoration:none">
        Leer artículo completo
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </a>
    </div>
  `;
  // ...
}
```

---

## Acceptance criteria

- [ ] Logo click → navigates to `/` (homepage)
- [ ] Admin button → navigates to `/admin` (no alert)
- [ ] "Ver todos ↗" → navigates to `/posts/`
- [ ] Each blog card → opens modal AND has a "Leer artículo completo" link inside modal
- [ ] LinkedIn chip → opens real LinkedIn profile in new tab
- [ ] "Política de privacidad" → navigates to `/privacidad.html`
- [ ] Footer year shows current year automatically
- [ ] No `href="#"` dead links remain (except internal anchors like `#blog`, `#sobre`, `#suscribir` which are intentional)
- [ ] No `alert()` calls remain
