import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  site: "https://eu.robsoncassiano.software",
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwind()],
    resolve: {
      alias: {
        "@": "/src"
      }
    }
  }
});
