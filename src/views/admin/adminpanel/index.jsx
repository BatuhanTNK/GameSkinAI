/**
 * @fileoverview Admin Paneli Sayfası (ozellik_onerileri.md #13).
 * Tema ekleme/düzenleme/pasifleştirme, kullanıcı istatistikleri ve
 * uygunsuz içerik moderasyonu (public skinleri gizleme) sunar.
 * Sadece admin yetkili kullanıcılar erişebilir.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MdAdminPanelSettings,
  MdBarChart,
  MdPalette,
  MdShield,
  MdAdd,
  MdEdit,
  MdVisibilityOff,
  MdToggleOn,
  MdToggleOff,
  MdAutoAwesome,
  MdPeople,
  MdPublic,
  MdChatBubbleOutline,
  MdFavorite,
  MdClose,
  MdLock,
} from 'react-icons/md';
import { useIsAdmin } from 'hooks/useIsAdmin';
import {
  fetchAllThemesAdmin,
  saveThemeAdmin,
  toggleThemeActiveAdmin,
  fetchAdminStats,
  fetchPublicConversionsAdmin,
  hideConversionAdmin,
} from 'lib/admin';
import { useTranslation } from 'contexts/TranslationContext';
import { useToast } from 'contexts/ToastContext';

/** Boş tema formu */
const EMPTY_THEME_FORM = { slug: '', label: '', description: '', prompt: '', active: true };

/**
 * Admin paneli sayfası.
 */
export default function AdminPanel() {
  const { isAdmin, adminChecked } = useIsAdmin();
  const { t, lang } = useTranslation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'themes' | 'moderation'

  // İstatistikler
  const [stats, setStats] = useState(null);

  // Temalar
  const [themes, setThemes] = useState([]);
  const [themeFormOpen, setThemeFormOpen] = useState(false);
  const [themeForm, setThemeForm] = useState(EMPTY_THEME_FORM);
  const [editingSlug, setEditingSlug] = useState(null);
  const [savingTheme, setSavingTheme] = useState(false);

  // Moderasyon
  const [publicList, setPublicList] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [statsData, themeList, modList] = await Promise.all([
      fetchAdminStats(),
      fetchAllThemesAdmin(),
      fetchPublicConversionsAdmin(),
    ]);
    setStats(statsData);
    setThemes(themeList);
    setPublicList(modList);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (adminChecked && isAdmin) {
      loadData();
    }
  }, [adminChecked, isAdmin, loadData]);

  /** Tema formunu düzenleme modunda açar. */
  const handleEditTheme = (theme) => {
    setThemeForm({
      slug: theme.slug,
      label: theme.label,
      description: theme.description || '',
      prompt: theme.prompt || '',
      active: theme.active !== false,
    });
    setEditingSlug(theme.slug);
    setThemeFormOpen(true);
  };

  /** Yeni tema formunu açar. */
  const handleNewTheme = () => {
    setThemeForm(EMPTY_THEME_FORM);
    setEditingSlug(null);
    setThemeFormOpen(true);
  };

  /** Tema formunu kaydeder (ekleme/güncelleme). */
  const handleSaveTheme = async (e) => {
    e.preventDefault();
    setSavingTheme(true);
    const { error } = await saveThemeAdmin(themeForm);
    setSavingTheme(false);

    if (error) {
      showToast(t('admin.themeSaveError'), 'error');
      return;
    }

    showToast(editingSlug ? t('admin.themeUpdated') : t('admin.themeAdded'), 'success');
    setThemeFormOpen(false);
    setThemeForm(EMPTY_THEME_FORM);
    setEditingSlug(null);
    setThemes(await fetchAllThemesAdmin());
  };

  /** Tema aktif/pasif durumunu değiştirir. */
  const handleToggleActive = async (theme) => {
    const nextActive = !(theme.active !== false);
    // İyimser güncelleme
    setThemes((prev) =>
      prev.map((th) => (th.slug === theme.slug ? { ...th, active: nextActive } : th))
    );
    await toggleThemeActiveAdmin(theme, nextActive);
    showToast(
      nextActive ? t('admin.themeActivated') : t('admin.themeDeactivated'),
      nextActive ? 'success' : 'info'
    );
  };

  /** Public skini topluluktan gizler. */
  const handleHideConversion = async (conv) => {
    setPublicList((prev) => prev.filter((c) => c.id !== conv.id));
    await hideConversionAdmin(conv.id);
    showToast(t('admin.conversionHidden'), 'info');
  };

  // Yetki kontrolü devam ediyor
  if (!adminChecked) {
    return (
      <div className="mt-3 flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-brand-500" />
      </div>
    );
  }

  // Yetkisiz erişim
  if (!isAdmin) {
    return (
      <div className="mt-3 flex flex-col items-center justify-center rounded-[20px] bg-white px-6 py-20 text-center shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
        <MdLock className="mb-4 h-14 w-14 text-gray-400" />
        <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
          {t('admin.noAccessTitle')}
        </h2>
        <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {t('admin.noAccessDesc')}
        </p>
      </div>
    );
  }

  const statCards = stats
    ? [
        { icon: MdAutoAwesome, label: t('admin.statConversions'), value: stats.totalConversions },
        { icon: MdPublic, label: t('admin.statPublic'), value: stats.publicConversions },
        { icon: MdPeople, label: t('admin.statUsers'), value: stats.totalUsers },
        { icon: MdChatBubbleOutline, label: t('admin.statComments'), value: stats.totalComments },
        { icon: MdFavorite, label: t('admin.statLikes'), value: stats.totalLikes },
      ]
    : [];

  const themeDistEntries = stats
    ? Object.entries(stats.themeDistribution).sort((a, b) => b[1] - a[1])
    : [];
  const maxThemeCount = themeDistEntries.length > 0 ? themeDistEntries[0][1] : 1;

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Üst Banner */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-navy-700 via-brand-500 to-purple-600 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <MdAdminPanelSettings className="h-4 w-4" />
            <span>Admin</span>
          </div>
          <h2 className="text-3xl font-extrabold md:text-4xl">{t('admin.title')}</h2>
          <p className="mt-2 text-sm text-white/80 md:text-base">{t('admin.subtitle')}</p>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'stats', label: t('admin.tabStats'), icon: MdBarChart },
          { key: 'themes', label: t('admin.tabThemes'), icon: MdPalette },
          { key: 'moderation', label: t('admin.tabModeration'), icon: MdShield },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Yükleniyor */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[20px] bg-gray-200 dark:bg-navy-700" />
          ))}
        </div>
      )}

      {/* ============ İSTATİSTİKLER ============ */}
      {!loading && activeTab === 'stats' && stats && (
        <>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="flex flex-col items-center rounded-[20px] bg-white p-5 text-center shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                  <card.icon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-2xl font-bold text-navy-700 dark:text-white">
                  {card.value}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
              </div>
            ))}
          </div>

          {/* Tema Dağılımı */}
          <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
            <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              {t('admin.themeDistTitle')}
            </h4>
            {themeDistEntries.length === 0 && (
              <p className="text-sm text-gray-400">{t('admin.noData')}</p>
            )}
            <div className="flex flex-col gap-3">
              {themeDistEntries.map(([label, count]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm font-semibold text-navy-700 dark:text-white">
                    {label}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-navy-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                      style={{ width: `${Math.max(8, (count / maxThemeCount) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-bold text-gray-500 dark:text-gray-400">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ============ TEMA YÖNETİMİ ============ */}
      {!loading && activeTab === 'themes' && (
        <div className="flex flex-col gap-4">
          {/* Yeni Tema Butonu */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNewTheme}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-600"
            >
              <MdAdd className="h-5 w-5" />
              {t('admin.newTheme')}
            </button>
          </div>

          {/* Tema Formu */}
          {themeFormOpen && (
            <form
              onSubmit={handleSaveTheme}
              className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                  {editingSlug ? t('admin.editTheme') : t('admin.newTheme')}
                </h4>
                <button
                  type="button"
                  onClick={() => setThemeFormOpen(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                >
                  <MdClose className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy-700 dark:text-white">
                    {t('admin.fieldSlug')}
                  </label>
                  <input
                    type="text"
                    value={themeForm.slug}
                    onChange={(e) => setThemeForm({ ...themeForm, slug: e.target.value })}
                    disabled={!!editingSlug}
                    placeholder="orn-tema-slug"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-navy-700 outline-none focus:border-brand-500 disabled:opacity-60 dark:border-white/10 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-navy-700 dark:text-white">
                    {t('admin.fieldLabel')}
                  </label>
                  <input
                    type="text"
                    value={themeForm.label}
                    onChange={(e) => setThemeForm({ ...themeForm, label: e.target.value })}
                    placeholder="Örn. Anime Kahramanı"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-bold text-navy-700 dark:text-white">
                  {t('admin.fieldDescription')}
                </label>
                <input
                  type="text"
                  value={themeForm.description}
                  onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-bold text-navy-700 dark:text-white">
                  {t('admin.fieldPrompt')}
                </label>
                <textarea
                  value={themeForm.prompt}
                  onChange={(e) => setThemeForm({ ...themeForm, prompt: e.target.value })}
                  rows={6}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-mono text-xs text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-700 dark:text-white">
                  <input
                    type="checkbox"
                    checked={themeForm.active}
                    onChange={(e) => setThemeForm({ ...themeForm, active: e.target.checked })}
                    className="h-4 w-4 accent-brand-500"
                  />
                  {t('admin.fieldActive')}
                </label>
                <button
                  type="submit"
                  disabled={savingTheme || !themeForm.slug.trim() || !themeForm.label.trim() || !themeForm.prompt.trim()}
                  className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingTheme ? t('admin.saving') : t('admin.saveTheme')}
                </button>
              </div>
            </form>
          )}

          {/* Tema Listesi */}
          <div className="overflow-hidden rounded-[20px] bg-white shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
            {themes.map((theme, idx) => (
              <div
                key={theme.slug}
                className={`flex flex-wrap items-center gap-3 px-5 py-4 ${
                  idx !== themes.length - 1 ? 'border-b border-gray-100 dark:border-white/10' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-navy-700 dark:text-white">
                      {theme.label}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-navy-700 dark:text-gray-400">
                      {theme.slug}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        theme.source === 'db' || theme.source === 'custom'
                          ? 'bg-brand-500/10 text-brand-500'
                          : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
                      }`}
                    >
                      {theme.source === 'static' ? t('admin.sourceStatic') : t('admin.sourceDb')}
                    </span>
                    {theme.active === false && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500 dark:bg-red-500/10">
                        {t('admin.inactive')}
                      </span>
                    )}
                  </div>
                  {theme.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                      {theme.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditTheme(theme)}
                    title={t('admin.editTheme')}
                    className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/10"
                  >
                    <MdEdit className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(theme)}
                    title={theme.active !== false ? t('admin.deactivate') : t('admin.activate')}
                    className={`rounded-lg p-1 transition-all ${
                      theme.active !== false ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    {theme.active !== false ? (
                      <MdToggleOn className="h-8 w-8" />
                    ) : (
                      <MdToggleOff className="h-8 w-8" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ MODERASYON ============ */}
      {!loading && activeTab === 'moderation' && (
        <div className="flex flex-col gap-4">
          {publicList.length === 0 && (
            <div className="flex flex-col items-center rounded-[20px] bg-white p-12 text-center shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
              <MdShield className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.noPublicContent')}
              </p>
            </div>
          )}

          {publicList.length > 0 && (
            <div className="overflow-hidden rounded-[20px] bg-white shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
              {publicList.map((conv, idx) => (
                <div
                  key={conv.id}
                  className={`flex flex-wrap items-center gap-4 px-5 py-4 ${
                    idx !== publicList.length - 1
                      ? 'border-b border-gray-100 dark:border-white/10'
                      : ''
                  }`}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-navy-900">
                    {conv.result_image_url && (
                      <img
                        src={conv.result_image_url}
                        alt={conv.theme_label}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {conv.theme_label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {conv.user_display_name || t('common.user')} ·{' '}
                      {new Date(conv.created_at).toLocaleDateString(
                        lang === 'en' ? 'en-US' : 'tr-TR'
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                    <MdFavorite className="h-4 w-4" />
                    {conv.likes_count || 0}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHideConversion(conv)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                  >
                    <MdVisibilityOff className="h-4 w-4" />
                    {t('admin.hideBtn')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
