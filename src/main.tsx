import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from ".";

import "./reset.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
