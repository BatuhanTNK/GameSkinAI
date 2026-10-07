/**
 * @fileoverview Günlük kredi/kota yönetimi için custom hook.
 * Kullanıcının bugün yaptığı dönüşüm sayısını sayarak kalan kredisini hesaplar.
 * Supabase yapılandırılmışsa veritabanından, aksi halde localStorage'dan okur.
 * Ek tablo gerektirmez: conversions kayıtlarının created_at alanı baz alınır.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { useAuth } from 'contexts/AuthContext';
import { TABLES, DAILY_CREDIT_LIMIT } from 'lib/constants';

/**
 * UUID doğrulaması yapar (PostgreSQL UUID syntax hatasını önler).
 */
function isValidUuid(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Bugünün başlangıcını (yerel saat, gece yarısı) ISO string olarak döner.
 */
function getTodayStartISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

/**
 * localStorage'daki dönüşümlerden bugünküleri sayar.
 * @param {string} userId
 * @returns {number}
 */
function countLocalTodayConversions(userId) {
  try {
    const stored = localStorage.getItem('gameskinai_conversions');
    const list = stored ? JSON.parse(stored) : [];
    const todayStart = new Date(getTodayStartISO()).getTime();
    return list.filter((item) => {
      if (userId && item.user_id && item.user_id !== userId) return false;
      const created = new Date(item.created_at).getTime();
      return !Number.isNaN(created) && created >= todayStart;
    }).length;
  } catch (e) {
    return 0;
  }
}

/**
 * Günlük kredi durumunu yöneten custom hook.
 * @returns {{ usedToday: number, remaining: number, limit: number, loading: boolean, hasCredits: boolean, refreshCredits: Function }}
 */
export function useCredits() {
  const { user } = useAuth();
  const [usedToday, setUsedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  /**
   * Bugünkü kullanım sayısını yeniden hesaplar.
   */
  const refreshCredits = useCallback(async () => {
    if (!user) {
      setUsedToday(0);
      setLoading(false);
      return;
    }

    const hasValidUuid = isValidUuid(user.id);

    if (!isSupabaseConfigured || !hasValidUuid) {
      setUsedToday(countLocalTodayConversions(user.id));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { count, error } = await supabase
        .from(TABLES.CONVERSIONS)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', getTodayStartISO());

      if (error) throw error;
      setUsedToday(count ?? 0);
    } catch (err) {
      console.warn('Kredi bilgisi Supabase uyarısı, yerel veri kullanılıyor:', err.message);
      setUsedToday(countLocalTodayConversions(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const remaining = Math.max(0, DAILY_CREDIT_LIMIT - usedToday);

  return {
    usedToday,
    remaining,
    limit: DAILY_CREDIT_LIMIT,
    loading,
    hasCredits: remaining > 0,
    refreshCredits,
  };
}
