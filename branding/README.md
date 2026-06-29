# Branding assets

Source icon files for the Imp favicon (generated with [favicon.io](https://favicon.io)).

| File | Use |
|---|---|
| `favicon.ico` | Legacy multi-size ICO |
| `favicon-16x16.png` / `favicon-32x32.png` | Browser tab icons |
| `apple-touch-icon.png` (180×180) | iOS home-screen icon |
| `android-chrome-192x192.png` / `android-chrome-512x512.png` | Android / PWA icons |
| `site.webmanifest` | PWA manifest (reference) |

## How these are used in the app

The favicon is **not** linked as external files. Because the app ships as a single
self-contained `index.html` (via `vite-plugin-singlefile`) that must work from
`file://`, the 16×16, 32×32, and apple-touch icons are inlined as base64 **data URIs**
directly in [`../index.html`](../index.html). This keeps the build a single file and
satisfies the production Content-Security-Policy (`img-src data:`).

To regenerate after changing the icon: re-run favicon.io with the new artwork, replace
the files here, and re-inline the 16/32/apple icons into `index.html` as data URIs.
