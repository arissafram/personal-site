import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from ".";
import { preloadGames } from "./preload-games";

import "./reset.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

preloadGames();
