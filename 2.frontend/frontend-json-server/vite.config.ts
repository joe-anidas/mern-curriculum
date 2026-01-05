import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  css: {
    devSourcemap: false,
  },
  build: {
    target: "esnext",
    cssCodeSplit: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        passes: 3,
        toplevel: true,
        ecma: 2020,
      },
      mangle: {
        toplevel: true,
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) {
              return "react";
            }
            if (id.includes("react-router")) {
              return "react-router";
            }
            if (id.includes("react-hook-form")) {
              return "forms";
            }
            if (id.includes("@tanstack/react-query")) {
              return "query";
            }
            if (id.includes("zustand")) {
              return "state";
            }
            return "vendor";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 400,
    reportCompressedSize: true,
    sourcemap: false,
    cssMinify: true,
    emptyOutDir: true,
  },
});
