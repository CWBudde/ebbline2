import { defineConfig } from "vite";
import { cacheDir } from "../cachedir.ts";

export default defineConfig({
  // Relative URLs: the site works from any path, such as the GitHub Pages project path.
  base: "./",
  cacheDir: cacheDir("app"),
  build: { outDir: "../build/site", emptyOutDir: true, target: "es2022" },
});
