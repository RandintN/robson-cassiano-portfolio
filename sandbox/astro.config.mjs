import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://eu.robsoncassiano.software",
  output: "static",
  integrations: [sitemap()],
  vite: {
    resolve: {
      alias: {
        "@": "/src"
      }
    }
  }
});
