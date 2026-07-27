/**
 * @fileoverview Yeniden tasarlanmış, ultra-modern Landing Page Navbar bileşeni.
 * Yüzen cam efektli (floating glassmorphism) şık kapsayıcı, kısa menü bağlantıları, 
 * dil seçici, dark mode ve Hızlı Kullanıcı Profil Dropdown Açılır Menüsü.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  MdAutoAwesome, 
  MdLanguage, 
  MdMenu, 
  MdClose, 
  MdPerson, 
  MdLogin,
  MdHistory,
  MdLogout
} from "react-icons/md";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";
import Dropdown from "components/dropdown";

const LandingNavbar = () => {
  const { user, signOut } = useAuth();
  const { t, lang, changeLanguage } = useTranslation();
  const navigate = useNavigate();
  const [darkmode, setDarkmode] = useState(
    document.body.classList.contains("dark")
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    if (darkmode) {
      document.body.classList.remove("dark");
      setDarkmode(false);
    } else {
      document.body.classList.add("dark");
      setDarkmode(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(`/${lang}/auth/sign-in`);
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    t('common.user');

  const navLinks = [
    { name: t('landing.menuFeatures'), href: "#features" },
    { name: t('landing.menuHowItWorks'), href: "#how-it-works" },
    { name: t('landing.menuShowcase'), href: "#showcase" },
    { name: t('landing.menuFaq'), href: "#faq" },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-navy-700/80 shadow-2xl shadow-shadow-500/15 py-2.5 px-6"
            : "bg-white/70 dark:bg-navy-900/70 backdrop-blur-md border border-white/40 dark:border-navy-800/60 shadow-lg shadow-shadow-500/5 py-3 px-6"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Area */}
          <Link to={`/${lang}`} className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform duration-200">
              <MdAutoAwesome className="h-6 w-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-navy-900" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black bg-gradient-to-r from-navy-700 via-brand-500 to-blue-600 dark:from-white dark:via-brand-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                  GameSkinAI
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-brand-50 dark:bg-navy-800 text-brand-500 border border-brand-200/60 dark:border-brand-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 tracking-wider uppercase -mt-0.5">
                Prompt Web Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-gray-100/60 dark:bg-navy-800/60 p-1.5 rounded-xl border border-gray-200/40 dark:border-navy-700/40">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-navy-700 hover:text-brand-500 dark:text-gray-200 dark:hover:text-white hover:bg-white dark:hover:bg-navy-700 transition-all duration-200 whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Dil Seçici (TR / EN Pill Switcher) */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-navy-800 p-1 border border-gray-200/60 dark:border-navy-700">
              <MdLanguage className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <button
                type="button"
                onClick={() => changeLanguage('tr')}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all duration-200 ${
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
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all duration-200 ${
                  lang === 'en'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700 border border-gray-200/60 dark:border-navy-700 transition-colors duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkmode ? <RiSunFill className="h-4 w-4 text-yellow-400" /> : <RiMoonFill className="h-4 w-4 text-gray-600 dark:text-white" />}
            </button>

            {/* User Auth Status Quick Profile Dropdown Menu */}
            {user ? (
              <Dropdown
                button={
                  <button
                    type="button"
                    className="p-2.5 rounded-xl text-white bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 shadow-md shadow-brand-500/20 transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] flex items-center justify-center cursor-pointer"
                    title={displayName}
                  >
                    <MdPerson className="h-4 w-4" />
                  </button>
                }
                classNames={"py-2 top-11 -right-2 w-60 z-50"}
              >
                <div className="flex w-60 flex-col rounded-2xl bg-white dark:bg-navy-800 p-3 shadow-2xl border border-gray-200/80 dark:border-navy-700 space-y-3">
                  {/* User Info Header */}
                  <div className="px-2 py-1.5 border-b border-gray-100 dark:border-navy-700">
                    <p className="text-xs font-bold text-navy-700 dark:text-white truncate">
                      {displayName}
                    </p>
                    {user?.email && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                    <span className="mt-1.5 inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                      ● Oturum Açık
                    </span>
                  </div>

                  {/* Quick Menu Links */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => navigate(`/${lang}/admin/converter`)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-navy-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-navy-700 hover:text-brand-500 dark:hover:text-white transition-colors text-left"
                    >
                      <MdAutoAwesome className="h-4 w-4 text-brand-500" />
                      <span>{t('nav.converter')}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/${lang}/admin/history`)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-navy-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-navy-700 hover:text-brand-500 dark:hover:text-white transition-colors text-left"
                    >
                      <MdHistory className="h-4 w-4 text-brand-500" />
                      <span>{t('nav.history')}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/${lang}/admin/profile`)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-navy-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-navy-700 hover:text-brand-500 dark:hover:text-white transition-colors text-left"
                    >
                      <MdPerson className="h-4 w-4 text-brand-500" />
                      <span>{t('nav.profile')}</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 dark:bg-navy-700" />

                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <MdLogout className="h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              </Dropdown>
            ) : (
              <button
                onClick={() => navigate(`/${lang}/auth/sign-in`)}
                title={t('auth.signInTitle')}
                className="p-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700 border border-gray-200/60 dark:border-navy-700 transition-colors duration-200 hover:text-brand-500 flex items-center justify-center"
              >
                <MdLogin className="h-4 w-4" />
              </button>
            )}

            {/* Main Studio CTA Button */}
            {user ? (
              <button
                onClick={() => navigate(`/${lang}/admin/converter`)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-500 via-blue-600 to-purple-600 hover:from-brand-600 hover:to-purple-700 shadow-lg shadow-brand-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 whitespace-nowrap"
              >
                <MdAutoAwesome className="h-4 w-4" />
                <span>{t('landing.btnGoToDashboard')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/${lang}/auth/sign-up`)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-500 via-blue-600 to-purple-600 hover:from-brand-600 hover:to-purple-700 shadow-lg shadow-brand-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  {t('landing.btnGetStarted')}
                </button>
              </div>
            )}

          </div>

          {/* Mobile Menu & Auth Quick Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <button
                onClick={() => navigate(`/${lang}/admin/converter`)}
                className="p-2 rounded-xl text-white bg-brand-500"
                title={displayName}
              >
                <MdPerson className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/${lang}/auth/sign-in`)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-navy-800"
                title={t('auth.signInTitle')}
              >
                <MdLogin className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-navy-800"
            >
              {darkmode ? <RiSunFill className="h-4 w-4 text-yellow-400" /> : <RiMoonFill className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-navy-700 dark:text-white bg-gray-100 dark:bg-navy-800"
            >
              {mobileMenuOpen ? <MdClose className="h-6 w-6" /> : <MdMenu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 max-w-7xl mx-auto rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border border-gray-200 dark:border-navy-700 p-5 shadow-2xl space-y-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-navy-700 dark:text-gray-200 hover:text-brand-500 py-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="h-px bg-gray-200 dark:bg-navy-800 my-2" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-navy-800">
              <MdLanguage className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <button
                type="button"
                onClick={() => changeLanguage('tr')}
                className={`rounded-lg px-3 py-1 text-xs font-extrabold ${
                  lang === 'tr' ? 'bg-brand-500 text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`rounded-lg px-3 py-1 text-xs font-extrabold ${
                  lang === 'en' ? 'bg-brand-500 text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                EN
              </button>
            </div>
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(`/${lang}/admin/converter`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 flex items-center gap-1.5"
              >
                <MdPerson className="h-4 w-4" />
                <span>{t('landing.btnGoToDashboard')}</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`/${lang}/auth/sign-in`);
                  }}
                  className="px-3 py-2 text-xs font-bold text-navy-700 dark:text-white flex items-center gap-1"
                >
                  <MdLogin className="h-4 w-4" />
                  <span>{t('auth.signInTitle')}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`/${lang}/auth/sign-up`);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500"
                >
                  {t('landing.btnGetStarted')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
