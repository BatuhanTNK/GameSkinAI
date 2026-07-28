/**
 * @fileoverview Supabase client konfigürasyonu ve storage/edge fonksiyon servisleri.
 */

import { createClient } from '@supabase/supabase-js';
import { validateImageMagicBytes } from './imageValidator';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

/**
 * Supabase URL'sinin geçerli olup olmadığını kontrol eder.
 * @param {string} url
 * @returns {boolean}
 */
function isValidSupabaseUrl(url) {
  if (!url || url.includes('placeholder') || url.includes('your_') || url.includes('your-')) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Geçersiz Supabase URL formatı:', err);
    }
    return false;
  }
}

/**
 * Supabase Anon Key'in geçerli olup olmadığını kontrol eder.
 * @param {string} key
 * @returns {boolean}
 */
function isValidSupabaseKey(key) {
  if (!key || typeof key !== 'string' || key.includes('placeholder') || key.includes('your_') || key.includes('your-')) {
    return false;
  }
  return key.trim().length > 10;
}

const isConfigured = isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey);

if (!isConfigured && process.env.NODE_ENV === 'development') {
  // Demo modu bilgilendirmesi
}

/**
 * Supabase client.
 */
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-key'
);

/** Supabase'in doğru yapılandırılıp yapılandırılmadığını gösterir */
export const isSupabaseConfigured = isConfigured;

/**
 * Orijinal dosyayı Supabase Storage'a yükler.
 * Magic byte kontrolü ile güvenli uzantı belirler (Bulgu A6, A7).
 * 
 * @param {File} file - Yüklenecek dosya
 * @param {string} bucketName - Storage bucket adı
 * @returns {Promise<string>} Resim public URL'i veya Signed URL
 */
export async function uploadImage(file, bucketName = 'conversions') {
  if (!isSupabaseConfigured) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Magic Byte ile güvenli uzantı belirleme (Bulgu A6)
  const magicCheck = await validateImageMagicBytes(file);
  let safeExt = 'jpg';
  if (magicCheck.detectedType === 'image/png') safeExt = 'png';
  else if (magicCheck.detectedType === 'image/webp') safeExt = 'webp';

  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const fileName = `${uuid}-${Date.now()}.${safeExt}`;
  const filePath = `${fileName}`;

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: false, contentType: magicCheck.detectedType || 'image/jpeg' });

    if (error) {
      console.error('Supabase Storage yükleme hatası, yerel URL kullanılıyor:', error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    // Bucket private ise Signed URL dene, değilse Public URL al (Bulgu A7)
    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 günlük erişim

      if (!signedError && signedData?.signedUrl) {
        return signedData.signedUrl;
      }
    } catch (sErr) {
      console.warn('Signed URL oluşturulamadı, public URL kullanılıyor:', sErr);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Storage yükleme istisnası:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Base64 formatındaki AI görselini Supabase Storage'a yükler.
 * @param {string} base64Str - Saf base64 string
 * @param {string} mimeType - Görüntünün MIME tipi
 * @param {string} bucketName - Storage bucket adı
 * @returns {Promise<string>} Yüklenen resmin URL'i
 */
export async function uploadBase64Image(base64Str, mimeType = 'image/jpeg', bucketName = 'conversions') {
  if (!base64Str) return '';
  if (typeof base64Str === 'string' && (base64Str.startsWith('http://') || base64Str.startsWith('https://'))) {
    return base64Str;
  }
  if (!isSupabaseConfigured) {
    return `data:${mimeType};base64,${base64Str}`;
  }

  try {
    const byteCharacters = atob(base64Str);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const fileExt = mimeType.split('/')[1] || 'jpeg';
    const file = new File([blob], `result-${Date.now()}.${fileExt}`, { type: mimeType });

    return await uploadImage(file, bucketName);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Base64 resmi dönüştürme uyarısı:', err.message);
    }
    return `data:${mimeType};base64,${base64Str}`;
  }
}

/**
 * Veritabanındaki 'themes' tablosundan aktif temaları çeker.
 * @returns {Promise<Array>} Tema listesi
 */
export async function fetchThemes() {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('active', true);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Temalar veritabanından çekilemedi:', err);
    return [];
  }
}

/**
 * Supabase Edge Function çağırır.
 * @param {string} functionName - Çağrılacak fonksiyon adı (ör. 'convert')
 * @param {Object} body - Fonksiyona gönderilecek body
 * @returns {Promise<Object>} Fonksiyondan dönen veri
 */
export async function invokeEdgeFunction(functionName, body) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase yapılandırılmamış.');
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });

  if (error) {
    throw new Error(error.message || 'Edge Function çağrısı başarısız oldu.');
  }

  return data;
}
