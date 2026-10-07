/**
 * @fileoverview Haftalık Yarışma (Challenge) veri katmanı (ozellik_onerileri.md #14).
 * Haftanın temasını belirler, katılımcı liderlik tablosunu ve geçen haftanın
 * kazananını hesaplar. Supabase yapılandırılmışsa veritabanı ile, demo modda
 * localStorage ile çalışır. Katılım = o haftanın temasıyla public dönüşüm.
 */

import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { TABLES } from 'lib/constants';
import { THEMES } from 'lib/themes';

/** LocalStorage'dan güvenli JSON okuma yardımcısı. */
function readLocalJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    return fallback;
  }
}

/* ========================= HAFTA HESAPLARI ========================= */

/**
 * Verilen tarihin bulunduğu haftanın pazartesi 00:00'ını döndürür.
 * @param {Date} [date]
 * @returns {Date}
 */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Pazar
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Haftanın anahtarını (pazartesi YYYY-MM-DD) döndürür.
 * @param {Date} [date]
 * @returns {string}
 */
export function getWeekKey(date = new Date()) {
  const start = getWeekStart(date);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, '0');
  const dd = String(start.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Epoch'tan bu yana geçen hafta sayısı (deterministik tema rotasyonu için).
 */
function getWeekNumber(date = new Date()) {
  const start = getWeekStart(date);
  return Math.floor(start.getTime() / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Hafta numarasına göre varsayılan challenge temasını seçer.
 * DB'de challenge kaydı yoksa bu rotasyon kullanılır — challenge hiç boş kalmaz.
 */
function getFallbackTheme(date = new Date()) {
  const idx = getWeekNumber(date) % THEMES.length;
  return THEMES[idx];
}

/* ========================= CHALLENGE ========================= */

/**
 * Belirtilen haftanın challenge bilgisini getirir.
 * DB'de admin tanımlı kayıt varsa onu, yoksa deterministik fallback'i döndürür.
 * @param {Date} [date] - Haftası baz alınacak tarih
 * @returns {Promise<Object>} { weekKey, themeSlug, themeLabel, theme, startsAt, endsAt, source }
 */
export async function fetchChallenge(date = new Date()) {
  const weekKey = getWeekKey(date);
  const startsAt = getWeekStart(date);
  const endsAt = new Date(startsAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  const buildFallback = () => {
    const theme = getFallbackTheme(date);
    return {
      weekKey,
      themeSlug: theme.slug,
      themeLabel: theme.label,
      theme,
      startsAt,
      endsAt,
      source: 'auto',
    };
  };

  if (!isSupabaseConfigured) {
    return buildFallback();
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.CHALLENGES)
      .select('week_key, theme_slug, theme_label, starts_at, ends_at')
      .eq('week_key', weekKey)
      .maybeSingle();

    if (error) throw error;
    if (!data) return buildFallback();

    const theme = THEMES.find((th) => th.slug === data.theme_slug) || null;
    return {
      weekKey: data.week_key,
      themeSlug: data.theme_slug,
      themeLabel: data.theme_label || theme?.label || data.theme_slug,
      theme,
      startsAt: new Date(data.starts_at),
      endsAt: new Date(data.ends_at),
      source: 'db',
    };
  } catch (err) {
    console.warn('Challenge çekilemedi, otomatik tema kullanılıyor:', err.message);
    return buildFallback();
  }
}

/* ========================= LİDERLİK TABLOSU ========================= */

/**
 * Bir challenge'ın katılımcılarını (liderlik tablosu) getirir.
 * Katılım kriteri: challenge temasıyla, hafta aralığında oluşturulmuş public dönüşüm.
 * @param {Object} challenge - fetchChallenge çıktısı
 * @param {number} [limit=20]
 * @returns {Promise<Array>} Beğeniye göre sıralı dönüşüm listesi
 */
export async function fetchChallengeEntries(challenge, limit = 20) {
  if (!challenge) return [];

  const startMs = challenge.startsAt.getTime();
  const endMs = challenge.endsAt.getTime();

  const readLocal = () => {
    const list = readLocalJson('gameskinai_conversions', []);
    const publicMap = readLocalJson('gameskinai_public_map', {});
    return list
      .filter((c) => {
        const created = new Date(c.created_at).getTime();
        return (
          c.theme_slug === challenge.themeSlug &&
          (c.is_public || publicMap[c.id]) &&
          created >= startMs &&
          created < endMs
        );
      })
      .map((c) => ({ ...c, original_image_url: null }));
  };

  const sortEntries = (list) =>
    [...list]
      .sort((a, b) => {
        const likeDiff = (b.likes_count || 0) - (a.likes_count || 0);
        if (likeDiff !== 0) return likeDiff;
        return new Date(a.created_at) - new Date(b.created_at); // eşitlikte önce paylaşan
      })
      .slice(0, limit);

  if (!isSupabaseConfigured) {
    return sortEntries(readLocal());
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.CONVERSIONS)
      .select('id, theme_slug, theme_label, result_image_url, created_at, likes_count, user_id, user_display_name')
      .eq('is_public', true)
      .eq('theme_slug', challenge.themeSlug)
      .gte('created_at', challenge.startsAt.toISOString())
      .lt('created_at', challenge.endsAt.toISOString())
      .order('likes_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Yereldeki (demo) kayıtları da birleştir
    const local = readLocal();
    const dbIds = new Set((data || []).map((c) => c.id));
    const merged = [...(data || []), ...local.filter((c) => !dbIds.has(c.id))];
    return sortEntries(merged);
  } catch (err) {
    console.warn('Challenge katılımcıları çekilemedi, yerel veriler kullanılıyor:', err.message);
    return sortEntries(readLocal());
  }
}

/**
 * Geçen haftanın challenge kazananını getirir.
 * @returns {Promise<Object|null>} { challenge, winner } veya katılım yoksa null winner
 */
export async function fetchLastWeekWinner() {
  const lastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const challenge = await fetchChallenge(lastWeekDate);
  const entries = await fetchChallengeEntries(challenge, 1);
  return {
    challenge,
    winner: entries[0] || null,
  };
}

/**
 * Kullanıcının kazandığı challenge haftalarını sayar (rozet için).
 * Basit yaklaşım: son 8 haftayı tarayıp kazananı kullanıcıyla eşleştirir.
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function countUserChallengeWins(userId) {
  if (!userId) return 0;
  let wins = 0;
  // Bu hafta hariç son 8 tamamlanmış hafta
  const checks = [];
  for (let i = 1; i <= 8; i++) {
    const date = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
    checks.push(
      fetchChallenge(date).then((ch) => fetchChallengeEntries(ch, 1))
    );
  }
  const results = await Promise.all(checks);
  results.forEach((entries) => {
    if (entries.length > 0 && entries[0].user_id === userId && (entries[0].likes_count || 0) > 0) {
      wins += 1;
    }
  });
  return wins;
}
