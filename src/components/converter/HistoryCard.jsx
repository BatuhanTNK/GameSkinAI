/**
 * @fileoverview Geçmiş dönüşüm kartı bileşeni.
 * Dönüşüm geçmişi listesinde her bir öğeyi temsil eder.
 * Tema adı, tarih, açıklama önizlemesi ve silme butonu içerir.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdDelete, MdVisibility } from 'react-icons/md';
import { FaCube } from 'react-icons/fa';
import Card from 'components/card';
import { CONVERSION_STATUS } from 'lib/constants';
import { parseConversionDescription } from 'lib/skinDataParser';
import { useTranslation } from 'contexts/TranslationContext';
import { getGameLogo } from './GameLogos';

/** Tema slug'ını renk sınıfına eşler */
const THEME_COLOR_MAP = {
  minecraft: 'from-green-500 to-emerald-600',
  roblox: 'from-red-500 to-rose-600',
  'among-us': 'from-purple-500 to-violet-600',
  'pixel-rpg': 'from-yellow-500 to-amber-600',
  stardew: 'from-teal-500 to-cyan-600',
  fortnite: 'from-blue-500 to-indigo-600',
  'gta-sa': 'from-orange-500 to-amber-600',
  pokemon: 'from-red-500 to-rose-600',
  valorant: 'from-purple-500 to-indigo-600',
  'brawl-stars': 'from-purple-600 to-indigo-700',
  'clash-royale': 'from-amber-500 to-yellow-600',
  lol: 'from-blue-600 to-cyan-700',
  apex: 'from-red-600 to-orange-700',
  lego: 'from-yellow-400 to-amber-500',
  'fall-guys': 'from-pink-500 to-rose-600',
  genshin: 'from-teal-400 to-emerald-600',
  cyberpunk: 'from-yellow-400 to-cyan-500',
  witcher: 'from-slate-700 to-gray-900',
  cs2: 'from-emerald-700 to-green-900',
};

/** Durum badge renkleri */
const STATUS_STYLES = {
  [CONVERSION_STATUS.PENDING]:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  [CONVERSION_STATUS.PROCESSING]:
    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  [CONVERSION_STATUS.DONE]:
    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  [CONVERSION_STATUS.ERROR]:
    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

/**
 * Tarih formatlama yardımcı fonksiyonu.
 */
const formatDate = (dateStr, lang = 'tr') => {
  if (!dateStr) return '';
  const dateLocale = lang === 'en' ? 'en-US' : 'tr-TR';
  return new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

/**
 * Geçmiş dönüşüm kartı bileşeni.
 */
export default function HistoryCard({ conversion, onDelete, onView, onTogglePublic }) {
  const { t, lang } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const gameLogo = getGameLogo(conversion.theme_slug, "h-5 w-5");
  const gradientColor =
    THEME_COLOR_MAP[conversion.theme_slug] || 'from-brand-400 to-brand-600';

  const { descriptionText } = parseConversionDescription(
    conversion.result_description || '',
    conversion.theme_slug
  );
  const description = descriptionText || 'Açıklama mevcut değil.';

  const shortDescription =
    description.length > 120
      ? description.substring(0, 120) + '...'
      : description;

  const displayImage = conversion.result_image_url || conversion.original_image_url;

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(conversion.id);
    } catch (err) {
      console.error('Silme işlemi başarısız:', err);
      setIsDeleting(false);
    }
  };

  return (
    <Card extra="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Gradient üst bar */}
      <div
        className={`flex items-center gap-3 bg-gradient-to-r ${gradientColor} px-5 py-3`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          {gameLogo || <FaCube className="h-4 w-4 text-white" />}
        </div>
        <div className="flex-1 truncate">
          <h4 className="text-sm font-bold text-white truncate">
            {conversion.theme_label}
          </h4>
          <p className="text-xs text-white/70">
            {formatDate(conversion.created_at, lang)}
          </p>
        </div>
        {/* Durum badge */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_STYLES[conversion.status] || STATUS_STYLES.done
          }`}
        >
          {t('history.statusCompleted')}
        </span>
      </div>

      {/* Görsel Önizleme */}
      {displayImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-navy-900 border-b border-gray-100 dark:border-white/5">
          <img
            src={displayImage}
            alt={conversion.theme_label}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* İçerik */}
      <div className="p-5">
        <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {showFull ? description : shortDescription}
        </p>

        {description.length > 120 && (
          <button
            type="button"
            onClick={() => setShowFull(!showFull)}
            className="mb-4 text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            {showFull ? t('history.showLess') : t('history.readMore')}
          </button>
        )}

        {/* Aksiyon butonları */}
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
          {onView && (
            <button
              type="button"
              onClick={() => onView(conversion)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-lightPrimary dark:text-gray-400 dark:hover:bg-navy-700"
            >
              <MdVisibility className="h-4 w-4" />
              {t('history.detail')}
            </button>
          )}

          {onTogglePublic && (
            <button
              type="button"
              onClick={() => onTogglePublic(conversion.id, conversion.is_public)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                conversion.is_public
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300'
              }`}
            >
              <span>{conversion.is_public ? `✓ ${t('marketplace.isPublic')}` : t('marketplace.makePublic')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-all duration-200 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
          >
            {isDeleting ? (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <MdDelete className="h-4 w-4" />
            )}
            {isDeleting ? t('history.deleting') : t('common.delete')}
          </button>
        </div>
      </div>
    </Card>
  );
}

HistoryCard.propTypes = {
  conversion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    theme_slug: PropTypes.string.isRequired,
    theme_label: PropTypes.string.isRequired,
    result_description: PropTypes.string,
    status: PropTypes.string,
    created_at: PropTypes.string,
    original_image_url: PropTypes.string,
    result_image_url: PropTypes.string,
    is_public: PropTypes.bool,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func,
  onTogglePublic: PropTypes.func,
};

HistoryCard.defaultProps = {
  onView: null,
  onTogglePublic: null,
};
