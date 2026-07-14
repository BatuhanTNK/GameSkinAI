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
 * @param {boolean} isJson - Çıktının JSON formatında olmasını zorunlu kılar
 * @returns {Promise<{description: string, imagePrompt: string}>} AI yanıtı
 * @throws {Error} API hatası durumunda Türkçe hata mesajı
 */
export async function analyzeAndConvert(imageBase64, mimeType, themePrompt, isJson = false, responseSchema = null) {
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
      ...(isJson ? { responseMimeType: 'application/json' } : {}),
      ...(responseSchema ? { responseSchema } : {}),
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye limit

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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

    console.log('Gemini raw response text:', textContent);

    return {
      description: textContent,
      imagePrompt: `Game character based on photo analysis: ${textContent.substring(0, 200)}`,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('İstek zaman aşımına uğradı (15sn). Lütfen internetinizi kontrol edip tekrar deneyin.');
    }
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
    }
    throw error;
  }
}

/**
 * Resim nesnesini yüklemek için yardımcı Promise sarmalayıcısı.
 * @param {string} src - Resim kaynak URL'i veya Data URL
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Resim yüklenemedi.'));
    img.src = src;
  });
}

/**
 * Resim verisini (ImageData) keskinleştirir (Sharpen Convolution Filter).
 * Kenar piksellerini hızlıca kopyalar ve iç piksellere 3x3 keskinleştirme uygular.
 * @param {ImageData} imageData 
 * @returns {ImageData}
 */
function sharpenImageData(imageData) {
  const { width, height, data } = imageData;
  
  const bufferCanvas = document.createElement('canvas');
  const bufferCtx = bufferCanvas.getContext('2d');
  const output = bufferCtx.createImageData(width, height);
  const dst = output.data;
  
  // Orijinal verileri kopyala (kenarlar ve alfa kanalı için)
  dst.set(data);
  
  // İç pikseller için hızlı döngü (kenar 1 piksel hariç)
  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    const prevRowOffset = (y - 1) * width;
    const nextRowOffset = (y + 1) * width;
    
    for (let x = 1; x < width - 1; x++) {
      const idx = (rowOffset + x) * 4;
      
      // Komşu piksellerin indeksleri (üst, sol, sağ, alt)
      const idxTop = (prevRowOffset + x) * 4;
      const idxLeft = (rowOffset + (x - 1)) * 4;
      const idxRight = (rowOffset + (x + 1)) * 4;
      const idxBottom = (nextRowOffset + x) * 4;
      
      // R kanalı
      const r = data[idx] * 5 - (data[idxTop] + data[idxLeft] + data[idxRight] + data[idxBottom]);
      dst[idx] = r < 0 ? 0 : (r > 255 ? 255 : r);
      
      // G kanalı
      const g = data[idx + 1] * 5 - (data[idxTop + 1] + data[idxLeft + 1] + data[idxRight + 1] + data[idxBottom + 1]);
      dst[idx + 1] = g < 0 ? 0 : (g > 255 ? 255 : g);
      
      // B kanalı
      const b = data[idx + 2] * 5 - (data[idxTop + 2] + data[idxLeft + 2] + data[idxRight + 2] + data[idxBottom + 2]);
      dst[idx + 2] = b < 0 ? 0 : (b > 255 ? 255 : b);
      
      // A kanalı (Alpha) doğrudan kopyalandı
    }
  }
  
  return output;
}

/**
 * Dosya objesini yükler, maksimum 800px olacak şekilde boyutlandırır,
 * görüntünün netliğini artırmak için keskinleştirme filtresi uygular
 * ve Base64 string olarak döner.
 * @param {File} file - Yüklenecek dosya
 * @returns {Promise<{base64: string, mimeType: string}>} Netleştirilmiş Base64 verisi ve MIME tipi
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawDataUrl = reader.result;
        
        // 1. Resim nesnesini yükle
        const img = await loadImage(rawDataUrl);
        
        // 2. Maksimum 800px sınırıyla yeniden boyutlandır (Aspect Ratio koruyarak)
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Resmi çiz
        ctx.drawImage(img, 0, 0, width, height);
        
        // 3. Keskinleştirme Filtresi Uygula
        const imageData = ctx.getImageData(0, 0, width, height);
        const sharpenedData = sharpenImageData(imageData);
        ctx.putImageData(sharpenedData, 0, 0);
        
        // 4. Netleştirilmiş resmi Base64'e dönüştür
        const mimeType = file.type || 'image/jpeg';
        const sharpenedBase64 = canvas.toDataURL(mimeType).split(',')[1];
        
        console.log(`Fotoğraf netleştirildi ve optimize edildi. Çözünürlük: ${width}x${height}`);
        
        resolve({
          base64: sharpenedBase64,
          mimeType: mimeType,
        });
      } catch (err) {
        console.warn('Görüntü netleştirme işlemi başarısız oldu, orijinal görsel kullanılıyor:', err);
        // Hata durumunda orijinal okunan base64 ile devam et
        const base64String = reader.result.split(',')[1];
        resolve({
          base64: base64String,
          mimeType: file.type,
        });
      }
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

/**
 * Fotoğrafı Gemini'ye gönderip native image generation ile
 * Minecraft skin görseli üretir (fotoğraftaki kişiye benzer).
 * @param {string} imageBase64 - Orijinal fotoğrafın Base64 verisi
 * @param {string} mimeType - Fotoğrafın MIME tipi
 * @param {string} characterDescription - AI tarafından üretilen karakter açıklaması
 * @returns {Promise<string>} Base64 formatında skin görseli
 * @throws {Error} Hata durumunda hata mesajı
 */
export async function generateSkinImage(imageBase64, mimeType, characterDescription) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API anahtarı bulunamadı.');
  }

  const skinPrompt = `Look at this person's photo carefully. Create a full-body Minecraft character model (voxel/block style) that looks exactly like this person.

Character details: ${characterDescription}

CRITICAL REQUIREMENTS:
- Match the official Minecraft game art style strictly: blocky 3D voxel geometry, low-resolution pixel art textures, standard in-game lighting, distinct cubic proportions
- STRICTLY translate the person's EXACT clothing patterns, colors, stripes, logos, numbers from the photo into pixel art textures on the Minecraft blocks
- Match the person's skin tone, hair color, facial hair, and accessories (headband, glasses, hat) precisely
- Use standard Minecraft Steve model proportions: large cubic head, rectangular block torso, separate blocky limbs
- AVOID: smooth 3D, realistic rendering, curved shapes, non-Minecraft styles
- Full-body view, head-to-toe visible, isometric or slight perspective view
- Transparent or plain light gray background, NO Minecraft world/terrain elements
- The character should be instantly recognizable as the person in the photo`;

  // Gemini 2.5 Flash ile native image generation
  const url = `${GEMINI_CONFIG.API_BASE_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: skinPrompt },
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
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseModalities: ['IMAGE', 'TEXT'],
      imageMimeType: 'image/png',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || response.statusText);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Gemini skin görseli üretemedi.');
    }

    const parts = data.candidates[0]?.content?.parts || [];
    
    // Görsel parçasını bul
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }

    throw new Error('Gemini yanıtında görsel bulunamadı.');
  } catch (error) {
    console.warn('Gemini native skin üretimi başarısız:', error.message);
    throw error;
  }
}
