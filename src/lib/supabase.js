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
 * Supabase URL'nin geçerli olup olmadığını kontrol eder.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 0;

if (!isConfigured) {
  console.error(
    'Supabase yapılandırılmamış. .env dosyanıza geçerli REACT_APP_SUPABASE_URL ve REACT_APP_SUPABASE_ANON_KEY ekleyin.'
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
