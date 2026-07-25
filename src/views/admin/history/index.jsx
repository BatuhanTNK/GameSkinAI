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
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';
import HistoryDetailModal from 'components/converter/HistoryDetailModal';


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
  const { conversions, loading, error, deleteConversion, fetchConversions, togglePublic } =
    useConversions();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleTogglePublic = async (id, currentPublicState) => {
    const { error: err } = await togglePublic(id, currentPublicState);
    if (!err) {
      showToast(
        !currentPublicState ? 'Toplulukta yayınlandı!' : 'Topluluktan kaldırıldı.',
        'success'
      );
    } else {
      showToast('İşlem gerçekleştirilemedi.', 'error');
    }
  };


  // Modal State'leri
  const [selectedConversion, setSelectedConversion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


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
                onTogglePublic={handleTogglePublic}
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
      {isModalOpen && (
        <HistoryDetailModal
          conversion={selectedConversion}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

