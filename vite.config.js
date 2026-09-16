import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Relative base so the built app works from a GitHub Pages project path
// or a custom domain root alike, without a config flag per environment.
export default defineConfig({
	base: "./",
	plugins: [svelte()],
});
