import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@humanity-org/react-sdk/styles.css";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
