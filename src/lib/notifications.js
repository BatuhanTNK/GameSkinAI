/**
 * @fileoverview Yerel (tarayıcı) bildirim katmanı (ozellik_onerileri.md #15).
 * Bildirim izni yönetimi, kullanıcı tercihi (localStorage) ve
 * "Dönüşümün hazır", "Skinin X beğeniye ulaştı" bildirimlerini yönetir.
 * Push sunucusu gerektirmez; Notification API + service worker kullanır.
 */

const PREF_KEY = 'gameskinai_notifications_enabled';
const MILESTONE_KEY = 'gameskinai_like_milestones';

/** Beğeni kilometre taşları (bildirim eşiği) */
export const LIKE_MILESTONES = [10, 25, 50, 100];

/** Tarayıcı Notification API'sini destekliyor mu? */
export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Mevcut izin durumu: 'granted' | 'denied' | 'default' | 'unsupported' */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/** Kullanıcının bildirim tercihi (izinden bağımsız, uygulama içi toggle). */
export function getNotificationPreference() {
  try {
    return localStorage.getItem(PREF_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

/** Bildirim tercihini kaydeder. */
export function setNotificationPreference(enabled) {
  try {
    localStorage.setItem(PREF_KEY, enabled ? 'true' : 'false');
  } catch (e) {}
}

/** Bildirimler aktif mi? (tercih açık + tarayıcı izni verilmiş) */
export function notificationsEnabled() {
  return getNotificationPreference() && getNotificationPermission() === 'granted';
}

/**
 * Bildirim izni ister ve tercihi açar.
 * @returns {Promise<'granted'|'denied'|'default'|'unsupported'>}
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') setNotificationPreference(true);
    return permission;
  } catch (e) {
    return 'denied';
  }
}

/**
 * Yerel bildirim gösterir. Service worker kayıtlıysa onun üzerinden
 * (bildirim tıklaması SW'de yönetilir), yoksa doğrudan Notification ile.
 * @param {string} title
 * @param {{ body?: string, url?: string, tag?: string, force?: boolean }} [options]
 *   force=false iken sayfa görünür durumdaysa bildirim atlanır (toast yeterli).
 * @returns {Promise<boolean>} Bildirim gösterildi mi
 */
export async function showLocalNotification(title, options = {}) {
  const { body = '', url = '/', tag, force = false } = options;

  if (!notificationsEnabled()) return false;
  // Sayfa açık ve görünürken toast zaten gösteriliyor; native bildirim gereksiz
  if (!force && document.visibilityState === 'visible') return false;

  const payload = {
    body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: tag || 'gameskinai',
    data: { url },
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, payload);
        return true;
      }
    }
    // SW yoksa (ör. dev modu) doğrudan göster
    new Notification(title, payload);
    return true;
  } catch (e) {
    console.warn('Bildirim gösterilemedi:', e.message);
    return false;
  }
}

/* ==================== BEĞENİ KİLOMETRE TAŞLARI ==================== */

/** Daha önce bildirilen kilometre taşları haritasını okur: { [convId]: maxMilestone } */
function readMilestones() {
  try {
    const stored = localStorage.getItem(MILESTONE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Kullanıcının dönüşümlerini tarayıp yeni ulaşılan beğeni kilometre taşlarını bulur.
 * Bulunanları kaydeder ki aynı bildirim tekrarlanmasın.
 * @param {Array} conversions - Kullanıcının dönüşüm listesi
 * @returns {Array<{ conversion: Object, milestone: number }>} Yeni ulaşılan eşikler
 */
export function checkLikeMilestones(conversions) {
  if (!Array.isArray(conversions) || conversions.length === 0) return [];

  const notified = readMilestones();
  const reached = [];

  conversions.forEach((conv) => {
    const likes = conv.likes_count || 0;
    // Bu dönüşüm için ulaşılan en yüksek eşik
    const highest = LIKE_MILESTONES.filter((m) => likes >= m).pop();
    if (highest && (notified[conv.id] || 0) < highest) {
      reached.push({ conversion: conv, milestone: highest });
      notified[conv.id] = highest;
    }
  });

  if (reached.length > 0) {
    try {
      localStorage.setItem(MILESTONE_KEY, JSON.stringify(notified));
    } catch (e) {}
  }

  return reached;
}
