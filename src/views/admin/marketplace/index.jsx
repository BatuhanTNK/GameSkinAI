/**
 * @fileoverview Topluluk Galerisi (Marketplace) Sayfası.
 * Kullanıcıların toplulukla paylaştığı AI karakterlerini listeler,
 * arama, tema filtreleme, beğeni ve sosyal paylaşım olanakları sunar.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useConversions } from 'hooks/useConversions';
import { THEMES } from 'lib/themes';
import { MdAutoAwesome, MdFavorite, MdSearch, MdVisibility } from 'react-icons/md';

import ShareButtons from 'components/converter/ShareButtons';
import MinecraftSkinPreview from 'components/converter/MinecraftSkinPreview';
import ComparisonSlider from 'components/converter/ComparisonSlider';
import { parseConversionDescription } from 'lib/skinDataParser';
import { useTranslation } from 'contexts/TranslationContext';
import { useToast } from 'contexts/ToastContext';

export default function Marketplace() {
  const { fetchPublicConversions, toggleLike } = useConversions();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [publicConversions, setPublicConversions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Arama, Filtreleme ve Sıralama
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'likes'

  // Modal
  const [selectedConversion, setSelectedConversion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPublicData = useCallback(async () => {
    setLoading(true);
    const data = await fetchPublicConversions();
    setPublicConversions(data);
    setLoading(false);
  }, [fetchPublicConversions]);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  // Beğeni Butonu İşleyicisi (Tek Beğeni / Beğeni Geri Alma Garantili)
  const handleLike = async (e, conv) => {
    e.stopPropagation();

    const isCurrentlyLiked = !!conv.userLiked;
    const currentLikes = conv.likes_count || 0;
    const nextLikedState = !isCurrentlyLiked;
    const nextLikesCount = nextLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    // Anında UI Güncellemesi (İlk Tıklamada +1 Artış Garantisi)
    setPublicConversions((prev) =>
      prev.map((item) =>
        item.id === conv.id
          ? { ...item, likes_count: nextLikesCount, userLiked: nextLikedState }
          : item
      )
    );

    if (selectedConversion && selectedConversion.id === conv.id) {
      setSelectedConversion((prev) => ({
        ...prev,
        likes_count: nextLikesCount,
        userLiked: nextLikedState,
      }));
    }

    await toggleLike(conv.id, nextLikesCount, nextLikedState);

    if (nextLikedState) {
      showToast('Beğenildi! ❤️', 'success');
    } else {
      showToast('Beğeni geri alındı 🤍', 'info');
    }
  };

  // Filtrelenmiş ve Sıralanmış Liste
  const filteredList = publicConversions
    .filter((conv) => {
      const matchSearch =
        conv.theme_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.result_description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTheme = selectedTheme === 'all' || conv.theme_slug === selectedTheme;
      return matchSearch && matchTheme;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes_count || 0) - (a.likes_count || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Modal Veri Hazırlama
  const modalParsedData = selectedConversion
    ? parseConversionDescription(selectedConversion.result_description || '', selectedConversion.theme_slug)
    : { descriptionText: '', skinData: null, skinImageUrl: null, isMinecraft: false };

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Üst Karşılama Banner */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-brand-500 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <MdAutoAwesome className="h-4 w-4" />
            <span>Topluluk Vitrini</span>
          </div>
          <h2 className="text-3xl font-extrabold md:text-4xl">
            {t('marketplace.title')}
          </h2>
          <p className="mt-2 text-sm md:text-base text-white/80">
            {t('marketplace.subtitle')}
          </p>
        </div>
      </div>

      {/* Arama, Filtreleme ve Sıralama Çubuğu */}
      <div className="flex flex-col gap-4 rounded-[20px] bg-white p-5 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none md:flex-row md:items-center md:justify-between">
        {/* Arama Input */}
        <div className="relative flex-1">
          <MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('marketplace.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm text-navy-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
        </div>

        {/* Tema Filtresi & Sıralama */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:bg-navy-900 dark:text-white"
          >
            <option value="all">{t('history.allThemes')}</option>
            {THEMES.map((theme) => (
              <option key={theme.slug} value={theme.slug}>
                {theme.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none dark:border-white/10 dark:bg-navy-900 dark:text-white"
          >
            <option value="newest">{t('history.sortNewest')}</option>
            <option value="likes">En Popüler (Beğeniye Göre)</option>
          </select>
        </div>
      </div>

      {/* Yükleme State */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-[20px] bg-gray-200 dark:bg-navy-700" />
          ))}
        </div>
      )}

      {/* Boş State */}
      {!loading && filteredList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[20px] bg-white px-6 py-16 text-center shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
          <MdAutoAwesome className="mb-4 h-12 w-12 text-brand-500" />
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">
            {t('marketplace.noSkins')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Dönüştürücü sayfasından kendi karakterinizi üretip "Toplulukta Paylaş" butonu ile ilk paylaşımı yapabilirsiniz!
          </p>
        </div>
      )}

      {/* Karakter Kartları Grid */}
      {!loading && filteredList.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setSelectedConversion(conv);
                setIsModalOpen(true);
              }}
              className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-navy-800 dark:shadow-none"
            >
              {/* Görsel Kapak */}
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-navy-900">
                <img
                  src={conv.result_image_url || conv.original_image_url}
                  alt={conv.theme_label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Tema Rozeti */}
                <div className="absolute top-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {conv.theme_label}
                </div>

                {/* Beğeni Butonu */}
                <button
                  type="button"
                  onClick={(e) => handleLike(e, conv)}
                  className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    conv.userLiked
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white dark:bg-navy-800/80 dark:text-white'
                  }`}
                >
                  <MdFavorite className={`h-4 w-4 ${conv.userLiked ? 'text-white' : 'text-red-500'}`} />
                  <span>{conv.likes_count || 0}</span>
                </button>

                {/* Hover İncele Butonu */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-1 text-xs font-bold text-white">
                    <MdVisibility className="h-4 w-4" /> Detayları Gör
                  </span>
                </div>
              </div>

              {/* Alt Bilgi Barı */}
              <div className="p-4">
                <h4 className="text-base font-bold text-navy-700 dark:text-white line-clamp-1">
                  {conv.theme_label} Character
                </h4>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                  {modalParsedData.descriptionText || 'AI Karakter açıklaması'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detay Modalı */}
      {isModalOpen && selectedConversion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl dark:bg-navy-800">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                  {selectedConversion.theme_label}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Topluluk Karakteri
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-6">
              {/* Resim Karşılaştırma */}
              {selectedConversion.original_image_url && selectedConversion.result_image_url ? (
                <div className="max-w-lg mx-auto w-full">
                  <ComparisonSlider
                    beforeImage={selectedConversion.original_image_url}
                    afterImage={selectedConversion.result_image_url}
                  />
                </div>
              ) : (
                <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl">
                  <img
                    src={selectedConversion.result_image_url || selectedConversion.original_image_url}
                    alt="AI Character"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Minecraft 2D Canvas önizleme */}
              {modalParsedData.isMinecraft && (
                <div className="flex justify-center">
                  <MinecraftSkinPreview skinData={modalParsedData.skinData} skinImageUrl={modalParsedData.skinImageUrl} />
                </div>
              )}

              {/* Açıklama */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-navy-700">
                <h5 className="mb-2 text-sm font-bold text-navy-700 dark:text-white">
                  Karakter Açıklaması:
                </h5>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-700 dark:text-gray-300">
                  {modalParsedData.descriptionText || selectedConversion.result_description}
                </p>
              </div>

              {/* Sosyal Paylaşım & Butonlar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-white/10">
                <ShareButtons
                  title={selectedConversion.theme_label}
                  text={modalParsedData.descriptionText}
                />
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-navy-700 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-900 dark:text-white"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
