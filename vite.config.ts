import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({
      exclude: ["console"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "build",
    minify: "terser",
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true,
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "inpage-react-app": path.resolve(
          __dirname,
          "src/chrome/inpage-react-app/index.tsx"
        ),
        inject: path.resolve(__dirname, "src/chrome/inject.ts"),
        serviceWorker: path.resolve(__dirname, "src/chrome/serviceWorker.ts"),
        sidepanel: path.resolve(__dirname, "src/chrome/sidepanel/index.html"),
      },
      output: {
        entryFileNames: "static/js/[name].js",
      },
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
