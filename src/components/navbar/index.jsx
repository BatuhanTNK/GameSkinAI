/**
 * @fileoverview Navbar bileşeni.
 * Sayfa başlığı, arama, dark mode toggle ve kullanıcı profil dropdown'ı içerir.
 */

import React from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { MdPerson, MdAutoAwesome, MdHistory, MdLogout } from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";
import { useDarkMode } from "hooks/useDarkMode";
import LanguageSwitcher from "components/common/LanguageSwitcher";

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const [darkmode, toggleDarkMode] = useDarkMode();
  const { user, signOut } = useAuth();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    t('common.user');

  const handleSignOut = async () => {
    await signOut();
    navigate(`/${lang}/auth/sign-in`);
  };

  const translatedBrandText = t(`nav.${brandText}`) !== `nav.${brandText}` ? t(`nav.${brandText}`) : brandText;

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/40 p-2.5 backdrop-blur-xl dark:bg-navy-800/40 border border-white/20 dark:border-navy-700/50 shadow-md">
      <div className="ml-[6px]">
        <div className="h-6 pt-1 flex items-center gap-1.5 text-xs text-navy-700 dark:text-gray-300">
          <Link
            className="font-medium hover:underline text-gray-500 dark:text-gray-400"
            to={`/${lang}`}
          >
            {t('nav.pages')}
          </Link>
          <span>/</span>
          <span className="font-semibold capitalize text-brand-500 dark:text-brand-400">
            {translatedBrandText}
          </span>
        </div>
        <h1 className="shrink text-2xl md:text-3xl font-bold capitalize text-navy-700 dark:text-white mt-1">
          {translatedBrandText}
        </h1>
      </div>

      <div className="relative mt-[3px] flex h-[52px] items-center justify-end gap-2 sm:gap-3 rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-shadow-500/10 dark:!bg-navy-800/90 dark:shadow-none border border-gray-100 dark:border-navy-700">
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>

        {/* Dil Seçici */}
        <LanguageSwitcher size="sm" />

        {/* Dark Mode Toggle */}
        <button
          type="button"
          className="p-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-200 dark:hover:bg-navy-600 transition-colors"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          {darkmode ? (
            <RiSunFill className="h-4 w-4 text-yellow-400" />
          ) : (
            <RiMoonFill className="h-4 w-4 text-gray-600 dark:text-white" />
          )}
        </button>

        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-blue-600 text-white shadow-md shadow-brand-500/20 hover:scale-105 transition-transform">
              <MdPerson className="h-5 w-5" />
            </div>
          }
          children={
            <div className="flex w-60 flex-col justify-start rounded-2xl bg-white p-3 shadow-2xl border border-gray-100 dark:border-navy-700 dark:!bg-navy-800 dark:text-white">
              <div className="p-2 border-b border-gray-100 dark:border-navy-700 mb-2">
                <p className="text-xs font-bold text-navy-700 dark:text-white truncate">
                  {displayName}
                </p>
                {user?.email && (
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <button
                  onClick={() => navigate(`/${lang}/admin/converter`)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium text-navy-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-navy-700 hover:text-brand-500 transition-colors"
                >
                  <MdAutoAwesome className="h-4 w-4 text-brand-500" />
                  <span>{t('nav.converter')}</span>
                </button>
                <button
                  onClick={() => navigate(`/${lang}/admin/history`)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium text-navy-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-navy-700 hover:text-brand-500 transition-colors"
                >
                  <MdHistory className="h-4 w-4 text-brand-500" />
                  <span>{t('nav.history')}</span>
                </button>
                <button
                  onClick={() => navigate(`/${lang}/admin/profile`)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium text-navy-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-navy-700 hover:text-brand-500 transition-colors"
                >
                  <MdPerson className="h-4 w-4 text-brand-500" />
                  <span>{t('nav.profile')}</span>
                </button>

                <div className="h-px bg-gray-100 dark:bg-navy-700 my-1" />

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <MdLogout className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          }
          classNames={"py-2 top-10 -right-2 w-max z-50"}
        />
      </div>
    </nav>
  );
};

export default Navbar;
