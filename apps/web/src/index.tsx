/* @refresh reload */
import { configureResponsiveImages } from "@church/ui/responsive-image";
import { render } from "solid-js/web";
import { App } from "./app/App";
import "./index.css";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
if (cloudName) {
  configureResponsiveImages({ cloudName });
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

render(() => <App />, root);
