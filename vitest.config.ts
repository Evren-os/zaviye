/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./tests/setup.ts"],
		css: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["**/*.{ts,tsx}"],
			exclude: [
				"node_modules/",
				"tests/",
				"**/*.config.{ts,js}",
				"**/dist/**",
				".next/**",
				"coverage/**",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
});
