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
    'nav.goToHome': 'Anasayfaya Git',

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

    // Profile Page (Tüm Çevirileri Tamamlandı)
    'profile.title': 'Profilim',
    'profile.subtitle': 'Hesap bilgilerinizi yönetin',
    'profile.demoBanner': 'Şu anda Demo Modundasınız. Profil ve şifre değişiklikleriniz yerel ortamda anlık olarak test edilebilir.',
    'profile.memberSince': 'Üyelik Tarihi',
    'profile.statsTotal': 'Toplam Dönüşüm',
    'profile.statsFav': 'En Çok Kullanılan Tema',
    'profile.mostUsedTheme': 'En Çok Kullanılan',
    'profile.formTitle': 'Profil Bilgileri',
    'profile.emailLabel': 'E-posta Adresi',
    'profile.emailNote': 'E-posta adresi değiştirilemez.',
    'profile.nameLabel': 'Görünen Ad',
    'profile.namePlaceholder': 'Adınızı girin',
    'profile.bioLabel': 'Hakkımda / Biyografi',
    'profile.bioPlaceholder': 'Kendinizden kısaca bahsedin (örn: Minecraft & Valorant sevdalısı)...',
    'profile.favGameLabel': 'Favori Oyun Evreni',
    'profile.avatarLabel': 'Profil Avatar Amblemi',
    'profile.btnSave': 'Değişiklikleri Kaydet',
    'profile.btnSaving': 'Kaydediliyor...',
    'profile.pwTitle': 'Şifre Değiştir',
    'profile.currentPwLabel': 'Mevcut Şifre',
    'profile.currentPwPlaceholder': 'Güvenlik için mevcut şifrenizi girin',
    'profile.newPwLabel': 'Yeni Şifre',
    'profile.newPwPlaceholder': 'Yeni güçlü şifreniz',
    'profile.suggestPw': 'Güçlü Şifre Öner',
    'profile.suggestedPwNotice': 'Önerilen güçlü şifre dolduruldu!',
    'profile.pwConfirmLabel': 'Yeni Şifre Tekrar',
    'profile.pwConfirmPlaceholder': 'Yeni şifrenizi tekrar girin',
    'profile.pwMatch': 'Şifreler eşleşiyor.',
    'profile.pwMismatch': 'Şifreler eşleşmiyor.',
    'profile.btnChangePw': 'Şifreyi Değiştir',
    'profile.btnChangingPw': 'Değiştiriliyor...',
    'profile.pwReqTitle': 'Şifre Güvenlik Kriterleri:',
    'profile.pwReqLength': 'En az 8 karakter',
    'profile.pwReqUpper': 'En az 1 büyük harf (A-Z)',
    'profile.pwReqLower': 'En az 1 küçük harf (a-z)',
    'profile.pwReqNumber': 'En az 1 rakam (0-9)',
    'profile.pwReqSpecial': 'En az 1 özel karakter (!@#$%...)',
    'profile.strengthTitle': 'Şifre Gücü:',
    'profile.strengthWeak': 'Zayıf',
    'profile.strengthMedium': 'Orta',
    'profile.strengthStrong': 'Güçlü',
    'profile.strengthVeryStrong': 'Çok Güçlü',
    'profile.rankTitle': 'Hesap Başarımları',
    'profile.rankBadge1': 'İlk Skin',
    'profile.rankBadge1Sub': 'Kazanıldı',
    'profile.rankBadge2': 'AI Kaşifi',
    'profile.rankBadge2Sub': 'Aktif',
    'profile.rankBadge3': 'Güvenli',
    'profile.rankBadge3Sub': 'Doğrulandı',
    'profile.rankRookie': '🥉 Çaylak Dönüştürücü',
    'profile.rankVeteran': '🥈 Kıdemli Savaşçı',
    'profile.rankMaster': '🥇 Skin Ustası',
    'profile.rankLegend': '💎 Efsanevi GameSkin Üstadı',
    'profile.toastSuccess': 'Değişiklikler başarıyla kaydedildi!',
    'profile.pwSuccess': 'Şifreniz başarıyla değiştirildi!',
    'profile.currentPwErr': 'Mevcut şifreniz hatalı. Lütfen tekrar kontrol edin.',
    'profile.fillCurrentPw': 'Lütfen mevcut şifrenizi giriniz.',
    'profile.meetCriteria': 'Yeni şifreniz tüm güvenlik kriterlerini karşılamalıdır.',

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

    // Landing Page
    'landing.menuFeatures': 'Özellikler',
    'landing.menuDemo': 'Canlı Demo',
    'landing.menuHowItWorks': 'Nasıl Çalışır?',
    'landing.menuShowcase': 'Galeri',
    'landing.menuFaq': 'SSS',
    'landing.heroTag': '⚡ Yapay Zekâ Destekli Skin & Prompt Platformu',
    'landing.heroTitle': 'Oyun Karakterlerinizi AI ile Efsanevi Skinlere Dönüştürün',
    'landing.heroSubtitle': 'Fotoğrafınızı yükleyin veya bir konsept seçin; yapay zekâ anında Unreal Engine, Unity ve Oyun Motorları için hazır görseller ve istemler üretsin.',
    'landing.heroBullet1': 'Anında Prompt & Stil Üretimi',
    'landing.heroBullet2': 'Unreal & Unity Uyumlu',
    'landing.heroBullet3': 'Ücretsiz Deneme',
    'landing.heroLivePreview': 'GameSkinAI Canlı Önizleme',
    'landing.heroOriginalInput': 'ORİJİNAL GİRDİ',
    'landing.heroInputType': 'Görsel / Metin',
    'landing.heroAiConversion': 'AI STİL DÖNÜŞÜMÜ',
    'landing.heroRenderReady': '8K Render Ready',
    'landing.heroAvgTime': '⚡ Ortalama Üretim Süresi:',
    'landing.btnGetStarted': 'Hemen Ücretsiz Başla',
    'landing.btnExploreShowcase': 'Galeriyi Keşfet',
    'landing.btnGoToDashboard': "AI Stüdyo'ya Git",

    'landing.demo1Title': 'Cyberpunk Assassin',
    'landing.demo1Badge': 'Futuristic Neon',
    'landing.demo1Input': 'Portre fotoğrafı / Temel insan modeli',
    'landing.demo2Title': 'Dark Fantasy Paladin',
    'landing.demo2Badge': 'Medieval RPG',
    'landing.demo2Input': 'Standard karakter taslağı',
    'landing.demo3Title': 'Mecha Pilot',
    'landing.demo3Badge': 'Sci-Fi Armor',
    'landing.demo3Input': 'Portre fotoğrafı',

    'landing.featuresTitle': 'Güçlü Özellikler',
    'landing.featuresHeading': 'Hayalinizdeki Oyun Karakterini Üretmek Artık Çok Kolay',
    'landing.featuresSubtitle': 'GameSkinAI ile hayalinizdeki oyun karakterlerini üretmek artık çok kolay.',
    'landing.feature1Title': 'Akıllı AI Prompt Dönüştürücü',
    'landing.feature1Desc': 'Yüklediğiniz fotoğrafı ve seçtiğiniz konsepti analiz eder; Unreal Engine, Unity ve Midjourney / Stable Diffusion için kusursuz istemler üretir.',
    'landing.feature2Title': '15+ Zengin Oyun Stili',
    'landing.feature2Desc': 'Cyberpunk, Dark Fantasy, Sci-Fi Armor, Anime RPG, Steampunk, Post-Apocalyptic ve daha birçok popüler oyun stilinde karakter tasarımları.',
    'landing.feature3Title': 'Topluluk Galerisi & Paylaşım',
    'landing.feature3Desc': 'Diğer oyun geliştiricileri ve dijital sanatçıların ürettiği en popüler AI skin istemlerini keşfedin, tek tıkla kopyalayın veya kendi tasarımlarınızı yayınlayın.',
    'landing.feature4Title': 'Geçmiş Yönetimi & Dışa Aktarım',
    'landing.feature4Desc': 'Tüm üretimleriniz güvenle saklanır. Yüksek çözünürlüklü görsellerinizi veya .txt formatındaki hazır promptlarınızı anında bilgisayarınıza indirin.',
    'landing.featureExplore': 'Detaylı İncele',

    'landing.demoTitle': 'Canlı Dönüşüm Demosu',
    'landing.demoHeading': 'Giriş Yapmadan Canlı Olarak Deneyin',
    'landing.demoSubtitle': 'Aşağıdaki adımları uygulayın ve yapay zekanın sonucunu anında test edin.',
    'landing.demoStep1': '1. Konsept veya Karakter Referansı Seçin:',
    'landing.demoStep1Note': 'Girdi Mantığı',
    'landing.demoStep2': '2. Dönüştürülecek Oyun Stilini Seçin:',
    'landing.demoBtnConvert': 'Seçili Konsepti AI ile Dönüştür',
    'landing.demoAnalyzing': 'AI Analiz Yapıyor (%{progress})...',
    'landing.demoPlaceholderTitle': 'Dönüşüm Sonucu Burada Görüntülenecek',
    'landing.demoPlaceholderDesc': 'Yukarıdan bir konsept ve oyun stili belirledikten sonra "Seçili Konsepti AI ile Dönüştür" butonuna tıklayın.',
    'landing.demoLoadingEngine': 'Yapay Zekâ Motoru Çalışıyor...',
    'landing.demoLoadingDesc': 'Görsel analiz ediliyor → İstemler hazırlanıyor → 8K render ready.',
    'landing.demoSuccessBadge': 'AI Dönüşümü Başarıyla Tamamlandı!',
    'landing.demoCopyPrompt': 'Promptu Kopyala',
    'landing.demoCopied': 'Kopyalandı!',
    'landing.demoInputRef': 'Girdi Referansı:',
    'landing.demoAppliedStyle': 'Uygulanan Stil:',
    'landing.demoOutputLabel': 'Üretilen 8K Oyun Motoru Promptu:',
    'landing.demoCompatibility': 'Unreal Engine 5 & Midjourney Uyumlu',
    'landing.demoReconvert': 'Yeniden Dönüştür',
    'landing.demoTryInApp': 'Kendi Fotoğrafınla Uygulamada Dene',

    'landing.concept1': 'Savaşçı Kadın Karakter Modeli',
    'landing.concept2': 'Büyücü Kadın Karakter Taslağı',
    'landing.concept3': 'Futuristik Mecha / Robot',
    'landing.concept4': 'Erkek Karakter Portre Referansı',

    'landing.howBadge': 'Kolay Akış',
    'landing.howTitle': '3 Adımda Nasıl Çalışır?',
    'landing.howSubtitle': 'GameSkinAI ile sadece saniyeler içinde efsanevi oyun skinleri ve promptları oluşturun.',
    'landing.step1Title': 'Fotoğraf veya Görsel Yükleyin',
    'landing.step1Desc': 'Portre fotoğrafınızı, konsept taslağınızı veya karakter referansınızı sisteme kolayca yükleyin.',
    'landing.step2Title': 'Oyun Stilini & Temayı Seçin',
    'landing.step2Desc': 'Cyberpunk, Dark Fantasy, Sci-Fi Armor gibi 15+ özel hazırlanmış oyun konsepti arasından tercihinizi yapın.',
    'landing.step3Title': 'AI ile Dönüştürün & İndirin',
    'landing.step3Desc': 'Yapay zeka saniyeler içinde 8K kalitesinde isteminizi hazırlar. İster görseli ister .txt formatındaki promptu indirin!',

    'landing.showcaseTitle': 'Topluluk Vitrini',
    'landing.showcaseHeading': 'Topluluk Tarafından Üretilen Efsanevi Skinler',
    'landing.showcaseSubtitle': 'Kullanıcılarımız tarafından oluşturulan en son efsanevi karakterler ve ilham kaynakları.',
    'landing.showcaseViewAll': 'Tüm Galeriyi Gör',
    'landing.showcaseAuthor': 'Üreten:',
    'landing.showcaseCopyPrompt': 'Promptu Kopyala',

    'landing.faqTitle': 'Sıkça Sorulan Sorular',
    'landing.faqHeading': 'Aklınıza Takılan Sorular',
    'landing.faqSubtitle': 'GameSkinAI hakkında merak edilen sorular ve yanıtları.',

    'landing.faq1Q': 'GameSkinAI tam olarak ne işe yarar?',
    'landing.faq1A': 'GameSkinAI, yüklediğiniz portre fotoğraflarını veya konsept metinlerini analiz ederek oyun motorlarında (Unreal Engine, Unity, Midjourney, Stable Diffusion vb.) kullanabileceğiniz yüksek detaylı oyun karakteri görselleri ve 8K detaylı istemler (prompt) oluşturur.',
    'landing.faq2Q': 'Ürettiğim skin ve promptları ticari projelerimde kullanabilir miyim?',
    'landing.faq2A': 'Evet! GameSkinAI ile ürettiğiniz tüm istem metinleri ve görseller tamamen sizin mülkiyetinizdedir. Bağımsız oyunlarınızda, 3D modellerinizde veya dijital projelerinizde özgürce kullanabilirsiniz.',
    'landing.faq3Q': 'Sistem ücretsiz mi? Deneme hakkı var mı?',
    'landing.faq3A': 'Evet! Sisteme tamamen ücretsiz kayıt olarak ücretsiz deneme kredilerinizle anında yapay zeka dönüşümlerine başlayabilirsiniz.',
    'landing.faq4Q': 'Hangi oyun stilleri destekleniyor?',
    'landing.faq4A': 'Cyberpunk, Dark Fantasy, Sci-Fi Armor, Anime RPG, Steampunk, Post-Apocalyptic, Medieval Knight ve daha 15\'ten fazla popüler oyun stili hazır olarak desteklenmektedir.',
    'landing.faq5Q': 'Fotoğraflarım ve kişisel verilerim güvende mi?',
    'landing.faq5A': 'Kesinlikle! Yüklediğiniz fotoğraflar sadece AI dönüşümü için işlenir ve gizlilik ilkelerimiz gereği kesinlikle üçüncü taraflarla paylaşılmaz.',

    'landing.ctaTitle': 'Kendi Oyun Skinini Üretmeye Hazır Mısın?',
    'landing.ctaSubtitle': 'Saniyeler içinde kayıt ol ve yapay zekanın gücüyle tanış.',
    'landing.footerDesc': 'Yapay zekâ teknolojisiyle fotoğraflarınızı ve konsept taslaklarınızı oyun motorları için hazır efsanevi skin ve istemlere dönüştürün.',
    'landing.footerNavProduct': 'Ürün & Gezinme',
    'landing.footerNavAccount': 'Hesap & Uygulama',
    'landing.footerPrivacy': 'Gizlilik Politikası',
    'landing.footerTerms': 'Kullanım Koşulları',
  },

  en: {
    // Navigation
    'nav.pages': 'Pages',
    'nav.goToHome': 'Go to Homepage',
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

    // Profile Page (Full EN Translations)
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your account settings',
    'profile.demoBanner': 'You are currently in Demo Mode. Your profile and password changes can be tested live locally.',
    'profile.memberSince': 'Member Since',
    'profile.statsTotal': 'Total Conversions',
    'profile.statsFav': 'Most Used Theme',
    'profile.mostUsedTheme': 'Most Used',
    'profile.formTitle': 'Profile Information',
    'profile.emailLabel': 'Email Address',
    'profile.emailNote': 'Email address cannot be changed.',
    'profile.nameLabel': 'Display Name',
    'profile.namePlaceholder': 'Enter your name',
    'profile.bioLabel': 'About Me / Bio',
    'profile.bioPlaceholder': 'Tell us briefly about yourself (e.g. Minecraft & Valorant fan)...',
    'profile.favGameLabel': 'Favorite Game Universe',
    'profile.avatarLabel': 'Profile Avatar Badge',
    'profile.btnSave': 'Save Changes',
    'profile.btnSaving': 'Saving...',
    'profile.pwTitle': 'Change Password',
    'profile.currentPwLabel': 'Current Password',
    'profile.currentPwPlaceholder': 'Enter your current password for security',
    'profile.newPwLabel': 'New Password',
    'profile.newPwPlaceholder': 'Your new strong password',
    'profile.suggestPw': 'Suggest Strong Password',
    'profile.suggestedPwNotice': 'Suggested strong password applied!',
    'profile.pwConfirmLabel': 'Confirm New Password',
    'profile.pwConfirmPlaceholder': 'Re-enter your new password',
    'profile.pwMatch': 'Passwords match.',
    'profile.pwMismatch': 'Passwords do not match.',
    'profile.btnChangePw': 'Change Password',
    'profile.btnChangingPw': 'Changing...',
    'profile.pwReqTitle': 'Password Security Requirements:',
    'profile.pwReqLength': 'At least 8 characters',
    'profile.pwReqUpper': 'At least 1 uppercase letter (A-Z)',
    'profile.pwReqLower': 'At least 1 lowercase letter (a-z)',
    'profile.pwReqNumber': 'At least 1 number (0-9)',
    'profile.pwReqSpecial': 'At least 1 special character (!@#$%...)',
    'profile.strengthTitle': 'Password Strength:',
    'profile.strengthWeak': 'Weak',
    'profile.strengthMedium': 'Medium',
    'profile.strengthStrong': 'Strong',
    'profile.strengthVeryStrong': 'Very Strong',
    'profile.rankTitle': 'Account Achievements',
    'profile.rankBadge1': 'First Skin',
    'profile.rankBadge1Sub': 'Earned',
    'profile.rankBadge2': 'AI Explorer',
    'profile.rankBadge2Sub': 'Active',
    'profile.rankBadge3': 'Secured',
    'profile.rankBadge3Sub': 'Verified',
    'profile.rankRookie': '🥉 Rookie Converter',
    'profile.rankVeteran': '🥈 Veteran Warrior',
    'profile.rankMaster': '🥇 Skin Master',
    'profile.rankLegend': '💎 Legendary GameSkin Master',
    'profile.toastSuccess': 'Changes saved successfully!',
    'profile.pwSuccess': 'Password changed successfully!',
    'profile.currentPwErr': 'Current password is incorrect. Please double check.',
    'profile.fillCurrentPw': 'Please enter your current password.',
    'profile.meetCriteria': 'Your new password must meet all security requirements.',

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

    // Common
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.user': 'User',

    // Landing Page
    'landing.menuFeatures': 'Features',
    'landing.menuDemo': 'Live Demo',
    'landing.menuHowItWorks': 'How It Works',
    'landing.menuShowcase': 'Showcase',
    'landing.menuFaq': 'FAQ',
    'landing.heroTag': '⚡ AI-Powered Skin & Prompt Platform',
    'landing.heroTitle': 'Transform Your Game Characters into Legendary Skins with AI',
    'landing.heroSubtitle': 'Upload your photo or choose a concept; let AI generate ready-to-use visuals and prompts for Unreal Engine, Unity, and game engines.',
    'landing.heroBullet1': 'Instant Prompt & Style Generation',
    'landing.heroBullet2': 'Unreal & Unity Compatible',
    'landing.heroBullet3': 'Free Trial',
    'landing.heroLivePreview': 'GameSkinAI Live Preview',
    'landing.heroOriginalInput': 'ORIGINAL INPUT',
    'landing.heroInputType': 'Visual / Text',
    'landing.heroAiConversion': 'AI STYLE CONVERSION',
    'landing.heroRenderReady': '8K Render Ready',
    'landing.heroAvgTime': '⚡ Average Generation Time:',
    'landing.btnGetStarted': 'Get Started Free',
    'landing.btnExploreShowcase': 'Explore Showcase',
    'landing.btnGoToDashboard': 'Go to AI Studio',

    'landing.demo1Title': 'Cyberpunk Assassin',
    'landing.demo1Badge': 'Futuristic Neon',
    'landing.demo1Input': 'Portrait photo / Base human model',
    'landing.demo2Title': 'Dark Fantasy Paladin',
    'landing.demo2Badge': 'Medieval RPG',
    'landing.demo2Input': 'Standard character sketch',
    'landing.demo3Title': 'Mecha Pilot',
    'landing.demo3Badge': 'Sci-Fi Armor',
    'landing.demo3Input': 'Portrait photo',

    'landing.featuresTitle': 'Powerful Features',
    'landing.featuresHeading': 'Creating Your Dream Game Character is Now Super Easy',
    'landing.featuresSubtitle': 'Creating your dream game characters is now super easy with GameSkinAI.',
    'landing.feature1Title': 'Smart AI Prompt Converter',
    'landing.feature1Desc': 'Analyzes your uploaded photo and concept; produces flawless prompts for Unreal Engine, Unity, and Midjourney / Stable Diffusion.',
    'landing.feature2Title': '15+ Rich Game Styles',
    'landing.feature2Desc': 'Cyberpunk, Dark Fantasy, Sci-Fi Armor, Anime RPG, Steampunk, Post-Apocalyptic, and many more popular game style character designs.',
    'landing.feature3Title': 'Community Showcase & Sharing',
    'landing.feature3Desc': 'Explore the most popular AI skin prompts created by game developers and digital artists, copy with one click or publish your own designs.',
    'landing.feature4Title': 'History Management & Export',
    'landing.feature4Desc': 'All your generations are saved securely. Download high-resolution images or .txt format ready prompts instantly to your computer.',
    'landing.featureExplore': 'Explore Details',

    'landing.demoTitle': 'Live Conversion Demo',
    'landing.demoHeading': 'Try It Live Without Signing In',
    'landing.demoSubtitle': 'Follow the steps below and instantly test the AI output.',
    'landing.demoStep1': '1. Select Concept or Character Reference:',
    'landing.demoStep1Note': 'Input Logic',
    'landing.demoStep2': '2. Select Game Style to Convert:',
    'landing.demoBtnConvert': 'Convert Selected Concept with AI',
    'landing.demoAnalyzing': 'AI Analyzing (%{progress})...',
    'landing.demoPlaceholderTitle': 'Conversion Result Will Appear Here',
    'landing.demoPlaceholderDesc': 'After selecting a concept and game style above, click the "Convert Selected Concept with AI" button.',
    'landing.demoLoadingEngine': 'AI Engine Running...',
    'landing.demoLoadingDesc': 'Visual analyzing → Prompts preparing → 8K render ready.',
    'landing.demoSuccessBadge': 'AI Conversion Completed Successfully!',
    'landing.demoCopyPrompt': 'Copy Prompt',
    'landing.demoCopied': 'Copied!',
    'landing.demoInputRef': 'Input Reference:',
    'landing.demoAppliedStyle': 'Applied Style:',
    'landing.demoOutputLabel': 'Generated 8K Game Engine Prompt:',
    'landing.demoCompatibility': 'Unreal Engine 5 & Midjourney Compatible',
    'landing.demoReconvert': 'Re-convert',
    'landing.demoTryInApp': 'Try in App with Your Own Photo',

    'landing.concept1': 'Female Warrior Character Model',
    'landing.concept2': 'Female Mage Character Sketch',
    'landing.concept3': 'Futuristic Mecha / Robot',
    'landing.concept4': 'Male Portrait Photo Reference',

    'landing.howBadge': 'Easy Workflow',
    'landing.howTitle': 'How It Works in 3 Steps',
    'landing.howSubtitle': 'Create legendary game skins and prompts in seconds with GameSkinAI.',
    'landing.step1Title': 'Upload Photo or Visual',
    'landing.step1Desc': 'Easily upload your portrait photo, concept sketch, or character reference into the system.',
    'landing.step2Title': 'Select Game Style & Theme',
    'landing.step2Desc': 'Choose from 15+ specially crafted game concepts like Cyberpunk, Dark Fantasy, Sci-Fi Armor.',
    'landing.step3Title': 'Convert with AI & Download',
    'landing.step3Desc': 'AI prepares your prompt in 8K quality within seconds. Download either the image or the prompt in .txt format!',

    'landing.showcaseTitle': 'Community Showcase',
    'landing.showcaseHeading': 'Legendary Skins Created by the Community',
    'landing.showcaseSubtitle': 'Latest legendary characters and inspiration created by our users.',
    'landing.showcaseViewAll': 'View Full Gallery',
    'landing.showcaseAuthor': 'Created by:',
    'landing.showcaseCopyPrompt': 'Copy Prompt',

    'landing.faqTitle': 'Frequently Asked Questions',
    'landing.faqHeading': 'Questions on Your Mind',
    'landing.faqSubtitle': 'Frequently asked questions and answers about GameSkinAI.',

    'landing.faq1Q': 'What exactly does GameSkinAI do?',
    'landing.faq1A': 'GameSkinAI analyzes your uploaded portrait photos or concept texts to generate high-detail game character visuals and 8K detailed prompts ready to use in game engines (Unreal Engine, Unity, Midjourney, Stable Diffusion, etc.).',
    'landing.faq2Q': 'Can I use generated skins and prompts in my commercial projects?',
    'landing.faq2A': 'Yes! All prompt texts and visuals generated with GameSkinAI are completely your property. You are free to use them in your indie games, 3D models, or digital projects.',
    'landing.faq3Q': 'Is the system free? Is there a free trial?',
    'landing.faq3A': 'Yes! You can sign up completely free of charge and start creating AI conversions immediately with your free trial credits.',
    'landing.faq4Q': 'Which game styles are supported?',
    'landing.faq4A': 'Cyberpunk, Dark Fantasy, Sci-Fi Armor, Anime RPG, Steampunk, Post-Apocalyptic, Medieval Knight, and more than 15 popular game styles are supported out of the box.',
    'landing.faq5Q': 'Are my photos and personal data secure?',
    'landing.faq5A': 'Absolutely! Uploaded photos are processed strictly for AI conversion and are never shared with third parties per our privacy policy.',

    'landing.ctaTitle': 'Ready to Create Your Own Game Skin?',
    'landing.ctaSubtitle': 'Sign up in seconds and experience the power of AI.',
    'landing.footerDesc': 'Transform your photos and concept sketches into ready-to-use legendary skins and prompts for game engines with AI technology.',
    'landing.footerNavProduct': 'Product & Navigation',
    'landing.footerNavAccount': 'Account & App',
    'landing.footerPrivacy': 'Privacy Policy',
    'landing.footerTerms': 'Terms of Use',
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

  useEffect(() => {
    const urlLang = getLangFromUrlPath(location.pathname);
    if (urlLang && urlLang !== lang) {
      setLang(urlLang);
      localStorage.setItem('gameskinai_lang', urlLang);
    } else if (!urlLang && location.pathname !== '/') {
      const segments = location.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const activeLang = lang || localStorage.getItem('gameskinai_lang') || 'tr';
        const newPath = '/' + activeLang + '/' + segments.join('/') + location.search;
        navigate(newPath, { replace: true });
      }
    }
  }, [location.pathname, location.search, lang, navigate]);

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
