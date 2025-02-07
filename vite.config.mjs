import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    nodePolyfills(), // Adds Node.js polyfills for the browser
  ],
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
  },
});
