import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from "vite-plugin-vue-devtools";
import Terminal from "vite-plugin-terminal";
// search for contacts
import { contacts } from "./src/assets/dataSource";
import Fuse from "fuse.js";
const fuse = new Fuse(contacts, {
  keys: ["name"],
  ignoreCase: true,
  threshold: 0,
});

function sleep(number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, number);
  });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "server",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith("/contact-list")) {
            await sleep(200);
            const url = new URL(req.url, "http://domain");
            req.query = Object.fromEntries(url.searchParams.entries());
            const keyword = req.query.keyword;
            const result = fuse.search(keyword).map((item) => item.item);
            const normalized = keyword ? result : contacts;
            const data = {
              data: normalized,
              total: normalized.length,
            };
            res.write(JSON.stringify(data));
            res.end();
          } else {
            next();
          }
        });
      },
    },
    vue(),
    VueDevTools(),
    Terminal({
      output: ["terminal", "console"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
