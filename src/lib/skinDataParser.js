/**
 * @fileoverview Minecraft skin verilerini parse ve normalize eden yardımcı modül.
 * ConversionResult, History ve Converter sayfalarında tekrar eden
 * JSON parse + normalize mantığını merkezileştirir.
 */

/**
 * Gemini API'den gelen JSON açıklamayı standart skinData formatına normalize eder.
 * Farklı key isimleri (camelCase, snake_case vb.) desteklenir.
 * @param {Object} rawSkinData - Ham skin verisi objesi
 * @returns {Object} Normalize edilmiş skinData objesi
 */
export function normalizeSkinData(rawSkinData) {
  if (!rawSkinData || typeof rawSkinData !== 'object') return null;

  const sd = rawSkinData;

  return {
    skinColor: sd.skinColor || sd.skin_color || sd.skinTone || sd.skin_tone || '#C68642',
    hairColor: sd.hairColor || sd.hair_color || '#2d1e18',
    hairStyle: sd.hairStyle || sd.hair_style || 'short',
    eyeColor: sd.eyeColor || sd.eye_color || '#333333',
    shirtColor: sd.shirtColor || sd.shirt_color || sd.clothingColor || sd.clothing_color || '#2353a2',
    shirtColor2: sd.shirtColor2 || sd.shirt_color_2 || sd.secondaryColor || sd.secondary_color || '',
    sleeveLength: sd.sleeveLength || sd.sleeve_length || 'short',
    pantsColor: sd.pantsColor || sd.pants_color || '#212121',
    pantsLength: sd.pantsLength || sd.pants_length || 'long',
    shoesColor: sd.shoesColor || sd.shoes_color || '#1a1a1a',
    hasBeard: sd.hasBeard ?? sd.has_beard ?? sd.beard ?? false,
    beardColor: sd.beardColor || sd.beard_color || sd.hairColor || sd.hair_color || '#2d1e18',
    accessory: sd.accessory || sd.hat || sd.headwear || 'none',
    accessoryColor: sd.accessoryColor || sd.accessory_color || '#e53e3e',
  };
}

/**
 * JSON description string'ini parse edip açıklama metni, skinData ve skinImageUrl çıkarır.
 * Parse başarısız olursa orijinal metni döner.
 * @param {string} descriptionStr - Result description string'i (JSON veya düz metin)
 * @param {string} [themeSlug] - Tema slug değeri (minecraft kontrolü için)
 * @returns {{ descriptionText: string, skinData: Object|null, skinImageUrl: string|null, isMinecraft: boolean }}
 */
export function parseConversionDescription(descriptionStr, themeSlug = '') {
  let descriptionText = descriptionStr || '';
  let skinData = null;
  let skinImageUrl = null;
  let isMinecraft = false;

  if (descriptionText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(descriptionText);

      // Açıklama metnini çıkar
      descriptionText =
        parsed.description ||
        parsed.character_description ||
        parsed.desc ||
        parsed.text ||
        descriptionText;

      // Skin görsel URL'i
      skinImageUrl = parsed.skinImageUrl || null;

      // skinData objesini bul
      const rawSd =
        parsed.skinData ||
        parsed.skin_data ||
        parsed.skindata ||
        parsed.colors ||
        parsed.skin ||
        parsed;

      if (rawSd) {
        skinData = normalizeSkinData(rawSd);
      }

      isMinecraft = themeSlug === 'minecraft' && skinData !== null;
    } catch (e) {
      console.error('JSON description parse hatası:', e);
    }
  }

  return { descriptionText, skinData, skinImageUrl, isMinecraft };
}
