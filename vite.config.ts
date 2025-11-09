import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Resolve optional TensorFlow backends to empty modules
      '@tensorflow/tfjs-backend-webgpu': path.resolve(__dirname, './src/lib/empty.js'),
      '@tensorflow/tfjs-backend-wasm': path.resolve(__dirname, './src/lib/empty.js'),
    },
  },
  optimizeDeps: {
    exclude: ['@tensorflow/tfjs-backend-webgpu', '@tensorflow/tfjs-backend-wasm'],
  },
}));
