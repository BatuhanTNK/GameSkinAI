/**
 * @fileoverview Sosyal özellikler (profil, takip, yorum) için veri katmanı.
 * Supabase yapılandırılmışsa veritabanı ile, aksi halde localStorage ile çalışır.
 * Demo modda (UUID olmayan kullanıcı id'leri) tüm işlemler yerel olarak saklanır.
 */

import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { TABLES } from 'lib/constants';

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

/* ============================= PROFİL ============================= */

/**
 * Bir kullanıcının public profilini getirir.
 * Demo modda kendi yerel profil bilgileri (gameskinai_user_metadata) kullanılır.
 * @param {string} userId
 * @returns {Promise<Object|null>} { id, display_name, bio, avatar_preset, favorite_game, created_at }
 */
export async function fetchPublicProfile(userId) {
  if (!userId) return null;

  // Demo kullanıcı: yerel metadata'dan profil oluştur
  const readLocalProfile = () => {
    const meta = readLocalJson('gameskinai_user_metadata', {});
    return {
      id: userId,
      display_name: meta.display_name || 'GameSkinAI Kullanıcısı',
      bio: meta.bio || '',
      avatar_preset: meta.avatar_preset || 'minecraft',
      favorite_game: meta.favorite_game || '',
      created_at: null,
    };
  };

  if (!isSupabaseConfigured || !isValidUuid(userId)) {
    return readLocalProfile();
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('id, display_name, bio, avatar_preset, favorite_game, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data || readLocalProfile();
  } catch (err) {
    console.warn('Profil çekme uyarısı, yerel veriler kullanılıyor:', err.message);
    return readLocalProfile();
  }
}

/**
 * Bir kullanıcının herkese açık dönüşümlerini getirir.
 * @param {string} userId
 * @returns {Promise<Array>} Public dönüşüm listesi
 */
export async function fetchUserPublicConversions(userId) {
  if (!userId) return [];

  const readLocal = () => {
    const list = readLocalJson('gameskinai_conversions', []);
    const publicMap = readLocalJson('gameskinai_public_map', {});
    return list
      .filter((c) => (c.user_id === userId || !c.user_id) && (c.is_public || publicMap[c.id]))
      .map((c) => ({ ...c, original_image_url: null, is_public: true }));
  };

  if (!isSupabaseConfigured || !isValidUuid(userId)) {
    return readLocal();
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.CONVERSIONS)
      .select('id, theme_slug, theme_label, result_image_url, created_at, likes_count, user_id, user_display_name')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Kullanıcı public dönüşümleri çekilemedi:', err.message);
    return readLocal();
  }
}

/* ============================= TAKİP ============================= */

/**
 * Takip istatistiklerini getirir: takipçi sayısı ve mevcut kullanıcının takip durumu.
 * @param {string} targetUserId - Profili görüntülenen kullanıcı
 * @param {string|null} currentUserId - Oturum açmış kullanıcı (yoksa null)
 * @returns {Promise<{followers: number, isFollowing: boolean}>}
 */
export async function fetchFollowStats(targetUserId, currentUserId) {
  const localFollows = readLocalJson('gameskinai_follows', {});
  const localIsFollowing = !!localFollows[targetUserId];

  if (!isSupabaseConfigured || !isValidUuid(targetUserId)) {
    return { followers: localIsFollowing ? 1 : 0, isFollowing: localIsFollowing };
  }

  try {
    const { count, error } = await supabase
      .from(TABLES.FOLLOWS)
      .select('follower_id', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    if (error) throw error;

    let isFollowing = false;
    if (currentUserId && isValidUuid(currentUserId)) {
      const { data: followRow } = await supabase
        .from(TABLES.FOLLOWS)
        .select('follower_id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();
      isFollowing = !!followRow;
    } else {
      isFollowing = localIsFollowing;
    }

    return { followers: count || 0, isFollowing };
  } catch (err) {
    console.warn('Takip istatistikleri çekilemedi:', err.message);
    return { followers: localIsFollowing ? 1 : 0, isFollowing: localIsFollowing };
  }
}

/**
 * Takip durumunu değiştirir (takip et / takibi bırak).
 * @param {string} currentUserId - Oturum açmış kullanıcı
 * @param {string} targetUserId - Takip edilecek kullanıcı
 * @param {boolean} nextState - true=takip et, false=takibi bırak
 * @returns {Promise<{success: boolean}>}
 */
export async function toggleFollow(currentUserId, targetUserId, nextState) {
  // Yerel durum her zaman güncellenir (demo + fallback)
  const localFollows = readLocalJson('gameskinai_follows', {});
  if (nextState) {
    localFollows[targetUserId] = true;
  } else {
    delete localFollows[targetUserId];
  }
  writeLocalJson('gameskinai_follows', localFollows);

  if (!isSupabaseConfigured || !isValidUuid(currentUserId) || !isValidUuid(targetUserId)) {
    return { success: true };
  }

  try {
    if (nextState) {
      const { error } = await supabase
        .from(TABLES.FOLLOWS)
        .insert([{ follower_id: currentUserId, following_id: targetUserId }]);
      if (error && error.code !== '23505') throw error; // 23505: zaten takipte
    } else {
      const { error } = await supabase
        .from(TABLES.FOLLOWS)
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.warn('Takip işlemi Supabase uyarısı (yerel kaydedildi):', err.message);
    return { success: true };
  }
}

/* ============================= YORUM ============================= */

/**
 * Bir dönüşümün yorumlarını getirir (en yeni üstte).
 * @param {string} conversionId
 * @returns {Promise<Array>} Yorum listesi
 */
export async function fetchComments(conversionId) {
  if (!conversionId) return [];

  const readLocal = () => {
    const map = readLocalJson('gameskinai_comments', {});
    return map[conversionId] || [];
  };

  if (!isSupabaseConfigured || !isValidUuid(conversionId)) {
    return readLocal();
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select('id, conversion_id, user_id, display_name, content, created_at')
      .eq('conversion_id', conversionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Yerelde kalan (offline eklenen) yorumları da birleştir
    const local = readLocal();
    const dbIds = new Set((data || []).map((c) => c.id));
    const merged = [...(data || []), ...local.filter((c) => !dbIds.has(c.id))];
    return merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    console.warn('Yorumlar çekilemedi, yerel veriler kullanılıyor:', err.message);
    return readLocal();
  }
}

/**
 * Yeni yorum ekler.
 * @param {Object} params
 * @param {string} params.conversionId
 * @param {string} params.userId
 * @param {string} params.displayName
 * @param {string} params.content - 1-500 karakter
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function addComment({ conversionId, userId, displayName, content }) {
  const trimmed = (content || '').trim();
  if (!trimmed || trimmed.length > 500) {
    return { data: null, error: 'invalid_content' };
  }

  const localComment = {
    id: 'cmt-' + Date.now(),
    conversion_id: conversionId,
    user_id: userId,
    display_name: displayName || 'Kullanıcı',
    content: trimmed,
    created_at: new Date().toISOString(),
  };

  const saveLocal = () => {
    const map = readLocalJson('gameskinai_comments', {});
    const list = map[conversionId] || [];
    // En fazla 50 yerel yorum tut
    map[conversionId] = [localComment, ...list].slice(0, 50);
    writeLocalJson('gameskinai_comments', map);
  };

  if (!isSupabaseConfigured || !isValidUuid(userId) || !isValidUuid(conversionId)) {
    saveLocal();
    return { data: localComment, error: null };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .insert([
        {
          conversion_id: conversionId,
          user_id: userId,
          display_name: displayName || 'Kullanıcı',
          content: trimmed,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Yorum Supabase uyarısı, yerel kaydedildi:', err.message);
    saveLocal();
    return { data: localComment, error: null };
  }
}

/**
 * Kullanıcının kendi yorumunu siler.
 * @param {string} commentId
 * @param {string} conversionId
 * @param {string} userId
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteComment(commentId, conversionId, userId) {
  // Yerel kopyayı temizle
  const map = readLocalJson('gameskinai_comments', {});
  if (map[conversionId]) {
    map[conversionId] = map[conversionId].filter((c) => c.id !== commentId);
    writeLocalJson('gameskinai_comments', map);
  }

  if (!isSupabaseConfigured || !isValidUuid(commentId) || !isValidUuid(userId)) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from(TABLES.COMMENTS)
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('Yorum silme Supabase uyarısı:', err.message);
    return { success: true };
  }
}
