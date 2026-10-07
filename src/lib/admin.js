/**
 * @fileoverview Admin paneli veri katmanı.
 * Tema yönetimi, kullanıcı/dönüşüm istatistikleri ve içerik moderasyonu işlemleri.
 * Supabase yapılandırılmışsa veritabanı ile, demo modda localStorage ile çalışır.
 */

import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { TABLES } from 'lib/constants';
import { THEMES } from 'lib/themes';

/**
 * UUID doğrulaması yapar (PostgreSQL UUID syntax hatasını önler).
 */
function isValidUuid(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** LocalStorage'dan güvenli JSON okuma yardımcısı. */
function readLocalJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    return fallback;
  }
}

/** LocalStorage'a güvenli JSON yazma yardımcısı. */
function writeLocalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`${key} kaydedilemedi:`, e);
  }
}

/* ========================= ADMIN YETKİSİ ========================= */

/**
 * Mevcut kullanıcının admin olup olmadığını kontrol eder.
 * Demo modda (UUID olmayan id) yerel test için admin kabul edilir.
 * @param {Object|null} user - Auth kullanıcısı
 * @returns {Promise<boolean>}
 */
export async function checkIsAdmin(user) {
  if (!user) return false;

  // Demo mod: yerel geliştirme/test için admin erişimi açık
  if (!isSupabaseConfigured || !isValidUuid(user.id)) {
    return true;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return !!data?.is_admin;
  } catch (err) {
    console.warn('Admin kontrolü yapılamadı:', err.message);
    return false;
  }
}

/* ========================= TEMA YÖNETİMİ ========================= */

/**
 * Demo modda tema düzenlemelerini saklayan yerel haritayı okur.
 * Yapı: { [slug]: { label, description, prompt, active, isCustom } }
 */
function getLocalThemeOverrides() {
  return readLocalJson('gameskinai_admin_themes', {});
}

/**
 * Tüm temaları (pasifler dahil) admin görünümü için getirir.
 * @returns {Promise<Array>} Tema listesi { slug, label, description, prompt, active, source }
 */
export async function fetchAllThemesAdmin() {
  const buildLocalList = () => {
    const overrides = getLocalThemeOverrides();
    const staticList = THEMES.map((th) => {
      const ov = overrides[th.slug] || {};
      return {
        slug: th.slug,
        label: ov.label ?? th.label,
        description: ov.description ?? th.description,
        prompt: ov.prompt ?? th.prompt,
        active: ov.active ?? true,
        source: 'static',
      };
    });
    const customList = Object.entries(overrides)
      .filter(([slug, ov]) => ov.isCustom && !THEMES.some((th) => th.slug === slug))
      .map(([slug, ov]) => ({
        slug,
        label: ov.label || slug,
        description: ov.description || '',
        prompt: ov.prompt || '',
        active: ov.active ?? true,
        source: 'custom',
      }));
    return [...staticList, ...customList];
  };

  if (!isSupabaseConfigured) {
    return buildLocalList();
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.THEMES)
      .select('id, slug, label, description, prompt, active')
      .order('id', { ascending: true });

    if (error) throw error;

    const dbSlugSet = new Set((data || []).map((th) => th.slug));
    const dbList = (data || []).map((th) => ({ ...th, source: 'db' }));
    // DB'de olmayan statik temaları da listede göster (salt okunur bilgiyle)
    const missingStatic = THEMES.filter((th) => !dbSlugSet.has(th.slug)).map((th) => ({
      slug: th.slug,
      label: th.label,
      description: th.description,
      prompt: th.prompt,
      active: true,
      source: 'static',
    }));
    return [...dbList, ...missingStatic];
  } catch (err) {
    console.warn('Admin tema listesi çekilemedi, yerel liste kullanılıyor:', err.message);
    return buildLocalList();
  }
}

/**
 * Tema ekler veya günceller (slug bazlı upsert).
 * @param {Object} theme - { slug, label, description, prompt, active }
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function saveThemeAdmin(theme) {
  const slug = (theme.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!slug || !theme.label?.trim() || !theme.prompt?.trim()) {
    return { data: null, error: 'missing_fields' };
  }

  const record = {
    slug,
    label: theme.label.trim(),
    description: (theme.description || '').trim(),
    prompt: theme.prompt.trim(),
    active: theme.active !== false,
  };

  const saveLocal = () => {
    const overrides = getLocalThemeOverrides();
    overrides[slug] = {
      ...record,
      isCustom: !THEMES.some((th) => th.slug === slug),
    };
    writeLocalJson('gameskinai_admin_themes', overrides);
    return { data: { ...record, source: 'custom' }, error: null };
  };

  if (!isSupabaseConfigured) {
    return saveLocal();
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.THEMES)
      .upsert([record], { onConflict: 'slug' })
      .select()
      .single();

    if (error) throw error;
    return { data: { ...data, source: 'db' }, error: null };
  } catch (err) {
    console.warn('Tema Supabase kaydı uyarısı, yerel kaydedildi:', err.message);
    return saveLocal();
  }
}

/**
 * Temanın aktif/pasif durumunu değiştirir.
 * @param {Object} theme - Admin listesindeki tema kaydı
 * @param {boolean} nextActive
 * @returns {Promise<{success: boolean}>}
 */
export async function toggleThemeActiveAdmin(theme, nextActive) {
  const saveLocal = () => {
    const overrides = getLocalThemeOverrides();
    overrides[theme.slug] = {
      ...(overrides[theme.slug] || {}),
      label: theme.label,
      description: theme.description,
      prompt: theme.prompt,
      active: nextActive,
      isCustom: theme.source === 'custom',
    };
    writeLocalJson('gameskinai_admin_themes', overrides);
    return { success: true };
  };

  if (!isSupabaseConfigured) {
    return saveLocal();
  }

  try {
    // Statik temalar DB'de yoksa önce upsert ile taşı
    const { error } = await supabase
      .from(TABLES.THEMES)
      .upsert(
        [
          {
            slug: theme.slug,
            label: theme.label,
            description: theme.description || '',
            prompt: theme.prompt || '',
            active: nextActive,
          },
        ],
        { onConflict: 'slug' }
      );

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('Tema durumu Supabase uyarısı, yerel kaydedildi:', err.message);
    return saveLocal();
  }
}

/* ========================= İSTATİSTİKLER ========================= */

/**
 * Admin paneli için genel istatistikleri getirir.
 * @returns {Promise<Object>} { totalConversions, publicConversions, totalUsers, totalComments, totalLikes, themeDistribution }
 */
export async function fetchAdminStats() {
  const buildLocalStats = () => {
    const list = readLocalJson('gameskinai_conversions', []);
    const commentsMap = readLocalJson('gameskinai_comments', {});
    const themeDist = {};
    let likes = 0;
    list.forEach((c) => {
      themeDist[c.theme_label || c.theme_slug] = (themeDist[c.theme_label || c.theme_slug] || 0) + 1;
      likes += c.likes_count || 0;
    });
    return {
      totalConversions: list.length,
      publicConversions: list.filter((c) => c.is_public).length,
      totalUsers: 1,
      totalComments: Object.values(commentsMap).reduce((sum, arr) => sum + arr.length, 0),
      totalLikes: likes,
      themeDistribution: themeDist,
    };
  };

  if (!isSupabaseConfigured) {
    return buildLocalStats();
  }

  try {
    const [convRes, publicRes, userRes, commentRes, likesRes] = await Promise.all([
      supabase.from(TABLES.CONVERSIONS).select('id', { count: 'exact', head: true }),
      supabase
        .from(TABLES.CONVERSIONS)
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true),
      supabase.from(TABLES.PROFILES).select('id', { count: 'exact', head: true }),
      supabase.from(TABLES.COMMENTS).select('id', { count: 'exact', head: true }),
      supabase.from(TABLES.CONVERSIONS).select('theme_label, likes_count').limit(1000),
    ]);

    const themeDist = {};
    let likes = 0;
    (likesRes.data || []).forEach((c) => {
      themeDist[c.theme_label] = (themeDist[c.theme_label] || 0) + 1;
      likes += c.likes_count || 0;
    });

    return {
      totalConversions: convRes.count || 0,
      publicConversions: publicRes.count || 0,
      totalUsers: userRes.count || 0,
      totalComments: commentRes.count || 0,
      totalLikes: likes,
      themeDistribution: themeDist,
    };
  } catch (err) {
    console.warn('Admin istatistikleri çekilemedi, yerel veriler kullanılıyor:', err.message);
    return buildLocalStats();
  }
}

/* ========================= MODERASYON ========================= */

/**
 * Moderasyon için tüm public dönüşümleri getirir.
 * @returns {Promise<Array>}
 */
export async function fetchPublicConversionsAdmin() {
  const readLocal = () => {
    const list = readLocalJson('gameskinai_conversions', []);
    const publicMap = readLocalJson('gameskinai_public_map', {});
    return list.filter((c) => c.is_public || publicMap[c.id]);
  };

  if (!isSupabaseConfigured) {
    return readLocal();
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.CONVERSIONS)
      .select('id, theme_slug, theme_label, result_image_url, created_at, likes_count, user_id, user_display_name')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Moderasyon listesi çekilemedi, yerel veriler kullanılıyor:', err.message);
    return readLocal();
  }
}

/**
 * Bir public dönüşümü topluluktan gizler (is_public=false).
 * @param {string} conversionId
 * @returns {Promise<{success: boolean}>}
 */
export async function hideConversionAdmin(conversionId) {
  // Yerel kopyayı güncelle (demo + fallback)
  const list = readLocalJson('gameskinai_conversions', []);
  const updated = list.map((c) => (c.id === conversionId ? { ...c, is_public: false } : c));
  writeLocalJson('gameskinai_conversions', updated);
  const publicMap = readLocalJson('gameskinai_public_map', {});
  delete publicMap[conversionId];
  writeLocalJson('gameskinai_public_map', publicMap);

  if (!isSupabaseConfigured || !isValidUuid(conversionId)) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from(TABLES.CONVERSIONS)
      .update({ is_public: false })
      .eq('id', conversionId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('Moderasyon gizleme Supabase uyarısı:', err.message);
    return { success: true };
  }
}
