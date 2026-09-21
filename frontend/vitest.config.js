import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  test: {
    environment: "jsdom",
  },
});
