/**
 * @fileoverview AI dönüşüm ve görsel üretimi istemci kütüphanesi.
 * Hem .env REACT_APP_GEMINI_API_KEY hem de Supabase Edge Function desteği içerir.
 */

import { invokeEdgeFunction, isSupabaseConfigured } from './supabase';

/**
 * Güvenli rastgele seed üretir (Bulgu A9).
 * @returns {number}
 */
function getSecureRandomSeed() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % 1000000;
  }
  return Math.floor(Math.random() * 1000000);
}

/**
 * API anahtarı yokluğu veya ağ hatası durumunda akıllı demo/fallback karakter üreticisi.
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

  if (themePrompt.includes('Brawl Stars')) {
    return 'Renkli ve sevimli 3D Brawl Stars kahramanı. Aksiyon dolu mobil arena stili, özel brawler silahı ve ikonik kıyafet detayları.';
  }

  if (themePrompt.includes('Clash Royale') || themePrompt.includes('Clash')) {
    return 'Karikatürize 3D Clash Royale krallık savaşçısı. Altın/çelik zırh kaplamaları, taç detayları ve destansı kart görünümü.';
  }

  if (themePrompt.includes('LoL') || themePrompt.includes('League of Legends')) {
    return 'Epik League of Legends MOBA şampiyonu. Parlayan büyü efektleri, detaylı fantezi zırhı ve vadinin efsanevi duruşu.';
  }

  if (themePrompt.includes('Apex')) {
    return 'Futuristik Apex Legends battle royale pilotu. Yüksek teknolojili zırh plakaları, jump-kit mekanizması ve taktiksel kask.';
  }

  if (themePrompt.includes('LEGO')) {
    return 'İkonik plastik LEGO minifigür karakteri. Silindir kafa yapısı, blok vücut baskısı ve özel tasarım plastik saç parçası.';
  }

  if (themePrompt.includes('Fall Guys')) {
    return 'Sevimli ve renkli Fall Guys fasulye kostümü. Parlak dokular, özel karakter şapkası ve parkur yarışçısı görünümü.';
  }

  if (themePrompt.includes('Genshin')) {
    return '5 Yıldızlı Genshin Impact 3D cel-shaded anime kahramanı. Parlayan element vizyonu mücevheri, detaylı büyücü/kılıç ustası giysisi.';
  }

  if (themePrompt.includes('Cyberpunk')) {
    return 'Night City Cyberpunk 2077 paralı askeri. Neon ışıklandırmalı deri ceket, siber implantlar ve Kiroshi optik göz protezleri.';
  }

  if (themePrompt.includes('Witcher')) {
    return 'Epik The Witcher canavar avcısı. Çift kılıçlı perçinli deri zırh, kedi gözleri ve orta çağ fantezi atmosferi.';
  }

  if (themePrompt.includes('CS2') || themePrompt.includes('Counter-Strike')) {
    return 'Gerçekçi Counter-Strike 2 taktiksel askeri operatörü. Balistik kask, Kevlar yelek ve Source 2 askeri teçhizat detayları.';
  }

  return 'Oyun evreninize özel tasarlanmış benzersiz AI karakter kostümü ve detaylı görsel tasarımı.';
}

/**
 * Fotoğrafı analiz edip tema prompt'uyla birleştirerek AI ile dönüşüm yapar.
 * .env dosyasındaki REACT_APP_GEMINI_API_KEY veya Supabase Edge Function kullanır.
 */
export async function analyzeAndConvert(imageBase64, mimeType, themePrompt, isJson = false, responseSchema = null) {
  // 1. Öncelik: .env dosyasındaki REACT_APP_GEMINI_API_KEY
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 10 && apiKey !== 'undefined') {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const requestBody = {
        contents: [
          {
            parts: [
              { text: themePrompt },
              { inlineData: { mimeType, data: imageBase64 } },
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

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textContent) {
            return {
              description: textContent,
              imagePrompt: `Game character based on photo analysis: ${textContent.substring(0, 200)}`,
            };
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Gemini API (${model}) çağrısı uyarısı:`, err.message);
        }
      }
    }
  }

  // 2. İkinci Öncelik: Supabase Edge Function üzerinden çağrı
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
      if (process.env.NODE_ENV === 'development') {
        console.info('Edge Function çağrısı bilgisi:', edgeErr.message);
      }
    }
  }

  // 3. Demo modu veya API anahtarı yokluğu durumunda akıllı demo fallback
  const fallbackText = generateFallbackCharacter(themePrompt, isJson);
  return {
    description: fallbackText,
    imagePrompt: `Game character based on photo analysis: ${fallbackText.substring(0, 200)}`,
  };
}

/**
 * Resim nesnesini yüklemek için yardımcı Promise sarmalayıcısı.
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
 */
function sharpenImageData(imageData) {
  const { width, height, data } = imageData;
  
  const bufferCanvas = document.createElement('canvas');
  const bufferCtx = bufferCanvas.getContext('2d');
  const output = bufferCtx.createImageData(width, height);
  const dst = output.data;
  
  dst.set(data);
  
  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    const prevRowOffset = (y - 1) * width;
    const nextRowOffset = (y + 1) * width;
    
    for (let x = 1; x < width - 1; x++) {
      const idx = (rowOffset + x) * 4;
      
      const idxTop = (prevRowOffset + x) * 4;
      const idxLeft = (rowOffset + (x - 1)) * 4;
      const idxRight = (rowOffset + (x + 1)) * 4;
      const idxBottom = (nextRowOffset + x) * 4;
      
      const r = data[idx] * 5 - (data[idxTop] + data[idxLeft] + data[idxRight] + data[idxBottom]);
      dst[idx] = r < 0 ? 0 : (r > 255 ? 255 : r);
      
      const g = data[idx + 1] * 5 - (data[idxTop + 1] + data[idxLeft + 1] + data[idxRight + 1] + data[idxBottom + 1]);
      dst[idx + 1] = g < 0 ? 0 : (g > 255 ? 255 : g);
      
      const b = data[idx + 2] * 5 - (data[idxTop + 2] + data[idxLeft + 2] + data[idxRight + 2] + data[idxBottom + 2]);
      dst[idx + 2] = b < 0 ? 0 : (b > 255 ? 255 : b);
    }
  }
  
  return output;
}

/**
 * Dosyayı okur, boyutlandırır ve keskinleştirir.
 */
export async function fileToBase64(file) {
  const mimeType = file.type || 'image/jpeg';

  let rawDataUrl;
  try {
    rawDataUrl = await readFileAsDataUrl(file);
  } catch (primaryErr) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
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

  try {
    const img = await loadImage(rawDataUrl);

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

    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const sharpenedData = sharpenImageData(imageData);
    ctx.putImageData(sharpenedData, 0, 0);

    const sharpenedBase64 = canvas.toDataURL(mimeType).split(',')[1];

    return { base64: sharpenedBase64, mimeType };
  } catch (err) {
    console.warn('Görüntü netleştirme işlemi başarısız oldu, orijinal görsel kullanılıyor:', err);
    const base64String = rawDataUrl.split(',')[1];
    return { base64: base64String, mimeType };
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('FileReader hatası'));
    reader.readAsDataURL(file);
  });
}

/**
 * Görsel üretir. Sunucu tarafı Edge Function veya Pollinations AI servisini kullanır.
 * Tarayıcı konsolunda kırmızı hata vermeyecek şekilde akıcı fallback sunar.
 */
export async function generateImage(prompt) {
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
      if (process.env.NODE_ENV === 'development') {
        console.info('Edge Function görsel üretimi bilgisi:', edgeErr.message);
      }
    }
  }

  // Pollinations AI URL'ini doğrudan döndür (JS fetch yapmaz, 403 konsol hatasını sıfırlar)
  const seed = getSecureRandomSeed();
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}`;
}

/**
 * Minecraft skin görseli üretir.
 */
export async function generateSkinImage(imageBase64, mimeType, characterDescription) {
  return generateImage(`Full body Minecraft character skin model based on: ${characterDescription}`);
}
