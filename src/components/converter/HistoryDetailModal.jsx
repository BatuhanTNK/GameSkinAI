/**
 * @fileoverview Geçmiş dönüşüm detay modal bileşeni.
 * Dönüşüm detaylarını, karşılaştırma slider'ını, 2D skin ve indirme/paylaşma butonlarını içerir.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ComparisonSlider from './ComparisonSlider';
import MinecraftSkinPreview from './MinecraftSkinPreview';
import ShareButtons from './ShareButtons';
import { parseConversionDescription } from 'lib/skinDataParser';
import { useTranslation } from 'contexts/TranslationContext';

export default function HistoryDetailModal({ conversion, onClose }) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('slider');

  if (!conversion) return null;

  const { descriptionText, skinData, skinImageUrl, isMinecraft } = parseConversionDescription(
    conversion.result_description || '',
    conversion.theme_slug
  );

  const handleDownloadImage = async () => {
    try {
      const url = conversion.result_image_url;
      if (!url) return;
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `gameskin_${conversion.theme_slug || 'result'}_${conversion.id.substring(0, 8)}.jpg`;
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
      link.download = `gameskin_${conversion.theme_slug || 'result'}_${conversion.id.substring(0, 8)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (conversion.result_image_url) {
        window.open(conversion.result_image_url, '_blank');
      }
    }
  };

  const handleDownloadText = () => {
    const content = `GameSkinAI - ${conversion.theme_label} Sonucu\n${'='.repeat(50)}\n\n--- Karakter Açıklaması ---\n\n${descriptionText}`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl transition-all duration-300 dark:bg-navy-800">
        {/* Modal Başlık */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-white/10">
          <div>
            <h3 className="text-xl font-bold text-navy-700 dark:text-white">
              {conversion.theme_label}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Intl.DateTimeFormat('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(conversion.created_at))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Modal İçerik (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Görsel Modu Seçici */}
          {conversion.original_image_url && conversion.result_image_url && (
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

          {/* Resim Karşılaştırma */}
          {(conversion.original_image_url || conversion.result_image_url) && (
            <>
              {viewMode === 'slider' && conversion.original_image_url && conversion.result_image_url ? (
                <div className="mb-6">
                  {isMinecraft ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
                      <div className="mx-auto w-full max-w-xl md:col-span-2">
                        <ComparisonSlider
                          beforeImage={conversion.original_image_url}
                          afterImage={conversion.result_image_url}
                        />
                      </div>
                      <div className="flex flex-col justify-center md:col-span-1">
                        <MinecraftSkinPreview skinData={skinData} skinImageUrl={skinImageUrl} />
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto w-full max-w-xl">
                      <ComparisonSlider
                        beforeImage={conversion.original_image_url}
                        afterImage={conversion.result_image_url}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className={`mb-6 grid grid-cols-1 gap-6 ${isMinecraft ? 'lg:grid-cols-3 md:grid-cols-3' : 'md:grid-cols-2'}`}>
                  {conversion.original_image_url && (
                    <div className="flex flex-col items-center rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-900/50">
                      <span className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {t('uploader.originalPhoto')}
                      </span>
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-navy-900">
                        <img
                          src={conversion.original_image_url}
                          alt="Orijinal"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {conversion.result_image_url && (
                    <div className="flex flex-col items-center rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-900/50">
                      <span className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-500">
                        {t('result.aiCharacter')}
                      </span>
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-navy-900">
                        <img
                          src={conversion.result_image_url}
                          alt="AI Karakteri"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {isMinecraft && (
                    <MinecraftSkinPreview skinData={skinData} skinImageUrl={skinImageUrl} />
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
              {descriptionText}
            </p>
          </div>

          {/* ShareButtons */}
          <div className="mt-4 flex items-center justify-between border-b border-t border-gray-100 py-3 dark:border-white/10">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Paylaş:</span>
            <ShareButtons title={conversion.theme_label} text={descriptionText} />
          </div>
        </div>

        {/* Modal Butonlar */}
        <div className="flex flex-wrap gap-3 border-t border-gray-100 bg-gray-50 p-6 dark:border-white/10 dark:bg-navy-900/30">
          {conversion.result_image_url && (
            <button
              type="button"
              onClick={handleDownloadImage}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600"
            >
              {t('result.btnDownloadImage')}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadText}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-600"
          >
            {t('result.btnDownloadText')}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

HistoryDetailModal.propTypes = {
  conversion: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

HistoryDetailModal.defaultProps = {
  conversion: null,
};
