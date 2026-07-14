/**
 * @fileoverview Geçmiş sayfası.
 * Kullanıcının önceki dönüşümlerini listeler.
 * Skeleton loading, boş state ve silme işlevi içerir.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversions } from 'hooks/useConversions';
import HistoryCard from 'components/converter/HistoryCard';
import { ROUTES, MESSAGES } from 'lib/constants';
import { MdAutoAwesome } from 'react-icons/md';
import MinecraftSkinPreview from 'components/converter/MinecraftSkinPreview';
import { parseConversionDescription } from 'lib/skinDataParser';
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';
import ComparisonSlider from 'components/converter/ComparisonSlider';

/**
 * Skeleton kart bileşeni (yükleme sırasında gösterilir).
 */
function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[20px] bg-white shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
      <div className="h-14 bg-gray-200 dark:bg-navy-700" />
      <div className="p-5">
        <div className="mb-3 h-3 w-3/4 rounded bg-gray-200 dark:bg-navy-700" />
        <div className="mb-3 h-3 w-full rounded bg-gray-200 dark:bg-navy-700" />
        <div className="mb-3 h-3 w-5/6 rounded bg-gray-200 dark:bg-navy-700" />
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
          <div className="h-7 w-16 rounded-lg bg-gray-200 dark:bg-navy-700" />
          <div className="h-7 w-12 rounded-lg bg-gray-200 dark:bg-navy-700" />
        </div>
      </div>
    </div>
  );
}

/**
 * Geçmiş sayfası bileşeni.
 * Kullanıcının tüm dönüşüm geçmişini gösterir.
 */
export default function History() {
  const { conversions, loading, error, deleteConversion, fetchConversions } =
    useConversions();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Modal State'leri
  const [selectedConversion, setSelectedConversion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalViewMode, setModalViewMode] = useState('slider'); // 'slider' veya 'split'

  // Arama, filtreleme, sıralama ve sayfalama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Benzersiz temaları filtre dropdown'ı için bulalım
  const uniqueThemes = Array.from(
    new Set(conversions.map((c) => JSON.stringify({ slug: c.theme_slug, label: c.theme_label }))),
    (str) => JSON.parse(str)
  );

  // Filtrele ve Sırala
  const filteredConversions = conversions
    .filter((conv) => {
      const matchesSearch =
        conv.theme_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.result_description &&
          conv.result_description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTheme = themeFilter === 'all' || conv.theme_slug === themeFilter;

      return matchesSearch && matchesTheme;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Toplam Sayfa Sayısı
  const totalPages = Math.ceil(filteredConversions.length / itemsPerPage);

  // Aktif sayfadaki ögeler
  const paginatedConversions = filteredConversions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Parse JSON description for modal if it's Minecraft Skin theme
  const {
    descriptionText: modalDescriptionText,
    skinData: modalSkinData,
    skinImageUrl: modalSkinImageUrl,
    isMinecraft: isModalMinecraft,
  } = selectedConversion
    ? parseConversionDescription(
        selectedConversion.result_description || '',
        selectedConversion.theme_slug
      )
    : { descriptionText: '', skinData: null, skinImageUrl: null, isMinecraft: false };

  /**
   * Dönüşüm silme işleyicisi.
   * @param {string} id - Silinecek dönüşüm UUID
   */
  const handleDelete = async (id) => {
    const { success, error: deleteError } = await deleteConversion(id);
    if (success) {
      showToast(MESSAGES.DELETE_SUCCESS, 'success');
    } else {
      showToast(deleteError || MESSAGES.DELETE_ERROR, 'error');
    }
  };

  /**
   * Dönüşüm detay görüntüleme işleyicisi.
   * @param {Object} conversion - Dönüşüm verisi
   */
  const handleView = (conversion) => {
    setSelectedConversion(conversion);
    setIsModalOpen(true);
  };

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Sayfa Üst Bilgi Satırı */}
      {!loading && conversions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('history.total', { count: conversions.length })}
          </p>
          <button
            type="button"
            onClick={fetchConversions}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-white/5"
          >
            {t('history.refresh')}
          </button>
        </div>
      )}

      {/* Hata durumu */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={fetchConversions}
            className="ml-auto text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            {t('result.btnRetry')}
          </button>
        </div>
      )}

      {/* Filtreleme ve Arama Çubuğu */}
      {!loading && conversions.length > 0 && (
        <div className="flex flex-col gap-4 rounded-[20px] bg-white p-5 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none md:flex-row md:items-center md:justify-between">
          {/* Arama Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-navy-900 px-4 py-3 text-sm text-navy-700 dark:text-white outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Tema Filtresi ve Sıralama */}
          <div className="flex flex-wrap gap-3 md:flex-nowrap">
            <select
              value={themeFilter}
              onChange={(e) => {
                setThemeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-navy-900 px-4 py-3 text-sm text-navy-700 dark:text-white outline-none"
            >
              <option value="all">{t('history.allThemes')}</option>
              {uniqueThemes.map((theme) => (
                <option key={theme.slug} value={theme.slug}>
                  {theme.label}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-navy-900 px-4 py-3 text-sm text-navy-700 dark:text-white outline-none"
            >
              <option value="newest">{t('history.sortNewest')}</option>
              <option value="oldest">{t('history.sortOldest')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading: Skeleton kartlar */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Boş state (Hiç dönüşüm yoksa) */}
      {!loading && conversions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[20px] bg-white px-6 py-16 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdAutoAwesome className="h-10 w-10 text-brand-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-navy-700 dark:text-white">
            {t('history.empty')}
          </h3>
          <p className="mb-6 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
            {t('history.emptyDesc')}
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.CONVERTER)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-brand-500 hover:to-brand-700 hover:shadow-xl"
          >
            <MdAutoAwesome className="h-5 w-5" />
            {t('history.btnStart')}
          </button>
        </div>
      )}

      {/* Filtreleme sonucu boş state */}
      {!loading && conversions.length > 0 && filteredConversions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[20px] bg-white px-6 py-12 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
          <p className="text-base text-gray-500 dark:text-gray-400">
            {t('history.noResults')}
          </p>
        </div>
      )}

      {/* Kart Listesi */}
      {!loading && paginatedConversions.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedConversions.map((conversion) => (
              <HistoryCard
                key={conversion.id}
                conversion={conversion}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>

          {/* Sayfalama (Pagination) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-navy-700 transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-750"
              >
                ←
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'border border-gray-200 bg-white text-navy-700 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-750'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-navy-700 transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-750"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detay Modalı */}
      {isModalOpen && selectedConversion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-white shadow-2xl dark:bg-navy-800 transition-all duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                  {selectedConversion.theme_label}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Intl.DateTimeFormat('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(selectedConversion.created_at))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal İçerik (Scrollable) */}
            <div className="overflow-y-auto p-6 flex-1">
              {/* Görsel Modu Seçici */}
              {selectedConversion.original_image_url && selectedConversion.result_image_url && (
                <div className="mb-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalViewMode('slider')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      modalViewMode === 'slider'
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
                    }`}
                  >
                    {t('result.viewSlider')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalViewMode('split')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      modalViewMode === 'split'
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
                    }`}
                  >
                    {t('result.viewSplit')}
                  </button>
                </div>
              )}

              {/* Resim Karşılaştırma */}
              {(selectedConversion.original_image_url || selectedConversion.result_image_url) && (
                <>
                  {modalViewMode === 'slider' && selectedConversion.original_image_url && selectedConversion.result_image_url ? (
                    <div className="mb-6">
                      {isModalMinecraft ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
                          <div className="md:col-span-2 max-w-xl mx-auto w-full">
                            <ComparisonSlider
                              beforeImage={selectedConversion.original_image_url}
                              afterImage={selectedConversion.result_image_url}
                            />
                          </div>
                          <div className="md:col-span-1 flex flex-col justify-center">
                            <MinecraftSkinPreview skinData={modalSkinData} skinImageUrl={modalSkinImageUrl} />
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-xl mx-auto w-full">
                          <ComparisonSlider
                            beforeImage={selectedConversion.original_image_url}
                            afterImage={selectedConversion.result_image_url}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`mb-6 grid grid-cols-1 gap-6 ${isModalMinecraft ? 'lg:grid-cols-3 md:grid-cols-3' : 'md:grid-cols-2'}`}>
                      {selectedConversion.original_image_url && (
                        <div className="flex flex-col items-center rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-900/50">
                          <span className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {t('uploader.originalPhoto')}
                          </span>
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-navy-900">
                            <img
                              src={selectedConversion.original_image_url}
                              alt="Orijinal"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {selectedConversion.result_image_url && (
                        <div className="flex flex-col items-center rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-900/50">
                          <span className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-500">
                            {t('result.aiCharacter')}
                          </span>
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-navy-900">
                            <img
                              src={selectedConversion.result_image_url}
                              alt="AI Karakteri"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Minecraft Oyuncu Skini (Eğer Minecraft teması ise) */}
                      {isModalMinecraft && (
                        <MinecraftSkinPreview skinData={modalSkinData} skinImageUrl={modalSkinImageUrl} />
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Açıklama */}
              <div className="rounded-xl bg-lightPrimary p-4 dark:bg-navy-700">
                <h5 className="mb-2 text-sm font-bold text-navy-700 dark:text-white">
                  {t('result.descTitle')}
                </h5>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-700 dark:text-gray-300">
                  {modalDescriptionText}
                </p>
              </div>
            </div>

            {/* Modal Butonlar */}
            <div className="flex flex-wrap gap-3 border-t border-gray-100 p-6 dark:border-white/10 bg-gray-50 dark:bg-navy-900/30">
              {selectedConversion.result_image_url && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const url = selectedConversion.result_image_url;
                      if (url.startsWith('data:')) {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `gameskin_${selectedConversion.theme_slug || 'result'}_${selectedConversion.id.substring(0, 8)}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        return;
                      }
                      const response = await fetch(url);
                      const blob = await response.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = `gameskin_${selectedConversion.theme_slug || 'result'}_${selectedConversion.id.substring(0, 8)}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(blobUrl);
                    } catch (err) {
                      window.open(selectedConversion.result_image_url, '_blank');
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600"
                >
                  {t('result.btnDownloadImage')}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const content = `GameSkinAI - ${selectedConversion.theme_label} Sonucu\n${'='.repeat(50)}\n\n--- Karakter Açıklaması ---\n\n${modalDescriptionText}`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `gameskinai_${selectedConversion.theme_slug}_${selectedConversion.id.substring(0, 8)}.txt`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-600"
              >
                {t('result.btnDownloadText')}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="ml-auto rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
