/**
 * @fileoverview Supabase client konfigürasyonu.
 * Tüm Supabase işlemleri bu dosyadan export edilen client ile yapılır.
 *
 * Gerekli Supabase tabloları (SQL):
 *
 * -- conversions tablosu
 * CREATE TABLE conversions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   theme_slug TEXT NOT NULL,
 *   theme_label TEXT NOT NULL,
 *   original_image_url TEXT,
 *   result_image_url TEXT,
 *   result_description TEXT,
 *   status TEXT DEFAULT 'pending', -- pending | processing | done | error
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
 * );
 *
 * -- Row Level Security
 * ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can only see their own conversions"
 *   ON conversions FOR ALL USING (auth.uid() = user_id);
 *
 * -- themes tablosu
 * CREATE TABLE themes (
 *   id SERIAL PRIMARY KEY,
 *   slug TEXT UNIQUE NOT NULL,
 *   label TEXT NOT NULL,
 *   description TEXT,
 *   prompt TEXT NOT NULL,
 *   icon TEXT,
 *   active BOOLEAN DEFAULT true
 * );
 */

import { createClient } from '@supabase/supabase-js';

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
  } catch {
    return false;
  }
}

/**
 * Supabase Anon Key'in geçerli (JWT formatında) olup olmadığını kontrol eder.
 * @param {string} key
 * @returns {boolean}
 */
function isValidSupabaseKey(key) {
  if (!key || key.includes('placeholder') || key.includes('your_') || key.includes('your-')) {
    return false;
  }
  // Supabase anon/public anahtarları her zaman 3 parçadan oluşan bir JWT'dir (Header.Payload.Signature) ve 'eyJ' ile başlar.
  const parts = key.split('.');
  return parts.length === 3 && key.startsWith('eyJ');
}

const isConfigured = isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    'Supabase yapılandırılmamış veya geçersiz kimlik bilgileri tespit edildi. .env dosyanıza geçerli REACT_APP_SUPABASE_URL ve REACT_APP_SUPABASE_ANON_KEY (JWT formatında) ekleyin. Uygulama Demo Modunda çalışıyor.'
  );
}

/**
 * Supabase client.
 * Yapılandırılmamışsa dummy URL ile oluşturulur (API çağrıları başarısız olur ama uygulama crash olmaz).
 */
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-key'
);

/** Supabase'in doğru yapılandırılıp yapılandırılmadığını gösterir */
export const isSupabaseConfigured = isConfigured;

/**
 * Orijinal dosyayı Supabase Storage'a yükler.
 * @param {File} file - Yüklenecek dosya
 * @param {string} bucketName - Storage bucket adı
 * @returns {Promise<string>} Resim public URL'i veya base64 data URL
 */
export async function uploadImage(file, bucketName = 'conversions') {
  if (!isSupabaseConfigured) {
    // Demo/offline mod fallback: base64'e çevirip döndür
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Storage yükleme hatası, yerel URL kullanılıyor:', error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Storage yükleme hatası:', err);
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
 * @returns {Promise<string>} Yüklenen resmin public URL'i
 */
export async function uploadBase64Image(base64Str, mimeType = 'image/jpeg', bucketName = 'conversions') {
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
    console.error('Base64 resmi dönüştürme ve yükleme hatası:', err);
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

