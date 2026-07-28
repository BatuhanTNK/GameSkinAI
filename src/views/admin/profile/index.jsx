/**
 * @fileoverview Detaylı Profil Yönetim Sayfası.
 * Tam TR / EN çoklu dil desteği, kullanıcı profil bilgileri, eski şifre doğrulamalı güçlü şifre değişikliği ve başarımları yönetir.
 */

import React, { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useConversions } from 'hooks/useConversions';
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';
import { THEMES } from 'lib/themes';
import { getGameLogo } from 'components/converter/GameLogos';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdSave,
  MdAutoAwesome,
  MdCalendarToday,
  MdBarChart,
  MdStar,
  MdMilitaryTech,
  MdCheckCircle,
  MdShield,
  MdVisibility,
  MdVisibilityOff,
  MdEditNote,
  MdSportsEsports,
  MdVpnKey,
  MdCheck,
  MdClose,
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';

/** Oyun Avatar Önayarları */
const AVATAR_PRESETS = [
  { id: 'minecraft', name: 'Minecraft', color: 'bg-green-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-yellow-400' },
  { id: 'valorant', name: 'Valorant', color: 'bg-red-500' },
  { id: 'fortnite', name: 'Fortnite', color: 'bg-blue-600' },
  { id: 'roblox', name: 'Roblox', color: 'bg-slate-800' },
  { id: 'lol', name: 'LoL', color: 'bg-amber-500' },
];

/**
 * Detaylı Profil Sayfası Bileşeni.
 */
export default function Profile() {
  const { user, isDemo, updateProfile, updatePassword } = useAuth();
  const { conversions } = useConversions();
  const { showToast } = useToast();
  const { t, lang } = useTranslation();

  // Profil Form State
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''
  );
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [favoriteGame, setFavoriteGame] = useState(user?.user_metadata?.favorite_game || 'minecraft');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.user_metadata?.avatar_preset || 'minecraft');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Şifre Değiştirme State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [suggestedNotice, setSuggestedNotice] = useState(false);

  // Güçlü Şifre Kriterleri (Kayıt Sayfası ile Birebir Aynı, Çeviri Destekli)
  const pwRequirements = [
    {
      key: 'length',
      label: t('profile.pwReqLength'),
      isValid: newPassword.length >= 8,
    },
    {
      key: 'upper',
      label: t('profile.pwReqUpper'),
      isValid: /[A-Z]/.test(newPassword),
    },
    {
      key: 'lower',
      label: t('profile.pwReqLower'),
      isValid: /[a-z]/.test(newPassword),
    },
    {
      key: 'number',
      label: t('profile.pwReqNumber'),
      isValid: /[0-9]/.test(newPassword),
    },
    {
      key: 'special',
      label: t('profile.pwReqSpecial'),
      // eslint-disable-next-line no-useless-escape
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    },
  ];

  const metCount = pwRequirements.filter((r) => r.isValid).length;
  const isAllPwMet = metCount === pwRequirements.length;

  const getStrengthInfo = () => {
    if (!newPassword) return { label: '', color: 'bg-gray-200 dark:bg-navy-700', textColor: 'text-gray-400', percent: 0 };
    if (metCount <= 2) return { label: t('profile.strengthWeak'), color: 'bg-red-500', textColor: 'text-red-500', percent: 25 };
    if (metCount <= 3) return { label: t('profile.strengthMedium'), color: 'bg-amber-500', textColor: 'text-amber-500', percent: 50 };
    if (metCount <= 4) return { label: t('profile.strengthStrong'), color: 'bg-blue-500', textColor: 'text-blue-500', percent: 75 };
    return { label: t('profile.strengthVeryStrong'), color: 'bg-emerald-500', textColor: 'text-emerald-500', percent: 100 };
  };
  const strengthInfo = getStrengthInfo();

  /**
   * Otomatik Güçlü Şifre Üretici
   */
  const handleGeneratePassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_+-=';
    
    let chars = [
      uppers[Math.floor(Math.random() * uppers.length)],
      lowers[Math.floor(Math.random() * lowers.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    
    const all = uppers + lowers + numbers + symbols;
    for (let i = 0; i < 8; i++) {
      chars.push(all[Math.floor(Math.random() * all.length)]);
    }
    
    const generated = chars.sort(() => Math.random() - 0.5).join('');
    setNewPassword(generated);
    setConfirmPassword(generated);
    setSuggestedNotice(true);
    setTimeout(() => setSuggestedNotice(false), 3500);
  };

  // İstatistikler & Hesaplamalar
  const totalConversions = conversions.length;
  const themeCounts = conversions.reduce((acc, c) => {
    acc[c.theme_label] = (acc[c.theme_label] || 0) + 1;
    return acc;
  }, {});
  const favoriteTheme =
    Object.entries(themeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Minecraft Skin';
  const dateLocale = lang === 'en' ? 'en-US' : 'tr-TR';
  const memberSince = user?.created_at
    ? new Intl.DateTimeFormat(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(user.created_at))
    : (lang === 'en' ? 'June 26, 2026' : '26 Haziran 2026');

  // Dinamik Rütbe / Seviye Hesaplama (Çeviri Destekli)
  const getUserRank = (count) => {
    if (count >= 30) return { title: t('profile.rankLegend'), color: 'text-cyan-500 bg-cyan-500/10' };
    if (count >= 15) return { title: t('profile.rankMaster'), color: 'text-amber-500 bg-amber-500/10' };
    if (count >= 5) return { title: t('profile.rankVeteran'), color: 'text-purple-500 bg-purple-500/10' };
    return { title: t('profile.rankRookie'), color: 'text-green-500 bg-green-500/10' };
  };
  const rankInfo = getUserRank(totalConversions);

  /**
   * Profil Bilgilerini Veritabanında Günceller.
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast(t('auth.fillAllFields'), 'error');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        favorite_game: favoriteGame,
        avatar_preset: selectedAvatar,
      });

      if (error) throw error;
      showToast(t('profile.toastSuccess'), 'success');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      showToast(error.message || 'Profil güncellenemedi.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Eski Şifre Doğrulamalı & Güçlü Şifre Değiştirme
   */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast(t('profile.fillCurrentPw'), 'error');
      return;
    }

    if (!isAllPwMet) {
      showToast(t('profile.meetCriteria'), 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(t('profile.pwMismatch'), 'error');
      return;
    }

    setIsChangingPassword(true);

    try {
      if (isSupabaseConfigured && user?.email) {
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (authErr) {
          showToast(t('profile.currentPwErr'), 'error');
          setIsChangingPassword(false);
          return;
        }
      }

      const { error: updateErr } = await updatePassword(newPassword);
      if (updateErr) throw updateErr;

      showToast(t('profile.pwSuccess'), 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      showToast(error.message || 'Şifre değiştirilemedi.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-navy-700 dark:text-white">
            <MdPerson className="h-8 w-8 text-brand-500" />
            {t('profile.title')}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {t('profile.subtitle')}
          </p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold ${rankInfo.color}`}>
          <MdMilitaryTech className="h-4 w-4" />
          {rankInfo.title}
        </span>
      </div>

      {/* Demo Mod Uyarısı */}
      {isDemo && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            {t('profile.demoBanner')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol Kolon: Profil Kartı, Avatar Seçimi & Başarımlar */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          {/* Main Avatar Banner */}
          <div className="overflow-hidden rounded-[24px] bg-white shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none border border-gray-100 dark:border-white/5">
            <div className="bg-gradient-to-r from-brand-500 via-indigo-600 to-purple-600 px-6 py-8 text-center">
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 p-2 text-white shadow-xl backdrop-blur-md">
                {getGameLogo(selectedAvatar, "h-14 w-14") || (
                  <span className="text-4xl font-black">
                    {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white ring-4 ring-white dark:ring-navy-800">
                  <MdCheckCircle className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-white">
                {displayName || user?.email?.split('@')[0] || 'Kullanıcı'}
              </h3>
              <p className="text-xs text-white/80">{user?.email || 'batuhan.tonk.1@gmail.com'}</p>
              {bio && (
                <p className="mt-3 text-xs italic text-white/90 bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                  "{bio}"
                </p>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 rounded-2xl bg-lightPrimary p-3.5 dark:bg-navy-700/60">
                <MdCalendarToday className="h-5 w-5 text-brand-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('profile.memberSince')}
                  </p>
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start rounded-[22px] bg-white p-5 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none border border-gray-100 dark:border-white/5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-500 dark:bg-brand-500/20">
                <MdAutoAwesome className="h-5 w-5" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.statsTotal')}
              </p>
              <p className="text-2xl font-black text-navy-700 dark:text-white">
                {totalConversions}
              </p>
            </div>

            <div className="flex flex-col items-start rounded-[22px] bg-white p-5 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none border border-gray-100 dark:border-white/5">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-500 dark:bg-green-500/20">
                <MdBarChart className="h-5 w-5" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.mostUsedTheme')}
              </p>
              <p className="text-sm font-bold text-navy-700 dark:text-white truncate w-full">
                {favoriteTheme}
              </p>
            </div>
          </div>

          {/* Rozetler & Başarımlar */}
          <div className="rounded-[24px] bg-white p-5 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none border border-gray-100 dark:border-white/5">
            <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-navy-700 dark:text-white">
              <MdStar className="h-5 w-5 text-yellow-500" />
              {t('profile.rankTitle')}
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center rounded-xl bg-gray-50 p-3 text-center dark:bg-navy-700/50">
                <span className="text-2xl">🎮</span>
                <span className="mt-1 text-[11px] font-bold text-navy-700 dark:text-white">{t('profile.rankBadge1')}</span>
                <span className="text-[10px] text-green-500 font-semibold">{t('profile.rankBadge1Sub')}</span>
              </div>

              <div className="flex flex-col items-center rounded-xl bg-gray-50 p-3 text-center dark:bg-navy-700/50">
                <span className="text-2xl">⚡</span>
                <span className="mt-1 text-[11px] font-bold text-navy-700 dark:text-white">{t('profile.rankBadge2')}</span>
                <span className="text-[10px] text-brand-500 font-semibold">{t('profile.rankBadge2Sub')}</span>
              </div>

              <div className="flex flex-col items-center rounded-xl bg-gray-50 p-3 text-center dark:bg-navy-700/50">
                <span className="text-2xl">🛡️</span>
                <span className="mt-1 text-[11px] font-bold text-navy-700 dark:text-white">{t('profile.rankBadge3')}</span>
                <span className="text-[10px] text-purple-500 font-semibold">{t('profile.rankBadge3Sub')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Formlar (Profil Güncelleme & Güvenli Şifre Değiştirme) */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* Profil Bilgileri Formu */}
          <div className="rounded-[24px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none border border-gray-100 dark:border-white/5">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-navy-700 dark:text-white">
              <MdEditNote className="h-6 w-6 text-brand-500" />
              {t('profile.formTitle')}
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              {/* E-posta */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                  <MdEmail className="h-4 w-4 text-gray-400" />
                  {t('profile.emailLabel')}
                </label>
                <input
                  type="email"
                  value={user?.email || 'batuhan.tonk.1@gmail.com'}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 dark:border-white/10 dark:bg-navy-900 dark:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {t('profile.emailNote')}
                </p>
              </div>

              {/* Görünen Ad */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                  <MdPerson className="h-4 w-4 text-gray-400" />
                  {t('profile.nameLabel')}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('profile.namePlaceholder')}
                  maxLength={50}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400"
                />
              </div>

              {/* Biyografi / Hakkımda */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                  <MdEditNote className="h-4 w-4 text-gray-400" />
                  {t('profile.bioLabel')}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('profile.bioPlaceholder')}
                  rows={2}
                  maxLength={150}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400 resize-none"
                />
              </div>

              {/* Favori Oyun Evreni & Oyun Rozeti */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                    <MdSportsEsports className="h-4 w-4 text-gray-400" />
                    {t('profile.favGameLabel')}
                  </label>
                  <select
                    value={favoriteGame}
                    onChange={(e) => setFavoriteGame(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400"
                  >
                    {THEMES.map((tItem) => (
                      <option key={tItem.slug} value={tItem.slug}>
                        {tItem.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                    <MdStar className="h-4 w-4 text-gray-400" />
                    {t('profile.avatarLabel')}
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVATAR_PRESETS.map((ap) => (
                      <button
                        key={ap.id}
                        type="button"
                        onClick={() => setSelectedAvatar(ap.id)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all ${
                          selectedAvatar === ap.id
                            ? 'border-brand-500 bg-brand-500/10 scale-110 shadow-md'
                            : 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-navy-900'
                        }`}
                      >
                        {getGameLogo(ap.id, "h-6 w-6")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-brand-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MdSave className="h-5 w-5" />
                  {isUpdatingProfile ? t('profile.btnSaving') : t('profile.btnSave')}
                </button>
              </div>
            </form>
          </div>

          {/* Eski Şifre Doğrulamalı Güvenli Şifre Değiştirme Formu */}
          <div className="rounded-[24px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none border border-gray-100 dark:border-white/5">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-navy-700 dark:text-white">
              <MdShield className="h-6 w-6 text-red-500" />
              {t('profile.pwTitle')}
            </h3>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              {/* 1. Mevcut (Eski) Şifre */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                  <MdVpnKey className="h-4 w-4 text-gray-400" />
                  {t('profile.currentPwLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('profile.currentPwPlaceholder')}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    {showCurrentPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* 2. Yeni Şifre */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                    <MdLock className="h-4 w-4 text-gray-400" />
                    {t('profile.newPwLabel')} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    <HiSparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    {t('profile.suggestPw')}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('profile.newPwPlaceholder')}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    {showNewPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                  </button>
                </div>

                {suggestedNotice && (
                  <div className="mt-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400 flex items-center gap-1.5">
                    <MdCheck className="h-4 w-4 shrink-0" />
                    {t('profile.suggestedPwNotice')}
                  </div>
                )}

                {/* Şifre Güçlük Barı */}
                {newPassword && (
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-700">
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${strengthInfo.percent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${strengthInfo.textColor}`}>
                      {t('profile.strengthTitle')} {strengthInfo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Güçlü Şifre Kriter Listesi */}
              <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-3.5 dark:border-white/10 dark:bg-navy-800/40">
                <p className="mb-2 text-xs font-bold text-navy-700 dark:text-gray-300">
                  {t('profile.pwReqTitle')}
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {pwRequirements.map((req) => (
                    <div key={req.key} className="flex items-center gap-1.5 text-xs">
                      {req.isValid ? (
                        <MdCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <MdClose className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                      )}
                      <span className={req.isValid ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Yeni Şifre Tekrar */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-700 dark:text-white">
                  <MdLock className="h-4 w-4 text-gray-400" />
                  {t('profile.pwConfirmLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('profile.pwConfirmPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    ❌ {t('profile.pwMismatch')}
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-green-500">
                    ✓ {t('profile.pwMatch')}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !isAllPwMet || newPassword !== confirmPassword}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-red-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MdLock className="h-5 w-5" />
                  {isChangingPassword ? t('profile.btnChangingPw') : t('profile.btnChangePw')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
