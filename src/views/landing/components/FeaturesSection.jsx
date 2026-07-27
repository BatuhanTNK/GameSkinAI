/**
 * @fileoverview Landing Page Features (Özellikler) bölümü.
 * Tamamı t(...) i18n çevirileri ile dinamikleştirilmiş bileşen.
 */

import React from "react";
import { MdAutoAwesome, MdPalette, MdStorefront, MdHistory } from "react-icons/md";
import { useTranslation } from "contexts/TranslationContext";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <MdAutoAwesome className="h-7 w-7 text-white" />,
      title: t('landing.feature1Title'),
      description: t('landing.feature1Desc'),
      gradient: "from-brand-500 to-blue-600",
      shadow: "shadow-brand-500/20"
    },
    {
      icon: <MdPalette className="h-7 w-7 text-white" />,
      title: t('landing.feature2Title'),
      description: t('landing.feature2Desc'),
      gradient: "from-purple-500 to-indigo-600",
      shadow: "shadow-purple-500/20"
    },
    {
      icon: <MdStorefront className="h-7 w-7 text-white" />,
      title: t('landing.feature3Title'),
      description: t('landing.feature3Desc'),
      gradient: "from-pink-500 to-rose-600",
      shadow: "shadow-pink-500/20"
    },
    {
      icon: <MdHistory className="h-7 w-7 text-white" />,
      title: t('landing.feature4Title'),
      description: t('landing.feature4Desc'),
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50/50 dark:bg-navy-900/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-navy-800 px-3.5 py-1 rounded-full border border-brand-200 dark:border-brand-500/30">
            {t('landing.featuresTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 dark:text-white tracking-tight">
            {t('landing.featuresHeading')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {t('landing.featuresSubtitle')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl bg-white dark:bg-navy-800 p-8 border border-gray-100 dark:border-navy-700 shadow-xl shadow-shadow-500/10 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Icon Container */}
                <div
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${feature.gradient} flex items-center justify-center mb-6 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>

                {/* Title & Desc */}
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Bottom Bar */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-navy-700/60 flex items-center text-xs font-semibold text-brand-500 dark:text-brand-400 group-hover:translate-x-1 transition-transform duration-200">
                <span>{t('landing.featureExplore')} &rarr;</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
