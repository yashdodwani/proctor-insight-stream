import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useDevProxy = env.VITE_USE_DEV_PROXY === "true";
  const apiBaseUrl = env.VITE_API_BASE_URL || "https://proctoring.formapply.in";
  const isLocalBackend = apiBaseUrl.includes("localhost") || apiBaseUrl.includes("127.0.0.1");

  return {
    server: {
    host: "::",
    port: 8080,
    proxy:
      useDevProxy
        ? {
            // Optional local proxy for /reports if you explicitly enable it.
            "/reports": {
              target: apiBaseUrl,
              changeOrigin: true,
              secure: !isLocalBackend,
              configure: (proxy) => {
                proxy.on("proxyReq", (proxyReq) => {
                  proxyReq.setHeader("X-API-Key", (env.VITE_API_KEY || "proctoringv0@yash").trim());
                });
              },
            },
          }
        : undefined,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
