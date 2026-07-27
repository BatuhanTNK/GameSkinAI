/**
 * @fileoverview Landing Page Nasıl Çalışır? Bölümü.
 * Tamamı t(...) i18n çevirileri ile dinamikleştirilmiş bileşen.
 */

import React from "react";
import { MdUploadFile, MdTune, MdAutoAwesome } from "react-icons/md";
import { useTranslation } from "contexts/TranslationContext";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      step: "01",
      icon: <MdUploadFile className="h-8 w-8 text-brand-500" />,
      title: t('landing.step1Title'),
      description: t('landing.step1Desc')
    },
    {
      step: "02",
      icon: <MdTune className="h-8 w-8 text-purple-500" />,
      title: t('landing.step2Title'),
      description: t('landing.step2Desc')
    },
    {
      step: "03",
      icon: <MdAutoAwesome className="h-8 w-8 text-blue-500" />,
      title: t('landing.step3Title'),
      description: t('landing.step3Desc')
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50/50 dark:bg-navy-900/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-navy-800 px-3.5 py-1 rounded-full border border-brand-200 dark:border-brand-500/30">
            {t('landing.howBadge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 dark:text-white tracking-tight">
            {t('landing.howTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('landing.howSubtitle')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl bg-white dark:bg-navy-800 p-8 border border-gray-100 dark:border-navy-700 shadow-xl shadow-shadow-500/10 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Step Number Badge */}
              <div className="absolute top-6 right-6 text-4xl font-black text-gray-200 dark:text-navy-700 select-none">
                {item.step}
              </div>

              {/* Icon Container */}
              <div className="h-16 w-16 rounded-2xl bg-gray-50 dark:bg-navy-700 border border-gray-200/60 dark:border-navy-600 flex items-center justify-center mb-6 shadow-sm">
                {item.icon}
              </div>

              {/* Title & Desc */}
              <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
