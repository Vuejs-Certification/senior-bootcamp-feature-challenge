import { createApp } from "vue";
import App from "./App.vue";
import "@/assets/main.css";
import terminal from "virtual:terminal";
// eslint-disable-next-line no-undef
globalThis.console = terminal;

const app = createApp(App);

app.mount("#app");
