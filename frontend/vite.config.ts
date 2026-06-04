import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      host: "::",
      port: Number(env.VITE_PORT) || 8080,
      strictPort: true,
    },
    preview: {
      host: "::",
      port: Number(env.VITE_PORT) || 8080,
      strictPort: true,
    },
  };
});
