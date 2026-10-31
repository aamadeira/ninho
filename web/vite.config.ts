import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const apiProxy = { target: env.API_PROXY_TARGET || "http://localhost:3000", changeOrigin: false };

    return {
        plugins: [react()],
        server: {
            port: 5173,
            host: true,
            proxy: {
                "/api": apiProxy,
                "/auth": apiProxy
            }
        }
    };
});
