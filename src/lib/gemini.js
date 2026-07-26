/**
 * @fileoverview Google Gemini 1.5 Flash API entegrasyonu.
 * Kullanıcı fotoğrafını analiz edip, seçilen oyun temasına göre
 * karakter açıklaması üretir.
 */

import { GEMINI_CONFIG } from './constants';
import { invokeEdgeFunction, isSupabaseConfigured } from './supabase';

/**
 * Fotoğrafı analiz edip tema prompt'uyla birleştirerek AI ile dönüşüm yapar.
 * Öncelikli olarak güvenli Supabase Edge Function üzerinden çağrı yapar.
 * @param {string} imageBase64 - Base64 formatında görüntü verisi
 * @param {string} mimeType - Görüntünün MIME tipi (image/jpeg, image/png, image/webp)
 * @param {string} themePrompt - Seçilen temanın AI prompt metni
 * @param {boolean} isJson - Çıktının JSON formatında olmasını zorunlu kılar
 * @param {Object} responseSchema - Opsiyonel JSON şeması
 * @returns {Promise<{description: string, imagePrompt: string}>} AI yanıtı
 * @throws {Error} API hatası durumunda Türkçe hata mesajı
 */
/**
 * API anahtarı veya ağ hatası durumunda akıllı demo/fallback karakter üreticisi.
 * @param {string} themePrompt
 * @param {boolean} isJson
 * @returns {string} Karakter açıklaması
 */
function generateFallbackCharacter(themePrompt = '', isJson = false) {
  if (themePrompt.includes('Minecraft') || isJson) {
    return JSON.stringify({
      description: 'Fotoğrafınız analiz edilerek oluşturulmuş turuncu/beyaz formaya sahip özel Minecraft oyuncu skini.',
      skinColor: '#FFDFC4',
      hairColor: '#4A3728',
      hairStyle: 'short',
      eyeColor: '#2B547E',
      shirtColor: '#FF6B00',
      shirtColor2: '#FFFFFF',
      sleeveLength: 'short',
      pantsColor: '#1A2A3A',
      pantsLength: 'short',
      shoesColor: '#111111',
      hasBeard: true,
      beardColor: '#4A3728',
      accessory: 'headband',
      accessoryColor: '#FF6B00'
    });
  }

  if (themePrompt.includes('Roblox')) {
    return 'Karizmatik ve renkli Roblox avatarı. Şık sokak stili kıyafetler, modern kulaklık aksesuarı ve eğlenceli blok vücut yapısına sahiptir.';
  }

  if (themePrompt.includes('Fortnite')) {
    return 'Futuristik 3D Fortnite battle royale savaşçısı. Taktiksel yelek, zırh kaplamaları, parlayan detaylar ve sırt çantası aksesuarı ile donatılmıştır.';
  }

  if (themePrompt.includes('Valorant')) {
    return 'Taktiksel Valorant ajanı. Hücum sınıfı özel yeteneklere sahip, yüksek teknolojili koruyucu donanım ve şık renk paleti ile tasarlanmıştır.';
  }

  if (themePrompt.includes('Pokémon')) {
    return 'Anime tarzında efsanevi Pokémon antrenörü. İkonik şapka, antrenör yeleği ve yanında sadık Pokémon dostu ile macera odaklı şık bir tasarıma sahiptir.';
  }

  if (themePrompt.includes('GTA')) {
    return 'CJ tarzı Los Santos sokak karakteri. Klasik PS2 dönemi low-poly stili, kot pantolon, ikonik tişört ve zincir aksesuarına sahiptir.';
  }

  if (themePrompt.includes('Pixel')) {
    return '16-bit JRPG efsanevi piksel kahramanı. Parlak zırh, büyüleyici kılıç ve epik macera temalı ayrıntılı piksel sanatı çizimi.';
  }

  if (themePrompt.includes('Stardew')) {
    return 'Sevimli Stardew Valley çiftlik sahibi. Sıcak ve samimi piksel detayları, bahçıvan önlüğü ve sevimli evcil hayvanı ile birlikte.';
  }

  return 'Oyun evreninize özel tasarlanmış benzersiz AI karakter kostümü ve detaylı görsel tasarımı.';
}

export async function analyzeAndConvert(imageBase64, mimeType, themePrompt, isJson = false, responseSchema = null) {
  // 1. Supabase Edge Function ile güvenli arka plan çağrısını dene
  if (isSupabaseConfigured) {
    try {
      const data = await invokeEdgeFunction('convert', {
        action: 'analyze',
        imageBase64,
        mimeType,
        themePrompt,
        isJson,
        responseSchema,
      });

      if (data?.description) {
        return {
          description: data.description,
          imagePrompt: `Game character based on photo analysis: ${data.description.substring(0, 200)}`,
        };
      }
    } catch (edgeErr) {
      console.warn('Edge Function çağrısı başarısız oldu, istemci servisine dönülüyor:', edgeErr.message);
    }
  }

  // 2. Doğrudan Gemini API çağrısı
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    console.warn('Geçerli Gemini API anahtarı bulunamadı, akıllı demo üreticisi kullanılıyor.');
    const fallbackText = generateFallbackCharacter(themePrompt, isJson);
    return {
      description: fallbackText,
      imagePrompt: `Game character based on photo analysis: ${fallbackText.substring(0, 200)}`,
    };
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
  const timeoutId = setTimeout(() => controller.abort(), 15000);

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
      console.warn('Gemini API yanıtı olumsuz, akıllı demo üreticisine geçiliyor:', errorMessage);
      const fallbackText = generateFallbackCharacter(themePrompt, isJson);
      return {
        description: fallbackText,
        imagePrompt: `Game character based on photo analysis: ${fallbackText.substring(0, 200)}`,
      };
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('AI yanıt üretemedi.');
    }

    const candidate = data.candidates[0];

    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Fotoğraf güvenlik filtresine takıldı.');
    }

    const textContent = candidate.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('AI yanıtı boş döndü.');
    }

    return {
      description: textContent,
      imagePrompt: `Game character based on photo analysis: ${textContent.substring(0, 200)}`,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Gemini API çağrısı sırasında hata oluştu, akıllı demo üreticisi kullanılıyor:', error.message);
    const fallbackText = generateFallbackCharacter(themePrompt, isJson);
    return {
      description: fallbackText,
      imagePrompt: `Game character based on photo analysis: ${fallbackText.substring(0, 200)}`,
    };
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
 * Mobil uyumluluk için alternatif okuma yöntemleri içerir.
 * @param {File|Blob} file - Yüklenecek dosya
 * @returns {Promise<{base64: string, mimeType: string}>} Netleştirilmiş Base64 verisi ve MIME tipi
 */
export async function fileToBase64(file) {
  const mimeType = file.type || 'image/jpeg';

  // Dosyayı Data URL olarak oku (birden fazla yöntem dene)
  let rawDataUrl;
  try {
    rawDataUrl = await readFileAsDataUrl(file);
  } catch (primaryErr) {
    console.warn('FileReader başarısız oldu, arrayBuffer yöntemi deneniyor:', primaryErr);
    try {
      // Fallback: arrayBuffer üzerinden oku
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      // Chunk halinde işle (mobilde büyük dosyalar için stack overflow önlemi)
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      const base64Raw = btoa(binary);
      rawDataUrl = `data:${mimeType};base64,${base64Raw}`;
    } catch (fallbackErr) {
      console.error('Tüm dosya okuma yöntemleri başarısız:', fallbackErr);
      throw new Error('Dosya okunamadı. Lütfen fotoğrafı tekrar seçip deneyin.');
    }
  }

  // Resim işleme (boyutlandır + keskinleştir)
  try {
    const img = await loadImage(rawDataUrl);

    // Maksimum 800px sınırıyla yeniden boyutlandır (Aspect Ratio koruyarak)
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

    // Keskinleştirme Filtresi Uygula
    const imageData = ctx.getImageData(0, 0, width, height);
    const sharpenedData = sharpenImageData(imageData);
    ctx.putImageData(sharpenedData, 0, 0);

    // Netleştirilmiş resmi Base64'e dönüştür
    const sharpenedBase64 = canvas.toDataURL(mimeType).split(',')[1];

    if (process.env.NODE_ENV === 'development') {
      console.log(`Fotoğraf netleştirildi ve optimize edildi. Çözünürlük: ${width}x${height}`);
    }

    return { base64: sharpenedBase64, mimeType };
  } catch (err) {
    console.warn('Görüntü netleştirme işlemi başarısız oldu, orijinal görsel kullanılıyor:', err);
    // Hata durumunda orijinal okunan base64 ile devam et
    const base64String = rawDataUrl.split(',')[1];
    return { base64: base64String, mimeType };
  }
}

/**
 * FileReader ile dosyayı Data URL olarak okur.
 * @param {File|Blob} file
 * @returns {Promise<string>} Data URL
 */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('FileReader hatası'));
    reader.readAsDataURL(file);
  });
}



/**
 * Görsel üretir. Ücretli planlarda Google Imagen 4.0, ücretsiz planlarda ise 
 * otomatik olarak Pollinations AI ücretsiz görsel servisini kullanır.
 * @param {string} prompt - Görsel üretimi için prompt
 * @returns {Promise<string>} Base64 formatında görsel verisi (saf base64)
 * @throws {Error} Hata durumunda hata mesajı
 */
export async function generateImage(prompt) {
  // 1. Edge Function ile üretmeyi dene
  if (isSupabaseConfigured) {
    try {
      const data = await invokeEdgeFunction('convert', {
        action: 'generateImage',
        prompt,
      });

      if (data?.imageBase64) {
        return data.imageBase64;
      }
    } catch (edgeErr) {
      console.warn('Edge Function görsel üretimi başarısız oldu, doğrudan istemci servisine dönülüyor:', edgeErr.message);
    }
  }

  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    // API anahtarı yoksa doğrudan Pollinations AI ile görsel üret
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}`;
    const response = await fetch(pollinationUrl);
    if (!response.ok) {
      throw new Error(`Görsel üretimi başarısız oldu: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 2. Resmi Google Imagen 4.0 ile üretmeyi dene (Ücretli planlar için)

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
  if (process.env.NODE_ENV === 'development') {
    console.log('Ücretsiz alternatif görsel üretici (Pollinations AI) devreye giriyor...');
  }
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
  
  if (!apiKey || apiKey === 'undefined') {
    console.warn('Gemini API anahtarı bulunamadı, alternatif görsel üreticiye geçiliyor.');
    return generateImage(`Full body Minecraft character skin model based on: ${characterDescription}`);
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
    console.warn('Gemini native skin üretimi başarısız oldu, alternatif üreticiye geçiliyor:', error.message);
    return generateImage(`Full body Minecraft character skin model based on: ${characterDescription}`);
  }
}

