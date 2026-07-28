/**
 * @fileoverview Tema seçim bileşeni.
 * THEMES dizisini grid olarak gösterir, seçili temayı vurgular.
 * Orijinal tam renkli vektör oyun logolarını (getGameLogo) gösterir.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FaGamepad } from 'react-icons/fa';
import { THEMES } from 'lib/themes';
import { useTranslation } from 'contexts/TranslationContext';
import { getGameLogo } from './GameLogos';

/** Tema renk sınıflarını eşler */
const COLOR_MAP = {
  green: {
    border: 'border-green-500',
    selectedBg: 'bg-green-500/10 dark:bg-green-500/20',
    badge: 'from-green-500 to-emerald-600',
  },
  red: {
    border: 'border-red-500',
    selectedBg: 'bg-red-500/10 dark:bg-red-500/20',
    badge: 'from-red-500 to-rose-600',
  },
  purple: {
    border: 'border-purple-500',
    selectedBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badge: 'from-purple-500 to-violet-600',
  },
  yellow: {
    border: 'border-yellow-500',
    selectedBg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    badge: 'from-yellow-400 to-amber-500',
  },
  teal: {
    border: 'border-teal-500',
    selectedBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    badge: 'from-teal-400 to-cyan-500',
  },
  blue: {
    border: 'border-blue-500',
    selectedBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badge: 'from-blue-500 to-indigo-600',
  },
  orange: {
    border: 'border-orange-500',
    selectedBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    badge: 'from-orange-500 to-amber-600',
  },
  amber: {
    border: 'border-amber-500',
    selectedBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badge: 'from-amber-500 to-yellow-600',
  },
  pink: {
    border: 'border-pink-500',
    selectedBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    badge: 'from-pink-500 to-rose-600',
  },
  slate: {
    border: 'border-slate-500',
    selectedBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    badge: 'from-slate-700 to-gray-900',
  },
  emerald: {
    border: 'border-emerald-500',
    selectedBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badge: 'from-emerald-700 to-green-900',
  },
};

/**
 * Tema seçim kartları bileşeni.
 * @param {Object} props
 * @param {string|null} props.selectedTheme - Seçili tema slug'ı
 * @param {Function} props.onSelect - Tema seçim callback'i
 * @param {boolean} props.disabled - Seçim devre dışı mı
 */
export default function ThemeSelector({ selectedTheme, onSelect, disabled, themes = [] }) {
  const { lang } = useTranslation();
  const themesToDisplay = themes && themes.length > 0 ? themes : THEMES;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {themesToDisplay.map((theme) => {
        const gameLogo = getGameLogo(theme.slug, "h-11 w-11");
        const colors = COLOR_MAP[theme.color] || COLOR_MAP.purple;
        const isSelected = selectedTheme === theme.slug;
        const descriptionText = lang === 'en' ? (theme.description_en || theme.description) : theme.description;

        return (
          <button
            key={theme.slug}
            id={`theme-${theme.slug}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(theme.slug)}
            className={`group relative flex flex-col items-start rounded-[22px] border-2 p-5 text-left transition-all duration-300 ${
              isSelected
                ? `${colors.border} ${colors.selectedBg} shadow-xl ring-2 ring-offset-2 dark:ring-offset-navy-800`
                : 'border-gray-200/80 bg-white hover:shadow-xl hover:border-gray-300 dark:border-white/10 dark:bg-navy-800'
            } ${
              disabled
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:-translate-y-1'
            }`}
          >
            {/* Seçim göstergesi */}
            {isSelected && (
              <div className="absolute top-3 right-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${colors.badge}`}
                >
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Orijinal Oyun Logosu */}
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50/80 dark:bg-navy-700/60 p-1 shadow-sm border border-gray-100 dark:border-white/5 transition-transform duration-300 group-hover:scale-110"
            >
              {gameLogo || <FaGamepad className="h-8 w-8 text-brand-500" />}
            </div>

            {/* Tema Adı */}
            <h3 className="mb-1 text-base font-bold text-navy-700 dark:text-white">
              {theme.label}
            </h3>

            {/* Açıklama */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {descriptionText}
            </p>
          </button>
        );
      })}
    </div>
  );
}

ThemeSelector.propTypes = {
  selectedTheme: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  themes: PropTypes.array,
};

ThemeSelector.defaultProps = {
  selectedTheme: null,
  disabled: false,
  themes: [],
};
