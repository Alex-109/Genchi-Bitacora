// src/main.tsx (o src/index.tsx)
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <div id="__app-root">
      <App />
    </div>
  </React.StrictMode>
);

// ejemplo: activar modo dark por defecto
// document.body.classList.add('dark');
