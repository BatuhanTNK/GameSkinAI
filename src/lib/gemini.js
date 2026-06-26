/**
 * @fileoverview Google Gemini 1.5 Flash API entegrasyonu.
 * Kullanıcı fotoğrafını analiz edip, seçilen oyun temasına göre
 * karakter açıklaması üretir.
 */

import { GEMINI_CONFIG } from './constants';

/**
 * Fotoğrafı analiz edip tema prompt'uyla birleştirerek AI ile dönüşüm yapar.
 * @param {string} imageBase64 - Base64 formatında görüntü verisi
 * @param {string} mimeType - Görüntünün MIME tipi (image/jpeg, image/png, image/webp)
 * @param {string} themePrompt - Seçilen temanın AI prompt metni
 * @returns {Promise<{description: string, imagePrompt: string}>} AI yanıtı
 * @throws {Error} API hatası durumunda Türkçe hata mesajı
 */
export async function analyzeAndConvert(imageBase64, mimeType, themePrompt) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  console.log('Browser API Key (ilk 10 hane):', apiKey ? apiKey.substring(0, 10) + '...' : 'yok', 'Model:', GEMINI_CONFIG.MODEL);

  if (!apiKey) {
    throw new Error('Gemini API anahtarı bulunamadı. .env dosyanızı kontrol edin.');
  }

  const url = `${GEMINI_CONFIG.API_BASE_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: themePrompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || response.statusText;
      throw new Error(translateGeminiError(errorMessage, response.status));
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('AI yanıt üretemedi. Lütfen farklı bir fotoğraf deneyin.');
    }

    const candidate = data.candidates[0];

    if (candidate.finishReason === 'SAFETY') {
      throw new Error(
        'Fotoğraf güvenlik filtresine takıldı. Lütfen farklı bir fotoğraf deneyin.'
      );
    }

    const textContent = candidate.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('AI yanıtı boş döndü. Lütfen tekrar deneyin.');
    }

    return {
      description: textContent,
      imagePrompt: `Game character based on photo analysis: ${textContent.substring(0, 200)}`,
    };
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
    }
    throw error;
  }
}

/**
 * Dosya objesini Base64 string'e çevirir.
 * @param {File} file - Yüklenecek dosya
 * @returns {Promise<{base64: string, mimeType: string}>} Base64 verisi ve MIME tipi
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        base64: base64String,
        mimeType: file.type,
      });
    };
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı. Lütfen tekrar deneyin.'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Gemini API hata mesajlarını Türkçe'ye çevirir.
 * @param {string} message - Orijinal hata mesajı
 * @param {number} status - HTTP durum kodu
 * @returns {string} Türkçeye çevrilmiş hata mesajı
 */
function translateGeminiError(message, status) {
  const errorMap = {
    400: 'Geçersiz istek. Lütfen fotoğrafı kontrol edin.',
    401: 'API anahtarı geçersiz. Lütfen ayarları kontrol edin.',
    403: 'API erişimi engellendi. API anahtarınızın izinlerini kontrol edin.',
    404: 'API servisi bulunamadı.',
    429: 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.',
    500: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    503: 'AI servisi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
  };

  return errorMap[status] || `Beklenmeyen hata: ${message}`;
}

/**
 * Görsel üretir. Ücretli planlarda Google Imagen 4.0, ücretsiz planlarda ise 
 * otomatik olarak Pollinations AI ücretsiz görsel servisini kullanır.
 * @param {string} prompt - Görsel üretimi için prompt
 * @returns {Promise<string>} Base64 formatında görsel verisi (saf base64)
 * @throws {Error} Hata durumunda hata mesajı
 */
export async function generateImage(prompt) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API anahtarı bulunamadı. .env dosyanızı kontrol edin.');
  }

  // 1. Resmi Google Imagen 4.0 ile üretmeyi dene (Ücretli planlar için)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

  const requestBody = {
    instances: [
      {
        prompt: prompt,
      },
    ],
    parameters: {
      aspectRatio: '1:1',
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.predictions && data.predictions.length > 0 && data.predictions[0].bytesBase64Encoded) {
        return data.predictions[0].bytesBase64Encoded;
      }
    } else {
      const errData = await response.json().catch(() => ({}));
      console.warn('Google Imagen 4.0 başarısız oldu (muhtemelen ücretsiz hesap):', errData?.error?.message || response.statusText);
    }
  } catch (error) {
    console.warn('Google Imagen 4.0 çağrısı sırasında hata oluştu, ücretsiz servise geçiliyor:', error);
  }

  // 2. Ücretsiz plan/hata durumunda Fallback: Pollinations AI
  console.log('Ücretsiz alternatif görsel üretici (Pollinations AI) devreye giriyor...');
  try {
    // Benzersiz bir seed ekleyerek her seferinde farklı görsel üretmesini sağlıyoruz
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}`;
    
    const response = await fetch(pollinationUrl);
    if (!response.ok) {
      throw new Error(`Ücretsiz görsel servisi hata döndürdü: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Blob'u base64'e dönüştür
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('Görsel base64 formatına dönüştürülemedi.'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Ücretsiz görsel üretici de başarısız oldu:', error);
    throw new Error(`Görsel üretimi başarısız oldu: ${error.message}`);
  }
}

