import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// 서버 프록시 & 인증 헤더 추가
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/opensky": {
          target: "https://opensky-network.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/opensky/, ""),
          headers: {
            Authorization:
              "Basic" +
              Buffer.from(
                `${env.VITE_OPENSKY_USERNAME}:${env.VITE_OPENSKY_PASSWORD}`
              ).toString("base64"),
          },
        },
      },
    },
  };
});