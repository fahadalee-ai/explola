import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Local Nginx and preview.html serve the app under /explola/.
 * Vercel sets VERCEL_ENV during its build and serves the project at the domain root.
 */
const base = process.env.VERCEL_ENV ? "/" : "/explola/";

export default defineConfig({
  nitro: { preset: "vercel" },
  vite: {
    base,
    server: {
      allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"],
    },
    preview: {
      allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"],
    },
  },
});