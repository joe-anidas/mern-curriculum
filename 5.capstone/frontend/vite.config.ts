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
        passes: 2,
        toplevel: false,
        ecma: 2020,
      },
      mangle: {
        toplevel: false,
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
            const parts = id.split("node_modules/")[1].split("/");
            const pkg = parts[0].startsWith("@")
              ? `${parts[0]}/${parts[1]}`
              : parts[0];

            // Group core React packages together
            if (pkg === "react" || pkg === "react-dom") return "react";
            if (pkg === "react-router-dom") return "react-router";
            if (pkg === "react-hook-form") return "forms";
            if (pkg === "@tanstack/react-query") return "query";
            if (pkg === "zustand") return "state";
            if (pkg === "recharts") return "charts";
            if (pkg === "framer-motion") return "motion";
            if (pkg === "firebase") return "firebase";
            if (pkg === "socket.io-client") return "socket";

            // Otherwise, create a package-specific chunk name (scoped packages normalized)
            return pkg.replace("/", "-");
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Increase the warning threshold and let manualChunks split large vendor bundles
    chunkSizeWarningLimit: 700,
    reportCompressedSize: true,
    sourcemap: false,
    cssMinify: true,
    emptyOutDir: true,
  },
});
