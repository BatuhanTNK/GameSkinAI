/**
 * @fileoverview Dönüşüm geçmişi yönetimi için custom hook.
 * Supabase yapılandırılmışsa veritabanı ile, aksi halde local state ile çalışır.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { useAuth } from 'contexts/AuthContext';
import { TABLES } from 'lib/constants';

/**
 * Dönüşüm geçmişini yöneten custom hook.
 */
export function useConversions() {
  const { user } = useAuth();
  const [conversions, setConversions] = useState([]);
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
      // Demo modu: local state zaten güncel
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
      setConversions(data || []);
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
      setConversions((prev) => prev.filter((c) => c.id !== id));

      if (isSupabaseConfigured) {
        const { error: deleteError } = await supabase
          .from(TABLES.CONVERSIONS)
          .delete()
          .eq('id', id);

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
        // Demo modu: local state'e ekle
        const demoData = {
          ...newConversion,
          id: 'demo-' + Date.now(),
          created_at: new Date().toISOString(),
        };
        setConversions((prev) => [demoData, ...prev]);
        return { data: demoData, error: null };
      }

      const { data, error: insertError } = await supabase
        .from(TABLES.CONVERSIONS)
        .insert([newConversion])
        .select()
        .single();

      if (insertError) throw insertError;
      setConversions((prev) => [data, ...prev]);
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
    try {
      if (!isSupabaseConfigured) {
        setConversions((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...updateData } : c))
        );
        return { data: { id, ...updateData }, error: null };
      }

      const { data, error: updateError } = await supabase
        .from(TABLES.CONVERSIONS)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setConversions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      return { data, error: null };
    } catch (err) {
      console.error('Dönüşüm güncellenemedi:', err);
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  return {
    conversions,
    loading,
    error,
    fetchConversions,
    deleteConversion,
    addConversion,
    updateConversion,
  };
}
