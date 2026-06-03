import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <StrictMode>
        <App />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </StrictMode>
    </ThemeProvider>
  </BrowserRouter>
);
