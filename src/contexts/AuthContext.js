/**
 * @fileoverview Kimlik doğrulama context'i.
 * Supabase Auth ile kullanıcı giriş/çıkış/kayıt/profil güncelleme işlemlerini yönetir.
 * Yerel profil verilerini localStorage ile saklayarak F5 yenilemelerinde korunmasını sağlar.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';

const AuthContext = createContext(null);

/**
 * Auth context hook'u.
 * @returns {Object} user, loading, signIn, signUp, signOut, updateProfile, updatePassword, isDemo
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook, AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};

/**
 * Yerel olarak saklanan profil metadatasını okur.
 */
function getLocalUserMetadata() {
  try {
    const stored = localStorage.getItem('gameskinai_user_metadata');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Yerel profil metadatasını kaydeder.
 */
function saveLocalUserMetadata(updates) {
  try {
    const current = getLocalUserMetadata();
    const merged = { ...current, ...updates };
    localStorage.setItem('gameskinai_user_metadata', JSON.stringify(merged));
    return merged;
  } catch (e) {
    return updates;
  }
}

/**
 * Auth Provider bileşeni.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localMeta = getLocalUserMetadata();

    if (!isSupabaseConfigured) {
      if (process.env.NODE_ENV === 'development') {
        setUser({
          id: 'demo-user-id',
          email: 'demo@gameskinai.com',
          user_metadata: {
            display_name: 'Batuhan Tonk',
            bio: 'Oyun tutkunu ve AI skin geliştiricisi.',
            favorite_game: 'minecraft',
            avatar_preset: 'minecraft',
            ...localMeta,
          },
          created_at: '2026-06-26T10:00:00.000Z',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    // İlk yükleme: mevcut oturumu kontrol et
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            ...session.user,
            user_metadata: {
              ...session.user.user_metadata,
              ...localMeta,
            },
          });
        } else if (process.env.NODE_ENV === 'development') {
          // Oturum açılmamışsa yerel geliştirme için hazır demo profil verisi + localMeta
          setUser({
            id: 'demo-user-id',
            email: 'batuhan.tonk.1@gmail.com',
            user_metadata: {
              display_name: 'Batuhan Tonk',
              bio: '',
              favorite_game: 'minecraft',
              avatar_preset: 'minecraft',
              ...localMeta,
            },
            created_at: '2026-06-26T10:00:00.000Z',
          });
        } else {
          setUser(null);
        }
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
      if (session?.user) {
        const currentLocal = getLocalUserMetadata();
        setUser({
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            ...currentLocal,
          },
        });
      }
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
    const normalizedEmail = email?.trim().toLowerCase();
    const localMeta = getLocalUserMetadata();

    if (!isSupabaseConfigured) {
      setUser({
        id: 'demo-user-id',
        email: normalizedEmail,
        user_metadata: { display_name: normalizedEmail.split('@')[0], ...localMeta },
      });
      return { data: { user: { email: normalizedEmail } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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
    const normalizedEmail = email?.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return {
        data: { user: { email: normalizedEmail } },
        error: null,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
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

  /**
   * Google OAuth ile giriş yapar.
   */
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      setUser({
        id: 'demo-google-user',
        email: 'google-demo@gameskinai.com',
        user_metadata: { display_name: 'Google Kullanıcı' },
      });
      return { data: {}, error: null };
    }

    try {
      const activeLang = localStorage.getItem('gameskinai_lang') || 'tr';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${activeLang}/admin/converter`,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * Discord OAuth ile giriş yapar.
   */
  const signInWithDiscord = async () => {
    if (!isSupabaseConfigured) {
      setUser({
        id: 'demo-discord-user',
        email: 'discord-demo@gameskinai.com',
        user_metadata: { display_name: 'Discord Kullanıcı' },
      });
      return { data: {}, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin + '/admin/converter',
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * E-posta adresi ile şifre sıfırlama bağlantısı gönderir.
   */
  const resetPassword = async (email) => {
    const normalizedEmail = email?.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: window.location.origin + '/tr/auth/reset-password',
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * Kullanıcı şifresini günceller.
   */
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { data: {}, error: null };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  /**
   * Kullanıcı profil bilgilerini (metadata) günceller.
   * F5 yenilemelerinde silinmemesi için hem localStorage hem de Supabase'e kalıcı kaydeder.
   */
  const updateProfile = async (metadataUpdates) => {
    const savedMeta = saveLocalUserMetadata(metadataUpdates);

    setUser((prev) => ({
      ...prev,
      user_metadata: {
        ...prev?.user_metadata,
        ...savedMeta,
      },
    }));

    if (!isSupabaseConfigured) {
      return { data: { user: { user_metadata: savedMeta } }, error: null };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { data: { user: { user_metadata: savedMeta } }, error: null };
      }

      const { data, error } = await supabase.auth.updateUser({
        data: metadataUpdates,
      });

      if (error) throw error;

      if (data?.user) {
        setUser({
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            ...savedMeta,
          },
        });
      }
      return { data, error: null };
    } catch (error) {
      return { data: { user: { user_metadata: savedMeta } }, error: null };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithDiscord,
    resetPassword,
    updatePassword,
    updateProfile,
    isDemo: !isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
