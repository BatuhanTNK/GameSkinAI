/**
 * @fileoverview Landing Page SSS (Sıkça Sorulan Sorular) Bölümü.
 * Tamamı t(...) i18n çevirileri ile dinamikleştirilmiş bileşen.
 */

import React, { useState } from "react";
import { MdExpandMore } from "react-icons/md";
import { useTranslation } from "contexts/TranslationContext";

const FaqSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);

  const faqItems = [
    {
      question: t('landing.faq1Q'),
      answer: t('landing.faq1A')
    },
    {
      question: t('landing.faq2Q'),
      answer: t('landing.faq2A')
    },
    {
      question: t('landing.faq3Q'),
      answer: t('landing.faq3A')
    },
    {
      question: t('landing.faq4Q'),
      answer: t('landing.faq4A')
    },
    {
      question: t('landing.faq5Q'),
      answer: t('landing.faq5A')
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50/50 dark:bg-navy-900/50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-navy-800 px-3.5 py-1 rounded-full border border-brand-200 dark:border-brand-500/30">
            {t('landing.faqTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 dark:text-white tracking-tight">
            {t('landing.faqHeading')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('landing.faqSubtitle')}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-navy-800 border border-gray-200/80 dark:border-navy-700 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-navy-700 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <span className="text-base sm:text-lg">{item.question}</span>
                  <MdExpandMore
                    className={`h-6 w-6 text-gray-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-navy-700/60 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
