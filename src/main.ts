import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "./styles.css";
import { startApp } from "./app";

const root = document.getElementById("app");
if (!root) throw new Error("#app not found");
void startApp(root);
