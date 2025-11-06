import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WhopProvider } from "@/contexts/WhopContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WhopProvider>
      <App />
    </WhopProvider>
  </StrictMode>
);
