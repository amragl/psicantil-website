# FEATURE-07 — Legal Pages (Privacy Policy & Cookie Notice)

## Goal

Spanish GDPR-compliant legal pages required before going live. The newsletter subscription makes these mandatory.

---

## Files to create

```
/privacidad.html     ← Política de privacidad (Privacy Policy)
/cookies.html        ← Política de cookies (Cookie Policy)
```

And a **cookie consent banner** injected into `index.html` (and all other pages).

---

## `/privacidad.html` — Privacy Policy

Same nav + footer as `index.html`. Plain readable layout with the content below.

**Page structure:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <!-- same fonts, same :root CSS variables as index.html -->
  <title>Política de Privacidad · Psicantil</title>
  <meta name="description" content="Política de privacidad de Psicantil.">
  <link rel="canonical" href="https://psicantil.com/privacidad.html">
  <meta name="robots" content="noindex"> <!-- legal pages don't need indexing -->
</head>
<body>
  <nav><!-- exact copy from index.html --></nav>

  <main class="legal-main">
    <div class="legal-body">
      <div class="tag tg">⚖️ Legal</div>
      <h1 class="legal-h1">Política de Privacidad</h1>
      <p class="legal-updated">Última actualización: enero 2025</p>

      <!-- Content sections below -->
    </div>
  </main>

  <footer><!-- exact copy from index.html --></footer>
</body>
</html>
```

**CSS to add:**
```css
.legal-main {
  padding-top: 68px; /* nav height */
  background: var(--paper);
  min-height: 100vh;
}
.legal-body {
  max-width: 760px;
  margin: 0 auto;
  padding: 80px 32px 120px;
}
.legal-h1 {
  font-family: 'Fraunces', serif;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 3.2rem);
  letter-spacing: -.05em;
  color: var(--ink);
  margin: 16px 0 8px;
}
.legal-updated {
  font-size: .82rem;
  color: var(--ink3);
  margin-bottom: 52px;
}
.legal-body h2 {
  font-family: 'Fraunces', serif;
  font-weight: 900;
  font-size: 1.4rem;
  color: var(--ink);
  letter-spacing: -.03em;
  margin: 48px 0 14px;
}
.legal-body p, .legal-body li {
  font-size: 1rem;
  line-height: 1.85;
  color: var(--ink2);
  margin-bottom: 16px;
}
.legal-body ul {
  padding-left: 24px;
  margin-bottom: 16px;
}
.legal-body a { color: var(--g0); }
.legal-body strong { color: var(--ink); }
```

**Privacy policy content (Spanish, GDPR compliant):**

```html
<h2>1. Responsable del tratamiento</h2>
<p>
  <strong>Cristina Góngora González</strong><br>
  Sitio web: psicantil.com<br>
  Contacto: <a href="mailto:hola@psicantil.com">hola@psicantil.com</a>
</p>

<h2>2. Datos que recopilamos</h2>
<p>Psicantil recopila únicamente los datos que tú nos proporcionas voluntariamente:</p>
<ul>
  <li><strong>Suscripción al newsletter:</strong> tu dirección de correo electrónico.</li>
  <li><strong>Contacto directo:</strong> los datos que compartas si te pones en contacto por email.</li>
</ul>
<p>No recopilamos datos de navegación, no usamos cookies de seguimiento y no instalamos herramientas de analítica de terceros.</p>

<h2>3. Finalidad y base legal</h2>
<p>Tratamos tu email con la única finalidad de enviarte el newsletter de Psicantil: artículos sobre psicología infantil y crianza consciente.</p>
<p>La base legal es tu <strong>consentimiento explícito</strong> (art. 6.1.a del RGPD), que otorgas al suscribirte.</p>

<h2>4. Destinatarios</h2>
<p>Tus datos se almacenan en <strong>Resend</strong> (resend.com), nuestro proveedor de envío de email, con servidores en la Unión Europea. No cedemos tus datos a ningún tercero con fines comerciales.</p>

<h2>5. Plazo de conservación</h2>
<p>Conservamos tu email mientras permanezcas suscrita/o. Si te das de baja, tus datos se eliminan de nuestra lista de forma inmediata.</p>

<h2>6. Tus derechos</h2>
<p>Tienes derecho a acceder, rectificar, suprimir, oponerte al tratamiento y solicitar la portabilidad de tus datos. Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:hola@psicantil.com">hola@psicantil.com</a>.</p>
<p>También puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (aepd.es) si consideras que el tratamiento no es conforme al RGPD.</p>

<h2>7. Cancelar suscripción</h2>
<p>Puedes darte de baja en cualquier momento haciendo clic en el enlace "Cancelar suscripción" que aparece al pie de cada email que te enviamos.</p>

<h2>8. Cambios en esta política</h2>
<p>Si realizamos cambios relevantes en esta política, te lo comunicaremos por email. La fecha de última actualización aparece al inicio de este documento.</p>
```

---

## `/cookies.html` — Cookie Policy

Same layout as `/privacidad.html`.

**Content:**
```html
<h2>¿Usamos cookies?</h2>
<p>
  Psicantil <strong>no utiliza cookies de seguimiento, analítica ni publicidad</strong>.
  No instalamos ninguna herramienta de terceros (Google Analytics, Facebook Pixel, etc.)
  que rastree tu comportamiento en el sitio.
</p>

<h2>Cookies técnicas</h2>
<p>
  El sitio puede utilizar cookies de sesión estrictamente necesarias para el funcionamiento
  de la página (por ejemplo, para recordar que has aceptado este aviso de cookies).
  Estas cookies no recopilan datos personales y se eliminan al cerrar el navegador.
</p>

<h2>Cookies de terceros</h2>
<p>
  Las únicas cookies de terceros posibles provienen de <strong>Google Fonts</strong>,
  que usamos para cargar las tipografías del sitio. Google puede registrar la solicitud
  de fuente, pero no recopilamos ningún dato de ese proceso.
  Consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">política de privacidad de Google</a>.
</p>

<h2>¿Cómo gestionar las cookies?</h2>
<p>
  Puedes configurar tu navegador para bloquear o eliminar cookies.
  Ten en cuenta que algunas funciones del sitio podrían verse afectadas.
</p>
```

---

## Cookie consent banner (inject into ALL pages)

A minimal, GDPR-compliant notice. Since the site uses essentially no tracking cookies, this can be very light.

**Add just before `</body>` in every HTML page:**

```html
<!-- ══ COOKIE BANNER ══ -->
<div id="cookie-banner" style="display:none">
  <p>
    Psicantil no usa cookies de rastreo. Solo usamos Google Fonts.
    <a href="/cookies.html">Más info</a>
  </p>
  <button onclick="acceptCookies()">Entendido</button>
</div>
```

**Cookie banner CSS** (add to each page's `<style>`):

```css
#cookie-banner {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 800;
  background: var(--ink);
  color: white;
  border-radius: 50px;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  font-family: 'Nunito', sans-serif;
  font-size: .84rem;
  font-weight: 700;
  box-shadow: 0 8px 32px rgba(0,0,0,.25);
  white-space: nowrap;
  max-width: calc(100vw - 48px);
  flex-wrap: wrap;
  justify-content: center;
}
#cookie-banner p { margin: 0; opacity: .85; }
#cookie-banner a { color: var(--g1); text-decoration: none; }
#cookie-banner button {
  padding: 8px 20px;
  border-radius: 50px;
  border: none;
  background: var(--g0);
  color: white;
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: .82rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background .2s;
}
#cookie-banner button:hover { background: var(--g1); }
```

**Cookie banner JS** (add to each page's `<script>`):

```js
// Cookie consent
function acceptCookies() {
  localStorage.setItem('psicantil_cookies', '1');
  document.getElementById('cookie-banner').style.display = 'none';
}
// Show banner if not yet accepted
if (!localStorage.getItem('psicantil_cookies')) {
  // Delay slightly so it doesn't flash on first paint
  setTimeout(() => {
    const b = document.getElementById('cookie-banner');
    if (b) b.style.display = 'flex';
  }, 1200);
}
```

---

## Update footer links

In `index.html` footer (and all other pages), update the privacy link:
```html
<!-- BEFORE -->
<a href="#">Política de privacidad</a>

<!-- AFTER -->
<a href="/privacidad.html">Política de privacidad</a> ·
<a href="/cookies.html" style="color:var(--g-light)">Cookies</a>
```

---

## Acceptance criteria

- [ ] `/privacidad.html` renders with correct nav, content, and footer
- [ ] `/cookies.html` renders with correct nav, content, and footer
- [ ] Both pages have `<meta name="robots" content="noindex">`
- [ ] Cookie banner appears on first visit
- [ ] Cookie banner does NOT appear after clicking "Entendido"
- [ ] Cookie banner does NOT reappear after page refresh once accepted
- [ ] Banner links to `/cookies.html`
- [ ] Footer "Política de privacidad" links to `/privacidad.html`
- [ ] All pages have cookies link in footer
