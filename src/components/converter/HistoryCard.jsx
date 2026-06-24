/**
 * @fileoverview Geçmiş dönüşüm kartı bileşeni.
 * Dönüşüm geçmişi listesinde her bir öğeyi temsil eder.
 * Tema adı, tarih, açıklama önizlemesi ve silme butonu içerir.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdDelete, MdVisibility } from 'react-icons/md';
import {
  FaCube,
  FaGamepad,
  FaUserAstronaut,
  FaDragon,
  FaSeedling,
} from 'react-icons/fa';
import Card from 'components/card';
import { CONVERSION_STATUS } from 'lib/constants';

/** Tema slug'ını ikon bileşenine eşler */
const THEME_ICON_MAP = {
  minecraft: FaCube,
  roblox: FaGamepad,
  'among-us': FaUserAstronaut,
  'pixel-rpg': FaDragon,
  stardew: FaSeedling,
};

/** Tema slug'ını renk sınıfına eşler */
const THEME_COLOR_MAP = {
  minecraft: 'from-green-400 to-emerald-500',
  roblox: 'from-red-400 to-rose-500',
  'among-us': 'from-purple-400 to-violet-500',
  'pixel-rpg': 'from-yellow-400 to-amber-500',
  stardew: 'from-teal-400 to-cyan-500',
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

/** Durum etiketleri */
const STATUS_LABELS = {
  [CONVERSION_STATUS.PENDING]: 'Bekliyor',
  [CONVERSION_STATUS.PROCESSING]: 'İşleniyor',
  [CONVERSION_STATUS.DONE]: 'Tamamlandı',
  [CONVERSION_STATUS.ERROR]: 'Hata',
};

/**
 * Tarih formatlama yardımcı fonksiyonu.
 * @param {string} dateStr - ISO tarih string'i
 * @returns {string} Formatlanmış tarih
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

/**
 * Geçmiş dönüşüm kartı bileşeni.
 * @param {Object} props
 * @param {Object} props.conversion - Dönüşüm verisi
 * @param {Function} props.onDelete - Silme callback'i
 * @param {Function} props.onView - Detay görüntüleme callback'i
 */
export default function HistoryCard({ conversion, onDelete, onView }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const IconComponent = THEME_ICON_MAP[conversion.theme_slug] || FaCube;
  const gradientColor =
    THEME_COLOR_MAP[conversion.theme_slug] || 'from-brand-400 to-brand-600';

  const description =
    conversion.result_description || 'Açıklama mevcut değil.';
  const shortDescription =
    description.length > 120
      ? description.substring(0, 120) + '...'
      : description;

  /**
   * Silme işleyicisi.
   */
  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(conversion.id);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <Card extra="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Gradient üst bar */}
      <div
        className={`flex items-center gap-3 bg-gradient-to-r ${gradientColor} px-5 py-3`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <IconComponent className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">
            {conversion.theme_label}
          </h4>
          <p className="text-xs text-white/70">
            {formatDate(conversion.created_at)}
          </p>
        </div>
        {/* Durum badge */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_STYLES[conversion.status] || STATUS_STYLES.done
          }`}
        >
          {STATUS_LABELS[conversion.status] || 'Tamamlandı'}
        </span>
      </div>

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
            {showFull ? 'Daha az göster' : 'Devamını oku'}
          </button>
        )}

        {/* Aksiyon butonları */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
          {onView && (
            <button
              type="button"
              onClick={() => onView(conversion)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-lightPrimary dark:text-gray-400 dark:hover:bg-navy-700"
            >
              <MdVisibility className="h-4 w-4" />
              Detay
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
            {isDeleting ? 'Siliniyor...' : 'Sil'}
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
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func,
};

HistoryCard.defaultProps = {
  onView: null,
};
