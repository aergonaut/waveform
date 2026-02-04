import { defineConfig } from "vite";

export default defineConfig({
  base: "/waveform/",
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: "es2020",
    minify: "esbuild",
  },
});
