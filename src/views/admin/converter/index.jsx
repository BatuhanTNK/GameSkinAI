/**
 * @fileoverview Ana dönüştürme sayfası (Dashboard).
 * Tema seçimi, fotoğraf yükleme ve AI dönüşüm akışını yönetir.
 * Tüm state bu sayfada tutulur ve alt bileşenlere aktarılır.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useConversions } from 'hooks/useConversions';
import { useCredits } from 'hooks/useCredits';
import { analyzeAndConvert, fileToBase64, generateImage } from 'lib/gemini';
import { THEMES, getThemeBySlug } from 'lib/themes';
import { uploadImage, uploadBase64Image, fetchThemes } from 'lib/supabase';
import {
  CONVERSION_STATUS,
  RATE_LIMIT_SECONDS,
} from 'lib/constants';
import ThemeSelector from 'components/converter/ThemeSelector';
import ImageUploader from 'components/converter/ImageUploader';
import StyleSelector, { buildStylePromptSuffix } from 'components/converter/StyleSelector';
import ConversionResult from 'components/converter/ConversionResult';
import { MdAutoAwesome, MdBolt, MdLayers, MdDownload, MdErrorOutline } from 'react-icons/md';
import { normalizeSkinData, parseTextDescriptionToSkinData } from 'lib/skinDataParser';
import { showLocalNotification } from 'lib/notifications';
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';


/**
 * Converter sayfası.
 * Kullanıcının tema seçip fotoğraf yükleyerek AI dönüşümü başlattığı ana sayfa.
 */
export default function Converter() {
  const { user } = useAuth();
  const { addConversion, updateConversion } = useConversions();
  const { remaining, limit, hasCredits, refreshCredits } = useCredits();
  const { t } = useTranslation();

  // Dinamik temalar state
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    async function loadThemes() {
      try {
        const dbThemes = await fetchThemes();
        if (dbThemes && dbThemes.length > 0) {
          const dbSlugSet = new Set(dbThemes.map((t) => t.slug));
          const formattedDbThemes = dbThemes.map((t) => {
            const staticMatch = THEMES.find((st) => st.slug === t.slug) || {};
            return {
              ...staticMatch,
              ...t,
              color: t.color || staticMatch.color || 'purple',
              bgGradient: t.bgGradient || staticMatch.bgGradient || 'from-purple-500 to-violet-600',
              icon: t.icon || staticMatch.icon || 'FaUserAstronaut',
            };
          });
          const missingStaticThemes = THEMES.filter((st) => !dbSlugSet.has(st.slug));
          setThemes([...formattedDbThemes, ...missingStaticThemes]);
        } else {
          setThemes(THEMES);
        }
      } catch (err) {
        console.error('Tema yükleme hatası, statik temalara dönülüyor:', err);
        setThemes(THEMES);
      }
    }
    loadThemes();
  }, []);

  // Form state
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Challenge sayfasından gelen ?theme= parametresi ile tema önseçimi (#14)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const themeParam = searchParams.get('theme');
    if (themeParam && THEMES.some((th) => th.slug === themeParam)) {
      setSelectedTheme(themeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI stil ayarları (ozellik_onerileri.md #9): poz, ton, renk paleti (hepsi isteğe bağlı)
  const [styleSettings, setStyleSettings] = useState({ pose: null, tone: null, palette: null });

  // Dönüşüm state
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState(null);
  const [conversionError, setConversionError] = useState(null);

  // Batch dönüşüm state'leri (ozellik_onerileri.md #16)
  const [batchMode, setBatchMode] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchProgress, setBatchProgress] = useState(null);

  // Varyasyon üretimi için son kullanılan görsel prompt'u (ozellik_onerileri.md #3)
  const [lastImagePrompt, setLastImagePrompt] = useState(null);

  // Rate limiting
  const lastRequestTime = useRef(0);

  // Global toast
  const { showToast } = useToast();

  /**
   * Tema seçim işleyicisi.
   * Tekli modda tek tema, batch modda çoklu tema seçimi yapar.
   * @param {string} slug - Seçilen tema slug'ı
   */
  const handleThemeSelect = (slug) => {
    if (batchMode) {
      setSelectedThemes((prev) => {
        if (prev.includes(slug)) {
          return prev.filter((s) => s !== slug);
        }
        // Kalan krediyi ve pratik üst sınırı (4) aşma
        const maxSelectable = Math.min(4, remaining);
        if (prev.length >= maxSelectable) {
          showToast(t('converter.batchMaxThemes', { max: maxSelectable }), 'error');
          return prev;
        }
        return [...prev, slug];
      });
    } else {
      setSelectedTheme(slug);
    }
    // Önceki sonucu temizle
    if (result || batchResults.length > 0) {
      setResult(null);
      setBatchResults([]);
      setConversionError(null);
    }
  };

  /**
   * Batch modu aç/kapat işleyicisi. Mod değişince seçimler sıfırlanır.
   */
  const handleBatchModeToggle = () => {
    setBatchMode((prev) => !prev);
    setSelectedTheme(null);
    setSelectedThemes([]);
    setResult(null);
    setBatchResults([]);
    setConversionError(null);
  };

  /**
   * Stil ayarı değişim işleyicisi.
   * @param {string} groupKey - pose | tone | palette
   * @param {string|null} value - Seçilen değer veya null (seçim kaldırma)
   */
  const handleStyleChange = (groupKey, value) => {
    setStyleSettings((prev) => ({ ...prev, [groupKey]: value }));
  };

  /**
   * Dosya seçim işleyicisi.
   * ImageUploader onFileSelect(file, errorMessage) formatında çağırır.
   * Mobilde dosya referansı kaybolabileceği için veriyi hemen belleğe okur.
   * @param {File|null} file - Seçilen dosya
   * @param {string|null} errorMessage - Hata mesajı (varsa)
   */
  const handleFileSelect = async (file, errorMessage) => {
    // Hata varsa sadece hatayı göster
    if (errorMessage) {
      setUploadError(errorMessage);
      setUploadedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      return;
    }

    // Dosya yoksa temizle
    if (!file) {
      setUploadedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      return;
    }

    // Önceki preview URL'i temizle
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    try {
      // Dosya verisini hemen belleğe oku (mobilde dosya referansı kaybolabiliyor)
      const arrayBuffer = await file.arrayBuffer();
      const persistedFile = new File([arrayBuffer], file.name, {
        type: file.type || 'image/jpeg',
        lastModified: file.lastModified,
      });

      const newPreviewUrl = URL.createObjectURL(persistedFile);
      setUploadedFile(persistedFile);
      setPreviewUrl(newPreviewUrl);
      setUploadError(null);
    } catch (err) {
      console.error('Dosya belleğe okuma hatası, doğrudan referans kullanılıyor:', err);
      // Fallback: doğrudan dosya referansını kullan
      const newPreviewUrl = URL.createObjectURL(file);
      setUploadedFile(file);
      setPreviewUrl(newPreviewUrl);
      setUploadError(null);
    }

    // Önceki sonucu temizle
    if (result) {
      setResult(null);
      setConversionError(null);
    }
  };

  /**
   * Dosya temizleme işleyicisi.
   */
  const handleFileClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  /**
   * Tek bir tema için AI analizi, görsel üretimi ve kayıt işlemlerini yapar.
   * Hem tekli dönüşüm hem batch dönüşüm tarafından kullanılır.
   * @param {Object} params
   * @param {Object} params.theme - Tema nesnesi
   * @param {string} params.base64 - Fotoğrafın base64 verisi
   * @param {string} params.mimeType - Fotoğrafın MIME türü
   * @param {string} params.originalImageUrl - Orijinal fotoğraf URL'i
   * @returns {Promise<{displayResult: Object, imagePrompt: string}>}
   */
  const performThemeConversion = async ({ theme, base64, mimeType, originalImageUrl }) => {
    // 1. Gemini API'ye gönder (Açıklama üret)
    const isMinecraft = theme.slug === 'minecraft';
    const aiResult = await analyzeAndConvert(base64, mimeType, theme.prompt, isMinecraft, theme.responseSchema);

    let finalDescription = aiResult.description;
    let userFriendlyDescription = aiResult.description;

    if (isMinecraft) {
      try {
        let text = aiResult.description.trim();
        // JSON bloğunu ayıkla (varsa önündeki/arkasındaki markdown ve metinleri temizler)
        const firstBrace = text.indexOf('{');
        if (firstBrace !== -1) {
          const lastBrace = text.lastIndexOf('}');
          if (lastBrace > firstBrace) {
            text = text.substring(firstBrace, lastBrace + 1);
          } else {
            text = text.substring(firstBrace);
          }
        }

        // Gemini yanıtının sonu kesildiyse tırnak ve süslü parantezi otomatik onar
        let quoteCount = 0;
        let inEscape = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '\\') {
            inEscape = !inEscape;
          } else if (char === '"' && !inEscape) {
            quoteCount++;
          } else {
            inEscape = false;
          }
        }
        if (quoteCount % 2 !== 0) {
          text += '"';
        }
        if (!text.endsWith('}')) {
          text += '}';
        }

        const parsed = JSON.parse(text);

        // Gemini farklı key isimleri kullanabilir - hepsini dene
        const desc = parsed.description
          || parsed.character_description
          || parsed.desc
          || parsed.text
          || 'Minecraft skin oluşturuldu.';

        const sd = parsed.skinData
          || parsed.skin_data
          || parsed.skindata
          || parsed.colors
          || parsed.skin
          || parsed;

        // Normalize et: Her zaman standart key isimlerini kullan
        const normalizedSkinData = normalizeSkinData(sd);

        if (process.env.NODE_ENV === 'development') {
          console.log('Successfully parsed Gemini JSON:', parsed);
          console.log('Normalized skinData for canvas drawing:', normalizedSkinData);
        }

        userFriendlyDescription = desc;
        finalDescription = JSON.stringify({
          description: desc,
          skinData: normalizedSkinData,
        });
      } catch (err) {
        // Kesilen JSON ayrıştırılamazsa sessizce metin yedek ayrıştırıcısını çalıştır
        const fallbackSkinData = parseTextDescriptionToSkinData(aiResult.description);
        finalDescription = JSON.stringify({
          description: aiResult.description,
          skinData: fallbackSkinData,
        });
      }
    }

    // Prompt sanitizasyonu: Zararlı komut enjeksiyonlarını temizle
    const safeDescription = (userFriendlyDescription || '')
      .replace(/ignore\s+(previous|all)\s+instructions/gi, '')
      .replace(/(system|user|assistant):/gi, '')
      .replace(/[#{}\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Görsel üretimi için prompt hazırla (stil ayarları son ek olarak eklenir)
    let resultImageUrl = '';
    const styleSuffix = buildStylePromptSuffix(styleSettings);
    const imagePrompt = (isMinecraft
      ? `Stunning official Minecraft game keyart illustration style, highly detailed 3D blocky voxel character based on: ${safeDescription}. Dynamic heroic pose, volumetric studio lighting, soft ambient occlusion, vibrant colors, clean soft background, premium game cover render.`
      : `${theme.label} character based on: ${safeDescription}. Stylized matching ${theme.label} game aesthetic, centered portrait, single character, high-quality detailed render, clean plain studio background.`) + styleSuffix;

    try {
      const resultImageBase64 = await generateImage(imagePrompt);
      // 3. Üretilen görseli Supabase'e yükle
      resultImageUrl = await uploadBase64Image(resultImageBase64, 'image/jpeg');
    } catch (err) {
      const seed = Math.floor(Math.random() * 1000000);
      resultImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true&seed=${seed}`;
    }

    // 4. Supabase'e veya local state'e kaydet
    const conversionData = {
      theme_slug: theme.slug,
      theme_label: theme.label,
      original_image_url: originalImageUrl,
      result_image_url: resultImageUrl, // Üretilen 3D AI görsel URL'i
      result_description: finalDescription,
      prompt: imagePrompt, // Prompt kütüphanesi için üretim prompt'u (ozellik_onerileri.md #10)
      status: CONVERSION_STATUS.DONE,
    };

    const { data: savedConversion, error: saveError } =
      await addConversion(conversionData);

    if (saveError) {
      console.error('Supabase kayıt hatası:', saveError);
    }

    const displayResult = savedConversion || {
      ...conversionData,
      description: finalDescription,
      created_at: new Date().toISOString(),
    };

    return { displayResult, imagePrompt };
  };

  /**
   * Dönüşüm başlatma işleyicisi.
   * Rate limiting, validasyon, API çağrısı ve Supabase kaydı yapar.
   */
  const handleConvert = async () => {
    // Validasyon
    if (!selectedTheme) {
      showToast(t('converter.toast.theme'), 'error');
      return;
    }
    if (!uploadedFile) {
      showToast(t('converter.toast.image'), 'error');
      return;
    }

    // Günlük kredi kontrolü
    if (!hasCredits) {
      showToast(t('converter.toast.noCredits', { limit }), 'error');
      return;
    }

    // Rate limiting kontrolü (Persisted across page reload)
    const now = Date.now();
    const storedLastRequest = localStorage.getItem('gameskinai_last_request_time');
    const lastRequestTimestamp = storedLastRequest ? parseInt(storedLastRequest, 10) : lastRequestTime.current;
    const timeSinceLastRequest = (now - lastRequestTimestamp) / 1000;

    if (timeSinceLastRequest < RATE_LIMIT_SECONDS && lastRequestTimestamp !== 0) {
      const remainingSeconds = Math.ceil(
        RATE_LIMIT_SECONDS - timeSinceLastRequest
      );
      showToast(
        t('converter.rateLimit', { seconds: remainingSeconds }),
        'error'
      );
      return;
    }

    const theme = THEMES.find((t) => t.slug === selectedTheme) || getThemeBySlug(selectedTheme);
    if (!theme) {
      showToast('Geçersiz tema seçimi.', 'error');
      return;
    }

    setIsConverting(true);
    setResult(null);
    setConversionError(null);
    setLastImagePrompt(null);
    lastRequestTime.current = Date.now();
    try {
      localStorage.setItem('gameskinai_last_request_time', lastRequestTime.current.toString());
    } catch (e) {
      console.warn('Rate limit kaydı kaydedilemedi:', e);
    }

    try {
      // 1. Görüntüyü base64'e çevir (Gemini analizi için)
      const { base64, mimeType } = await fileToBase64(uploadedFile);

      // 2. Orijinal fotoğrafı Supabase Storage'a yükle
      let originalImageUrl = previewUrl;
      try {
        originalImageUrl = await uploadImage(uploadedFile);
      } catch (err) {
        console.error('Orijinal görsel yükleme hatası:', err);
      }

      // 3. AI analizi + görsel üretimi + kayıt (ortak akış)
      const { displayResult, imagePrompt } = await performThemeConversion({
        theme,
        base64,
        mimeType,
        originalImageUrl,
      });

      // Varyasyon üretiminde yeniden kullanılmak üzere sakla
      setLastImagePrompt(imagePrompt);

      // 4. Sonucu göster
      setResult(displayResult);
      showToast(t('converter.toast.success'), 'success');
      // Sekme arka plandaysa yerel bildirim gönder (ozellik_onerileri.md #15)
      showLocalNotification(t('pwa.notifConversionReady'), {
        body: theme?.label || '',
        url: window.location.pathname,
        tag: 'conversion-ready',
      });
      // Kredi sayacını güncelle
      refreshCredits();
    } catch (error) {
      console.error('Dönüşüm hatası:', error);
      showToast(t('converter.toast.error'), 'error');
      setConversionError(error.message || t('converter.toast.error'));
    } finally {
      setIsConverting(false);
    }
  };

  /**
   * Batch dönüşüm işleyicisi (ozellik_onerileri.md #16).
   * Tek fotoğrafı seçilen tüm temalara sırayla dönüştürür.
   * Her tema 1 kredi harcar; fotoğraf analizi için base64 ve orijinal
   * yükleme yalnızca bir kez yapılır.
   */
  const handleBatchConvert = async () => {
    // Validasyon
    if (selectedThemes.length < 2) {
      showToast(t('converter.batchMinThemes'), 'error');
      return;
    }
    if (!uploadedFile) {
      showToast(t('converter.toast.image'), 'error');
      return;
    }
    if (!hasCredits || remaining < selectedThemes.length) {
      showToast(t('converter.toast.noCredits', { limit }), 'error');
      return;
    }

    // Rate limiting kontrolü (batch için tek sefer)
    const now = Date.now();
    const storedLastRequest = localStorage.getItem('gameskinai_last_request_time');
    const lastRequestTimestamp = storedLastRequest ? parseInt(storedLastRequest, 10) : lastRequestTime.current;
    const timeSinceLastRequest = (now - lastRequestTimestamp) / 1000;

    if (timeSinceLastRequest < RATE_LIMIT_SECONDS && lastRequestTimestamp !== 0) {
      const remainingSeconds = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastRequest);
      showToast(t('converter.rateLimit', { seconds: remainingSeconds }), 'error');
      return;
    }

    setIsConverting(true);
    setResult(null);
    setBatchResults([]);
    setConversionError(null);
    setLastImagePrompt(null);
    lastRequestTime.current = Date.now();
    try {
      localStorage.setItem('gameskinai_last_request_time', lastRequestTime.current.toString());
    } catch (e) {
      console.warn('Rate limit kaydı kaydedilemedi:', e);
    }

    try {
      // Fotoğraf hazırlığı (tüm temalar için bir kez)
      const { base64, mimeType } = await fileToBase64(uploadedFile);
      let originalImageUrl = previewUrl;
      try {
        originalImageUrl = await uploadImage(uploadedFile);
      } catch (err) {
        console.error('Orijinal görsel yükleme hatası:', err);
      }

      const total = selectedThemes.length;
      let successCount = 0;

      // Temaları sırayla dönüştür (her tema kendi prompt'unu kullanır)
      for (let i = 0; i < total; i++) {
        const slug = selectedThemes[i];
        const theme = THEMES.find((th) => th.slug === slug) || getThemeBySlug(slug) ||
          themes.find((th) => th.slug === slug);
        if (!theme) continue;

        setBatchProgress({ current: i + 1, total, themeLabel: theme.label });

        try {
          const { displayResult } = await performThemeConversion({
            theme,
            base64,
            mimeType,
            originalImageUrl,
          });
          successCount++;
          setBatchResults((prev) => [...prev, { theme, result: displayResult, error: null }]);
        } catch (err) {
          console.error(`Batch dönüşüm hatası (${theme.label}):`, err);
          setBatchResults((prev) => [...prev, { theme, result: null, error: err.message || 'error' }]);
        }
      }

      if (successCount === total) {
        showToast(t('converter.batchDone', { count: successCount }), 'success');
        // Sekme arka plandaysa yerel bildirim gönder (ozellik_onerileri.md #15)
        showLocalNotification(t('pwa.notifConversionReady'), {
          body: t('converter.batchDone', { count: successCount }),
          url: window.location.pathname,
          tag: 'conversion-ready',
        });
      } else {
        showToast(
          t('converter.batchPartial', { success: successCount, total, failed: total - successCount }),
          'error'
        );
      }
      refreshCredits();
    } catch (error) {
      console.error('Batch dönüşüm hatası:', error);
      showToast(t('converter.toast.error'), 'error');
      setConversionError(error.message || t('converter.toast.error'));
    } finally {
      setBatchProgress(null);
      setIsConverting(false);
    }
  };

  /**
   * Yeniden dönüştürme işleyicisi.
   */
  const handleRetry = () => {
    setResult(null);
    setBatchResults([]);
    setConversionError(null);
    setLastImagePrompt(null);
  };

  /**
   * Seçilen varyasyonu ana sonuç görseli yapar ve kaydı günceller (kredi harcamaz).
   */
  const handleApplyVariation = async (url) => {
    if (!result || !url) return;
    setResult((prev) => ({ ...prev, result_image_url: url }));
    if (result.id) {
      await updateConversion(result.id, { result_image_url: url });
    }
    showToast(t('result.variationApplied'), 'success');
  };

  // Kullanıcı adını al
  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    t('common.user');


  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Karşılama */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-navy-700 dark:text-white">
            {t('converter.welcome', { name: displayName })}
          </h2>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            {t('converter.subtitle')}
          </p>
        </div>

        {/* Günlük Kredi Göstergesi */}
        <div
          className={`flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-sm ${
            hasCredits
              ? 'border-brand-200 bg-white dark:border-brand-400/30 dark:bg-navy-800'
              : 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              hasCredits
                ? 'bg-brand-100 text-brand-500 dark:bg-brand-500/20'
                : 'bg-red-100 text-red-500 dark:bg-red-500/20'
            }`}
          >
            <MdBolt className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('converter.creditsLabel')}
            </p>
            <p
              className={`text-lg font-black ${
                hasCredits ? 'text-navy-700 dark:text-white' : 'text-red-500'
              }`}
            >
              {remaining} / {limit}
            </p>
          </div>
        </div>
      </div>

      {/* Kredi Bitti Uyarısı */}
      {!hasCredits && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          ⚡ {t('converter.noCreditsBanner', { limit })}
        </div>
      )}

      {/* Ana İçerik Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol: Tema Seçimi (2 kolon genişliğinde) */}
        <div className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              {t('converter.step1')}
            </h3>
            {!batchMode && selectedTheme && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ✓ {t('converter.selected')}
              </span>
            )}
            {batchMode && selectedThemes.length > 0 && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ✓ {t('converter.batchSelectedCount', { count: selectedThemes.length })}
              </span>
            )}
            {/* Batch Mod Anahtarı (ozellik_onerileri.md #16) */}
            <button
              type="button"
              onClick={handleBatchModeToggle}
              disabled={isConverting}
              title={t('converter.batchModeHint')}
              className={`ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                batchMode
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
              } ${isConverting ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <MdLayers className="h-4 w-4" />
              {t('converter.batchModeLabel')}
            </button>
          </div>
          <ThemeSelector
            selectedTheme={selectedTheme}
            onSelect={handleThemeSelect}
            disabled={isConverting}
            themes={themes}
            multiSelect={batchMode}
            selectedThemes={selectedThemes}
          />
        </div>

        {/* Sağ: Fotoğraf Yükleme */}
        <div className="xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              {t('converter.step2')}
            </h3>
            {uploadedFile && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ✓ {t('converter.uploaded')}
              </span>
            )}
          </div>
          <ImageUploader
            file={uploadedFile}
            preview={previewUrl}
            onFileSelect={handleFileSelect}
            onFileClear={handleFileClear}
            error={uploadError}
            onError={setUploadError}
            disabled={isConverting}
          />

          {/* AI Stil Ayarları (isteğe bağlı) */}
          <div className="mt-6">
            <StyleSelector
              styleSettings={styleSettings}
              onChange={handleStyleChange}
              disabled={isConverting}
            />
          </div>
        </div>
      </div>

      {/* Dönüştür Butonu */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={batchMode ? handleBatchConvert : handleConvert}
          disabled={
            (batchMode ? selectedThemes.length < 2 : !selectedTheme) ||
            !uploadedFile ||
            isConverting ||
            !hasCredits
          }
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-600 px-10 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:from-brand-500 hover:to-brand-700 hover:shadow-2xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-xl"
        >
          <MdAutoAwesome className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
          {isConverting
            ? t('converter.converting')
            : batchMode
            ? t('converter.btnBatchConvert', { count: selectedThemes.length })
            : t('converter.btnConvert')}
        </button>
      </div>

      {/* Batch İlerleme Göstergesi */}
      {batchProgress && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-brand-200 bg-white px-5 py-4 shadow-sm dark:border-brand-400/30 dark:bg-navy-800">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm font-semibold text-navy-700 dark:text-white">
            {t('converter.batchProgress', {
              theme: batchProgress.themeLabel,
              current: batchProgress.current,
              total: batchProgress.total,
            })}
          </p>
        </div>
      )}

      {/* Batch Sonuçları Karşılaştırma Grid'i */}
      {batchResults.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <MdLayers className="h-5 w-5 text-brand-500" />
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              {t('converter.batchResultsTitle')}
            </h3>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              {batchResults.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {batchResults.map(({ theme, result: themeResult }) => (
              <div
                key={theme.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-navy-600 dark:bg-navy-800"
              >
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <span className="truncate text-sm font-bold text-navy-700 dark:text-white">
                    {theme.label}
                  </span>
                  {themeResult && (
                    <a
                      href={themeResult.result_image_url}
                      download={`gameskin-${theme.slug}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-600 active:scale-95"
                    >
                      <MdDownload className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {themeResult ? (
                  <img
                    src={themeResult.result_image_url}
                    alt={theme.label}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-red-50 text-red-500 dark:bg-red-500/10">
                    <MdErrorOutline className="h-8 w-8" />
                    <span className="text-xs font-semibold">{t('converter.toast.error')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sonuç Alanı */}
      <ConversionResult
        result={result}
        isConverting={isConverting && !batchMode}
        onRetry={handleRetry}
        errorMessage={conversionError}
        imagePrompt={lastImagePrompt}
        onApplyVariation={handleApplyVariation}
      />
    </div>
  );
}
