/**
 * @fileoverview Uygulama giriş noktası.
 * AuthProvider ile tüm uygulamayı sarar.
 */

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <TranslationProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </TranslationProvider>
    </AuthProvider>
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
