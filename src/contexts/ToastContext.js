/**
 * @fileoverview Global toast bildirim sistemi.
 * Converter ve History sayfalarında tekrarlanan toast state ve showToast
 * fonksiyonunu merkezileştirir. Uygulama genelinde tek bir noktadan
 * bildirim yönetimi sağlar.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/**
 * Toast context hook'u.
 * @returns {{ showToast: Function }}
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast hook, ToastProvider içinde kullanılmalıdır.');
  }
  return context;
};

/**
 * Toast Provider bileşeni.
 * Uygulama genelinde toast bildirim yönetimi sağlar.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Yeni bir toast bildirimi gösterir.
   * @param {string} message - Bildirim mesajı
   * @param {'success'|'error'|'info'|'warning'} type - Bildirim tipi
   * @param {number} duration - Gösterim süresi (ms)
   */
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  /**
   * Belirtilen toast'ı kapatır.
   * @param {number} id - Toast ID
   */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Render */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl transition-all duration-300 animate-slideIn ${
                toast.type === 'success'
                  ? 'bg-green-500 text-white'
                  : toast.type === 'error'
                  ? 'bg-red-500 text-white'
                  : toast.type === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-brand-500 text-white'
              }`}
            >
              <span className="text-lg">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'warning' && '⚠'}
                {toast.type === 'info' && 'ℹ'}
              </span>
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="ml-2 text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastContext;
