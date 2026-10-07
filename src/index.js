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
const basename = process.env.PUBLIC_URL || "";

root.render(
  <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <TranslationProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </TranslationProvider>
    </AuthProvider>
  </BrowserRouter>
);

// PWA: service worker'ı kaydet (offline cache + bildirim tıklama yönetimi).
// Yeni sürümler SKIP_WAITING ile anında devraldığından cache bayatlaması yaşanmaz.
serviceWorkerRegistration.register();
