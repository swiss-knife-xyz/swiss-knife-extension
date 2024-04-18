import { createRoot } from "react-dom/client";
import App from "./App";

// receive from content_script (inject.ts)
window.addEventListener("message", (e: any) => {
  // only accept messages from us
  if (e.source !== window) {
    return;
  }

  if (e.data.type === "swissKnifeExtensionUrl") {
    // set this value to window so it's accessible everywhere
    // we'll use this to reference extension's static files like images
    (window as any).swissKnifeExtensionUrl = e.data.msg.swissKnifeExtensionUrl;
  }
});

const body = document.querySelector("body");
const app = document.createElement("div");
app.id = "swiss-knife-react-app";

if (body) {
  body.prepend(app);
}

const root = createRoot(app);
// Render react component
root.render(<App />);
