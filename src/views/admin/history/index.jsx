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
import { MdHistory, MdAutoAwesome } from 'react-icons/md';

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
  const [toast, setToast] = useState(null);

  /**
   * Toast bildirim gösterir.
   */
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
    // İleride detay modal açılabilir
    // Şimdilik sonuç açıklamasını indirme olarak kullan
    const content = `GameSkinAI - ${conversion.theme_label} Sonucu\n${'='.repeat(50)}\n\n${conversion.result_description || 'Açıklama mevcut değil.'}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gameskinai_${conversion.theme_slug}_${conversion.id.substring(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-brand-500 text-white'
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-navy-700 dark:text-white">
            <MdHistory className="h-8 w-8" />
            Geçmişim
          </h2>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            {loading
              ? 'Yükleniyor...'
              : `Toplam ${conversions.length} dönüşüm`}
          </p>
        </div>

        {/* Yenile butonu */}
        {!loading && conversions.length > 0 && (
          <button
            type="button"
            onClick={fetchConversions}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            Yenile
          </button>
        )}
      </div>

      {/* Hata durumu */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={fetchConversions}
            className="ml-auto text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Tekrar Dene
          </button>
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

      {/* Boş state */}
      {!loading && conversions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[20px] bg-white px-6 py-16 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
            <MdAutoAwesome className="h-10 w-10 text-brand-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-navy-700 dark:text-white">
            Henüz dönüşüm yok
          </h3>
          <p className="mb-6 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
            İlk dönüşümünüzü yaparak başlayın! Fotoğrafınızı yükleyin ve bir
            oyun teması seçin.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.CONVERTER)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-brand-500 hover:to-brand-700 hover:shadow-xl"
          >
            <MdAutoAwesome className="h-5 w-5" />
            İlk Dönüşümünü Yap
          </button>
        </div>
      )}

      {/* Kart Listesi */}
      {!loading && conversions.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {conversions.map((conversion) => (
            <HistoryCard
              key={conversion.id}
              conversion={conversion}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
