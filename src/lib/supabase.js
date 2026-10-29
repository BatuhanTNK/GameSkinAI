/**
 * @fileoverview Supabase client konfigürasyonu ve storage/edge fonksiyon servisleri.
 */

import { createClient } from '@supabase/supabase-js';
import { validateImageMagicBytes } from './imageValidator';

const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

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
  if (!isSupabaseConfigured || process.env.NODE_ENV === 'development') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Magic Byte ile güvenli uzantı belirleme (Bulgu A6)
  const magicCheck = await validateImageMagicBytes(file);
  if (!magicCheck.isValid) throw new Error(magicCheck.error);
  let safeExt = 'jpg';
  if (magicCheck.detectedType === 'image/png') safeExt = 'png';
  else if (magicCheck.detectedType === 'image/webp') safeExt = 'webp';

  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const fileName = `${uuid}-${Date.now()}.${safeExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { upsert: false, contentType: magicCheck.detectedType });

  if (error) {
    throw new Error(`Görsel Supabase Storage'a yüklenemedi: ${error.message}`);
  }

  // Private bucket için erişilebilir bir bağlantı oluştur.
  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60 * 60 * 24 * 7);

  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }
  throw new Error(`Görsel erişim bağlantısı oluşturulamadı: ${signedError?.message || 'Boş yanıt'}`);
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
  const dataUrl = base64Str.match(/^data:(image\/[\w.+-]+);base64,([\s\S]+)$/);
  if (dataUrl) {
    mimeType = dataUrl[1];
    base64Str = dataUrl[2];
  }
  if (!isSupabaseConfigured || process.env.NODE_ENV === 'development') {
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
    throw new Error(`AI görseli kaydedilemedi: ${err.message}`);
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
    let message = error.message || 'Edge Function çağrısı başarısız oldu.';
    if (error.context && typeof error.context.json === 'function') {
      try {
        const details = await error.context.json();
        message = details.error || details.message || message;
      } catch (_) { /* Yanıt JSON olmayabilir. */ }
    } else if (error.name === 'FunctionsFetchError') {
      message = 'Supabase sunucusuna ulaşılamıyor. Proje adresini, projenin aktif olduğunu ve internet bağlantısını kontrol edin.';
    }
    const invocationError = new Error(message);
    invocationError.status = error.context?.status;
    throw invocationError;
  }

  if (data?.error) throw new Error(data.error);

  return data;
}
