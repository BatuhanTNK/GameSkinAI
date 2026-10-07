/**
 * @fileoverview Public Üretici Profil Sayfası (/:lang/user/:userId).
 * Giriş gerektirmeden bir kullanıcının public profilini, takipçi sayısını
 * ve herkese açık skinlerini gösterir. Giriş yapmış kullanıcılar takip edebilir.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MdAutoAwesome,
  MdArrowBack,
  MdSearchOff,
  MdFavorite,
  MdPersonAdd,
  MdPersonRemove,
  MdGroups,
  MdCalendarMonth,
  MdSportsEsports,
} from 'react-icons/md';
import {
  fetchPublicProfile,
  fetchUserPublicConversions,
  fetchFollowStats,
  toggleFollow,
} from 'lib/social';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'contexts/TranslationContext';
import { useToast } from 'contexts/ToastContext';

/** Oyun Avatar Önayarları (profil sayfası ile senkron) */
const AVATAR_PRESETS = [
  { id: 'minecraft', name: 'Minecraft', color: 'bg-green-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-yellow-400' },
  { id: 'valorant', name: 'Valorant', color: 'bg-red-500' },
  { id: 'fortnite', name: 'Fortnite', color: 'bg-blue-600' },
  { id: 'roblox', name: 'Roblox', color: 'bg-slate-800' },
  { id: 'lol', name: 'LoL', color: 'bg-amber-500' },
];

/**
 * Public üretici profil sayfası.
 */
export default function PublicUserPage() {
  const { userId, lang: urlLang } = useParams();
  const { t, lang } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const activeLang = urlLang || lang || 'tr';

  const [profile, setProfile] = useState(null);
  const [skins, setSkins] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [profileData, skinList, followStats] = await Promise.all([
      fetchPublicProfile(userId),
      fetchUserPublicConversions(userId),
      fetchFollowStats(userId, user?.id || null),
    ]);
    setProfile(profileData);
    setSkins(skinList);
    setFollowers(followStats.followers);
    setIsFollowing(followStats.isFollowing);
    setLoading(false);
  }, [userId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sayfa başlığı
  useEffect(() => {
    const prevTitle = document.title;
    if (profile) {
      document.title = `${profile.display_name} · GameSkinAI`;
    }
    return () => {
      document.title = prevTitle;
    };
  }, [profile]);

  const handleFollowToggle = async () => {
    if (!user) {
      navigate(`/${activeLang}/auth/sign-in`);
      return;
    }
    if (user.id === userId) {
      showToast(t('userProfile.cantFollowSelf'), 'info');
      return;
    }

    const nextState = !isFollowing;
    setFollowBusy(true);
    // İyimser güncelleme
    setIsFollowing(nextState);
    setFollowers((prev) => Math.max(0, prev + (nextState ? 1 : -1)));

    await toggleFollow(user.id, userId, nextState);
    setFollowBusy(false);
    showToast(
      nextState ? t('userProfile.followSuccess') : t('userProfile.unfollowSuccess'),
      nextState ? 'success' : 'info'
    );
  };

  const avatarPreset =
    AVATAR_PRESETS.find((ap) => ap.id === profile?.avatar_preset) || AVATAR_PRESETS[0];

  return (
    <div className="min-h-screen bg-lightPrimary dark:bg-navy-900">
      {/* Üst Bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          to={`/${activeLang}`}
          className="flex items-center gap-2 text-xl font-bold text-navy-700 dark:text-white"
        >
          <MdAutoAwesome className="h-6 w-6 text-brand-500" />
          GameSkinAI
        </Link>
        <Link
          to={`/${activeLang}/auth/sign-up`}
          className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
        >
          {t('publicSkin.ctaButton')}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4">
        {/* Yükleniyor */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-gray-200 dark:border-navy-700" />
              <div className="absolute top-0 left-0 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-brand-500" />
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t('userProfile.loading')}
            </p>
          </div>
        )}

        {/* Bulunamadı */}
        {!loading && !profile && (
          <div className="flex flex-col items-center rounded-[20px] bg-white p-10 text-center shadow-3xl dark:bg-navy-800 dark:shadow-none">
            <MdSearchOff className="h-14 w-14 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-navy-700 dark:text-white">
              {t('userProfile.notFoundTitle')}
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {t('userProfile.notFoundDesc')}
            </p>
            <Link
              to={`/${activeLang}`}
              className="mt-6 flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600"
            >
              <MdArrowBack className="h-4 w-4" />
              {t('publicSkin.backHome')}
            </Link>
          </div>
        )}

        {/* Profil */}
        {!loading && profile && (
          <>
            {/* Profil Kartı */}
            <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:bg-navy-800 dark:shadow-none">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                {/* Avatar */}
                <div
                  className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-extrabold text-white ${avatarPreset.color}`}
                >
                  {(profile.display_name || '?').charAt(0).toUpperCase()}
                </div>

                {/* Bilgiler */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                    {profile.display_name}
                  </h1>
                  {profile.bio && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {profile.bio}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 sm:justify-start">
                    <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 font-semibold dark:bg-navy-700">
                      <MdGroups className="h-4 w-4 text-brand-500" />
                      {t('userProfile.followers', { count: followers })}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 font-semibold dark:bg-navy-700">
                      <MdAutoAwesome className="h-4 w-4 text-brand-500" />
                      {t('userProfile.skinCount', { count: skins.length })}
                    </span>
                    {profile.favorite_game && (
                      <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 font-semibold capitalize dark:bg-navy-700">
                        <MdSportsEsports className="h-4 w-4 text-brand-500" />
                        {profile.favorite_game}
                      </span>
                    )}
                    {profile.created_at && (
                      <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 font-semibold dark:bg-navy-700">
                        <MdCalendarMonth className="h-4 w-4 text-brand-500" />
                        {t('userProfile.memberSince', {
                          date: new Date(profile.created_at).toLocaleDateString(
                            activeLang === 'en' ? 'en-US' : 'tr-TR'
                          ),
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Takip Butonu */}
                {(!user || user.id !== userId) && (
                  <button
                    type="button"
                    onClick={handleFollowToggle}
                    disabled={followBusy}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-60 ${
                      isFollowing
                        ? 'border border-gray-200 bg-white text-navy-700 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-900 dark:text-white'
                        : 'bg-brand-500 text-white hover:bg-brand-600'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <MdPersonRemove className="h-4 w-4" />
                        {t('userProfile.unfollow')}
                      </>
                    ) : (
                      <>
                        <MdPersonAdd className="h-4 w-4" />
                        {t('userProfile.follow')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Public Skinler */}
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
                {t('userProfile.publicSkinsTitle')}
              </h3>

              {skins.length === 0 && (
                <div className="flex flex-col items-center rounded-[20px] bg-white p-10 text-center shadow-3xl dark:bg-navy-800 dark:shadow-none">
                  <MdAutoAwesome className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {t('userProfile.noSkins')}
                  </p>
                </div>
              )}

              {skins.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {skins.map((skin) => (
                    <Link
                      key={skin.id}
                      to={`/${activeLang}/skin/${skin.id}`}
                      className="group overflow-hidden rounded-[16px] bg-white shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-navy-800 dark:shadow-none"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-navy-900">
                        {skin.result_image_url && (
                          <img
                            src={skin.result_image_url}
                            alt={skin.theme_label}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-md">
                          <MdFavorite className="h-3 w-3 text-red-400" />
                          {skin.likes_count || 0}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-bold text-navy-700 dark:text-white">
                          {skin.theme_label}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(skin.created_at).toLocaleDateString(
                            activeLang === 'en' ? 'en-US' : 'tr-TR'
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
