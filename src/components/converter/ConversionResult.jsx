/**
 * @fileoverview Dönüşüm sonucu bileşeni.
 * AI'ın ürettiği karakter açıklamasını gösterir.
 * Yükleme, başarı ve hata durumlarını destekler.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdDownload, MdRefresh, MdAutoAwesome } from 'react-icons/md';
import Card from 'components/card';
import MinecraftSkinPreview from './MinecraftSkinPreview';
import { parseConversionDescription } from 'lib/skinDataParser';
import ComparisonSlider from './ComparisonSlider';
import { useTranslation } from 'contexts/TranslationContext';

/**
 * Tarih formatlama yardımcı fonksiyonu.
 * @param {string} dateStr - ISO tarih string'i
 * @returns {string} Formatlanmış tarih
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

/**
 * Dönüşüm sonucu bileşeni.
 * @param {Object} props
 * @param {Object|null} props.result - Dönüşüm sonucu
 * @param {string} props.result.description - AI açıklaması
 * @param {string} props.result.status - Durum (pending, processing, done, error)
 * @param {string} props.result.created_at - Oluşturulma tarihi
 * @param {string} props.result.theme_label - Tema adı
 * @param {boolean} props.isConverting - Dönüşüm devam ediyor mu
 * @param {Function} props.onRetry - Yeniden dönüştürme callback'i
 * @param {string|null} props.errorMessage - Hata mesajı
 */
export default function ConversionResult({
  result,
  isConverting,
  onRetry,
  errorMessage,
}) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('slider');

  // Dönüşüm devam ediyorsa loading göster
  if (isConverting) {
    return (
      <Card extra="p-6 animate-pulse">
        <div className="flex flex-col items-center justify-center py-8">
          {/* Animasyonlu spinner */}
          <div className="relative mb-6">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-navy-700" />
            <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-brand-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MdAutoAwesome className="h-6 w-6 text-brand-500 animate-pulse" />
            </div>
          </div>

          <h4 className="mb-2 text-lg font-bold text-navy-700 dark:text-white">
            {t('result.loadingTitle')}
          </h4>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t('result.loadingDesc')}
          </p>

          {/* Progress bar efekti */}
          <div className="mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-navy-700">
            <div
              className="h-full animate-pulse rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              style={{
                animation: 'progress 2s ease-in-out infinite',
                width: '60%',
              }}
            />
          </div>
        </div>
      </Card>
    );
  }

  // Hata durumu
  if (errorMessage) {
    return (
      <Card extra="p-6 border-2 border-red-200 dark:border-red-500/30">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h4 className="mb-2 text-lg font-bold text-navy-700 dark:text-white">
            {t('converter.toast.error')}
          </h4>
          <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-600"
          >
            <MdRefresh className="h-5 w-5" />
            {t('result.btnRetry')}
          </button>
        </div>
      </Card>
    );
  }

  // Sonuç yoksa gösterme
  if (!result) return null;

  const { descriptionText: parsedDesc, skinData, skinImageUrl, isMinecraft: parsedIsMinecraft } =
    parseConversionDescription(
      result.result_description || result.description || '',
      result.theme_slug
    );
  let descriptionText = parsedDesc;

  /**
   * Açıklamayı .txt olarak indirir.
   */
  const handleDownload = () => {
    const content = `GameSkinAI - ${result.theme_label || 'Dönüşüm'} Sonucu\n${'='.repeat(50)}\n\nTarih: ${formatDate(result.created_at)}\nTema: ${result.theme_label}\n\n--- Karakter Açıklaması ---\n\n${descriptionText}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gameskinai_${result.theme_slug || 'result'}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * AI tarafından üretilen görseli indirir.
   */
  const handleDownloadImage = async () => {
    if (!result.result_image_url) return;
    try {
      if (result.result_image_url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = result.result_image_url;
        link.download = `gameskin_${result.theme_slug || 'result'}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      const response = await fetch(result.result_image_url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `gameskin_${result.theme_slug || 'result'}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Görsel indirme hatası, yeni sekmede açılıyor:', err);
      window.open(result.result_image_url, '_blank');
    }
  };

  const isMinecraft = parsedIsMinecraft;

  return (
    <Card extra="overflow-hidden">
      {/* Başlık alanı - gradient bar */}
      <div className="bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <MdAutoAwesome className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {t('result.successTitle')}
              </h4>
              <p className="text-sm text-white/70">
                {result.theme_label}
                {result.created_at && ` • ${formatDate(result.created_at)}`}
              </p>
            </div>
          </div>

          {/* Durum badge */}
          <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-white">
            ✓ {t('converter.uploaded')}
          </span>
        </div>
      </div>

      {/* Sonuç içeriği */}
      <div className="p-6">
        {/* Görsel Modu Seçici */}
        {result.original_image_url && result.result_image_url && (
          <div className="mb-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                viewMode === 'slider'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
              }`}
            >
              {t('result.viewSlider')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                viewMode === 'split'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
              }`}
            >
              {t('result.viewSplit')}
            </button>
          </div>
        )}

        {/* Görsel Karşılaştırma Alanı */}
        {(result.original_image_url || result.result_image_url) && (
          <>
            {viewMode === 'slider' && result.original_image_url && result.result_image_url ? (
              <div className="mb-6">
                {isMinecraft ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
                    <div className="md:col-span-2 max-w-xl mx-auto w-full">
                      <ComparisonSlider
                        beforeImage={result.original_image_url}
                        afterImage={result.result_image_url}
                      />
                    </div>
                    <div className="md:col-span-1 flex flex-col justify-center">
                      <MinecraftSkinPreview skinData={skinData} skinImageUrl={skinImageUrl} />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto w-full">
                    <ComparisonSlider
                      beforeImage={result.original_image_url}
                      afterImage={result.result_image_url}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className={`mb-6 grid grid-cols-1 gap-6 ${isMinecraft ? 'lg:grid-cols-3 md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {/* Orijinal Görsel */}
                {result.original_image_url && (
                  <div className="flex flex-col items-center rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-800">
                    <span className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('uploader.originalPhoto')}
                    </span>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-navy-900">
                      <img
                        src={result.original_image_url}
                        alt="Orijinal"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Üretilen Görsel */}
                {result.result_image_url && (
                  <div className="flex flex-col items-center rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-800">
                    <span className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-brand-500">
                      {t('result.aiCharacter')}
                    </span>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-navy-900">
                      <img
                        src={result.result_image_url}
                        alt="Dönüştürülmüş Karakter"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Minecraft Oyuncu Skini (Eğer Minecraft teması ise) */}
                {isMinecraft && (
                  <MinecraftSkinPreview skinData={skinData} skinImageUrl={skinImageUrl} />
                )}
              </div>
            )}
          </>
        )}

        <div className="mb-6 rounded-xl bg-lightPrimary p-4 dark:bg-navy-700">
          <h5 className="mb-2 text-sm font-bold text-navy-700 dark:text-white">
            {t('result.descTitle')}
          </h5>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-700 dark:text-gray-300">
            {descriptionText}
          </p>
        </div>

        {/* Aksiyon butonları */}
        <div className="flex flex-wrap gap-3">
          {result.result_image_url && (
            <button
              type="button"
              onClick={handleDownloadImage}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600 hover:shadow-lg"
            >
              <MdDownload className="h-5 w-5" />
              {t('result.btnDownloadImage')}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-600 hover:shadow-lg"
          >
            <MdDownload className="h-5 w-5" />
            {t('result.btnDownloadText')}
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-medium text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            <MdRefresh className="h-5 w-5" />
            {t('result.btnRetry')}
          </button>
        </div>
      </div>
    </Card>
  );
}

ConversionResult.propTypes = {
  result: PropTypes.shape({
    description: PropTypes.string,
    result_description: PropTypes.string,
    status: PropTypes.string,
    created_at: PropTypes.string,
    theme_label: PropTypes.string,
    theme_slug: PropTypes.string,
    original_image_url: PropTypes.string,
    result_image_url: PropTypes.string,
  }),
  isConverting: PropTypes.bool,
  onRetry: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

ConversionResult.defaultProps = {
  result: null,
  isConverting: false,
  errorMessage: null,
};
