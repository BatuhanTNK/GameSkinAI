/**
 * @fileoverview Tema seçim bileşeni.
 * THEMES dizisini grid olarak gösterir, seçili temayı vurgular.
 * Hover animasyonları ve dark mode desteği içerir.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  FaCube,
  FaGamepad,
  FaUserAstronaut,
  FaDragon,
  FaSeedling,
  FaCrosshairs,
  FaCar,
  FaCircle,
  FaShieldAlt,
} from 'react-icons/fa';
import { THEMES } from 'lib/themes';

/** İkon isimlerini React bileşenlerine eşler */
const ICON_MAP = {
  FaCube: FaCube,
  FaGamepad: FaGamepad,
  FaUserAstronaut: FaUserAstronaut,
  FaDragon: FaDragon,
  FaSeedling: FaSeedling,
  FaCrosshairs: FaCrosshairs,
  FaCar: FaCar,
  FaCircle: FaCircle,
  FaShieldAlt: FaShieldAlt,
};

/** Tema renk sınıflarını eşler */
const COLOR_MAP = {
  green: {
    bg: 'bg-green-50 dark:bg-green-500/10',
    border: 'border-green-500',
    icon: 'text-green-500',
    selectedBg: 'bg-green-500/10 dark:bg-green-500/20',
    gradient: 'from-green-400 to-emerald-500',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-500',
    icon: 'text-red-500',
    selectedBg: 'bg-red-500/10 dark:bg-red-500/20',
    gradient: 'from-red-400 to-rose-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-500',
    icon: 'text-purple-500',
    selectedBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    gradient: 'from-purple-400 to-violet-500',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    border: 'border-yellow-500',
    icon: 'text-yellow-500',
    selectedBg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    gradient: 'from-yellow-400 to-amber-500',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-500',
    icon: 'text-teal-500',
    selectedBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    gradient: 'from-teal-400 to-cyan-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-500',
    icon: 'text-blue-500',
    selectedBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    gradient: 'from-blue-400 to-indigo-500',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-500',
    icon: 'text-orange-500',
    selectedBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    gradient: 'from-orange-400 to-amber-500',
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
  const themesToDisplay = themes && themes.length > 0 ? themes : THEMES;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {themesToDisplay.map((theme) => {
        const IconComponent = ICON_MAP[theme.icon];
        const colors = COLOR_MAP[theme.color] || COLOR_MAP.purple;
        const isSelected = selectedTheme === theme.slug;

        return (
          <button
            key={theme.slug}
            id={`theme-${theme.slug}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(theme.slug)}
            className={`group relative flex flex-col items-start rounded-[20px] border-2 p-5 text-left transition-all duration-300 ${
              isSelected
                ? `${colors.border} ${colors.selectedBg} shadow-lg ring-2 ring-offset-2 dark:ring-offset-navy-800`
                : 'border-gray-200 bg-white hover:shadow-lg dark:border-white/10 dark:bg-navy-800'
            } ${
              disabled
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:-translate-y-1'
            }`}
            style={
              isSelected
                ? { ringColor: colors.border?.replace('border-', '') }
                : {}
            }
          >
            {/* Seçim göstergesi */}
            {isSelected && (
              <div className="absolute top-3 right-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${colors.gradient}`}
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

            {/* İkon */}
            <div
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
            >
              {IconComponent && <IconComponent className="h-6 w-6" />}
            </div>

            {/* Tema Adı */}
            <h3 className="mb-1 text-base font-bold text-navy-700 dark:text-white">
              {theme.label}
            </h3>

            {/* Açıklama */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {theme.description}
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
