import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const USERNAME = import.meta.env.VITE_OPENSKY_USERNAME;
const PASSWORD = import.meta.env.VITE_OPENSKY_PASSWORD;

// 서버 프록시 & 인증헤더 추가
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/opensky" : {
        target: "https://opensky-network.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky/, ''),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq) => {
            const auth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
            proxyReq.setHeader("Authorization", `Basic ${auth}`);
          });
        },
      },
    },
  },
});