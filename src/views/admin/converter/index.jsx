/**
 * @fileoverview Ana dönüştürme sayfası (Dashboard).
 * Tema seçimi, fotoğraf yükleme ve AI dönüşüm akışını yönetir.
 * Tüm state bu sayfada tutulur ve alt bileşenlere aktarılır.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useConversions } from 'hooks/useConversions';
import { analyzeAndConvert, fileToBase64, generateImage } from 'lib/gemini';
import { THEMES, getThemeBySlug } from 'lib/themes';
import { uploadImage, uploadBase64Image, fetchThemes } from 'lib/supabase';
import {
  CONVERSION_STATUS,
  RATE_LIMIT_SECONDS,
} from 'lib/constants';
import ThemeSelector from 'components/converter/ThemeSelector';
import ImageUploader from 'components/converter/ImageUploader';
import ConversionResult from 'components/converter/ConversionResult';
import { MdAutoAwesome } from 'react-icons/md';
import { normalizeSkinData, parseTextDescriptionToSkinData } from 'lib/skinDataParser';
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';


/**
 * Converter sayfası.
 * Kullanıcının tema seçip fotoğraf yükleyerek AI dönüşümü başlattığı ana sayfa.
 */
export default function Converter() {
  const { user } = useAuth();
  const { addConversion } = useConversions();
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

  // Dönüşüm state
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState(null);
  const [conversionError, setConversionError] = useState(null);

  // Rate limiting
  const lastRequestTime = useRef(0);

  // Global toast
  const { showToast } = useToast();

  /**
   * Tema seçim işleyicisi.
   * @param {string} slug - Seçilen tema slug'ı
   */
  const handleThemeSelect = (slug) => {
    setSelectedTheme(slug);
    // Önceki sonucu temizle
    if (result) {
      setResult(null);
      setConversionError(null);
    }
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

    // Rate limiting kontrolü
    const now = Date.now();
    const timeSinceLastRequest = (now - lastRequestTime.current) / 1000;
    if (timeSinceLastRequest < RATE_LIMIT_SECONDS && lastRequestTime.current !== 0) {
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
    lastRequestTime.current = Date.now();

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

      // 3. Gemini API'ye gönder (Açıklama üret)
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

      // 4. Görsel üretimi için prompt hazırla
      let resultImageUrl = '';
      const imagePrompt = isMinecraft
        ? `Stunning official Minecraft game keyart illustration style, highly detailed 3D blocky voxel character based on: ${safeDescription}. Dynamic heroic pose, volumetric studio lighting, soft ambient occlusion, vibrant colors, clean soft background, premium game cover render.`
        : `${theme.label} character based on: ${safeDescription}. Stylized matching ${theme.label} game aesthetic, centered portrait, single character, high-quality detailed render, clean plain studio background.`;

      try {
        const resultImageBase64 = await generateImage(imagePrompt);
        // 5. Üretilen görseli Supabase'e yükle
        resultImageUrl = await uploadBase64Image(resultImageBase64, 'image/jpeg');
      } catch (err) {
        console.warn('Görsel üretimi veya Storage yüklemesi başarısız oldu, doğrudan URL yedeklemesi (Pollinations AI) yapılıyor:', err);
        const seed = Math.floor(Math.random() * 1000000);
        resultImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true&seed=${seed}`;
      }

      // 6. Supabase'e veya local state'e kaydet
      const conversionData = {
        theme_slug: theme.slug,
        theme_label: theme.label,
        original_image_url: originalImageUrl,
        result_image_url: resultImageUrl, // Üretilen 3D AI görsel URL'i
        result_description: finalDescription,
        status: CONVERSION_STATUS.DONE,
      };

      const { data: savedConversion, error: saveError } =
        await addConversion(conversionData);

      if (saveError) {
        console.error('Supabase kayıt hatası:', saveError);
      }

      // 7. Sonucu göster
      const displayResult = savedConversion || {
        ...conversionData,
        description: finalDescription,
        created_at: new Date().toISOString(),
      };

      setResult(displayResult);
      showToast(t('converter.toast.success'), 'success');
    } catch (error) {
      console.error('Dönüşüm hatası:', error);
      showToast(t('converter.toast.error'), 'error');
      setConversionError(error.message || t('converter.toast.error'));
    } finally {
      setIsConverting(false);
    }
  };

  /**
   * Yeniden dönüştürme işleyicisi.
   */
  const handleRetry = () => {
    setResult(null);
    setConversionError(null);
  };

  // Kullanıcı adını al
  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    t('common.user');


  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Karşılama */}
      <div>
        <h2 className="text-3xl font-bold text-navy-700 dark:text-white">
          {t('converter.welcome', { name: displayName })}
        </h2>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
          {t('converter.subtitle')}
        </p>
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol: Tema Seçimi (2 kolon genişliğinde) */}
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              {t('converter.step1')}
            </h3>
            {selectedTheme && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ✓ {t('converter.selected')}
              </span>
            )}
          </div>
          <ThemeSelector
            selectedTheme={selectedTheme}
            onSelect={handleThemeSelect}
            disabled={isConverting}
            themes={themes}
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
        </div>
      </div>

      {/* Dönüştür Butonu */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleConvert}
          disabled={!selectedTheme || !uploadedFile || isConverting}
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-600 px-10 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:from-brand-500 hover:to-brand-700 hover:shadow-2xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-xl"
        >
          <MdAutoAwesome className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
          {isConverting ? t('converter.converting') : t('converter.btnConvert')}
        </button>
      </div>

      {/* Sonuç Alanı */}
      <ConversionResult
        result={result}
        isConverting={isConverting}
        onRetry={handleRetry}
        errorMessage={conversionError}
      />
    </div>
  );
}
