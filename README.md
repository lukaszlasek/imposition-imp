# 😈 Imp — Print Imposition

> **Make print great again.**

Imp is a **browser-based print imposition tool** for bookbinders, zine makers, indie publishers, and anyone who cares about craft. Upload a print-ready PDF, dial in your paper and signature settings, and download an **imposed PDF** that — when printed, folded, and stitched — produces pages in correct reading order on your home printer.

No InDesign. No server. No accounts. Your files never leave your browser.

## Why Imp?

Imposition tools are either buried inside expensive desktop software or assume a commercial print shop. Imp is focused, free, shareable, and built for the kitchen-table bookbinder. Its standout feature is **duplex calibration** — measure your printer's front-to-back misalignment once, and Imp compensates so your folded pages line up.

## Features

- 📄 **Upload any print-ready PDF** (up to 100 MB, processed entirely in-browser)
- 📐 **Paper sizes** — A4, Letter, A3, and more
- 📚 **Two binding modes** — saddle stitch (single signature) and multi-signature
- 🔖 **Signature size** — sheets per folded section
- 📏 **Binding margin / gutter** in millimetres
- 🎯 **Duplex calibration** — X/Y offset (mm) to correct home-printer front/back drift, with a printable calibration sheet
- 🌀 **Creep compensation** — shift inner sheets toward the spine for thick booklets
- ⚠️ **Smart page-count handling** — warns when pages don't divide by 4 and lets you add blanks or proceed
- 🔒 **Privacy-first** — fully client-side; a CSP-hardened single-file build that even runs from `file://`

## How it works

1. **Upload** a print-ready PDF.
2. **Configure** paper size, binding mode, signature size, gutter, and (optionally) duplex/creep calibration.
3. **Compose** — Imp lays out 2-up imposed sheets in correct fold order.
4. **Download** the imposed PDF, print it duplex, fold, and stitch.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 + `vite-plugin-singlefile` |
| Styling | Tailwind CSS 4 |
| PDF read **and** write | [`pdf-lib`](https://github.com/Hopding/pdf-lib) (no worker, runs from `file://`) |
| State | Zustand |
| Tests | Vitest |

Everything compiles to a **single self-contained `index.html`** — open it from disk, host it anywhere, or email it to a friend.

## Getting started

```bash
git clone https://github.com/lukaszlasek/imposition-imp.git
cd imposition-imp
npm install

npm run dev      # dev server at http://localhost:5173
npm run build    # production single-file build → dist/index.html
npm run preview  # serve the production build locally
npm test         # run the test suite
npm run lint     # lint
```

## Privacy & security

- **No network calls.** All PDF parsing and generation happen locally in your browser.
- The production build ships a strict **Content-Security-Policy** with `connect-src 'none'`, enforcing that nothing is ever uploaded or exfiltrated.
- No analytics, no accounts, no cookies.

## Status

v1 in active development (~88% complete). Roadmap:

1. **Core imposition** — saddle-stitch MVP ✅
2. **Multi-signature & duplex calibration** — in progress

## License

[MIT](LICENSE) © 2026 Lukasz Lasek
