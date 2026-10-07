import React from 'react';
import { MdLanguage } from 'react-icons/md';
import { useTranslation } from 'contexts/TranslationContext';

/**
 * Reusable Language Switcher component (TR / EN pill selector).
 * @param {Object} props
 * @param {string} [props.size='md'] - 'sm' or 'md'
 * @param {string} [props.className] - Extra container styling
 */
export default function LanguageSwitcher({ size = 'md', className = '' }) {
  const { lang, changeLanguage } = useTranslation();

  const isSmall = size === 'sm';
  const paddingBtn = isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <div
      className={`flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-navy-800 border border-gray-200/60 dark:border-navy-700/80 ${className}`}
    >
      <MdLanguage className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
      <button
        type="button"
        onClick={() => changeLanguage('tr')}
        className={`rounded-lg ${paddingBtn} font-extrabold transition-all duration-200 ${
          lang === 'tr'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className={`rounded-lg ${paddingBtn} font-extrabold transition-all duration-200 ${
          lang === 'en'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}
