/**
 * @fileoverview Çoklu dil desteği (i18n) için Context ve Hook.
 * Harici paket bağımlılığı olmadan hafif ve performanslı dil yönetimi sağlar.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TranslationContext = createContext(null);


const LANGUAGES = {
  tr: {
    // Navigation
    'nav.pages': 'Sayfalar',
    'nav.converter': 'Dönüştürücü',
    'nav.history': 'Geçmişim',
    'nav.marketplace': 'Topluluk Galerisi',
    'nav.profile': 'Profilim',
    'nav.logout': 'Çıkış Yap',

    // Sidebar & Footer
    'sidebar.cardDesc': 'Fotoğraflarınızı AI ile oyun karakterlerine dönüştürün!',
    'sidebar.cardBtn': 'Dönüştürmeye Başla',
    'footer.rights': 'Tüm hakları saklıdır.',


    // Marketplace / Community
    'marketplace.title': 'Topluluk Galerisi 🎨',
    'marketplace.subtitle': 'Diğer kullanıcıların ürettiği en popüler AI oyun karakterlerini keşfedin.',
    'marketplace.searchPlaceholder': 'Galeride karakter veya tema ara...',
    'marketplace.makePublic': 'Toplulukta Paylaş',
    'marketplace.isPublic': 'Toplulukta Yayında',
    'marketplace.noSkins': 'Henüz yayınlanmış bir topluluk skini bulunmuyor.',
    'share.copiedSuccess': 'Bağlantı panoya kopyalandı!',


    // Converter Page
    'converter.welcome': 'Merhaba, {name}! 👋',
    'converter.subtitle': 'Fotoğrafınızı seçin, bir tema belirleyin ve AI ile dönüştürün.',
    'converter.step1': '1. Tema Seçin',
    'converter.step2': '2. Fotoğraf Yükleyin',
    'converter.selected': 'Seçildi',
    'converter.uploaded': 'Yüklendi',
    'converter.btnConvert': 'Dönüştür',
    'converter.converting': 'Dönüştürülüyor...',
    'converter.toast.theme': 'Lütfen bir tema seçin.',
    'converter.toast.image': 'Lütfen bir fotoğraf yükleyin.',
    'converter.toast.success': 'Dönüşüm tamamlandı!',
    'converter.toast.error': 'Dönüşüm sırasında bir hata oluştu.',
    'converter.rateLimit': 'Lütfen {seconds} saniye daha bekleyin.',
    
    // ImageUploader
    'uploader.dragActive': 'Fotoğrafı buraya bırakın...',
    'uploader.dragInstruction': 'Fotoğrafınızı sürükleyip bırakın',
    'uploader.or': 'veya',
    'uploader.selectFile': 'Dosya Seçin',
    'uploader.specs': 'JPEG, PNG veya WebP • Maks. 5MB',
    'uploader.btnCamera': 'Kamera ile Çek',
    'uploader.originalPhoto': 'Orijinal Fotoğraf',

    // ConversionResult
    'result.successTitle': 'Dönüşüm Tamamlandı!',
    'result.btnDownloadImage': 'Görseli İndir',
    'result.btnDownloadText': 'Açıklamayı İndir (.txt)',
    'result.btnRetry': 'Yeniden Dönüştür',
    'result.aiCharacter': 'Yapay Zeka Karakteri',
    'result.descTitle': 'Karakter Açıklaması:',
    'result.viewSlider': 'Slider Görünümü',
    'result.viewSplit': 'Yan Yana Görünüm',
    'result.loadingTitle': 'AI Dönüşüm Yapılıyor...',
    'result.loadingDesc': 'Fotoğrafınız analiz edilip oyun karakterine dönüştürülüyor. Bu işlem birkaç saniye sürebilir.',

    // History Page
    'history.title': 'Geçmişim',
    'history.total': 'Toplam {count} dönüşüm',
    'history.refresh': 'Yenile',
    'history.empty': 'Henüz dönüşüm yok',
    'history.emptyDesc': 'İlk dönüşümünüzü yaparak başlayın! Fotoğrafınızı yükleyin ve bir oyun teması seçin.',
    'history.btnStart': 'İlk Dönüşümünü Yap',
    'history.btnDelete': 'Sil',
    'history.btnView': 'Detay',
    'history.noResults': 'Aradığınız kriterlere uygun sonuç bulunamadı.',
    'history.searchPlaceholder': 'Geçmişte ara (tema, açıklama...)',
    'history.allThemes': 'Tüm Temalar',
    'history.sortNewest': 'En Yeni İlk',
    'history.sortOldest': 'En Eski İlk',
    'history.statusCompleted': 'Tamamlandı',
    'history.showLess': 'Daha az göster',
    'history.readMore': 'Devamını oku',
    'history.detail': 'Detay',
    'history.deleting': 'Siliniyor...',
    'common.delete': 'Sil',

    
    // Profile Page
    'profile.title': 'Profilim',
    'profile.subtitle': 'Hesap bilgilerinizi yönetin',
    'profile.demoWarning': 'Demo modundasınız. Profil değişiklikleri kaydedilmeyecektir. Gerçek hesap kullanmak için Supabase yapılandırmasını tamamlayın.',
    'profile.memberSince': 'Üyelik Tarihi',
    'profile.statsTotal': 'Toplam Dönüşüm',
    'profile.statsFav': 'En Çok Kullanılan Tema',
    'profile.formTitle': 'Profil Bilgileri',
    'profile.emailLabel': 'E-posta Adresi',
    'profile.emailNote': 'E-posta adresi değiştirilemez.',
    'profile.nameLabel': 'Görünen Ad',
    'profile.namePlaceholder': 'Adınızı girin',
    'profile.btnSave': 'Değişiklikleri Kaydet',
    'profile.btnSaving': 'Kaydediliyor...',
    'profile.pwTitle': 'Şifre Değiştir',
    'profile.pwLabel': 'Yeni Şifre',
    'profile.pwPlaceholder': 'En az 6 karakter',
    'profile.pwConfirmLabel': 'Şifre Tekrar',
    'profile.pwConfirmPlaceholder': 'Şifrenizi tekrar girin',
    'profile.pwMismatch': 'Şifreler eşleşmiyor.',
    'profile.btnChangePw': 'Şifreyi Değiştir',
    'profile.btnChangingPw': 'Değiştiriliyor...',

    // Auth
    'auth.forgotPassword': 'Şifremi Unuttum',
    'auth.forgotPasswordSubtitle': 'E-posta adresinizi girin, şifre sıfırlama bağlantısını gönderelim.',
    'auth.sendResetLink': 'Sıfırlama Bağlantısı Gönder',
    'auth.backToSignIn': 'Giriş Sayfasına Dön',
    'auth.backToDashboard': 'Dashboard\'a Dön',
    'auth.resetSuccess': 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu kontrol edin.',


    // Common
    'common.close': 'Kapat',
    'common.cancel': 'İptal',
    'common.user': 'Kullanıcı',
  },

  en: {
    // Navigation
    'nav.pages': 'Pages',
    'nav.converter': 'Converter',
    'nav.history': 'My History',
    'nav.marketplace': 'Community Showcase',
    'nav.profile': 'My Profile',
    'nav.logout': 'Sign Out',

    // Sidebar & Footer
    'sidebar.cardDesc': 'Convert your photos into game characters with AI!',
    'sidebar.cardBtn': 'Start Converting',
    'footer.rights': 'All rights reserved.',


    // Marketplace / Community
    'marketplace.title': 'Community Showcase 🎨',
    'marketplace.subtitle': 'Explore the most popular AI game characters created by other users.',
    'marketplace.searchPlaceholder': 'Search character or theme in gallery...',
    'marketplace.makePublic': 'Share to Community',
    'marketplace.isPublic': 'Public in Gallery',
    'marketplace.noSkins': 'No community skins published yet.',
    'share.copiedSuccess': 'Link copied to clipboard!',


    // Auth
    'auth.forgotPassword': 'Forgot Password',
    'auth.forgotPasswordSubtitle': 'Enter your email address and we will send you a reset link.',
    'auth.sendResetLink': 'Send Reset Link',
    'auth.backToSignIn': 'Back to Sign In',
    'auth.backToDashboard': 'Back to Dashboard',
    'auth.resetSuccess': 'Password reset link sent to your email address! Please check your inbox.',


    // Converter Page

    'converter.welcome': 'Hello, {name}! 👋',
    'converter.subtitle': 'Select a photo, choose a theme, and convert with AI.',
    'converter.step1': '1. Choose Theme',
    'converter.step2': '2. Upload Photo',
    'converter.selected': 'Selected',
    'converter.uploaded': 'Uploaded',
    'converter.btnConvert': 'Convert',
    'converter.converting': 'Converting...',
    'converter.toast.theme': 'Please select a theme.',
    'converter.toast.image': 'Please upload a photo.',
    'converter.toast.success': 'Conversion completed!',
    'converter.toast.error': 'An error occurred during conversion.',
    'converter.rateLimit': 'Please wait {seconds} seconds.',

    // ImageUploader
    'uploader.dragActive': 'Drop the photo here...',
    'uploader.dragInstruction': 'Drag and drop your photo',
    'uploader.or': 'or',
    'uploader.selectFile': 'Select File',
    'uploader.specs': 'JPEG, PNG or WebP • Max 5MB',
    'uploader.btnCamera': 'Take Photo',
    'uploader.originalPhoto': 'Original Photo',

    // ConversionResult
    'result.successTitle': 'Conversion Completed!',
    'result.btnDownloadImage': 'Download Image',
    'result.btnDownloadText': 'Download Description (.txt)',
    'result.btnRetry': 'Convert Again',
    'result.aiCharacter': 'AI Character',
    'result.descTitle': 'Character Description:',
    'result.viewSlider': 'Slider View',
    'result.viewSplit': 'Split View',
    'result.loadingTitle': 'AI Conversion in Progress...',
    'result.loadingDesc': 'Your photo is being analyzed and converted into a game character. This process may take a few seconds.',

    // History Page
    'history.title': 'My History',
    'history.total': 'Total {count} conversions',
    'history.refresh': 'Refresh',
    'history.empty': 'No conversions yet',
    'history.emptyDesc': 'Get started by making your first conversion! Upload a photo and choose a game theme.',
    'history.btnStart': 'Make Your First Conversion',
    'history.btnDelete': 'Delete',
    'history.btnView': 'Details',
    'history.noResults': 'No results found matching your criteria.',
    'history.searchPlaceholder': 'Search history (theme, description...)',
    'history.allThemes': 'All Themes',
    'history.sortNewest': 'Newest First',
    'history.sortOldest': 'Oldest First',
    'history.statusCompleted': 'Completed',
    'history.showLess': 'Show less',
    'history.readMore': 'Read more',
    'history.detail': 'Details',
    'history.deleting': 'Deleting...',
    'common.delete': 'Delete',


    // Profile Page
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your account settings',
    'profile.demoWarning': 'You are in demo mode. Profile changes will not be saved. Complete Supabase configuration to use a real account.',
    'profile.memberSince': 'Member Since',
    'profile.statsTotal': 'Total Conversions',
    'profile.statsFav': 'Most Used Theme',
    'profile.formTitle': 'Profile Information',
    'profile.emailLabel': 'Email Address',
    'profile.emailNote': 'Email address cannot be changed.',
    'profile.nameLabel': 'Display Name',
    'profile.namePlaceholder': 'Enter your name',
    'profile.btnSave': 'Save Changes',
    'profile.btnSaving': 'Saving...',
    'profile.pwTitle': 'Change Password',
    'profile.pwLabel': 'New Password',
    'profile.pwPlaceholder': 'At least 6 characters',
    'profile.pwConfirmLabel': 'Confirm Password',
    'profile.pwConfirmPlaceholder': 'Re-enter your password',
    'profile.pwMismatch': 'Passwords do not match.',
    'profile.btnChangePw': 'Change Password',
    'profile.btnChangingPw': 'Changing...',

    // Common
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.user': 'User',
  }
};


const getLangFromUrlPath = () => {
  try {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && LANGUAGES[segments[0]]) {
      return segments[0];
    }
  } catch (e) {
    // ignore
  }
  return null;
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation hook, TranslationProvider içinde kullanılmalıdır.');
  }
  return context;
};

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const pathLang = getLangFromUrlPath();
    if (pathLang) return pathLang;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && LANGUAGES[urlLang]) {
        return urlLang;
      }
    } catch (e) {
      // Fallback
    }
    return localStorage.getItem('gameskinai_lang') || 'tr';
  });

  // HTML kök etiketinin lang özniteliğini aktif dil ile senkronize et
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // URL değişikliklerini dinle
  useEffect(() => {
    const handleLocationChange = () => {
      const pathLang = getLangFromUrlPath();
      if (pathLang && pathLang !== lang) {
        setLang(pathLang);
        localStorage.setItem('gameskinai_lang', pathLang);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [lang]);

  const changeLanguage = useCallback((newLang) => {
    if (LANGUAGES[newLang]) {
      setLang(newLang);
      localStorage.setItem('gameskinai_lang', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }

      // URL path'ini güncelle (/tr/admin/converter -> /en/admin/converter)
      try {
        const currentPath = window.location.pathname;
        const segments = currentPath.split('/').filter(Boolean);
        
        let newPath = '';
        if (segments.length > 0 && LANGUAGES[segments[0]]) {
          segments[0] = newLang;
          newPath = '/' + segments.join('/');
        } else {
          newPath = '/' + newLang + (currentPath.startsWith('/') ? currentPath : '/' + currentPath);
        }

        if (window.location.search) {
          newPath += window.location.search;
        }

        window.history.pushState({}, '', newPath);
      } catch (e) {
        // yoksay
      }
    }
  }, []);

  const t = useCallback((key, params = {}) => {
    let translation = LANGUAGES[lang]?.[key] || LANGUAGES['tr']?.[key] || key;

    // Parametreleri değiştir (örneğin {name} -> "Batuhan")
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{${paramKey}}`, value);
    });

    return translation;
  }, [lang]);

  return (
    <TranslationContext.Provider value={{ t, lang, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}


