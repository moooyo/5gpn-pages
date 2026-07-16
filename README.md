# 5gpn.de — 5GPN 营销站

The public marketing site for both **5GPN DNS Gateway** and **5GPN Relay**.
Product repos: <https://github.com/moooyo/5gpn> and
<https://github.com/moooyo/5gpn-relay>.

Zero build step, plain static HTML/CSS/JS. Both solutions share Apple system type,
off-white/near-black surfaces, one indigo accent, pill controls, and a persisted
automatic/light/dark theme. Served by GitHub Pages at
**<https://5gpn.de>**.

## Structure

```
.
├── index.html      # DNS Gateway marketing page
├── relay.html      # Apple Relay marketing page
├── generate.html   # local .mobileconfig generator
├── styles.css      # Apple-style tokens, components, themes, responsive states
├── main.js         # theme, copy commands, and seamless solution switching
├── favicon.svg     # indigo brand shield
├── assets/
│   ├── console-dashboard.png   # Web console screenshot (Console section)
│   ├── og-cover.png            # 1200×630 @2x social preview (og:image)
│   ├── generate.js             # browser-only Relay profile generation
│   └── qrcode.js               # local QR renderer
├── lib/             # plist/profile/domain helpers shared by the generator
├── lists/           # built-in direct/relay domain lists + metadata
├── presets/         # fast-path pre-generated Relay profiles
├── CNAME           # custom domain (5gpn.de) — add when DNS is ready
├── .nojekyll       # serve files as-is (skip Jekyll)
├── design_handoff_5gpn_pages_ios/  # DNS source handoff (reference)
└── design_handoff_5gpn_relay_ios/  # Relay source handoff (reference)
```

## Local preview

No toolchain required — open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
# or
npx serve .
```

## Deployment (GitHub Pages)

The site deploys straight from the default branch — no CI.

1. Push to `main`.
2. Repo **Settings → Pages** → **Source:** *Deploy from a branch* →
   **Branch:** `main` / `/ (root)`.
3. Preview at the default URL: **<https://moooyo.github.io/5gpn-pages/>**.
4. To switch to the custom domain `5gpn.de`, create a `CNAME` file at the repo root
   containing `5gpn.de` (see DNS below), push, then enable **Enforce HTTPS**.

> The `CNAME` file is intentionally omitted during default-domain preview: while it is
> present, GitHub redirects the default URL to `5gpn.de`, which is unreachable until
> DNS is configured.

## DNS for `5gpn.de`

`5gpn.de` is an apex (root) domain, so it needs **A / AAAA** records pointing at
GitHub Pages (a `CNAME` record is not allowed on an apex). Add these at your domain
registrar / DNS provider:

| Type  | Host / Name | Value               |
| ----- | ----------- | ------------------- |
| A     | `@`         | `185.199.108.153`   |
| A     | `@`         | `185.199.109.153`   |
| A     | `@`         | `185.199.110.153`   |
| A     | `@`         | `185.199.111.153`   |
| AAAA  | `@`         | `2606:50c0:8000::153` |
| AAAA  | `@`         | `2606:50c0:8001::153` |
| AAAA  | `@`         | `2606:50c0:8002::153` |
| AAAA  | `@`         | `2606:50c0:8003::153` |
| CNAME | `www`       | `moooyo.github.io.` |

The `www` CNAME is optional; with it, `www.5gpn.de` redirects to the apex.

Verify propagation, then turn on **Enforce HTTPS** in Settings → Pages (GitHub
provisions the Let's Encrypt certificate automatically; it can take a few minutes to
an hour).

> AAAA addresses are the current GitHub Pages IPv6 set. If GitHub publishes new
> addresses, follow the values in the
> [official docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Customizing

- **Theme tokens** — light defaults and forced light/dark values live at the top
  of `styles.css`. The fixed brand accent is `--accent: #5e5ce6`; links and CTAs
  use the separate Apple blue token.
- **Theme state** — `main.js` cycles automatic → light → dark and persists the
  selection in `localStorage['5gpn-theme']`. The inline head script applies a
  saved forced theme before first paint; all three pages share the same state.
- **Relay generator data** — refresh `lists/` and `presets/` from the
  5gpn-relay list build when its curated domain data changes.
- **Console screenshot** — replace `assets/console-dashboard.png` with a current
  screenshot of the live console.
- **Social preview** — `assets/og-cover.png` is referenced by the Open Graph /
  Twitter meta tags in `index.html`.

## License

Content and copy relate to the 5GPN project (MIT). See the product repo for details.
