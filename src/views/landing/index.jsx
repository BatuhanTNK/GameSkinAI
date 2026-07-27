/**
 * @fileoverview Anasayfa (Landing Page) ana bileşeni.
 * Karşılama, vitrin, canlı demo, özellikler ve yönlendirme alanlarını birleştirir.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { MdAutoAwesome, MdArrowForward } from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";

import LandingNavbar from "./components/LandingNavbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import ShowcaseSection from "./components/ShowcaseSection";
import FaqSection from "./components/FaqSection";
import LandingFooter from "./components/LandingFooter";

const LandingPage = () => {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900 text-navy-700 dark:text-white transition-colors duration-300 font-dm overflow-x-hidden">
      {/* Top Sticky Navbar */}
      <LandingNavbar />

      {/* Main Sections */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ShowcaseSection />
        <FaqSection />

        {/* CTA Banner Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-r from-brand-600 via-blue-600 to-purple-600 p-8 sm:p-14 text-white shadow-2xl overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  {t('landing.ctaTitle')}
                </h2>
                <p className="text-base sm:text-lg text-white/90 font-normal">
                  {t('landing.ctaSubtitle')}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  {user ? (
                    <button
                      onClick={() => navigate(`/${lang}/admin/converter`)}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-navy-700 bg-white hover:bg-gray-100 shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <MdAutoAwesome className="h-5 w-5 text-brand-500" />
                      <span>{t('landing.btnGoToDashboard')}</span>
                      <MdArrowForward className="h-5 w-5 ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/${lang}/auth/sign-up`)}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-navy-700 bg-white hover:bg-gray-100 shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <MdAutoAwesome className="h-5 w-5 text-brand-500" />
                      <span>{t('landing.btnGetStarted')}</span>
                      <MdArrowForward className="h-5 w-5 ml-1" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
