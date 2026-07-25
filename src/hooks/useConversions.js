/**
 * @fileoverview Dönüşüm geçmişi yönetimi için custom hook.
 * Supabase yapılandırılmışsa veritabanı ile, aksi halde local state ile çalışır.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { useAuth } from 'contexts/AuthContext';
import { TABLES } from 'lib/constants';

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
 * LocalStorage kotalarını aşmamak için güvenli yazma yardımcısı.
 * QuotaExceededError fırlatılırsa en eski verileri budar.
 */
function safeSetLocalStorage(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      console.warn('LocalStorage kotası aşıldı. Eski veriler budanıyor...');
      try {
        const pruned = items.slice(0, Math.max(1, Math.floor(items.length / 2)));
        localStorage.setItem(key, JSON.stringify(pruned));
      } catch (err) {
        console.error('LocalStorage budama sonrası da kaydedilemedi:', err);
      }
    } else {
      console.error('LocalStorage kaydetme hatası:', e);
    }
  }
}

/**
 * Dönüşüm geçmişini yöneten custom hook.
 */
export function useConversions() {
  const { user } = useAuth();
  const [conversions, setConversions] = useState(() => {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem('gameskinai_conversions');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
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

    if (!isSupabaseConfigured) {
      // Demo modu: localStorage'dan oku
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
      console.error('Dönüşüm geçmişi alınamadı:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Belirtilen ID'ye sahip dönüşümü siler.
   */
  const deleteConversion = async (id) => {
    try {
      const previousConversions = [...conversions];
      const updated = conversions.filter((c) => c.id !== id);
      setConversions(updated);
      saveLocalPublicMap(id, false);

      if (!isSupabaseConfigured) {
        safeSetLocalStorage('gameskinai_conversions', updated);
      } else {
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

      if (!isSupabaseConfigured) {
        // Demo modu: local state ve localStorage'a ekle
        const demoData = {
          ...newConversion,
          id: 'demo-' + Date.now(),
          created_at: new Date().toISOString(),
        };
        const updated = [demoData, ...conversions];
        setConversions(updated);
        safeSetLocalStorage('gameskinai_conversions', updated);
        return { data: demoData, error: null };
      }

      const { data, error: insertError } = await supabase
        .from(TABLES.CONVERSIONS)
        .insert([newConversion])
        .select()
        .single();

      if (insertError) throw insertError;
      setConversions((prev) => [data, ...prev]);

      // Supabase'e eklenen veriyi yerel listenize de yedekleyin
      const stored = localStorage.getItem('gameskinai_conversions');
      const list = stored ? JSON.parse(stored) : [];
      safeSetLocalStorage('gameskinai_conversions', [data, ...list]);

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
    if (updateData.is_public !== undefined) {
      saveLocalPublicMap(id, updateData.is_public);
    }

    try {
      const updated = conversions.map((c) => (c.id === id ? { ...c, ...updateData } : c));
      setConversions(updated);
      safeSetLocalStorage('gameskinai_conversions', updated);

      if (!isSupabaseConfigured) {
        return { data: { id, ...updateData }, error: null };
      }

      const { data, error: updateError } = await supabase
        .from(TABLES.CONVERSIONS)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.warn('Supabase güncelleme uyarısı (yerel saklama aktif):', updateError.message);
      }

      return { data: data || { id, ...updateData }, error: null };
    } catch (err) {
      console.warn('Dönüşüm güncelleme hatası (yerel saklama aktif):', err.message);
      const updated = conversions.map((c) => (c.id === id ? { ...c, ...updateData } : c));
      setConversions(updated);
      safeSetLocalStorage('gameskinai_conversions', updated);
      return { data: { id, ...updateData }, error: null };
    }
  };

  /**
   * Kamusal (topluluk) dönüşümleri getirir.
   */
  const fetchPublicConversions = useCallback(async () => {
    const publicMap = getLocalPublicMap();

    // 1. Önce yerel conversions ve localStorage'dan public olanları topla
    let localPublicList = [];
    try {
      const stored = localStorage.getItem('gameskinai_conversions');
      const allStored = stored ? JSON.parse(stored) : [];
      const combined = [...conversions, ...allStored];

      const uniqueMap = new Map();
      combined.forEach((item) => {
        const isPub = item.is_public || !!publicMap[item.id];
        if (isPub && !uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, { ...item, is_public: true });
        }
      });
      localPublicList = Array.from(uniqueMap.values());
    } catch (e) {
      localPublicList = conversions.filter((c) => c.is_public || publicMap[c.id]);
    }

    if (!isSupabaseConfigured) {
      return localPublicList;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from(TABLES.CONVERSIONS)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      // Supabase'den gelenler ile yerel public listenin birleşimi
      const dbMap = new Map();
      (data || []).forEach((item) => dbMap.set(item.id, { ...item, is_public: true }));
      localPublicList.forEach((item) => {
        if (!dbMap.has(item.id)) {
          dbMap.set(item.id, item);
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
   * Bir dönüşümün beğeni sayısını artırır.
   */
  const toggleLike = async (id, currentLikes = 0) => {
    const nextLikes = currentLikes + 1;
    return await updateConversion(id, { likes_count: nextLikes });
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
