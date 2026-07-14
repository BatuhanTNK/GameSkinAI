import React, { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useConversions } from 'hooks/useConversions';
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';
import { supabase } from 'lib/supabase';
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdSave,
  MdAutoAwesome,
  MdCalendarToday,
  MdBarChart,
} from 'react-icons/md';

/**
 * Profil sayfası bileşeni.
 */
export default function Profile() {
  const { user, isDemo } = useAuth();
  const { conversions } = useConversions();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Profil düzenleme state
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Şifre değiştirme state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // İstatistikler
  const totalConversions = conversions.length;
  const themeCounts = conversions.reduce((acc, c) => {
    acc[c.theme_label] = (acc[c.theme_label] || 0) + 1;
    return acc;
  }, {});
  const favoriteTheme =
    Object.entries(themeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '—';
  const memberSince = user?.created_at
    ? new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(user.created_at))
    : '—';

  /**
   * Profil adını günceller.
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast(t('profile.namePlaceholder'), 'error');
      return;
    }

    if (isDemo) {
      showToast(t('profile.demoWarning'), 'warning');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });

      if (error) throw error;
      showToast('Profil başarıyla güncellendi!', 'success');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      showToast(error.message || 'Profil güncellenemedi.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Şifre değiştirme.
   */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast(t('profile.pwPlaceholder'), 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('profile.pwMismatch'), 'error');
      return;
    }

    if (isDemo) {
      showToast(t('profile.demoWarning'), 'warning');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      showToast('Şifre başarıyla değiştirildi!', 'success');
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
      <div>
        <h2 className="flex items-center gap-3 text-3xl font-bold text-navy-700 dark:text-white">
          <MdPerson className="h-8 w-8" />
          {t('profile.title')}
        </h2>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Demo Mod Uyarısı */}
      {isDemo && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {t('profile.demoWarning')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol Kolon: Profil Kartı + İstatistikler */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          {/* Profil Avatar Kartı */}
          <div className="overflow-hidden rounded-[20px] bg-white shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
            <div className="bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-8">
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl font-bold text-white backdrop-blur-sm">
                  {(user?.user_metadata?.display_name || user?.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <h3 className="mt-3 text-xl font-bold text-white">
                  {user?.user_metadata?.display_name ||
                    user?.email?.split('@')[0] ||
                    'Kullanıcı'}
                </h3>
                <p className="text-sm text-white/70">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 rounded-xl bg-lightPrimary p-3 dark:bg-navy-700">
                <MdCalendarToday className="h-5 w-5 text-brand-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('profile.memberSince')}
                  </p>
                  <p className="text-sm font-semibold text-navy-700 dark:text-white">
                    {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 rounded-[20px] bg-white p-5 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
                <MdAutoAwesome className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.statsTotal')}
                </p>
                <p className="text-2xl font-bold text-navy-700 dark:text-white">
                  {totalConversions}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[20px] bg-white p-5 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                <MdBarChart className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.statsFav')}
                </p>
                <p className="text-lg font-bold text-navy-700 dark:text-white">
                  {favoriteTheme}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Düzenleme Formları */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* Profil Bilgileri Formu */}
          <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
            <h3 className="mb-5 text-lg font-bold text-navy-700 dark:text-white">
              {t('profile.formTitle')}
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-white">
                  <MdEmail className="h-4 w-4 text-gray-400" />
                  {t('profile.emailLabel')}
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-white/10 dark:bg-navy-900 dark:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {t('profile.emailNote')}
                </p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-white">
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

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex w-fit items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdSave className="h-5 w-5" />
                {isUpdatingProfile ? t('profile.btnSaving') : t('profile.btnSave')}
              </button>
            </form>
          </div>

          {/* Şifre Değiştirme Formu */}
          <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
            <h3 className="mb-5 text-lg font-bold text-navy-700 dark:text-white">
              {t('profile.pwTitle')}
            </h3>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-white">
                  <MdLock className="h-4 w-4 text-gray-400" />
                  {t('profile.pwLabel')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('profile.pwPlaceholder')}
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-white">
                  <MdLock className="h-4 w-4 text-gray-400" />
                  {t('profile.pwConfirmLabel')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('profile.pwConfirmPlaceholder')}
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {t('profile.pwMismatch')}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="flex w-fit items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdLock className="h-5 w-5" />
                {isChangingPassword ? t('profile.btnChangingPw') : t('profile.btnChangePw')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
