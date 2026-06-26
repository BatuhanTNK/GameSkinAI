/**
 * @fileoverview Uygulama genelinde kullanılan sabitler.
 * Magic string kullanımını önlemek için tüm sabit değerler burada tanımlanır.
 */

/** Dönüşüm durumları */
export const CONVERSION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

/** Dosya yükleme limitleri */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  },
};

/** Rate limiting - saniye cinsinden */
export const RATE_LIMIT_SECONDS = 30;

export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.5-flash',
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
};

/** Supabase tablo isimleri */
export const TABLES = {
  CONVERSIONS: 'conversions',
  THEMES: 'themes',
};

/** Route yolları */
export const ROUTES = {
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  CONVERTER: '/admin/converter',
  HISTORY: '/admin/history',
};

/** Toast mesajları */
export const MESSAGES = {
  SIGN_IN_SUCCESS: 'Giriş başarılı!',
  SIGN_IN_ERROR: 'Giriş yapılırken bir hata oluştu.',
  SIGN_UP_SUCCESS: 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.',
  SIGN_UP_ERROR: 'Kayıt olurken bir hata oluştu.',
  SIGN_OUT_SUCCESS: 'Çıkış yapıldı.',
  CONVERSION_START: 'Dönüşüm başlatılıyor...',
  CONVERSION_SUCCESS: 'Dönüşüm tamamlandı!',
  CONVERSION_ERROR: 'Dönüşüm sırasında bir hata oluştu.',
  DELETE_SUCCESS: 'Kayıt silindi.',
  DELETE_ERROR: 'Silme işlemi başarısız oldu.',
  FILE_TOO_LARGE: 'Dosya boyutu 5MB\'dan büyük olamaz.',
  INVALID_FILE_TYPE: 'Sadece JPEG, PNG ve WebP formatları kabul edilir.',
  RATE_LIMIT: 'Lütfen yeni bir istek göndermeden önce 30 saniye bekleyin.',
  NETWORK_ERROR: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
  SELECT_THEME: 'Lütfen bir tema seçin.',
  UPLOAD_IMAGE: 'Lütfen bir fotoğraf yükleyin.',
};
