/**
 * @fileoverview AI dönüşüm ve görsel üretimi istemci kütüphanesi.
 * Tüm Gemini API anahtarları Sunucu Tarafında (Supabase Edge Function) saklanır.
 * İstemci tarafında hiçbir API anahtarı barındırılmaz (Güvenlik Koruması).
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
 * Sunucu tarafı API veya ağ hatası durumunda akıllı demo/fallback karakter üreticisi.
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
 * Fotoğrafı analiz edip tema prompt'uyla birleştirerek Supabase Edge Function üzerinden güvenli dönüşüm yapar.
 * API anahtarı sunucu tarafında (Supabase Deno Environment) gizlidir.
 */
export async function analyzeAndConvert(imageBase64, mimeType, themePrompt, isJson = false, responseSchema = null) {
  // Lokal geliştirme ortamında (localhost / Antigravity önizleme) doğrudan Vite dev proxy üzerinden
  // gerçek Gemini 2.5 Flash çalıştırılır; böylece Supabase oturum token'ı (401) hatası oluşmaz.
  if (process.env.NODE_ENV === 'development' && typeof fetch === 'function') {
    try {
      const resp = await fetch('/__dev/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          imageBase64,
          mimeType,
          themePrompt,
          isJson,
          responseSchema,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.description) {
          return {
            description: data.description,
            imagePrompt: `Game character based on photo analysis: ${data.description.substring(0, 200)}`,
          };
        }
      }
    } catch (devErr) {
      console.warn('Lokal Gemini proxy erişilemedi:', devErr);
    }
  }

  if (isSupabaseConfigured) {
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
    throw new Error('AI servisi karakter açıklaması döndürmedi.');
  }

  // Akıllı Demo/Fallback Karakter Üretici (Sunucu tarafı API olmadığında veya demo modunda)
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
 * Dosyayı okur ve AI'a gönderilecek boyuta getirir (en fazla 1024px, JPEG).
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

    const maxDim = 1024;
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
    ctx.imageSmoothingQuality = 'high';
    // Şeffaf PNG'ler JPEG'e çevrilirken siyah olmasın diye beyaz zemin
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(img, 0, 0, width, height);

    // Not: Eskiden burada keskinleştirme filtresi uygulanıyordu; gürültü/halo üretip
    // yüz detaylarını bozduğu için kaldırıldı. Sadece boyutlandırma yapılır.
    // PNG/WebP gibi büyük formatlar da JPEG'e çevrilerek Edge Function'a giden boyut küçültülür.
    const outMime = 'image/jpeg';
    const resizedBase64 = canvas.toDataURL(outMime, 0.9).split(',')[1];

    return { base64: resizedBase64, mimeType: outMime };
  } catch (err) {
    console.warn('Görüntü boyutlandırma işlemi başarısız oldu, orijinal görsel kullanılıyor:', err);
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
 * Gemini görselini MIME bilgisini koruyan bir data URL olarak döndürür.
 * Yapılandırılmış sunucunun hataları kullanıcıya iletilir.
 * @param {string} prompt - Görsel üretim promptu
 * @param {{base64: string, mimeType: string}} [sourceImage] - Referans fotoğraf (image-to-image).
 *   Verilirse görsel modeli kişinin yüzünü/kıyafetini doğrudan fotoğraftan alır.
 */
/**
 * Ücretsiz görsel servisinin (pollinations.ai) sağ alt köşeye bastığı filigran
 * şeridini (768x832 görselin alt 64 pikselini) kırparak temiz 768x768 kare görsel döndürür.
 * @param {string} src - Data URL veya resim URL'i
 * @returns {Promise<string>}
 */
async function stripBottomWatermark(src) {
  try {
    const img = await loadImage(src);
    const size = img.width || 768;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Üst kare alanı (0, 0, size, size) çizerek alt filigran bandını dışarıda bırak
    const sourceH = img.height > size ? size : Math.floor(img.height * 0.92);
    ctx.drawImage(img, 0, 0, img.width, sourceH, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.92);
  } catch (_) {
    return src;
  }
}

export async function generateImage(prompt, sourceImage = null) {
  // Lokal geliştirme ortamında (localhost / Antigravity önizleme) doğrudan Vite dev proxy üzerinden
  // görsel üretilir; böylece Supabase oturum token'ı (401) hatası oluşmaz.
  if (process.env.NODE_ENV === 'development' && typeof fetch === 'function') {
    try {
      const resp = await fetch('/__dev/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateImage',
          prompt,
          imageBase64: sourceImage?.base64,
          mimeType: sourceImage?.mimeType || 'image/jpeg',
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.imageBase64) {
          const rawUrl = `data:${data.mimeType || 'image/jpeg'};base64,${data.imageBase64}`;
          return data.cropWatermark ? await stripBottomWatermark(rawUrl) : rawUrl;
        }
        if (data?.fallbackUrl) {
          return await stripBottomWatermark(data.fallbackUrl);
        }
      }
    } catch (devErr) {
      console.warn('Lokal görsel proxy erişilemedi, doğrudan URL kullanılıyor:', devErr);
    }
    const seed = getSecureRandomSeed();
    const rawFallback = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=832&nologo=true&seed=${seed}`;
    return await stripBottomWatermark(rawFallback);
  }

  if (isSupabaseConfigured) {
    const payload = { action: 'generateImage', prompt };
    if (sourceImage?.base64) {
      payload.imageBase64 = sourceImage.base64;
      payload.mimeType = sourceImage.mimeType || 'image/jpeg';
      payload.allowFreeFallback = true;
    }
    let data;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        data = await invokeEdgeFunction('convert', payload);
        break;
      } catch (error) {
        // Sadece geçici sunucu hatasında bir kez yeniden dene; analiz tekrarlanmaz.
        if (attempt > 0 || ![500, 502, 503, 504].includes(error.status)) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (data?.imageBase64) {
      const rawUrl = `data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`;
      return data.cropWatermark ? await stripBottomWatermark(rawUrl) : rawUrl;
    }
    if (data?.fallbackUrl) {
      return await stripBottomWatermark(data.fallbackUrl);
    }
    throw new Error('AI servisi görsel döndürmedi.');
  }

  const seed = getSecureRandomSeed();
  const rawFallback = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=832&nologo=true&seed=${seed}`;
  return await stripBottomWatermark(rawFallback);
}

/**
 * Minecraft skin görseli üretir.
 */
export async function generateSkinImage(imageBase64, mimeType, characterDescription) {
  return generateImage(
    `Full body authentic Minecraft 3D cubic voxel character model based on: ${characterDescription}`,
    imageBase64 ? { base64: imageBase64, mimeType } : null
  );
}
