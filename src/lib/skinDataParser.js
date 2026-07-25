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

/**
 * Düz metin açıklamadan Minecraft skin verilerini (renkler, aksesuarlar)
 * regex kullanarak tahmin eder. JSON parse başarısız olursa veya eski kayıtlar için kullanılır.
 * @param {string} text - AI açıklaması
 * @returns {Object} skinData objesi
 */
export function parseTextDescriptionToSkinData(text) {
  const lowercase = (text || '').toLowerCase();
  
  const colorMap = {
    red: '#e53e3e',
    kırmızı: '#e53e3e',
    orange: '#dd6b20',
    turuncu: '#dd6b20',
    yellow: '#d69e2e',
    sarı: '#d69e2e',
    green: '#38a169',
    yeşil: '#38a169',
    blue: '#3182ce',
    mavi: '#3182ce',
    purple: '#805ad5',
    mor: '#805ad5',
    pink: '#d53f8c',
    pembe: '#d53f8c',
    black: '#1a1a1a',
    siyah: '#1a1a1a',
    white: '#ffffff',
    beyaz: '#ffffff',
    grey: '#718096',
    gray: '#718096',
    gri: '#718096',
    brown: '#8b4513',
    kahverengi: '#8b4513',
  };
  
  const skinData = {
    skinColor: '#e29a6f',
    hairColor: '#2d1e18',
    hairStyle: 'short',
    eyeColor: '#32587f',
    shirtColor: '#2353a2',
    sleeveLength: 'short',
    pantsColor: '#212121',
    shoesColor: '#1a1a1a',
    hasBeard: false,
    beardColor: '#2d1e18',
    accessory: 'none',
    accessoryColor: '#e53e3e',
  };

  if (lowercase.includes('black hair') || lowercase.includes('dark hair') || lowercase.includes('siyah saç')) {
    skinData.hairColor = '#1a1a1a';
  } else if (
    lowercase.includes('blonde hair') || 
    lowercase.includes('blond hair') || 
    lowercase.includes('yellow hair') || 
    lowercase.includes('sarı saç')
  ) {
    skinData.hairColor = '#e5c158';
  } else if (lowercase.includes('red hair') || lowercase.includes('orange hair') || lowercase.includes('kızıl saç')) {
    skinData.hairColor = '#b85621';
  } else if (lowercase.includes('grey hair') || lowercase.includes('gray hair') || lowercase.includes('gri saç')) {
    skinData.hairColor = '#8a8a8a';
  } else if (lowercase.includes('brown hair') || lowercase.includes('kahverengi saç')) {
    skinData.hairColor = '#503525';
  }

  if (
    lowercase.includes('beard') || 
    lowercase.includes('mustache') || 
    lowercase.includes('facial hair') || 
    lowercase.includes('bearded') || 
    lowercase.includes('sakal') || 
    lowercase.includes('bıyık')
  ) {
    skinData.hasBeard = true;
    skinData.beardColor = skinData.hairColor;
  }

  if (lowercase.includes('headband') || lowercase.includes('bandana')) {
    skinData.accessory = 'headband';
    if (lowercase.includes('red') || lowercase.includes('kırmızı') || lowercase.includes('turuncu') || lowercase.includes('orange')) {
      skinData.accessoryColor = '#e53e3e';
    } else if (lowercase.includes('blue') || lowercase.includes('mavi')) {
      skinData.accessoryColor = '#3182ce';
    } else if (lowercase.includes('black') || lowercase.includes('siyah')) {
      skinData.accessoryColor = '#1a1a1a';
    } else {
      skinData.accessoryColor = '#e53e3e';
    }
  } else if (
    lowercase.includes('glasses') || 
    lowercase.includes('spectacles') || 
    lowercase.includes('gözlük')
  ) {
    skinData.accessory = 'glasses';
    if (lowercase.includes('red') || lowercase.includes('kırmızı')) skinData.accessoryColor = '#e53e3e';
    else if (lowercase.includes('black') || lowercase.includes('siyah')) skinData.accessoryColor = '#1a1a1a';
  } else if (lowercase.includes('hat') || lowercase.includes('cap') || lowercase.includes('şapka') || lowercase.includes('bere')) {
    skinData.accessory = 'hat';
  }

  const hasWord = (str, word) => new RegExp('\\b' + word + '\\b', 'i').test(str);

  const shirtKeywords = ['shirt', 'top', 'jersey', 'tişört', 'kazak', 'forma', 'üst', 'vest', 'sweater', 'hoodie', 'blouse'];
  let shirtIndex = -1;
  for (const keyword of shirtKeywords) {
    const idx = lowercase.indexOf(keyword);
    if (idx !== -1) {
      shirtIndex = idx;
      break;
    }
  }

  if (shirtIndex !== -1) {
    const start = Math.max(0, shirtIndex - 30);
    const end = Math.min(lowercase.length, shirtIndex + 35);
    const windowText = lowercase.substring(start, end);
    for (const [colorName, colorHex] of Object.entries(colorMap)) {
      if (hasWord(windowText, colorName)) {
        skinData.shirtColor = colorHex;
        for (const [colorName2, colorHex2] of Object.entries(colorMap)) {
          if (colorHex2 !== colorHex && hasWord(windowText, colorName2)) {
            skinData.shirtColor2 = colorHex2;
            break;
          }
        }
        break;
      }
    }
  } else {
    for (const [colorName, colorHex] of Object.entries(colorMap)) {
      if (hasWord(lowercase, colorName)) {
        skinData.shirtColor = colorHex;
        break;
      }
    }
  }

  const pantsKeywords = ['pants', 'shorts', 'trousers', 'pantolon', 'şort', 'jeans', 'skirt', 'legs'];
  let pantsIndex = -1;
  for (const keyword of pantsKeywords) {
    const idx = lowercase.indexOf(keyword);
    if (idx !== -1) {
      pantsIndex = idx;
      break;
    }
  }

  if (pantsIndex !== -1) {
    const start = Math.max(0, pantsIndex - 35);
    const end = Math.min(lowercase.length, pantsIndex + 35);
    const windowText = lowercase.substring(start, end);
    for (const [colorName, colorHex] of Object.entries(colorMap)) {
      if (hasWord(windowText, colorName)) {
        skinData.pantsColor = colorHex;
        break;
      }
    }
  }

  skinData.pantsLength = 'long';
  if (hasWord(lowercase, 'shorts') || hasWord(lowercase, 'şort') || lowercase.includes('short pants') || lowercase.includes('yarım pantolon')) {
    skinData.pantsLength = 'short';
  }

  return skinData;
}

