# CLAUDE.md — Psicantil Project

## What this project is

**Psicantil** is a psychology blog for children (psicología infantil) written by Cristina Góngora González. The site is a static HTML site to be deployed on Vercel. Starting point: `index.html` — a pixel-perfect, fully designed single-page site (v7 of the design).

The design is **complete and approved**. Do not change any visual design unless explicitly asked. Your job is to implement missing features and wire up functionality.

---

## Tech stack

- **Static HTML/CSS/JS** — no framework, no build step
- **Deployment**: Vercel (static)
- **Fonts**: Google Fonts — Fraunces (serif headlines) + Nunito (body)
- **No dependencies** beyond Google Fonts
- Phase 2 (future): may migrate to Next.js + Supabase for CMS/auth

---

## Project structure (target)

```
/
├── index.html              ← main page (start here)
├── vercel.json             ← Vercel config
├── /posts/                 ← individual blog post pages (static HTML)
│   ├── desarrollo-lenguaje.html
│   ├── apego-seguro.html
│   └── rabietas.html
├── /admin/                 ← password-protected admin area
│   └── index.html
├── /api/                   ← Vercel serverless functions
│   └── subscribe.js        ← newsletter signup handler
└── /assets/
    └── og-image.png        ← social share image
```

---

## Design tokens (CSS custom properties)

These are defined in `:root` in `index.html`. Never hardcode hex values — always use these variables.

```css
--paper:    #F5F0E8   /* parchment base background */
--paper2:   #EDE8DF   /* deeper parchment, alt sections */
--card:     #FFFFFF   /* white — cards pop off parchment */
--g0:       #16B05A   /* brand green */
--g1:       #20C96A   /* bright green accent */
--g2:       #0C7A3D   /* deep green */
--g-light:  #B2F0CE   /* pale green wash */
--g-pale:   #DCF5EB   /* very pale green tint */
--coral:    #FF3D5A   /* vivid coral */
--sun:      #FFA800   /* amber-gold */
--sky:      #0088BB   /* sky blue */
--lav:      #7C3AED   /* violet */
--peach:    #FF6A30   /* peach */
--ink:      #1A1208   /* near-black warm */
--ink2:     #3D3020   /* body text */
--ink3:     #6B5C44   /* captions/meta */
--border:   rgba(26,18,8,.10)
--shadow:   rgba(26,18,8,.07)
--shadow-m: rgba(26,18,8,.13)
--shadow-lg:rgba(26,18,8,.18)
```

---

## Typography

- **Headlines**: `font-family: 'Fraunces', serif` — weight 700 or 900, tight tracking (`letter-spacing: -.04em` to `-.06em`)
- **Body / UI**: `font-family: 'Nunito', sans-serif` — weight 400–900
- **Gradient text pattern**: `background: linear-gradient(...); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`

---

## Sections in index.html (in order)

| Section | ID / class | Description |
|---|---|---|
| Nav | `<nav>` | Fixed, parchment glass, logo + 4 nav pills |
| Hero | `.hero` | Split 50/50: left = headline+CTAs, right = SVG illustration |
| Marquee | `.marquee` | Green scrolling ticker strip |
| Intro | `.intro-sec` | 3 topic cards (Apego, Rabietas, Lenguaje) |
| Blog | `#blog` `.blog-sec` | 3 blog cards, 1 big + 2 small, open modal on click |
| About | `#sobre` `.about-sec` | Bio + morphing blob + floating pills |
| Subscribe | `#suscribir` `.sub-sec` | Email newsletter form |
| Footer | `<footer>` | Logo + copyright |
| Modal | `#modal` | Full-post reader, triggered by blog card click |

---

## What is already working

- ✅ All visual design (CSS, animations, SVG illustrations)
- ✅ Aurora canvas background (animated parchment wash)
- ✅ Custom cursor with hover states
- ✅ Scroll reveal (IntersectionObserver)
- ✅ Blog card → modal → post reader (hardcoded JS data)
- ✅ Share buttons (Facebook, LinkedIn, Instagram)
- ✅ Subscribe form (fake confirm, no backend)
- ✅ Responsive layout (1060px, 640px breakpoints)
- ✅ Admin button (shows alert placeholder)

---

## Features to implement

See individual feature docs. Implement in this order:

1. `FEATURE-01-vercel-deploy.md` — `vercel.json`, `.gitignore`, `.env.example`
2. `FEATURE-02-blog-pages.md` — Standalone post pages + `/posts/` index page
3. `FEATURE-03-seo-meta.md` — Meta tags, Open Graph, JSON-LD structured data
4. `FEATURE-04-newsletter.md` — Real subscribe endpoint via Resend API
5. `FEATURE-05-admin.md` — Password-protected admin dashboard
6. `FEATURE-06-fix-stubs.md` — Fix every dead link and alert() stub in index.html
7. `FEATURE-07-legal-pages.md` — /privacidad.html, /cookies.html, cookie banner
8. `FEATURE-08-mobile-fixes.md` — Guard cursor:none, touch tap, keyboard a11y
9. `FEATURE-09-404-page.md` — Branded 404 page wired to Vercel
10. `FEATURE-10-partials.md` — Shared nav/footer partials + final file structure

---

## Code conventions

- **Spanish copy**: all user-facing text stays in Spanish
- **No frameworks**: vanilla JS only for phase 1
- **CSS**: add styles inside `<style>` tags in each HTML file, following the same BEM-ish class naming already in use
- **Accessibility**: every interactive element needs `aria-label` or visible label; use semantic HTML
- **Mobile first**: test at 375px, 768px, 1280px
- **No `cursor: none`** on touch devices — wrap cursor CSS in `@media (hover: hover)`
- **Performance**: keep everything under 100kb uncompressed JS per page; inline critical CSS

---

## Vercel deployment notes

- Static export — no SSR needed for phase 1
- `vercel.json` should set headers for caching and security
- Serverless functions go in `/api/` — Node.js 18
- Environment variables needed: `RESEND_API_KEY` (newsletter), `ADMIN_PASSWORD` (admin panel)
- Custom domain: `psicantil.com` (configure in Vercel dashboard after deploy)
