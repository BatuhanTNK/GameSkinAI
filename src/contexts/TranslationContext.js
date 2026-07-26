import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
    'auth.resetPasswordTitle': 'Yeni Şifre Oluştur',
    'auth.resetPasswordSubtitle': 'Lütfen hesabınız için yeni ve güçlü bir şifre girin.',
    'auth.newPasswordLabel': 'Yeni Şifre*',
    'auth.newPasswordPlaceholder': 'Yeni güçlü şifrenizi girin',
    'auth.confirmNewPasswordLabel': 'Yeni Şifre Tekrar*',
    'auth.confirmNewPasswordPlaceholder': 'Yeni şifrenizi tekrar girin',
    'auth.updatePasswordBtn': 'Şifreyi Güncelle',
    'auth.updatingPassword': 'Şifre güncelleniyor...',
    'auth.resetSuccessTitle': 'Şifreniz Değiştirildi! 🎉',
    'auth.resetSuccessSubtitle': 'Yeni şifreniz başarıyla kaydedildi. Artık yeni şifrenizle giriş yapabilirsiniz.',
    'auth.backToSignIn': 'Giriş Sayfasına Dön',
    'auth.backToDashboard': 'Dashboard\'a Dön',
    'auth.resetSuccess': 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu kontrol edin.',
    'auth.signInTitle': 'Giriş Yap',
    'auth.signInSubtitle': 'GameSkinAI\'ya hoş geldiniz! Devam etmek için giriş yapın.',
    'auth.signInWithGoogle': 'Google ile Giriş Yap',
    'auth.orWithEmail': 'veya e-posta ile',
    'auth.forgotPasswordLink': 'Şifremi unuttum?',
    'auth.signInBtn': 'Giriş Yap',
    'auth.signingIn': 'Giriş yapılıyor...',
    'auth.dontHaveAccount': 'Hesabınız yok mu?',
    'auth.signUpLink': 'Kayıt olun',
    'auth.googleLoginFailed': 'Google girişi başarısız.',
    'auth.invalidCredentials': 'E-posta veya şifre hatalı.',
    'auth.emailNotConfirmed': 'E-posta adresiniz henüz doğrulanmamış.',
    'auth.signUpTitle': 'Kayıt Ol',
    'auth.signUpSubtitle': 'GameSkinAI\'ya katılın ve fotoğraflarınızı oyun karakterlerine dönüştürün!',
    'auth.usernameLabel': 'Kullanıcı Adı*',
    'auth.usernamePlaceholder': 'Kullanıcı adınızı girin',
    'auth.emailLabel': 'E-posta*',
    'auth.emailPlaceholder': 'ornek@email.com',
    'auth.passwordLabel': 'Şifre*',
    'auth.passwordPlaceholder': 'Güçlü bir şifre girin',
    'auth.confirmPasswordLabel': 'Şifre Tekrar*',
    'auth.confirmPasswordPlaceholder': 'Şifrenizi tekrar girin',
    'auth.signUpBtn': 'Kayıt Ol',
    'auth.signingUp': 'Kayıt yapılıyor...',
    'auth.alreadyHaveAccount': 'Zaten hesabınız var mı?',
    'auth.signInLink': 'Giriş yapın',
    'auth.signUpSuccessTitle': 'Kayıt Başarılı! 🎉',
    'auth.signUpSuccessSubtitle': 'E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.',
    'auth.pwReqTitle': 'Güçlü Şifre Kriterleri:',
    'auth.pwReqLength': 'En az 8 karakter',
    'auth.pwReqUpper': 'En az 1 büyük harf (A-Z)',
    'auth.pwReqLower': 'En az 1 küçük harf (a-z)',
    'auth.pwReqNumber': 'En az 1 rakam (0-9)',
    'auth.pwReqSpecial': 'En az 1 özel karakter (!@#$%^&*)',
    'auth.pwStrengthTitle': 'Şifre Gücü:',
    'auth.pwStrengthWeak': 'Zayıf',
    'auth.pwStrengthMedium': 'Orta',
    'auth.pwStrengthStrong': 'Güçlü',
    'auth.pwStrengthVeryStrong': 'Çok Güçlü',
    'auth.suggestPassword': 'Güçlü Şifre Öner',
    'auth.suggestedPasswordCopied': 'Güçlü şifre oluşturuldu ve uygulandı!',
    'auth.fillAllFields': 'Lütfen tüm alanları doldurun.',
    'auth.usernameMinLength': 'Kullanıcı adı en az 3 karakter olmalıdır.',
    'auth.passwordRequirementsNotMet': 'Şifreniz tüm güvenlik kriterlerini karşılamalıdır.',
    'auth.passwordsDoNotMatch': 'Şifreler eşleşmiyor.',
    'auth.userAlreadyRegistered': 'Bu e-posta adresi veya kullanıcı adı zaten kayıtlı.',
    'auth.heroTitle': 'GameSkinAI',
    'auth.heroSubtitle': 'Fotoğraflarınızı yapay zeka ile efsanevi oyun karakterlerine dönüştürün.',
    'auth.heroFeature1': 'Anında AI Karakter Dönüşümü',
    'auth.heroFeature2': 'Cyberpunk, RPG & Anime Temaları',
    'auth.heroFeature3': 'Yüksek Çözünürlüklü Topluluk Galerisi',


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
    'auth.resetPasswordTitle': 'Create New Password',
    'auth.resetPasswordSubtitle': 'Please enter a new strong password for your account.',
    'auth.newPasswordLabel': 'New Password*',
    'auth.newPasswordPlaceholder': 'Enter your new strong password',
    'auth.confirmNewPasswordLabel': 'Confirm New Password*',
    'auth.confirmNewPasswordPlaceholder': 'Re-enter your new password',
    'auth.updatePasswordBtn': 'Update Password',
    'auth.updatingPassword': 'Updating password...',
    'auth.resetSuccessTitle': 'Password Changed! 🎉',
    'auth.resetSuccessSubtitle': 'Your new password has been saved. You can now sign in with your new password.',
    'auth.backToSignIn': 'Back to Sign In',
    'auth.backToDashboard': 'Back to Dashboard',
    'auth.resetSuccess': 'Password reset link sent to your email address! Please check your inbox.',
    'auth.signInTitle': 'Sign In',
    'auth.signInSubtitle': 'Welcome to GameSkinAI! Sign in to continue.',
    'auth.signInWithGoogle': 'Sign In with Google',
    'auth.orWithEmail': 'or with email',
    'auth.forgotPasswordLink': 'Forgot password?',
    'auth.signInBtn': 'Sign In',
    'auth.signingIn': 'Signing in...',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.signUpLink': 'Sign up',
    'auth.googleLoginFailed': 'Google login failed.',
    'auth.invalidCredentials': 'Invalid email or password.',
    'auth.emailNotConfirmed': 'Your email address has not been confirmed yet.',
    'auth.signUpTitle': 'Sign Up',
    'auth.signUpSubtitle': 'Join GameSkinAI and transform your photos into game characters!',
    'auth.usernameLabel': 'Username*',
    'auth.usernamePlaceholder': 'Enter your username',
    'auth.emailLabel': 'Email*',
    'auth.emailPlaceholder': 'example@email.com',
    'auth.passwordLabel': 'Password*',
    'auth.passwordPlaceholder': 'Enter a strong password',
    'auth.confirmPasswordLabel': 'Confirm Password*',
    'auth.confirmPasswordPlaceholder': 'Re-enter your password',
    'auth.signUpBtn': 'Sign Up',
    'auth.signingUp': 'Creating account...',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInLink': 'Sign in',
    'auth.signUpSuccessTitle': 'Registration Successful! 🎉',
    'auth.signUpSuccessSubtitle': 'We sent a verification link to your email address. Please check your inbox and verify your account.',
    'auth.pwReqTitle': 'Strong Password Criteria:',
    'auth.pwReqLength': 'At least 8 characters',
    'auth.pwReqUpper': 'At least 1 uppercase letter (A-Z)',
    'auth.pwReqLower': 'At least 1 lowercase letter (a-z)',
    'auth.pwReqNumber': 'At least 1 number (0-9)',
    'auth.pwReqSpecial': 'At least 1 special character (!@#$%^&*)',
    'auth.pwStrengthTitle': 'Password Strength:',
    'auth.pwStrengthWeak': 'Weak',
    'auth.pwStrengthMedium': 'Medium',
    'auth.pwStrengthStrong': 'Strong',
    'auth.pwStrengthVeryStrong': 'Very Strong',
    'auth.suggestPassword': 'Suggest Strong Password',
    'auth.suggestedPasswordCopied': 'Strong password generated and applied!',
    'auth.fillAllFields': 'Please fill in all fields.',
    'auth.usernameMinLength': 'Username must be at least 3 characters.',
    'auth.passwordRequirementsNotMet': 'Password must meet all security requirements.',
    'auth.passwordsDoNotMatch': 'Passwords do not match.',
    'auth.userAlreadyRegistered': 'This email address or username is already registered.',
    'auth.heroTitle': 'GameSkinAI',
    'auth.heroSubtitle': 'Transform your photos into epic gaming characters powered by AI.',
    'auth.heroFeature1': 'Instant AI Character Conversion',
    'auth.heroFeature2': 'Cyberpunk, RPG & Anime Themes',
    'auth.heroFeature3': 'High-Res Community Showcase',


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

const getLangFromUrlPath = (pathname) => {
  try {
    const segments = pathname.split('/').filter(Boolean);
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
  const location = useLocation();
  const navigate = useNavigate();

  const [lang, setLang] = useState(() => {
    const pathLang = getLangFromUrlPath(window.location.pathname);
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

  // URL adresi değiştikçe (örneğin kullanıcı adresteki /tr/ yerine /en/ yazdığında) dili anında güncelle
  useEffect(() => {
    const urlLang = getLangFromUrlPath(location.pathname);
    if (urlLang && urlLang !== lang) {
      setLang(urlLang);
      localStorage.setItem('gameskinai_lang', urlLang);
    } else if (!urlLang && location.pathname !== '/') {
      // URL'de /tr veya /en yoksa (ör. /auth/sign-up), mevcut dili URL'nin başına otomatik ekle: /tr/auth/sign-up
      const segments = location.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const activeLang = lang || localStorage.getItem('gameskinai_lang') || 'tr';
        const newPath = '/' + activeLang + '/' + segments.join('/') + location.search;
        navigate(newPath, { replace: true });
      }
    }
  }, [location.pathname, location.search, lang, navigate]);

  // HTML kök etiketinin lang özniteliğini aktif dil ile senkronize et
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const changeLanguage = useCallback((newLang) => {
    if (LANGUAGES[newLang]) {
      setLang(newLang);
      localStorage.setItem('gameskinai_lang', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }

      // URL path'ini güncelle (/tr/auth/sign-up -> /en/auth/sign-up)
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

        navigate(newPath);
      } catch (e) {
        // yoksay
      }
    }
  }, [navigate]);

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


