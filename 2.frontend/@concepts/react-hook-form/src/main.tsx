import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/hook-form.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
