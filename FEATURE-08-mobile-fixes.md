# FEATURE-08 — Mobile & Touch Fixes

## Goal

The current `index.html` has two known mobile problems introduced by its desktop design:

1. **`cursor: none`** is set on `body` and many elements — on touch devices this makes the tap cursor invisible and breaks usability
2. **Blog cards use `onclick` on `<div>`** elements — these work but are not semantically correct and can be awkward on touch

This feature fixes both, plus catches any other mobile rough edges.

---

## Fix 1 — Guard `cursor: none` behind `@media (hover: hover)`

Devices with no hover capability (phones, tablets) should use the native cursor.

### What to change in `index.html`

Find every `cursor: none` declaration and move them inside a `@media (hover: hover)` block. Also, move the entire custom cursor HTML and its JS inside the same guard.

**Step 1 — Wrap all `cursor:none` CSS in a media query**

At the end of the `<style>` block, add:

```css
/* ── CUSTOM CURSOR — desktop/mouse only ── */
@media (hover: hover) {
  body { cursor: none; }

  .logo,
  .npill,
  .btn,
  .clink,
  .see-all,
  .gcard,
  .bc,
  .schip,
  .sub-btn,
  .mclose,
  .sbtn { cursor: none; }
}
```

Then **remove** `cursor: none` from all the individual rules where it currently appears inline (body, .logo, .npill, .btn, .gcard, etc.). The media-query block above replaces them all.

**Step 2 — Hide cursor elements on touch devices**

```css
@media (hover: none) {
  #cur, #cur-ring { display: none !important; }
}
```

**Step 3 — Guard cursor JS**

Wrap the CURSOR script block so it only runs on pointer devices:

```js
/* CURSOR — mouse/trackpad only */
if (window.matchMedia('(hover: hover)').matches) {
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * .1;
    ry += (my - ry) * .1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.gcard,.bc,.npill').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });
}
```

---

## Fix 2 — Blog cards: add keyboard accessibility

The blog cards use `onclick` on `<div>` elements. Add `tabindex` and `role` so keyboard users can also open them:

```html
<!-- BEFORE -->
<div class="bc big rev" onclick="openPost(0)" data-href="/posts/desarrollo-lenguaje.html" style="...">

<!-- AFTER -->
<div class="bc big rev"
     onclick="openPost(0)"
     data-href="/posts/desarrollo-lenguaje.html"
     tabindex="0"
     role="button"
     aria-label="Leer: Desarrollo del lenguaje"
     onkeydown="if(event.key==='Enter'||event.key===' '){openPost(0)}"
     style="...">
```

Apply to all 3 blog cards with appropriate `aria-label` per card.

---

## Fix 3 — Nav on small screens

At 375px the nav currently hides non-solid pills but the layout can still feel tight. Verify:

```css
/* Already in index.html — confirm this rule exists and is correct */
@media (max-width: 640px) {
  .nav-links .npill:not(.solid) { display: none; }
}
```

If the Admin pill and the logo overlap at 375px, add:
```css
@media (max-width: 400px) {
  nav { padding: 0 16px; }
  .logo { font-size: 1.3rem; }
}
```

---

## Fix 4 — Subscribe form on small screens

Already in the CSS:
```css
@media (max-width: 640px) {
  .sub-form { flex-direction: column; }
}
```

Verify the email input and button stack correctly and the button is full-width at 375px. Add if missing:
```css
@media (max-width: 640px) {
  .sub-in, .sub-btn { width: 100%; }
}
```

---

## Fix 5 — Touch tap highlight on blog cards

On iOS/Android, tapping a `<div>` with `onclick` shows an ugly grey flash. Suppress it:

```css
.bc, .gcard {
  -webkit-tap-highlight-color: transparent;
}
```

---

## Fix 6 — Aurora canvas performance on low-end mobile

The aurora canvas runs `requestAnimationFrame` continuously. On low-power devices this can drain battery. Pause animation when the page is not visible:

```js
// In the aurora IIFE, replace the draw() call with:
function draw() {
  if (!document.hidden) {
    cx.clearRect(0, 0, W, H);
    cx.fillStyle = '#F5F0E8';
    cx.fillRect(0, 0, W, H);
    orbs.forEach(o => {
      // ... existing orb drawing code ...
    });
    t++;
  }
  requestAnimationFrame(draw);
}

// Optionally reduce frame rate on mobile:
let lastFrame = 0;
function draw(ts) {
  const fps = window.matchMedia('(hover: none)').matches ? 24 : 60;
  const interval = 1000 / fps;
  requestAnimationFrame(draw);
  if (ts - lastFrame < interval) return;
  lastFrame = ts;
  // ... drawing code ...
}
```

---

## Testing checklist

Test each of these manually on a real phone (or Chrome DevTools mobile emulation at 375px × 812px):

- [ ] Tapping logo navigates to `/`
- [ ] Custom cursor dots are NOT visible on phone
- [ ] Native tap cursor works normally on phone
- [ ] Blog cards respond to tap (opens modal)
- [ ] Modal can be closed with the ✕ button on small screens
- [ ] Subscribe form stacks vertically on phone
- [ ] Nav only shows "Suscríbete" + Admin pill at 375px
- [ ] Footer text doesn't overflow at 375px
- [ ] No horizontal scrollbar at any mobile width
- [ ] Blog card keyboard navigation works (Tab + Enter opens modal)
- [ ] Aurora animation doesn't cause jank on phone (test on a real device)
