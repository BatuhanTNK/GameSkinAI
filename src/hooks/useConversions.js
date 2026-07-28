/**
 * @fileoverview Dönüşüm geçmişi yönetimi için custom hook.
 * Supabase yapılandırılmışsa veritabanı ile, aksi halde local state ile çalışır.
 * Her kullanıcının beğeni durumunu yerel bellekte saklayarak ID-bazlı 1 beğeni sınırı getirir.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { useAuth } from 'contexts/AuthContext';
import { TABLES } from 'lib/constants';

/**
 * UUID doğrulaması yapar (PostgreSQL UUID syntax hatasını önler).
 */
function isValidUuid(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Yerel public durumlarını saklayan haritayı alır.
 */
function getLocalPublicMap() {
  try {
    const stored = localStorage.getItem('gameskinai_public_map');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Yerel public durumlarını saklayan haritayı kaydeder.
 */
function saveLocalPublicMap(id, isPublic) {
  try {
    const map = getLocalPublicMap();
    if (isPublic) {
      map[id] = true;
    } else {
      delete map[id];
    }
    localStorage.setItem('gameskinai_public_map', JSON.stringify(map));
  } catch (e) {
    console.error('LocalPublicMap kaydedilemedi:', e);
  }
}

/**
 * Kullanıcının beğendiği gönderi haritasını okur.
 */
function getLocalLikesMap() {
  try {
    const stored = localStorage.getItem('gameskinai_user_likes');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Kullanıcının beğendiği gönderi haritasına kaydeder/siler.
 */
function saveLocalLikeState(id, isLiked) {
  try {
    const map = getLocalLikesMap();
    if (isLiked) {
      map[id] = true;
    } else {
      delete map[id];
    }
    localStorage.setItem('gameskinai_user_likes', JSON.stringify(map));
  } catch (e) {
    console.error('LocalLikeState kaydedilemedi:', e);
  }
}

function safeSetLocalStorage(key, items) {
  if (!Array.isArray(items)) return;
  // Maximum 15 recent items to keep LocalStorage lightweight and fast
  const lightItems = items.slice(0, 15);
  try {
    localStorage.setItem(key, JSON.stringify(lightItems));
  } catch (e) {
    try {
      const pruned = lightItems.slice(0, 5);
      localStorage.setItem(key, JSON.stringify(pruned));
    } catch (err) {
      // Silent catch
    }
  }
}

/**
 * Dönüşüm geçmişini yöneten custom hook.
 */
export function useConversions() {
  const { user } = useAuth();
  const [conversions, setConversions] = useState(() => {
    try {
      const stored = localStorage.getItem('gameskinai_conversions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Kullanıcının tüm dönüşümlerini getirir.
   */
  const fetchConversions = useCallback(async () => {
    if (!user) {
      setConversions([]);
      setLoading(false);
      return;
    }

    const hasValidUuid = isValidUuid(user.id);

    if (!isSupabaseConfigured || !hasValidUuid) {
      try {
        const stored = localStorage.getItem('gameskinai_conversions');
        const publicMap = getLocalPublicMap();
        const list = stored ? JSON.parse(stored) : [];
        const merged = list.map((item) => ({
          ...item,
          is_public: item.is_public !== undefined ? item.is_public : !!publicMap[item.id],
        }));
        setConversions(merged);
      } catch (e) {
        console.error('LocalStorage okuma hatası:', e);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(TABLES.CONVERSIONS)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const publicMap = getLocalPublicMap();
      const merged = (data || []).map((item) => ({
        ...item,
        is_public: item.is_public !== undefined ? item.is_public : !!publicMap[item.id],
      }));

      setConversions(merged);
    } catch (err) {
      console.warn('Dönüşüm geçmişi Supabase uyarısı, yerel veriler gösteriliyor:', err.message);
      try {
        const stored = localStorage.getItem('gameskinai_conversions');
        const list = stored ? JSON.parse(stored) : [];
        setConversions(list);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Belirtilen ID'ye sahip dönüşümü siler.
   */
  const deleteConversion = async (id) => {
    if (!user) {
      return { success: false, error: 'Kullanıcı oturumu bulunamadı.' };
    }

    try {
      const previousConversions = [...conversions];
      const updated = conversions.filter((c) => c.id !== id);
      setConversions(updated);
      saveLocalPublicMap(id, false);
      saveLocalLikeState(id, false);
      safeSetLocalStorage('gameskinai_conversions', updated);

      if (isSupabaseConfigured && isValidUuid(user.id)) {
        const { error: deleteError } = await supabase
          .from(TABLES.CONVERSIONS)
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) {
          setConversions(previousConversions);
          throw deleteError;
        }
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Dönüşüm silinemedi:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Yeni dönüşüm ekler.
   */
  const addConversion = async (conversionData) => {
    if (!user) {
      return { data: null, error: 'Kullanıcı oturumu bulunamadı.' };
    }

    try {
      const newConversion = {
        ...conversionData,
        user_id: user.id,
      };

      const demoData = {
        ...newConversion,
        id: 'conv-' + Date.now(),
        created_at: new Date().toISOString(),
      };
      const updated = [demoData, ...conversions];
      setConversions(updated);
      safeSetLocalStorage('gameskinai_conversions', updated);

      if (!isSupabaseConfigured || !isValidUuid(user.id)) {
        return { data: demoData, error: null };
      }

      const { data, error: insertError } = await supabase
        .from(TABLES.CONVERSIONS)
        .insert([newConversion])
        .select()
        .single();

      if (insertError) {
        console.warn('Supabase kayıt uyarısı, yerel veri kullanılıyor:', insertError.message);
        return { data: demoData, error: null };
      }
      
      setConversions((prev) => [data, ...prev.filter((c) => c.id !== demoData.id)]);

      return { data, error: null };
    } catch (err) {
      console.error('Dönüşüm kaydedilemedi:', err);
      return { data: null, error: err.message };
    }
  };

  /**
   * Mevcut bir dönüşümü günceller.
   */
  const updateConversion = async (id, updateData) => {
    if (!user) {
      return { data: null, error: 'Kullanıcı oturumu bulunamadı.' };
    }

    if (updateData.is_public !== undefined) {
      saveLocalPublicMap(id, updateData.is_public);
    }

    try {
      const updated = conversions.map((c) => (c.id === id ? { ...c, ...updateData } : c));
      setConversions(updated);
      safeSetLocalStorage('gameskinai_conversions', updated);

      if (!isSupabaseConfigured || !isValidUuid(user.id)) {
        return { data: { id, ...updateData }, error: null };
      }

      const { data, error: updateError } = await supabase
        .from(TABLES.CONVERSIONS)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.warn('Supabase güncelleme uyarısı:', updateError.message);
      }

      return { data: data || { id, ...updateData }, error: null };
    } catch (err) {
      console.warn('Dönüşüm güncelleme hatası:', err.message);
      const updated = conversions.map((c) => (c.id === id ? { ...c, ...updateData } : c));
      setConversions(updated);
      return { data: { id, ...updateData }, error: null };
    }
  };

  /**
   * Kamusal (topluluk) dönüşümleri getirir.
   * Kullanıcının önceden beğendiği gönderileri userLiked olarak işaretler.
   */
  const fetchPublicConversions = useCallback(async () => {
    const publicMap = getLocalPublicMap();
    const likesMap = getLocalLikesMap();

    let localPublicList = [];
    try {
      const stored = localStorage.getItem('gameskinai_conversions');
      const allStored = stored ? JSON.parse(stored) : [];
      const combined = [...conversions, ...allStored];

      const uniqueMap = new Map();
      combined.forEach((item) => {
        const isPub = item.is_public || !!publicMap[item.id];
        if (isPub && !uniqueMap.has(item.id)) {
          const safeItem = {
            ...item,
            original_image_url: null,
            is_public: true,
            userLiked: !!likesMap[item.id],
          };
          uniqueMap.set(item.id, safeItem);
        }
      });
      localPublicList = Array.from(uniqueMap.values());
    } catch (e) {
      localPublicList = conversions
        .filter((c) => c.is_public || publicMap[c.id])
        .map((c) => ({
          ...c,
          original_image_url: null,
          userLiked: !!likesMap[c.id],
        }));
    }

    if (!isSupabaseConfigured) {
      return localPublicList;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from(TABLES.CONVERSIONS)
        .select('id, theme_slug, theme_label, result_image_url, result_description, created_at, likes_count, is_public')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      const dbMap = new Map();
      (data || []).forEach((item) =>
        dbMap.set(item.id, {
          ...item,
          is_public: true,
          userLiked: !!likesMap[item.id],
        })
      );
      localPublicList.forEach((item) => {
        if (!dbMap.has(item.id)) {
          dbMap.set(item.id, {
            ...item,
            userLiked: !!likesMap[item.id],
          });
        }
      });

      return Array.from(dbMap.values());
    } catch (err) {
      console.warn('Supabase genel galeri çekme uyarısı, yerel public veriler kullanılıyor:', err.message);
      return localPublicList;
    }
  }, [conversions]);

  /**
   * Bir dönüşümün toplulukta yayınlanma (is_public) durumunu değiştirir.
   */
  const togglePublic = async (id, currentPublicState) => {
    const nextPublicState = !currentPublicState;
    return await updateConversion(id, { is_public: nextPublicState });
  };

  /**
   * Bir dönüşümün beğeni durumunu ve sayısını günceller.
   * Hesap başına 1 beğeni sınırı koruması eklenmiştir (Like/Unlike).
   */
  const toggleLike = async (id, newLikesCount, newLikedState) => {
    saveLocalLikeState(id, newLikedState);

    // State içindeki dönüşümü güncelle
    setConversions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, likes_count: newLikesCount, userLiked: newLikedState } : c
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from(TABLES.CONVERSIONS)
          .update({ likes_count: newLikesCount })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase beğeni sayısı güncelleme uyarısı:', err.message);
      }
    }

    return { success: true };
  };

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  return {
    conversions,
    loading,
    error,
    fetchConversions,
    fetchPublicConversions,
    deleteConversion,
    addConversion,
    updateConversion,
    togglePublic,
    toggleLike,
  };
}
