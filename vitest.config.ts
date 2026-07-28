import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",

    include: [
      "src/test/unit/**/*.test.ts",
      "src/test/unit/**/*.test.tsx",
      "src/test/integration/**/*.test.ts",
      "src/test/integration/**/*.test.tsx",
    ],

    exclude: [
      "src/test/e2e/**",
      "node_modules",
      "dist",
    ],
  },
});