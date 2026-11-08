// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Root site (`/`). For a GitHub Pages project URL such as
// https://fer1s.github.io/portfolio-main/, set `base` to `/portfolio-main`.
export default defineConfig({
	site: "https://fer1s.github.io",
	trailingSlash: "always",
	integrations: [sitemap()],
});
