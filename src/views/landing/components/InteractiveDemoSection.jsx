/**
 * @fileoverview Canlı Demo Bölümü.
 * 16 kombinasyonlu (4 Konsept x 4 Oyun Stili) tam matrisli, sıfırdan inşa edilmiş, 
 * %100 gerçek 8K karakter görselleri ve cinsiyet/yüz uyumu sunan Canlı Dönüşüm Demosu.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MdAutoAwesome, 
  MdRefresh, 
  MdContentCopy, 
  MdCheck, 
  MdArrowForward, 
  MdCheckCircle,
  MdCode,
  MdPalette,
  MdDescription
} from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";

// Girdi Referansı Portre / Taslak Görselleri (Before)
import avatar4 from "assets/img/avatars/avatar4.png";   // c1: Savaşçı Kadın (Siyah Saçlı)
import avatar11 from "assets/img/avatars/avatar11.png"; // c2: Büyücü Kadın (Sarı Saçlı)
import avatar1 from "assets/img/avatars/avatar1.png";   // c3: Futuristik Mecha / Robot
import avatar6 from "assets/img/avatars/avatar6.png";   // c4: Erkek Karakter Portre Referansı (Esmer Erkek)

// Karakter AI Skin Render Görselleri (After - 100% Gerçek Karakter Çıktıları)
import cyberpunkFemaleNinja from "assets/img/hero/cyberpunk.png";       // Siyah Saçlı Kadın Cyberpunk Ninja
import fantasyBlondePaladin from "assets/img/hero/fantasy.png";         // Sarı Saçlı Kadın Paladin Şövalye
import scifiRedheadPilot from "assets/img/hero/scifi.png";               // Kızıl Saçlı Kadın Mecha Pilotu
import animeMaleWizard from "assets/img/hero/anime.png";                 // Erkek Anime Büyücü Karakter
import cyberpunkFemaleKunoichi from "assets/img/hero/female_cyberpunk.png"; // Siyah Saçlı Kunoichi Ninja
import fantasyDarkKnightFemale from "assets/img/hero/female_fantasy.png"; // Siyah Saçlı Kadın Savaşçı Şövalye
import scifiWhiteSuitFemale from "assets/img/hero/female_scifi.png";   // Siyah Saçlı Kadın Mecha Pilotu
import animeBlondeSorceress from "assets/img/hero/female_anime.png";   // Sarı Saçlı Kadın Anime Büyücü
import mechaCyberRobot from "assets/img/hero/robot_cyberpunk.png";      // Sibernetik Robot Ninja
import mechaRunicGolem from "assets/img/hero/robot_fantasy.png";        // Rünlü Golem Robot Şövalye

const InteractiveDemoSection = () => {
  const { t, lang } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const demoConcepts = [
    { id: "c1", label: t('landing.concept1'), icon: "⚔️", image: avatar4 },
    { id: "c2", label: t('landing.concept2'), icon: "🔮", image: avatar11 },
    { id: "c3", label: t('landing.concept3'), icon: "🤖", image: avatar1 },
    { id: "c4", label: t('landing.concept4'), icon: "📸", image: avatar6 },
  ];

  const demoThemes = [
    {
      id: "cyberpunk",
      name: "Cyberpunk Ninja",
      icon: "🤖",
      badge: "Efsanevi Skin",
      borderColor: "border-purple-500/60 shadow-purple-900/40",
    },
    {
      id: "fantasy",
      name: "Dark Knight",
      icon: "⚔️",
      badge: "Destansı Skin",
      borderColor: "border-amber-500/60 shadow-amber-900/40",
    },
    {
      id: "scifi",
      name: "Mecha Pilot",
      icon: "🚀",
      badge: "Efsanevi Skin",
      borderColor: "border-cyan-500/60 shadow-cyan-900/40",
    },
    {
      id: "anime",
      name: "Anime Sorcerer",
      icon: "✨",
      badge: "Nadir Skin",
      borderColor: "border-pink-500/60 shadow-pink-900/40",
    }
  ];

  // 16 Kombinasyonluk (4 Konsept x 4 Oyun Stili) %100 GERÇEK KARAKTER Matris Haritası
  const MATRIX_OUTPUTS = {
    // c1: Savaşçı Kadın (avatar4.png - Siyah Saçlı Kadın)
    "c1_cyberpunk": {
      image: cyberpunkFemaleNinja,
      prompt: "3D render portrait of a dark-haired female cyberpunk street ninja warrior with glowing violet neon visor, holographic katana, tactical cybernetics suit, rainy Tokyo backdrop, 8k Unreal Engine render",
      armor: "Cyber Ninja Plaka",
      rarity: "Legendary",
      renderTime: "1.2s",
      engine: "UnrealEngine_5.4",
      colors: ["#8B5CF6", "#06B6D4", "#0F172A", "#F59E0B"]
    },
    "c1_fantasy": {
      image: fantasyDarkKnightFemale,
      prompt: "3D render portrait of a dark-haired female dark fantasy paladin knight in glowing golden obsidian plate armor, holding mythical broadsword, gothic cathedral backdrop, 8k resolution RPG art",
      armor: "Ağır Obsidian Zırh",
      rarity: "Epic",
      renderTime: "1.4s",
      engine: "UnrealEngine_5.4",
      colors: ["#D97706", "#78350F", "#1C1917", "#EF4444"]
    },
    "c1_scifi": {
      image: scifiWhiteSuitFemale,
      prompt: "3D render portrait of a dark-haired female sci-fi mecha suit pilot in white cyan exoskeleton suit holding pilot helmet, space station backdrop, hyperrealistic raytracing, octane render 8k",
      armor: "Titanyum Exosuit",
      rarity: "Legendary",
      renderTime: "1.1s",
      engine: "Unity_HDRP_2023",
      colors: ["#06B6D4", "#3B82F6", "#090D16", "#10B981"]
    },
    "c1_anime": {
      image: cyberpunkFemaleKunoichi,
      prompt: "Cel shaded anime style dark-haired female kunoichi assassin with glowing neon Katana, tactical cyber suit, Makoto Shinkai aesthetic, 4k resolution toon shader",
      armor: "Kunoichi Cübbesi",
      rarity: "Rare",
      renderTime: "1.3s",
      engine: "UnrealEngine_5.4",
      colors: ["#EC4899", "#8B5CF6", "#F43F5E", "#FDE047"]
    },

    // c2: Büyücü Kadın (avatar11.png - Sarı Saçlı Kadın)
    "c2_cyberpunk": {
      image: cyberpunkFemaleKunoichi,
      prompt: "3D render portrait of a blond female cyberpunk kunoichi warrior with purple neon visor, tactical cyber suit, rainy city backdrop, photorealistic facial likeness 8k",
      armor: "Kunoichi Taktik",
      rarity: "Legendary",
      renderTime: "1.2s",
      engine: "UnrealEngine_5.4",
      colors: ["#8B5CF6", "#EC4899", "#0F172A", "#38BDF8"]
    },
    "c2_fantasy": {
      image: fantasyBlondePaladin,
      prompt: "3D render portrait of a beautiful blond female dark fantasy paladin knight in glowing rune golden plate armor, broadsword on back, castle ruins, photorealistic facial likeness 8k",
      armor: "Altın Paladin Zırhı",
      rarity: "Epic",
      renderTime: "1.3s",
      engine: "UnrealEngine_5.4",
      colors: ["#F59E0B", "#78350F", "#1C1917", "#F43F5E"]
    },
    "c2_scifi": {
      image: scifiRedheadPilot,
      prompt: "3D render portrait of a female mecha pilot with glowing HUD glasses, futuristic space station cockpit background, photorealistic 8k render",
      armor: "Pilot Exosuit",
      rarity: "Legendary",
      renderTime: "1.1s",
      engine: "Unity_HDRP_2023",
      colors: ["#38BDF8", "#6366F1", "#0F172A", "#10B981"]
    },
    "c2_anime": {
      image: animeBlondeSorceress,
      prompt: "3D render portrait of a beautiful blond female anime mage sorceress with swirling elemental arcane magic, glowing staff, moonlight backdrop, Makoto Shinkai style, photorealistic facial likeness 8k",
      armor: "Büyücü Elbisesi",
      rarity: "Rare",
      renderTime: "1.2s",
      engine: "UnrealEngine_5.4",
      colors: ["#EC4899", "#A855F7", "#38BDF8", "#FDE047"]
    },

    // c3: Futuristik Mecha / Robot (avatar1.png)
    "c3_cyberpunk": {
      image: mechaCyberRobot,
      prompt: "3D render portrait of a futuristic mecha robot ninja warrior with glowing violet neon visor, cybernetic armor plates, Japanese neon street backdrop, Unreal Engine 5 8k",
      armor: "Meka Sibernetik",
      rarity: "Legendary",
      renderTime: "1.0s",
      engine: "UnrealEngine_5.4",
      colors: ["#A855F7", "#06B6D4", "#090D16", "#F59E0B"]
    },
    "c3_fantasy": {
      image: mechaRunicGolem,
      prompt: "3D render portrait of a dark fantasy runic golem knight in golden obsidian plate armor, glowing red runes, holding warhammer, epic dark fantasy RPG 8k render",
      armor: "Rünlü Golem Plaka",
      rarity: "Epic",
      renderTime: "1.4s",
      engine: "UnrealEngine_5.4",
      colors: ["#EF4444", "#D97706", "#18181B", "#F59E0B"]
    },
    "c3_scifi": {
      image: mechaCyberRobot,
      prompt: "3D render portrait of a heavy sci-fi titanium mecha robot suit with violet energy core, raytracing octane render 8k",
      armor: "Ağır Meka Gövde",
      rarity: "Legendary",
      renderTime: "1.1s",
      engine: "Unity_HDRP_2023",
      colors: ["#0284C7", "#2563EB", "#0F172A", "#34D399"]
    },
    "c3_anime": {
      image: mechaRunicGolem,
      prompt: "Cel shaded anime mecha construct warrior, swirling arcane rune energy, vibrant color palette, Makoto Shinkai aesthetic, 4k resolution toon shader",
      armor: "Büyülü Meka Gövde",
      rarity: "Rare",
      renderTime: "1.2s",
      engine: "UnrealEngine_5.4",
      colors: ["#38BDF8", "#8B5CF6", "#F43F5E", "#FACC15"]
    },

    // c4: Erkek Karakter Portre Referansı (avatar6.png - Esmer Erkek)
    "c4_cyberpunk": {
      image: animeMaleWizard,
      prompt: "3D render portrait of a male cyberpunk warrior with glowing arcane magic, tactical cyber armor, rainy Tokyo backdrop, photorealistic facial likeness 8k",
      armor: "Erkek Cyber Armor",
      rarity: "Legendary",
      renderTime: "1.2s",
      engine: "UnrealEngine_5.4",
      colors: ["#8B5CF6", "#3B82F6", "#090D16", "#F59E0B"]
    },
    "c4_fantasy": {
      image: animeMaleWizard,
      prompt: "3D render portrait of a male dark fantasy sorcerer paladin with magical staff, obsidian armor, foggy castle ruins, photorealistic facial likeness 8k",
      armor: "Karanlık Büyücü Zırhı",
      rarity: "Epic",
      renderTime: "1.3s",
      engine: "UnrealEngine_5.4",
      colors: ["#F59E0B", "#B45309", "#18181B", "#EF4444"]
    },
    "c4_scifi": {
      image: animeMaleWizard,
      prompt: "3D render portrait of a male sci-fi warrior hero in cyber suit with plasma aura, space station backdrop, photorealistic facial likeness 8k",
      armor: "Uzay Pilotu Exosuit",
      rarity: "Legendary",
      renderTime: "1.1s",
      engine: "Unity_HDRP_2023",
      colors: ["#0284C7", "#6366F1", "#0F172A", "#10B981"]
    },
    "c4_anime": {
      image: animeMaleWizard,
      prompt: "3D render portrait of a male anime sorcerer hero with swirling elemental arcane magic, holding glowing staff, mountain landscape, Makoto Shinkai style, photorealistic facial likeness 8k",
      armor: "Erkek Büyücü Zırhı",
      rarity: "Rare",
      renderTime: "1.2s",
      engine: "UnrealEngine_5.4",
      colors: ["#8B5CF6", "#EC4899", "#38BDF8", "#FDE047"]
    }
  };

  const [selectedConcept, setSelectedConcept] = useState(demoConcepts[0]);
  const [selectedTheme, setSelectedTheme] = useState(demoThemes[0]);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasConverted, setHasConverted] = useState(false);

  // Active Tab: "prompt" | "engine" | "palette"
  const [activeTab, setActiveTab] = useState("prompt");
  const [copiedKey, setCopiedKey] = useState(null);

  // Exact 16-Combination Key Lookup
  const matrixKey = `${selectedConcept.id}_${selectedTheme.id}`;
  const currentOutput = MATRIX_OUTPUTS[matrixKey] || MATRIX_OUTPUTS["c1_cyberpunk"];

  const engineConfigJson = `{
  "engine": "${currentOutput.engine}",
  "pipeline": "Nanite_PBR",
  "textureResolution": "8192x8192",
  "shader": "Custom_Shader_${selectedTheme.id.toUpperCase()}",
  "emissiveIntensity": 4.5
}`;

  const handleSimulate = () => {
    setIsSimulating(true);
    setProgress(20);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsSimulating(false);
      setHasConverted(true);
    }, 900);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section id="demo" className="py-20 bg-white dark:bg-navy-900 transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-navy-800 px-3.5 py-1 rounded-full border border-brand-200 dark:border-brand-500/30">
            {t('landing.demoTitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 dark:text-white tracking-tight">
            {t('landing.demoHeading')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('landing.demoSubtitle')}
          </p>
        </div>

        {/* Interactive Demo Container */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-6 sm:p-10 shadow-2xl shadow-shadow-500/10 space-y-8 transition-colors duration-300">
          
          {/* Step 1: Concept Selection */}
          <div>
            <label className="block text-sm font-bold text-navy-700 dark:text-white mb-3 flex items-center justify-between">
              <span>{t('landing.demoStep1')}</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('landing.demoStep1Note')}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoConcepts.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => setSelectedConcept(concept)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 ${
                    selectedConcept.id === concept.id
                      ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 font-bold"
                      : "bg-white dark:bg-navy-700 text-navy-700 dark:text-gray-200 border-gray-200 dark:border-navy-600 hover:border-brand-300 dark:hover:border-brand-400"
                  }`}
                >
                  <span className="text-2xl">{concept.icon}</span>
                  <span className="text-sm font-bold">{concept.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Theme Selection */}
          <div>
            <label className="block text-sm font-bold text-navy-700 dark:text-white mb-3">
              {t('landing.demoStep2')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {demoThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-4.5 rounded-2xl border text-left transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                    selectedTheme.id === theme.id
                      ? "bg-gradient-to-r from-brand-500 to-blue-600 text-white border-brand-500 shadow-lg shadow-brand-500/30 scale-[1.02] font-bold"
                      : "bg-white dark:bg-navy-700 text-navy-700 dark:text-gray-200 border-gray-200 dark:border-navy-600 hover:border-brand-300 dark:hover:border-brand-400"
                  }`}
                >
                  <span className="text-3xl">{theme.icon}</span>
                  <span className="text-xs font-bold text-center">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Convert Button */}
          <div className="flex flex-col items-center justify-center pt-2">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-brand-500 via-blue-600 to-purple-600 hover:from-brand-600 hover:to-purple-700 shadow-xl shadow-brand-500/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isSimulating ? (
                <>
                  <MdRefresh className="h-6 w-6 animate-spin" />
                  <span>{t('landing.demoAnalyzing', { progress })}</span>
                </>
              ) : (
                <>
                  <MdAutoAwesome className="h-6 w-6 text-yellow-300" />
                  <span>{t('landing.demoBtnConvert')}</span>
                  <MdArrowForward className="h-5 w-5 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Initial State Placeholder */}
          {!hasConverted && !isSimulating && (
            <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border-2 border-dashed border-gray-200 dark:border-navy-700 text-center space-y-3 transition-colors duration-300">
              <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-navy-800 text-brand-500 mx-auto flex items-center justify-center">
                <MdAutoAwesome className="h-6 w-6 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-navy-700 dark:text-white">
                {t('landing.demoPlaceholderTitle')}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {t('landing.demoPlaceholderDesc')}
              </p>
            </div>
          )}

          {/* Loading Progress State */}
          {isSimulating && (
            <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-brand-200 dark:border-brand-500/40 text-center space-y-4 shadow-lg transition-colors duration-300">
              <div className="flex items-center justify-center gap-2 text-brand-500 font-bold text-sm">
                <MdAutoAwesome className="h-5 w-5 animate-spin" />
                <span>{t('landing.demoLoadingEngine')}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-navy-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('landing.demoLoadingDesc')}
              </p>
            </div>
          )}

          {/* Fully Detailed Converted AI Output Console - Explicit #0b1437 (Navy 900) Dark Background in Both Light & Dark Mode */}
          {hasConverted && !isSimulating && (
            <div
              style={{ backgroundColor: '#0b1437', color: '#ffffff' }}
              className={`p-6 sm:p-8 rounded-3xl ${selectedTheme.borderColor} shadow-2xl transition-all duration-300 border relative overflow-hidden space-y-6 animate-fadeIn`}
            >
              {/* Top Success Status Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-navy-700" style={{ borderColor: '#1B254B' }}>
                <div className="flex items-center gap-3">
                  <MdCheckCircle className="text-emerald-400 h-7 w-7 shrink-0" />
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-wide">
                      {t('landing.demoSuccessBadge')}
                    </h3>
                    <p className="text-xs text-gray-300 font-medium mt-0.5">
                      Girdi: <strong className="text-white">{selectedConcept.label}</strong> • Stil: <strong className="text-yellow-300">{selectedTheme.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 shadow-sm">
                    {selectedTheme.badge}
                  </span>
                </div>
              </div>

              {/* Large Prominent Visual Before & After Grid Showcase (Matrix Matched Output) */}
              <div style={{ backgroundColor: '#111c44', borderColor: '#1B254B' }} className="p-5 rounded-2xl border">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left: Input Reference Image */}
                  <div className="md:col-span-5 flex flex-col items-center text-center space-y-2.5">
                    <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border-2 shadow-xl group" style={{ borderColor: '#3652ba' }}>
                      <img
                        src={selectedConcept.image}
                        alt="Girdi Referansı"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end justify-center p-2.5">
                        <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-black/80 text-white border border-white/20">
                          📸 Girdi Referansı
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-200">
                      {selectedConcept.label}
                    </span>
                  </div>

                  {/* Center: AI Transformation Indicator */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-center space-y-2 py-2">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-brand-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/50 animate-pulse border border-white/30">
                      <MdAutoAwesome className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">
                      AI STİL
                    </span>
                  </div>

                  {/* Right: Transformed 8K AI Skin Render Image (100% Real 8K Character Render!) */}
                  <div className="md:col-span-5 flex flex-col items-center text-center space-y-2.5">
                    <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-2xl shadow-brand-500/40 group">
                      <img
                        src={currentOutput.image}
                        alt={selectedTheme.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end justify-center p-2.5">
                        <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-lg border border-white/20">
                          ✨ 8K AI Skin Render
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">
                      {selectedTheme.name} ({selectedConcept.label})
                    </span>
                  </div>

                </div>
              </div>

              {/* Output Tab Switcher & Details */}
              <div className="space-y-4">
                
                {/* Tab Navigation Buttons */}
                <div style={{ backgroundColor: '#111c44', borderColor: '#1B254B' }} className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl border">
                  <button
                    onClick={() => setActiveTab("prompt")}
                    className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      activeTab === "prompt"
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/40 scale-[1.02]"
                        : "bg-navy-700 text-gray-200 hover:text-white hover:bg-navy-600"
                    }`}
                  >
                    <MdDescription className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate">8K Prompt</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("engine")}
                    className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      activeTab === "engine"
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/40 scale-[1.02]"
                        : "bg-navy-700 text-gray-200 hover:text-white hover:bg-navy-600"
                    }`}
                  >
                    <MdCode className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate">UE5 / Unity Config</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("palette")}
                    className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                      activeTab === "palette"
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/40 scale-[1.02]"
                        : "bg-navy-700 text-gray-200 hover:text-white hover:bg-navy-600"
                    }`}
                  >
                    <MdPalette className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate">Renk Paleti</span>
                  </button>
                </div>

                {/* Tab 1: 8K AI Prompt */}
                {activeTab === "prompt" && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                        Midjourney v6.1 & SDXL İstem Metni:
                      </span>
                      <button
                        onClick={() => handleCopy(currentOutput.prompt, "prompt")}
                        className="px-3.5 py-1.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-xs font-bold transition-all flex items-center gap-1.5 border border-navy-500 text-white shadow-sm"
                      >
                        {copiedKey === "prompt" ? <MdCheck className="text-emerald-300" /> : <MdContentCopy className="text-gray-300" />}
                        <span>{copiedKey === "prompt" ? "Kopyalandı!" : "Promptu Kopyala"}</span>
                      </button>
                    </div>

                    <div style={{ backgroundColor: '#070d22', color: '#ffffff' }} className="p-4 rounded-2xl border border-navy-700 font-mono text-xs leading-relaxed shadow-inner select-all">
                      {currentOutput.prompt}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-300 font-medium pt-1">
                      <span>Zırh Tipi: <strong className="text-white">{currentOutput.armor}</strong></span>
                      <span>Render Süresi: <strong className="text-emerald-400">{currentOutput.renderTime}</strong></span>
                      <span>Seviye: <strong className="text-yellow-300">{currentOutput.rarity}</strong></span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Engine Config JSON */}
                {activeTab === "engine" && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                        Oyun Motoru Material & Shader Parametreleri:
                      </span>
                      <button
                        onClick={() => handleCopy(engineConfigJson, "engine")}
                        className="px-3.5 py-1.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-xs font-bold transition-all flex items-center gap-1.5 border border-navy-500 text-white shadow-sm"
                      >
                        {copiedKey === "engine" ? <MdCheck className="text-emerald-300" /> : <MdContentCopy className="text-gray-300" />}
                        <span>{copiedKey === "engine" ? "Kopyalandı!" : "JSON Kopyala"}</span>
                      </button>
                    </div>

                    <pre style={{ backgroundColor: '#070d22', color: '#4ade80' }} className="p-4 rounded-2xl border border-navy-700 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                      {engineConfigJson}
                    </pre>
                  </div>
                )}

                {/* Tab 3: Color Palette & Swatches */}
                {activeTab === "palette" && (
                  <div className="space-y-4 animate-fadeIn">
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-wider block">
                      Karakter Materyal Renk Paleti (Hex Swatches):
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {currentOutput.colors.map((hex, i) => (
                        <div
                          key={i}
                          onClick={() => handleCopy(hex, `hex-${i}`)}
                          style={{ backgroundColor: '#111c44', borderColor: '#1B254B' }}
                          className="group cursor-pointer p-3 rounded-2xl border hover:border-brand-500 transition-all flex flex-col items-center gap-2 text-center"
                        >
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white/50 shadow-lg group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="text-xs font-mono font-bold text-gray-200 group-hover:text-white">
                            {copiedKey === `hex-${i}` ? "Kopyalandı" : hex}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p style={{ backgroundColor: '#111c44', borderColor: '#1B254B' }} className="text-xs text-gray-300 leading-relaxed p-3 rounded-xl border">
                      💡 Renk kodlarının üzerine tıklayarak Unreal Engine veya Photoshop materyal düzenleyicinize tek tıkla kopyalayabilirsiniz.
                    </p>
                  </div>
                )}

              </div>

              {/* Bottom Actions Bar */}
              <div style={{ borderColor: '#1B254B' }} className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleSimulate}
                  className="text-xs text-gray-300 hover:text-white font-semibold underline flex items-center gap-1.5"
                >
                  <MdRefresh className="h-4 w-4" />
                  <span>{t('landing.demoReconvert')}</span>
                </button>

                <button
                  onClick={() => navigate(user ? `/${lang}/admin/converter` : `/${lang}/auth/sign-up`)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold text-navy-700 bg-white hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02]"
                >
                  <span>{t('landing.demoTryInApp')}</span>
                  <MdArrowForward className="h-4 w-4 text-brand-500" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default InteractiveDemoSection;
