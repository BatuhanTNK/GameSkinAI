/**
 * @fileoverview Landing Page Hero bölümü.
 * Yapay zeka ile üretilmiş yüksek çözünürlüklü (8K) 3D oyun skin görselleriyle yenilenmiş vitrin.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAutoAwesome, MdArrowForward, MdCheckCircle } from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";

// Avatar Portre Görselleri (Orijinal)
import avatar4 from "assets/img/avatars/avatar4.png";
import avatar11 from "assets/img/avatars/avatar11.png";
import avatar1 from "assets/img/avatars/avatar1.png";

// AI Tarafından Üretilen Yüksek Çözünürlüklü 3D Skin Görselleri (After)
import cyberpunkImg from "assets/img/hero/cyberpunk.png";
import fantasyImg from "assets/img/hero/fantasy.png";
import scifiImg from "assets/img/hero/scifi.png";

const HeroSection = () => {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const heroDemos = [
    {
      id: "cyberpunk",
      title: t('landing.demo1Title'),
      badge: t('landing.demo1Badge'),
      originalText: t('landing.demo1Input'),
      beforeImg: avatar4,
      afterImg: cyberpunkImg,
      promptText: "Cyberpunk street ninja, neon glowing visor, holographic dual blades, tactical tech jacket, highly detailed 8k Unreal Engine render",
      convertedBgClass: "bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 border-purple-500/50 shadow-purple-900/30",
    },
    {
      id: "fantasy",
      title: t('landing.demo2Title'),
      badge: t('landing.demo2Badge'),
      originalText: t('landing.demo2Input'),
      beforeImg: avatar11,
      afterImg: fantasyImg,
      promptText: "Dark fantasy holy paladin, glowing golden plate armor, rune engraved broadsword, ethereal aura, cinematic lighting 4k",
      convertedBgClass: "bg-gradient-to-br from-amber-900 via-stone-900 to-slate-900 border-amber-500/50 shadow-amber-900/30",
    },
    {
      id: "scifi",
      title: t('landing.demo3Title'),
      badge: t('landing.demo3Badge'),
      originalText: t('landing.demo3Input'),
      beforeImg: avatar1,
      afterImg: scifiImg,
      promptText: "Sci-fi mecha exoskeleton pilot, carbon fiber armor plates, cyan plasma core, octane render, photorealistic",
      convertedBgClass: "bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 border-cyan-500/50 shadow-cyan-900/30",
    }
  ];

  const [activeDemo, setActiveDemo] = useState(heroDemos[0]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-navy-800 border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs sm:text-sm font-semibold shadow-sm">
              <MdAutoAwesome className="h-4 w-4 animate-spin text-brand-500" />
              <span>{t('landing.heroTag')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-700 dark:text-white tracking-tight leading-[1.15]">
              {t('landing.heroTitle').split("AI").map((part, index, arr) => (
                <React.Fragment key={index}>
                  {part}
                  {index < arr.length - 1 && (
                    <span className="bg-gradient-to-r from-brand-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                      AI
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('landing.heroSubtitle')}
            </p>

            {/* Feature Bullets */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <MdCheckCircle className="text-brand-500 h-5 w-5" />
                <span>{t('landing.heroBullet1')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MdCheckCircle className="text-brand-500 h-5 w-5" />
                <span>{t('landing.heroBullet2')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MdCheckCircle className="text-brand-500 h-5 w-5" />
                <span>{t('landing.heroBullet3')}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {user ? (
                <button
                  onClick={() => navigate(`/${lang}/admin/converter`)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-500 via-blue-600 to-purple-600 hover:from-brand-600 hover:to-purple-700 shadow-xl shadow-brand-500/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <MdAutoAwesome className="h-5 w-5" />
                  <span>{t('landing.btnGoToDashboard')}</span>
                  <MdArrowForward className="h-5 w-5 ml-1" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/${lang}/auth/sign-up`)}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-500 via-blue-600 to-purple-600 hover:from-brand-600 hover:to-purple-700 shadow-xl shadow-brand-500/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <MdAutoAwesome className="h-5 w-5" />
                    <span>{t('landing.btnGetStarted')}</span>
                    <MdArrowForward className="h-5 w-5 ml-1" />
                  </button>
                  <a
                    href="#showcase"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-navy-700 dark:text-white bg-white dark:bg-navy-800 hover:bg-gray-100 dark:hover:bg-navy-700 border border-gray-200 dark:border-navy-700 shadow-md transition-all duration-200 flex items-center justify-center"
                  >
                    {t('landing.btnExploreShowcase')}
                  </a>
                </>
              )}
            </div>

          </div>

          {/* Right Column: Visual Before & After Card Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card Container */}
              <div className="relative rounded-3xl bg-white dark:bg-navy-800 border border-gray-200/80 dark:border-navy-700 p-6 shadow-2xl shadow-shadow-500/20">
                
                {/* Header Dots & Badge */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-navy-700">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t('landing.heroLivePreview')}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-50 dark:bg-navy-700 text-brand-500 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30">
                    {activeDemo.badge}
                  </span>
                </div>

                {/* Style Switcher Pills */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
                  {heroDemos.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => setActiveDemo(demo)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                        activeDemo.id === demo.id
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-[1.02]"
                          : "bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600"
                      }`}
                    >
                      {demo.title}
                    </button>
                  ))}
                </div>

                {/* Visual Before & After Grid Showcase */}
                <div className="space-y-4">
                  
                  {/* Visual Comparison Card (Before Image -> AI Skin Image) */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 border border-gray-200/80 dark:border-navy-700">
                    
                    <div className="grid grid-cols-12 gap-3 items-center">
                      
                      {/* Left: Original Photo */}
                      <div className="col-span-5 flex flex-col items-center text-center">
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-gray-300 dark:border-navy-600 shadow-md group">
                          <img
                            src={activeDemo.beforeImg}
                            alt="Orijinal Yüklenen Fotoğraf"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-black/70 text-white backdrop-blur-md">
                              Orijinal Fotoğraf
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: AI Conversion Arrow */}
                      <div className="col-span-2 flex flex-col items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-brand-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 animate-pulse">
                          <MdAutoAwesome className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-brand-500 dark:text-brand-400 mt-1 uppercase tracking-tighter">
                          AI DÖNÜŞÜM
                        </span>
                      </div>

                      {/* Right: Transformed 8K AI Skin Image */}
                      <div className="col-span-5 flex flex-col items-center text-center">
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-xl shadow-brand-500/20 group">
                          <img
                            src={activeDemo.afterImg}
                            alt={activeDemo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow backdrop-blur-md">
                              8K AI Skin
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* After / Converted AI Prompt Output Box */}
                  <div
                    className={`p-5 rounded-2xl ${activeDemo.convertedBgClass} text-white shadow-xl transition-all duration-300 border relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-md border border-white/20">
                        {t('landing.heroAiConversion')}
                      </span>
                      <span className="text-xs font-bold text-yellow-300 flex items-center gap-1">
                        <MdAutoAwesome className="text-yellow-300 h-3.5 w-3.5" />
                        {t('landing.heroRenderReady')}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white tracking-wide flex items-center justify-between">
                        <span>{activeDemo.title} Prompt Çıktısı</span>
                      </h4>
                      <p className="text-xs font-mono text-white bg-black/60 p-3 rounded-xl border border-white/20 leading-relaxed backdrop-blur-sm shadow-inner">
                        {activeDemo.promptText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-navy-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    {t('landing.heroAvgTime')} <strong className="text-navy-700 dark:text-white">1.4s</strong>
                  </span>
                  <span className="font-bold text-brand-500 dark:text-brand-400">
                    GameSkinAI v2.4
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
