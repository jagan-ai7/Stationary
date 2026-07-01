import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/app/store";
import { ThemeInitializer } from "@/features/theme/ThemeInitializer";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeInitializer />
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster richColors position="top-right" duration={1000} />
    </Provider>
  </React.StrictMode>,
);
