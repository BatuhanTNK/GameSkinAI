/**
 * @fileoverview Minecraft skin verilerini parse ve normalize eden yardımcı modül.
 * ConversionResult, History ve Converter sayfalarında tekrar eden
 * JSON parse + normalize mantığını merkezileştirir.
 */

export const COLOR_MAP = {
  red: '#e53e3e',
  kırmızı: '#e53e3e',
  orange: '#dd6b20',
  turuncu: '#dd6b20',
  yellow: '#d69e2e',
  sarı: '#d69e2e',
  green: '#38a169',
  yeşil: '#38a169',
  lime: '#76ff7a',
  blue: '#3182ce',
  mavi: '#3182ce',
  'dark blue': '#1a365d',
  'koyu mavi': '#1a365d',
  navy: '#1a365d',
  lacivert: '#1a365d',
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
  'dark brown': '#4a2f1b',
  'koyu kahverengi': '#4a2f1b',
  leather: '#78350f',
  tan: '#c68642',
  beige: '#e2ba8d',
};

export function resolveColor(val, fallback = '#1a1a1a') {
  if (!val) return fallback;
  if (typeof val === 'object') {
    return resolveColor(val.color || val.hex || val.clothing || '', fallback);
  }
  const str = String(val).trim().toLowerCase();
  if (str.startsWith('#') && (str.length === 7 || str.length === 4)) {
    return str;
  }
  for (const [name, hex] of Object.entries(COLOR_MAP)) {
    if (str.includes(name)) return hex;
  }
  return fallback;
}

/**
 * Gemini API'den gelen JSON açıklamayı standart skinData formatına normalize eder.
 * Düz (flat) veya iç içe (nested) JSON yapılarını ve renk isimlerini çözer.
 * @param {Object} rawSkinData - Ham skin verisi objesi
 * @returns {Object} Normalize edilmiş skinData objesi
 */
export function normalizeSkinData(rawSkinData) {
  if (!rawSkinData || typeof rawSkinData !== 'object') return null;

  const sd = rawSkinData;

  // İç içe nesneler (Gemini sıkça { head: {...}, torso: {...}, legs: {...} } döner)
  const head = sd.head || {};
  const torso = sd.torso || {};
  const legs = sd.legs || {};
  const arms = sd.arms || {};

  // Saç
  const rawHair = sd.hairColor || sd.hair_color || head.hair?.color || head.hair || '#2d1e18';
  const hairColor = resolveColor(rawHair, '#2d1e18');
  const hairStyle = sd.hairStyle || sd.hair_style || head.hair?.style || 'short';

  // Ten rengi
  const rawSkin = sd.skinColor || sd.skin_color || sd.skinTone || sd.skin_tone || head.skin?.color || '#C68642';
  const skinColor = resolveColor(rawSkin, '#C68642');

  // Göz rengi
  const rawEye = sd.eyeColor || sd.eye_color || head.eyes?.color || head.eyes || '#333333';
  const eyeColor = resolveColor(rawEye, '#333333');

  // Sakal / Bıyık
  const facialHair = head.facial_hair || head.facialHair || {};
  const facialType = typeof facialHair === 'string' ? facialHair.toLowerCase() : (facialHair.type || '').toLowerCase();
  const hasBeard = Boolean(
    sd.hasBeard === true || sd.hasBeard === 'true' ||
    sd.has_beard === true || sd.has_beard === 'true' ||
    sd.beard === true || sd.beard === 'true' ||
    facialType.includes('beard') || facialType.includes('sakal') || facialType.includes('mustache') ||
    (typeof sd.beardColor === 'string' && sd.beardColor.length > 2 && sd.beardColor !== 'none') ||
    Boolean(facialHair.color)
  );
  const rawBeardColor = sd.beardColor || sd.beard_color || facialHair.color || hairColor;
  const beardColor = resolveColor(rawBeardColor, hairColor);

  // Üst giyim (Gömlek, Ceket, Deri Mont, Yelek vb.)
  const torsoOuter = torso.outer_layer || torso.clothing || torso.top || {};
  const torsoInner = torso.inner_layer || {};
  const rawShirt = sd.shirtColor || sd.shirt_color || sd.clothingColor || sd.clothing_color ||
    sd.jacketColor || sd.jacket_color || sd.coatColor || sd.coat_color ||
    sd.topColor || sd.top_color || sd.outfitColor || sd.outfit_color ||
    sd.vestColor || sd.vest_color ||
    torsoOuter.clothing || torsoOuter.color || torso.color || torsoInner.clothing ||
    '#78350f';
  const shirtColor = resolveColor(rawShirt, '#78350f');

  // Pantolon
  const legsPants = legs.pants || legs.bottom || {};
  const rawPants = sd.pantsColor || sd.pants_color || sd.trousersColor || sd.shortsColor ||
    legsPants.color || legsPants.clothing || legs.color || '#1a365d';
  const pantsColor = resolveColor(rawPants, '#1a365d');

  // Ayakkabı
  const legsShoes = legs.shoes || legs.boots || legs.footwear || {};
  const rawShoes = sd.shoesColor || sd.shoes_color || legsShoes.color || legsShoes.clothing || '#1a1a1a';
  const shoesColor = resolveColor(rawShoes, '#1a1a1a');

  // Uzunluklar
  const sleeveLength = sd.sleeveLength || sd.sleeve_length || (arms.sleeves?.includes('short') ? 'short' : 'long');
  const pantsLength = sd.pantsLength || sd.pants_length || (legsPants.style?.includes('short') ? 'short' : 'long');

  // Aksesuar
  const accessory = sd.accessory || sd.hat || head.hat || head.accessory || 'none';
  const accessoryColor = resolveColor(sd.accessoryColor || sd.accessory_color, '#e53e3e');

  return {
    skinColor,
    hairColor,
    hairStyle,
    eyeColor,
    shirtColor,
    shirtColor2: sd.shirtColor2 || sd.shirt_color_2 || '',
    sleeveLength,
    pantsColor,
    pantsLength,
    shoesColor,
    hasBeard,
    beardColor,
    accessory: typeof accessory === 'string' ? accessory : 'none',
    accessoryColor,
  };
}

/**
 * AI tarafından döndürülen JSON yanıtını esnek ve hataya dayanıklı şekilde ayrıştırır.
 * Markdown kod bloklarını, ham satır sonlarını (\n), kesilmiş tırnakları ve eksik parantezleri onarır.
 * @param {string} rawText
 * @returns {Object|null}
 */
export function safeParseAiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Markdown kod bloklarını temizle
  let text = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // 2. İlk { ve son } arasını al
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1) {
    text = text.substring(firstBrace);
  }

  // 3. İlk deneme: Doğrudan parse et
  try {
    return JSON.parse(text);
  } catch (e1) {
    // 4. İkinci deneme: Dize içindeki ham satır sonlarını (\r\n) temizle
    try {
      const sanitized = text.replace(/[\r\n]+/g, ' ');
      return JSON.parse(sanitized);
    } catch (e2) {
      // 5. Üçüncü deneme: Kesilmiş tırnak ve süslü parantezleri onar
      try {
        let fixed = text.replace(/[\r\n]+/g, ' ').trim();
        fixed = fixed.replace(/,\s*([}\]])/g, '$1');
        
        let quoteCount = 0;
        let inEscape = false;
        for (let i = 0; i < fixed.length; i++) {
          const char = fixed[i];
          if (char === '\\') {
            inEscape = !inEscape;
          } else if (char === '"' && !inEscape) {
            quoteCount++;
          } else {
            inEscape = false;
          }
        }
        if (quoteCount % 2 !== 0) fixed += '"';
        if (!fixed.endsWith('}')) fixed += '}';
        return JSON.parse(fixed);
      } catch (e3) {
        // 6. Dördüncü deneme: Regex ile alanları ayıkla
        const extractField = (key) => {
          const m = rawText.match(new RegExp(`"${key}"\\s*:\\s*(?:"([^"]*)"|([#a-zA-Z0-9_-]+)|(true|false))`, 'i'));
          if (!m) return null;
          if (m[1] !== undefined) return m[1];
          if (m[2] !== undefined) return m[2];
          if (m[3] !== undefined) return m[3] === 'true';
          return null;
        };

        const desc = extractField('description') || extractField('character_description') || extractField('desc');
        if (desc || extractField('skinColor') || extractField('shirtColor')) {
          return {
            description: desc || 'Minecraft karakter skini.',
            skinColor: extractField('skinColor') || '#C68642',
            hairColor: extractField('hairColor') || '#2d1e18',
            hairStyle: extractField('hairStyle') || 'short',
            eyeColor: extractField('eyeColor') || '#333333',
            shirtColor: extractField('shirtColor') || '#dd6b20',
            shirtColor2: extractField('shirtColor2') || '',
            sleeveLength: extractField('sleeveLength') || 'short',
            pantsColor: extractField('pantsColor') || '#212121',
            pantsLength: extractField('pantsLength') || 'long',
            shoesColor: extractField('shoesColor') || '#111111',
            hasBeard: extractField('hasBeard') === true,
            beardColor: extractField('beardColor') || '',
            accessory: extractField('accessory') || 'none',
            accessoryColor: extractField('accessoryColor') || '',
          };
        }
        return null;
      }
    }
  }
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

  const parsed = safeParseAiJson(descriptionText);
  if (parsed) {
    // Açıklama metnini çıkar
    descriptionText =
      parsed.description ||
      parsed.character_description ||
      parsed.desc ||
      parsed.text ||
      descriptionText;

    // Eğer descriptionText hala bir JSON string ise (iç içe serialize edilmişse), tekrar aç
    if (typeof descriptionText === 'string' && descriptionText.trim().startsWith('{')) {
      const nested = safeParseAiJson(descriptionText);
      if (nested) {
        descriptionText = nested.description || nested.character_description || nested.desc || descriptionText;
        if (!skinData && (nested.skinColor || nested.shirtColor)) {
          skinData = normalizeSkinData(nested);
        }
      }
    }

    // Skin görsel URL'i
    skinImageUrl = parsed.skinImageUrl || null;

    // skinData objesini bul
    if (!skinData) {
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
    }

    isMinecraft = themeSlug === 'minecraft' && skinData !== null;
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
  
  const skinData = {
    skinColor: '#e29a6f',
    hairColor: '#2d1e18',
    hairStyle: 'short',
    eyeColor: '#32587f',
    shirtColor: '#78350f',
    sleeveLength: 'long',
    pantsColor: '#1a365d',
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

  const shirtKeywords = ['shirt', 'top', 'jersey', 'jacket', 'coat', 'leather', 'vest', 'sweater', 'hoodie', 'blouse', 'armor', 'tişört', 'kazak', 'forma', 'üst', 'ceket', 'mont', 'yelek', 'deri', 'zırh'];
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
    for (const [colorName, colorHex] of Object.entries(COLOR_MAP)) {
      if (hasWord(windowText, colorName)) {
        skinData.shirtColor = colorHex;
        for (const [colorName2, colorHex2] of Object.entries(COLOR_MAP)) {
          if (colorHex2 !== colorHex && hasWord(windowText, colorName2)) {
            skinData.shirtColor2 = colorHex2;
            break;
          }
        }
        break;
      }
    }
  } else {
    for (const [colorName, colorHex] of Object.entries(COLOR_MAP)) {
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

