import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'

/** Kort commit-id vises i appen, så testere kan oppgi hvilken versjon de brukte. */
function gitVersion(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'ukjent'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relativ base: samme bygg fungerer på GitHub Pages (/<repo>/), Netlify, eller i en undermappe.
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(gitVersion()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
})
