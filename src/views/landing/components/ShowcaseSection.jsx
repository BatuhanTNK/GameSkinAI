/**
 * @fileoverview Landing Page Topluluk Vitrini (Showcase) Bölümü.
 * Tamamı t(...) i18n çevirileri ile dinamikleştirilmiş bileşen.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { MdStorefront, MdFavorite, MdContentCopy, MdArrowForward } from "react-icons/md";
import { useTranslation } from "contexts/TranslationContext";

const SHOWCASE_ITEMS = [
  {
    id: 1,
    title: "Neon Samurai X-9",
    author: "CyberDev",
    theme: "Cyberpunk",
    likes: 342,
    prompt: "Cyberpunk katana warrior, neon magenta armor plates, rain soaked cyberpunk street, holographic visor, octane render 8k",
    badgeColor: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border-purple-300"
  },
  {
    id: 2,
    title: "Eldritch Void Lord",
    author: "RPG_Master",
    theme: "Dark Fantasy",
    likes: 289,
    prompt: "Dark fantasy lich king, floating dark energy orb, skeletal rune armor, ethereal purple glow, epic composition",
    badgeColor: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border-amber-300"
  },
  {
    id: 3,
    title: "Valkyrie Protocol",
    author: "SciFiArtist",
    theme: "Sci-Fi Armor",
    likes: 415,
    prompt: "Futuristic mech valkyrie, white titanium suit, glowing cyan energy wings, orbital launchpad background",
    badgeColor: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 border-cyan-300"
  },
  {
    id: 4,
    title: "Solar Sorceress",
    author: "AnimeCraft",
    theme: "Anime RPG",
    likes: 198,
    prompt: "Vibrant anime sun priestess, golden robes, celestial magic circles, glowing staff, Makoto Shinkai style 4k",
    badgeColor: "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 border-pink-300"
  }
];

const ShowcaseSection = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  return (
    <section id="showcase" className="py-20 bg-white dark:bg-navy-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-14 gap-6">
          <div className="text-center sm:text-left space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-navy-800 px-3.5 py-1 rounded-full border border-brand-200 dark:border-brand-500/30">
              {t('landing.showcaseTitle')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 dark:text-white tracking-tight">
              {t('landing.showcaseHeading')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl">
              {t('landing.showcaseSubtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate(`/${lang}/admin/marketplace`)}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-navy-700 dark:text-white bg-gray-100 dark:bg-navy-800 hover:bg-gray-200 dark:hover:bg-navy-700 border border-gray-200 dark:border-navy-700 shadow-sm transition-all flex items-center gap-2"
          >
            <MdStorefront className="h-5 w-5 text-brand-500" />
            <span>{t('landing.showcaseViewAll')}</span>
            <MdArrowForward className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Showcase Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-gray-50 dark:bg-navy-800 border border-gray-200/80 dark:border-navy-700 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${item.badgeColor}`}>
                    {item.theme}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <MdFavorite className="text-red-500 h-4 w-4" />
                    <span>{item.likes}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  {t('landing.showcaseAuthor')} <span className="font-semibold text-gray-600 dark:text-gray-300">@{item.author}</span>
                </p>

                <div className="bg-white dark:bg-navy-900 p-3 rounded-xl border border-gray-200/60 dark:border-navy-700 text-xs font-mono text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
                  "{item.prompt}"
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.prompt);
                  alert(t('share.copiedSuccess'));
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-navy-700/60 hover:bg-brand-100 dark:hover:bg-navy-700 border border-brand-200/60 dark:border-brand-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <MdContentCopy className="h-4 w-4" />
                <span>{t('landing.showcaseCopyPrompt')}</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShowcaseSection;
