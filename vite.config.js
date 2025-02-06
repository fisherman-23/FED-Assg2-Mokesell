import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext", // Use 'esnext' to ensure full compatibility with top-level await
    rollupOptions: {
      input: {
        main: "index.html",
        chatList: "chat-list.html",
        chatView: "chat-view.html",
        dashboard: "dashboard.html",
        login: "login.html",
        productPage: "productPage.html",
        productDetail: "product-detail.html",
        rewards: "rewards.html",
      },
    },
    esbuild: {
      target: "esnext", // Ensures support for the latest JS features, including top-level await
    },
  },
});
