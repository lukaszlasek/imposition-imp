import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * Inject a Content-Security-Policy <meta> into the PRODUCTION build only.
 *
 * Enforces the app's privacy-first guarantee: all PDF processing is local, so
 * the built artifact must never reach the network. `connect-src 'none'` blocks
 * any fetch/XHR/WebSocket/beacon exfiltration; `object-src`/`base-uri`/
 * `form-action 'none'` close common injection escape hatches.
 *
 * `'unsafe-inline'` is required because vite-plugin-singlefile inlines the JS and
 * CSS into index.html. `'unsafe-eval'` is intentionally NOT granted — the bundle
 * contains no eval/new Function (verified). data:/blob: cover the inlined logo
 * and the object-URL PDF downloads.
 *
 * Build-only (`apply: 'build'`) so it never interferes with the dev server's HMR
 * websocket or eval-based module loading.
 */
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'none'",
    "script-src 'unsafe-inline'",
    "style-src 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ')
  return {
    name: 'imp-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '</title>',
        `</title>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cspPlugin(), viteSingleFile()],
  base: './',  // CRITICAL: relative base so dist/index.html works from filesystem
  test: {
    globals: true,
    environment: 'node',
  },
})
