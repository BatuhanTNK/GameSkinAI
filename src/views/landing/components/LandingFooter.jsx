/**
 * @fileoverview Landing Page Footer bileşeni.
 * Tamamı t(...) i18n çevirileri ile dinamikleştirilmiş bileşen.
 */

import React from "react";
import { Link } from "react-router-dom";
import { MdAutoAwesome } from "react-icons/md";
import { useTranslation } from "contexts/TranslationContext";

const LandingFooter = () => {
  const { t, lang } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-navy-900 border-t border-gray-200 dark:border-navy-800 pt-16 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link to={`/${lang}`} className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 via-blue-600 to-purple-600 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <MdAutoAwesome className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-navy-700 via-brand-500 to-blue-600 dark:from-white dark:via-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
                GameSkinAI
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed font-normal">
              {t('landing.footerDesc')}
            </p>
          </div>

          {/* Quick Links 1 */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-navy-700 dark:text-white uppercase tracking-wider">
              {t('landing.footerNavProduct')}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
              <li>
                <a href="#features" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  {t('landing.menuFeatures')}
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  {t('landing.menuDemo')}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  {t('landing.menuHowItWorks')}
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  {t('landing.menuShowcase')}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  {t('landing.menuFaq')}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-extrabold text-navy-700 dark:text-white uppercase tracking-wider">
              {t('landing.footerNavAccount')}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
              <li>
                <Link to={`/${lang}/auth/sign-in`} className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  {t('auth.signInTitle')}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/auth/sign-up`} className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  {t('auth.signUpTitle')}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/admin/converter`} className="font-bold text-brand-500 dark:text-brand-400 hover:underline">
                  {t('landing.btnGoToDashboard')} &rarr;
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200/80 dark:border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <p>© {currentYear} GameSkinAI. {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-brand-500 dark:hover:text-brand-400 cursor-pointer transition-colors">
              {t('landing.footerPrivacy')}
            </span>
            <span className="hover:text-brand-500 dark:hover:text-brand-400 cursor-pointer transition-colors">
              {t('landing.footerTerms')}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
