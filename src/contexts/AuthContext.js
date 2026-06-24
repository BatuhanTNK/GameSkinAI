/**
 * @fileoverview Kimlik doğrulama context'i.
 * Supabase Auth ile kullanıcı giriş/çıkış/kayıt işlemlerini yönetir.
 * Supabase yapılandırılmamışsa demo modunda çalışır.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';

const AuthContext = createContext(null);

/**
 * Auth context hook'u.
 * @returns {Object} user, loading, signIn, signUp, signOut, isDemo
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook, AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};

/**
 * Auth Provider bileşeni.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo modu: Supabase yapılandırılmamış, demo kullanıcı oluştur
      setUser({
        id: 'demo-user-id',
        email: 'demo@gameskinai.com',
        user_metadata: {
          display_name: 'Demo Kullanıcı',
        },
      });
      setLoading(false);
      return;
    }

    // İlk yükleme: mevcut oturumu kontrol et
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Oturum kontrolü sırasında hata:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Email ve şifre ile giriş yapar.
   */
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Demo modu
      setUser({
        id: 'demo-user-id',
        email: email,
        user_metadata: { display_name: email.split('@')[0] },
      });
      return { data: { user: { email } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * Email, şifre ve görünen ad ile kayıt yapar.
   */
  const signUp = async (email, password, displayName) => {
    if (!isSupabaseConfigured) {
      // Demo modu
      return {
        data: { user: { email } },
        error: null,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * Mevcut oturumu kapatır.
   */
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isDemo: !isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
