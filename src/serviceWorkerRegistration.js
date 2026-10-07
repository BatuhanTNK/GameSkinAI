/**
 * @fileoverview Service worker kayıt yönetimi (ozellik_onerileri.md #15).
 * Production build'de /sw.js dosyasını kaydeder; offline cache ve
 * bildirim tıklama yönetimi service worker içindedir.
 * Yeni sürüm bulunduğunda SKIP_WAITING mesajı ile anında devralması sağlanır,
 * böylece güncellemeler ve güvenlik yamaları cache bayatlaması yüzünden gecikmez.
 */

/**
 * Service worker'ı kaydeder (yalnızca production ve destekleyen tarayıcılar).
 * @param {{ onUpdate?: Function, onSuccess?: Function }} [config]
 */
export function register(config) {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/sw.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Yeni sürüm bulunduğunda beklemeden aktifleştir
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state !== 'installed') return;

            if (navigator.serviceWorker.controller) {
              // Güncel içerik indirildi; yeni SW'nin hemen devralmasını iste
              installingWorker.postMessage({ type: 'SKIP_WAITING' });
              if (config && config.onUpdate) config.onUpdate(registration);
            } else {
              // İlk kurulum: içerik offline kullanım için cache'lendi
              if (config && config.onSuccess) config.onSuccess(registration);
            }
          };
        };
      })
      .catch((error) => {
        console.error('Service worker kaydı başarısız:', error);
      });
  });
}

/**
 * Kayıtlı service worker'ı kaldırır (geliştirme/sorun giderme için).
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
