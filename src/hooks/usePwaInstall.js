/**
 * @fileoverview PWA "Ana Ekrana Ekle" (A2HS) hook'u (ozellik_onerileri.md #15).
 * beforeinstallprompt olayını yakalar; kurulum butonunun görünürlüğünü
 * ve promptun tetiklenmesini yönetir.
 */

import { useState, useEffect, useCallback } from 'react';

/** Uygulama zaten yüklü (standalone) modda mı çalışıyor? */
function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * PWA kurulum durumu ve tetikleyicisi.
 * @returns {{ canInstall: boolean, isInstalled: boolean, promptInstall: Function }}
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault(); // Tarayıcının mini-infobar'ını engelle
      setDeferredPrompt(e);
    };
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  /** Kurulum promptunu gösterir. @returns {Promise<boolean>} kabul edildi mi */
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt && !installed,
    isInstalled: installed,
    promptInstall,
  };
}
