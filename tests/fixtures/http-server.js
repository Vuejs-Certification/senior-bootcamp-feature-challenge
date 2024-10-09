import { createApp, eventHandler, toNodeListener } from "h3";
import { listen } from "listhen";

const app = createApp();
let listener;
export const getURL = () => listener.url;

export async function setupServer() {
  app.use(
    "/list",
    eventHandler(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
      return {
        data: [1, 2, 3, 4, 5],
      };
    })
  );

  app.use(
    "/detail",
    eventHandler(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
      return {
        data: "detail",
      };
    })
  );

  listener = await listen(toNodeListener(app));
}

export function closeServer() {
  listener.close().catch(console.error);
}
