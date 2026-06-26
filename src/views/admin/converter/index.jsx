/**
 * @fileoverview Ana dönüştürme sayfası (Dashboard).
 * Tema seçimi, fotoğraf yükleme ve AI dönüşüm akışını yönetir.
 * Tüm state bu sayfada tutulur ve alt bileşenlere aktarılır.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useConversions } from 'hooks/useConversions';
import { analyzeAndConvert, fileToBase64, generateImage } from 'lib/gemini';
import { THEMES, getThemeBySlug } from 'lib/themes';
import { uploadImage, uploadBase64Image, fetchThemes } from 'lib/supabase';
import {
  CONVERSION_STATUS,
  RATE_LIMIT_SECONDS,
  MESSAGES,
} from 'lib/constants';
import ThemeSelector from 'components/converter/ThemeSelector';
import ImageUploader from 'components/converter/ImageUploader';
import ConversionResult from 'components/converter/ConversionResult';
import { MdAutoAwesome } from 'react-icons/md';

/**
 * Converter sayfası.
 * Kullanıcının tema seçip fotoğraf yükleyerek AI dönüşümü başlattığı ana sayfa.
 */
export default function Converter() {
  const { user } = useAuth();
  const { addConversion } = useConversions();

  // Dinamik temalar state
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    async function loadThemes() {
      try {
        const dbThemes = await fetchThemes();
        if (dbThemes && dbThemes.length > 0) {
          const formattedThemes = dbThemes.map((t) => ({
            ...t,
            color: t.color || 'purple',
            bgGradient: t.bgGradient || 'from-purple-500 to-violet-600',
            icon: t.icon || 'FaUserAstronaut',
          }));
          setThemes(formattedThemes);
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

  // Toast/bildirim state
  const [toast, setToast] = useState(null);

  /**
   * Toast bildirim gösterir.
   * @param {string} message - Mesaj
   * @param {'success'|'error'|'info'} type - Bildirim tipi
   */
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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
   * @param {File} file - Seçilen dosya
   * @param {string} preview - Önizleme URL'i
   */
  const handleFileSelect = (file, preview) => {
    setUploadedFile(file);
    setPreviewUrl(preview);
    setUploadError(null);
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
      showToast(MESSAGES.SELECT_THEME, 'error');
      return;
    }
    if (!uploadedFile) {
      showToast(MESSAGES.UPLOAD_IMAGE, 'error');
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
        `Lütfen ${remainingSeconds} saniye daha bekleyin.`,
        'error'
      );
      return;
    }

    const theme = themes.find((t) => t.slug === selectedTheme) || getThemeBySlug(selectedTheme);
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
      const aiResult = await analyzeAndConvert(base64, mimeType, theme.prompt);

      // 4. Görsel üretimi için prompt hazırla
      let resultImageUrl = '';
      const imagePrompt = `${theme.label} character based on: ${aiResult.description}. Stylized matching ${theme.label} game aesthetic, centered portrait, single character, high-quality detailed render, clean plain studio background.`;

      try {
        const resultImageBase64 = await generateImage(imagePrompt);
        // 5. Üretilen görseli Supabase'e yükle
        resultImageUrl = await uploadBase64Image(resultImageBase64, 'image/jpeg');
      } catch (err) {
        console.warn('Görsel üretimi veya Storage yüklemesi başarısız oldu, doğrudan URL yedeklemesi (Pollinations AI) yapılıyor:', err);
        // Tarayıcı tarafındaki CORS/403 engellerini aşmak için doğrudan Pollinations URL'ini kullan
        const seed = Math.floor(Math.random() * 1000000);
        resultImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true&seed=${seed}`;
      }

      // 6. Supabase'e kaydet
      const conversionData = {
        theme_slug: theme.slug,
        theme_label: theme.label,
        original_image_url: originalImageUrl,
        result_image_url: resultImageUrl,
        result_description: aiResult.description,
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
        description: aiResult.description,
        created_at: new Date().toISOString(),
      };

      setResult(displayResult);
      showToast(MESSAGES.CONVERSION_SUCCESS, 'success');
    } catch (error) {
      console.error('Dönüşüm hatası:', error);
      setConversionError(error.message || MESSAGES.CONVERSION_ERROR);
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
    'Kullanıcı';

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Toast Bildirimi */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-brand-500 text-white'
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Karşılama */}
      <div>
        <h2 className="text-3xl font-bold text-navy-700 dark:text-white">
          Merhaba, {displayName}! 👋
        </h2>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
          Fotoğrafınızı seçin, bir tema belirleyin ve AI ile dönüştürün.
        </p>
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol: Tema Seçimi (2 kolon genişliğinde) */}
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              1. Tema Seçin
            </h3>
            {selectedTheme && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ✓ Seçildi
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
              2. Fotoğraf Yükleyin
            </h3>
            {uploadedFile && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ✓ Yüklendi
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
          {isConverting ? 'Dönüştürülüyor...' : 'Dönüştür'}
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
