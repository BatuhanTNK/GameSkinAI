/**
 * @fileoverview Gerçek 64x64 Minecraft skin dokusu (texture) üreticisi ve
 * 3B izometrik voksel (cubic block) karakter render motoru.
 *
 * Ücretsiz metinden-görsele servislerin (pollinations.ai vb.) Minecraft temasında
 * bozuk/bulanık kil figürler çizmesi yerine, doğrudan Gemini 2.5 Flash'ın fotoğraftan
 * çıkardığı yüz/kıyafet/aksesuar verilerinden:
 *  1) Oyunda kullanılabilir standart 64x64 .png Minecraft skin dosyasını,
 *  2) Yüksek çözünürlüklü (768x768) gerçek 3B kübik Minecraft karakter render'ını üretir.
 */

export const hexToRgb = (hex) => {
  if (!hex) return null;
  const clean = String(hex).replace('#', '').trim();
  if (clean.length === 6) {
    const val = parseInt(clean, 16);
    if (isNaN(val)) return null;
    return { r: (val >> 16) & 0xff, g: (val >> 8) & 0xff, b: val & 0xff };
  }
  if (clean.length === 3) {
    const val = parseInt(clean, 16);
    if (isNaN(val)) return null;
    return { r: ((val >> 8) & 0xf) * 17, g: ((val >> 4) & 0xf) * 17, b: (val & 0xf) * 17 };
  }
  return null;
};

export const adjustColor = (hex, factor) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const sanitizeColor = (colorStr, fallback) => {
  if (!colorStr || typeof colorStr !== 'string') return fallback;
  const c = colorStr.trim();
  if (!c || ['none', 'null', 'transparent', 'empty'].includes(c.toLowerCase())) {
    return fallback;
  }
  if (c.startsWith('#')) {
    const clean = c.replace('#', '').trim();
    if (clean.length === 6 || clean.length === 3) return '#' + clean;
    if (clean.length > 6) return '#' + clean.substring(0, 6);
    return fallback;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(c) || /^[0-9A-Fa-f]{3}$/.test(c)) return '#' + c;
  const map = {
    red: '#e53e3e', green: '#38a169', blue: '#3182ce', white: '#f4f4f6', black: '#1a1a1a',
    yellow: '#d69e2e', orange: '#dd6b20', brown: '#8b4513', purple: '#805ad5', pink: '#d53f8c',
    grey: '#718096', gray: '#718096', darkbrown: '#3b2212', lightbrown: '#c68642', cream: '#f5f0e6',
    beige: '#e2ba8d', navy: '#1a365d', olive: '#4f5b47',
  };
  return map[c.toLowerCase().replace(/\s+/g, '')] || fallback;
};

/**
 * Deterministik sözde-rastgele sayı üreteci (aynı skinData her zaman aynı dokuyu üretir).
 */
function createSeededNoise(seedStr = 'mc') {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * skinData nesnesinden standart 64x64 Minecraft skin Canvas'ı üretir.
 * @param {Object} skinData
 * @param {Function} [createCanvasFn] - Node.js test ortamı için isteğe bağlı canvas fabrikası
 * @returns {HTMLCanvasElement} 64x64 canvas
 */
export function buildMinecraftSkinCanvas(skinData = {}, createCanvasFn = null) {
  const makeCanvas = createCanvasFn || ((w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  });

  const skin     = sanitizeColor(skinData.skinColor, '#D9A17C');
  const skinDark = adjustColor(skin, 0.86);
  const skinDeep = adjustColor(skin, 0.72);
  const hair     = sanitizeColor(skinData.hairColor, '#261B14');
  const hairDark = adjustColor(hair, 0.78);
  const hairHi   = adjustColor(hair, 1.15);
  const eye      = sanitizeColor(skinData.eyeColor, '#2D4F6C');
  const shirt    = sanitizeColor(skinData.shirtColor, '#F2F2F5');
  const shirtDk  = adjustColor(shirt, 0.88);
  const shirtDeep = adjustColor(shirt, 0.76);
  const shirt2   = skinData.shirtColor2 ? sanitizeColor(skinData.shirtColor2, '') : '';
  const pants    = sanitizeColor(skinData.pantsColor, '#1E293B');
  const pantsDk  = adjustColor(pants, 0.85);
  const shoes    = sanitizeColor(skinData.shoesColor, '#18181B');
  const beard    = sanitizeColor(skinData.beardColor || skinData.hairColor, hair);
  const beardDk  = adjustColor(beard, 0.82);

  const acc = String(skinData.accessory || 'none').toLowerCase();
  const hatStyle = String(skinData.hatStyle || (acc === 'hat' || acc === 'headband' ? acc : 'none')).toLowerCase();
  const hasGlasses = Boolean(skinData.hasGlasses || acc === 'glasses');
  const glassesColor = sanitizeColor(skinData.glassesColor || (acc === 'glasses' ? skinData.accessoryColor : '#18181B'), '#18181B');
  const hatColor = sanitizeColor(skinData.hatColor || skinData.accessoryColor || '#1E293B', '#1E293B');
  const hatDark = adjustColor(hatColor, 0.82);
  const shirtStyle = String(skinData.shirtStyle || 'hoodie').toLowerCase();

  const rand = createSeededNoise(JSON.stringify(skinData));

  const C = makeCanvas(64, 64);
  const ctx = C.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);

  const fillNoise = (x, y, w, h, hex, noise = 0.045) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const f = 1 + (rand() - 0.5) * noise;
        const r = Math.min(255, Math.max(0, Math.round(rgb.r * f)));
        const g = Math.min(255, Math.max(0, Math.round(rgb.g * f)));
        const b = Math.min(255, Math.max(0, Math.round(rgb.b * f)));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  };

  const fillRect = (x, y, w, h, hex, alpha = 1) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    ctx.fillStyle = alpha < 1 ? `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})` : `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    ctx.fillRect(x, y, w, h);
  };

  const px = (x, y, hex, alpha = 1) => fillRect(x, y, 1, 1, hex, alpha);

  // ── 1. KAFA TABANI (İç Katman: 0..31, 0..15) ──
  // Üst (8,0,8,8) ve Alt (16,0,8,8)
  fillNoise(8, 0, 8, 8, hair, 0.07);
  fillNoise(16, 0, 8, 8, skinDark, 0.03);
  // Sağ yan (0,8,8,8), Ön (8,8,8,8), Sol yan (16,8,8,8), Arka (24,8,8,8)
  fillNoise(0, 8, 8, 8, skin, 0.04);
  fillNoise(8, 8, 8, 8, skin, 0.04);
  fillNoise(16, 8, 8, 8, skin, 0.04);
  fillNoise(24, 8, 8, 8, hairDark, 0.07);

  // Saç kesimi (Ön ve yanlar)
  const isLongHair = skinData.hairStyle === 'long';
  const isMediumHair = skinData.hairStyle === 'medium';
  fillNoise(8, 8, 8, 2, hair, 0.07);
  px(8, 10, hair);
  px(15, 10, hair);
  px(9, 9, hairHi);
  px(12, 8, hairHi);
  // Yan favoriler ve saç üstü
  fillNoise(0, 8, 8, 3, hair, 0.07);
  fillNoise(16, 8, 8, 3, hair, 0.07);
  fillNoise(0, 11, 3, 2, hairDark, 0.06);
  fillNoise(21, 11, 3, 2, hairDark, 0.06);
  if (isLongHair || isMediumHair) {
    fillNoise(0, 11, 4, 5, hair, 0.07);
    fillNoise(20, 11, 4, 5, hair, 0.07);
  }

  // Kaşlar
  fillRect(9, 10, 2, 1, hairDark);
  fillRect(13, 10, 2, 1, hairDark);

  // Gözler (2x1 sklera + iris)
  px(9, 11, '#FFFFFF');
  px(10, 11, eye);
  px(13, 11, eye);
  px(14, 11, '#FFFFFF');

  // Burun ve dudak gölgesi
  px(11, 12, skinDark);
  px(12, 12, skinDark);
  px(11, 13, skinDeep);
  px(12, 13, skinDeep);

  // Sakal / Bıyık (hasBeard)
  if (skinData.hasBeard) {
    // Bıyık + çene sakalı (goatee & jawline)
    fillRect(10, 13, 4, 1, beard);
    fillRect(9, 14, 6, 2, beard);
    px(11, 14, skinDeep);
    px(12, 14, skinDeep);
    px(8, 14, beardDk);
    px(15, 14, beardDk);
    px(8, 15, beard);
    px(15, 15, beard);
    // Yan çene hattı
    fillRect(4, 14, 4, 2, beardDk);
    fillRect(16, 14, 4, 2, beardDk);
  }

  // ── 2. KAFA DIŞ KATMANI (Şapka / Bere / Gözlük / Saç Hacmi: 32..63, 0..15) ──
  if (hatStyle === 'hat' || hatStyle === 'cap') {
    // Şapka/Kep: tepe + ön siperlik (saçın tamamını kapatmaz, gerçek kep gibi durur)
    fillNoise(40, 0, 8, 8, hatColor, 0.04);
    fillNoise(32, 8, 8, 3, hatColor, 0.04);
    fillNoise(40, 8, 8, 3, hatColor, 0.04);
    fillNoise(48, 8, 8, 3, hatColor, 0.04);
    fillNoise(56, 8, 8, 4, hatDark, 0.04);
    // Kep siperliği (ön katmanda kaş hizasında koyu siper)
    fillRect(40, 10, 8, 1, hatDark);
    // Ön logo detayı
    px(43, 8, '#FFFFFF');
    px(44, 8, '#FFFFFF');
  } else if (hatStyle === 'headband') {
    fillNoise(32, 9, 32, 2, hatColor, 0.03);
  } else {
    // Şapka yoksa dış katmana 3B saç hacmi ekle
    fillNoise(40, 0, 8, 8, hair, 0.08);
    fillNoise(40, 8, 8, 2, hair, 0.08);
    fillNoise(32, 8, 8, 2, hair, 0.08);
    fillNoise(48, 8, 8, 2, hair, 0.08);
    fillNoise(56, 8, 8, 4, hairDark, 0.08);
  }

  // Gözlük (şapka ile aynı anda takılabilir!)
  if (hasGlasses) {
    // Sol çerçeve (8..11), köprü (11..12), sağ çerçeve (12..15)
    fillRect(40, 10, 3, 1, glassesColor);
    fillRect(45, 10, 3, 1, glassesColor);
    fillRect(43, 11, 2, 1, glassesColor);
    px(40, 11, glassesColor);
    px(47, 11, glassesColor);
    fillRect(40, 12, 3, 1, glassesColor);
    fillRect(45, 12, 3, 1, glassesColor);
    // Yarı saydam cam parlaması
    px(41, 11, '#A5F3FC', 0.35);
    px(46, 11, '#A5F3FC', 0.35);
    // Gözlük sapları (yan yüzlerde)
    fillRect(35, 11, 5, 1, glassesColor);
    fillRect(48, 11, 5, 1, glassesColor);
  }

  // ── 3. GÖVDE (16..39, 16..31) ──
  // Not: shirtColor2 artık tüm gövdeyi hakem forması gibi dikey çizgiye boyamaz!
  // Yalnızca shirtStyle === 'striped' ise çizgili yapar; aksi halde kapüşonlu/ceket/tişört detayı olarak kullanır.
  const isStriped = shirtStyle === 'striped' && Boolean(shirt2);
  const drawTorsoBase = (x, y, w, h, baseHex) => {
    if (isStriped) {
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const c = Math.floor(dx / 2) % 2 === 0 ? baseHex : shirt2;
          px(x + dx, y + dy, c);
        }
      }
    } else {
      fillNoise(x, y, w, h, baseHex, 0.04);
    }
  };

  // Üst/alt omuz (20,16,8,4), (28,16,8,4)
  drawTorsoBase(20, 16, 8, 4, shirt);
  drawTorsoBase(28, 16, 8, 4, shirtDeep);
  // Sağ yan (16,20,4,12), Ön (20,20,8,12), Sol yan (28,20,4,12), Arka (32,20,8,12)
  drawTorsoBase(16, 20, 4, 12, shirtDk);
  drawTorsoBase(20, 20, 8, 12, shirt);
  drawTorsoBase(28, 20, 4, 12, shirtDk);
  drawTorsoBase(32, 20, 8, 12, shirt);

  // Boyun açıklığı
  px(23, 20, skin);
  px(24, 20, skin);
  px(23, 21, skinDark);
  px(24, 21, skinDark);

  if (!isStriped) {
    const accent = shirt2 || shirtDeep;
    if (shirtStyle === 'jacket') {
      // Açık fermuarlı ceket + iç tişört
      fillNoise(23, 21, 2, 11, accent, 0.03);
      fillRect(22, 20, 1, 12, shirtDeep);
      fillRect(25, 20, 1, 12, shirtDeep);
    } else {
      // Hoodie / Kazak / Tişört detayları:
      // 1) Alt bel lastiği gölgesi
      fillRect(20, 31, 8, 1, shirtDeep);
      fillRect(32, 31, 8, 1, shirtDeep);
      // 2) Kapüşon bağcıkları ve kanguru cebi
      px(22, 21, shirtDeep);
      px(22, 22, shirtDeep);
      px(25, 21, shirtDeep);
      px(25, 22, shirtDeep);
      fillRect(21, 28, 6, 3, shirtDk);
      px(21, 28, shirtDeep);
      px(26, 28, shirtDeep);
      // 3) Göğüste küçük logo/arma (shirtColor2 varsa)
      if (shirt2 && shirt2.toLowerCase() !== shirt.toLowerCase()) {
        px(25, 23, shirt2);
        px(26, 23, shirt2);
      }
      // 4) Sırt kapüşon kıvrımı
      fillRect(34, 20, 4, 3, shirtDk);
      fillRect(35, 23, 2, 1, shirtDeep);
    }
  }

  // ── 4. KOLLAR ──
  const isShortSleeve = skinData.sleeveLength === 'short';
  const sleeveH = isShortSleeve ? 5 : 10;
  const armSkinH = 12 - sleeveH;
  const cuffH = !isShortSleeve ? 1 : 0;

  // Sağ Kol (40..55, 16..31)
  fillNoise(44, 16, 4, 4, shirt, 0.04);
  fillNoise(48, 16, 4, 4, skinDark, 0.04);
  [40, 44, 48, 52].forEach((x, idx) => {
    const shade = idx === 1 ? shirt : shirtDk;
    fillNoise(x, 20, 4, sleeveH, shade, 0.04);
    if (cuffH) fillRect(x, 20 + sleeveH - 1, 4, 1, shirtDeep);
    fillNoise(x, 20 + sleeveH, 4, armSkinH, skin, 0.04);
  });

  // Sol Kol (32..47, 48..63)
  fillNoise(36, 48, 4, 4, shirt, 0.04);
  fillNoise(40, 48, 4, 4, skinDark, 0.04);
  [32, 36, 40, 44].forEach((x, idx) => {
    const shade = idx === 1 ? shirt : shirtDk;
    fillNoise(x, 52, 4, sleeveH, shade, 0.04);
    if (cuffH) fillRect(x, 52 + sleeveH - 1, 4, 1, shirtDeep);
    fillNoise(x, 52 + sleeveH, 4, armSkinH, skin, 0.04);
  });

  // ── 5. BACAKLAR ──
  const isShorts = skinData.pantsLength === 'short';
  const pantsH = isShorts ? 5 : 10;
  const legSkinH = 10 - pantsH;

  // Sağ Bacak (0..15, 16..31)
  fillNoise(4, 16, 4, 4, pants, 0.04);
  fillNoise(8, 16, 4, 4, shoes, 0.04);
  [0, 4, 8, 12].forEach((x, idx) => {
    const pShade = idx === 1 ? pants : pantsDk;
    fillNoise(x, 20, 4, pantsH, pShade, 0.04);
    if (legSkinH > 0) fillNoise(x, 20 + pantsH, 4, legSkinH, skin, 0.04);
    fillNoise(x, 30, 4, 2, shoes, 0.04);
  });

  // Sol Bacak (16..31, 48..63)
  fillNoise(20, 48, 4, 4, pants, 0.04);
  fillNoise(24, 48, 4, 4, shoes, 0.04);
  [16, 20, 24, 28].forEach((x, idx) => {
    const pShade = idx === 1 ? pants : pantsDk;
    fillNoise(x, 52, 4, pantsH, pShade, 0.04);
    if (legSkinH > 0) fillNoise(x, 52 + pantsH, 4, legSkinH, skin, 0.04);
    fillNoise(x, 62, 4, 2, shoes, 0.04);
  });

  return C;
}

/**
 * 64x64 Minecraft skin dokusundan yüksek çözünürlüklü 3B izometrik voksel karakter
 * render'ı üretir. Kafa, dış katman (şapka/gözlük/saç), gövde, kollar ve bacaklar
 * gerçek 3B kübik prizmalar olarak ışık/gölge ile çizilir.
 *
 * @param {HTMLCanvasElement} skinCanvas - 64x64 Minecraft skin canvas'ı
 * @param {Object} [options]
 * @param {number} [options.width=768]
 * @param {number} [options.height=768]
 * @param {boolean} [options.transparentBackground=false]
 * @param {Function} [options.createCanvasFn]
 * @returns {HTMLCanvasElement}
 */
export function renderMinecraft3DCharacter(skinCanvas, options = {}) {
  const {
    width = 768,
    height = 768,
    transparentBackground = false,
    createCanvasFn = null,
  } = options;

  const makeCanvas = createCanvasFn || ((w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  });

  const out = makeCanvas(width, height);
  const ctx = out.getContext('2d');
  const skinCtx = skinCanvas.getContext('2d');
  const skinImg = skinCtx.getImageData(0, 0, 64, 64).data;

  // Stüdyo arka planı (isteğe bağlı)
  if (!transparentBackground) {
    const bg = ctx.createRadialGradient(width * 0.5, height * 0.42, width * 0.05, width * 0.5, height * 0.5, width * 0.65);
    bg.addColorStop(0, '#2A303C');
    bg.addColorStop(0.6, '#1B2028');
    bg.addColorStop(1, '#11141A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }

  // Zemin gölgesi
  ctx.save();
  ctx.translate(width * 0.5, height * 0.855);
  ctx.scale(1, 0.36);
  const sh = ctx.createRadialGradient(0, 0, 10, 0, 0, width * 0.24);
  sh.addColorStop(0, 'rgba(0,0,0,0.55)');
  sh.addColorStop(0.7, 'rgba(0,0,0,0.22)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(0, 0, width * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3B Kamera Dönüşümü (Yaw = -28 derece, Pitch = 18 derece)
  const yaw = (-28 * Math.PI) / 180;
  const pitch = (18 * Math.PI) / 180;
  const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch), sinP = Math.sin(pitch);

  const scale = Math.min(width, height) / 42;
  const centerX = width * 0.5;
  const centerY = height * 0.49;

  const project = (x, y, z) => {
    // Y yukarı pozitif, Z öne (kameraya) pozitif, X sağa pozitif
    const rx = x * cosY + z * sinY;
    const rz = -x * sinY + z * cosY;
    const ry = y * cosP - rz * sinP;
    const depth = y * sinP + rz * cosP;
    return {
      sx: centerX + rx * scale,
      sy: centerY - ry * scale,
      depth,
    };
  };

  const getTexel = (tx, ty) => {
    const idx = (ty * 64 + tx) * 4;
    return [skinImg[idx], skinImg[idx + 1], skinImg[idx + 2], skinImg[idx + 3]];
  };

  // Tüm görünür piksel-poligonları toplayıp Z-sırasına (painter's algorithm) göre çizeriz
  const quads = [];

  /**
   * Bir kutunun (cuboid) 6 yüzünü piksel-piksel (texel-by-texel) 3B uzayda örnekler.
   * localRotate: { pitchX, rollZ } (radyan) — kutunun kendi pivot noktası etrafında dönüşü.
   */
  const addCuboid = ({
    cx, cy, cz,
    w, h, d,
    pivotYOffset = 0,
    rotX = 0,
    rotZ = 0,
    uv, // { front:[x,y,w,h], back, left, right, top, bottom }
    inflate = 0,
  }) => {
    const hw = w / 2 + inflate;
    const hh = h / 2 + inflate;
    const hd = d / 2 + inflate;

    const cX = Math.cos(rotX), sX = Math.sin(rotX);
    const cZ = Math.cos(rotZ), sZ = Math.sin(rotZ);

    const toWorld = (lx, ly, lz) => {
      // Pivot noktasına göre döndür
      const py = ly - pivotYOffset;
      // X ekseni etrafında (kol/bacak ileri-geri salınımı)
      const y1 = py * cX - lz * sX;
      const z1 = py * sX + lz * cX;
      // Z ekseni etrafında (hafif dışa açılma)
      const x2 = lx * cZ - y1 * sZ;
      const y2 = lx * sZ + y1 * cZ;
      return [cx + x2, cy + y2 + pivotYOffset, cz + z1];
    };

    const emitFace = (faceSpec, uvs, shade) => {
      if (!uvs) return;
      const [ux, uy, uw, uh] = uvs;
      for (let ty = 0; ty < uh; ty++) {
        for (let tx = 0; tx < uw; tx++) {
          const [r, g, b, a] = getTexel(ux + tx, uy + ty);
          if (a < 20) continue;
          const u0 = tx / uw, u1 = (tx + 1) / uw;
          const v0 = ty / uh, v1 = (ty + 1) / uh;
          const corners3d = faceSpec(u0, v0, u1, v1);
          // Yüz normali kameraya dönük mü kontrol et (backface culling)
          const p0 = project(...corners3d[0]);
          const p1 = project(...corners3d[1]);
          const p2 = project(...corners3d[2]);
          const p3 = project(...corners3d[3]);
          const cross = (p1.sx - p0.sx) * (p2.sy - p0.sy) - (p1.sy - p0.sy) * (p2.sx - p0.sx);
          if (cross <= 0) continue;

          const avgDepth = (p0.depth + p1.depth + p2.depth + p3.depth) * 0.25;
          const sr = Math.min(255, Math.round(r * shade));
          const sg = Math.min(255, Math.round(g * shade));
          const sb = Math.min(255, Math.round(b * shade));
          quads.push({
            depth: avgDepth + (inflate > 0 ? 0.08 : 0),
            p0, p1, p2, p3,
            color: a < 250 ? `rgba(${sr},${sg},${sb},${(a / 255).toFixed(2)})` : `rgb(${sr},${sg},${sb})`,
          });
        }
      }
    };

    // Ön yüz (z = +hd), u: -hw -> +hw, v: +hh -> -hh
    emitFace(
      (u0, v0, u1, v1) => [
        toWorld(-hw + u0 * 2 * hw, hh - v0 * 2 * hh, hd),
        toWorld(-hw + u1 * 2 * hw, hh - v0 * 2 * hh, hd),
        toWorld(-hw + u1 * 2 * hw, hh - v1 * 2 * hh, hd),
        toWorld(-hw + u0 * 2 * hw, hh - v1 * 2 * hh, hd),
      ],
      uv.front,
      1.0
    );

    // Arka yüz (z = -hd)
    emitFace(
      (u0, v0, u1, v1) => [
        toWorld(hw - u0 * 2 * hw, hh - v0 * 2 * hh, -hd),
        toWorld(hw - u1 * 2 * hw, hh - v0 * 2 * hh, -hd),
        toWorld(hw - u1 * 2 * hw, hh - v1 * 2 * hh, -hd),
        toWorld(hw - u0 * 2 * hw, hh - v1 * 2 * hh, -hd),
      ],
      uv.back,
      0.68
    );

    // Karakterin Sağ yanı (ekranda sol taraf, x = -hw)
    emitFace(
      (u0, v0, u1, v1) => [
        toWorld(-hw, hh - v0 * 2 * hh, -hd + u0 * 2 * hd),
        toWorld(-hw, hh - v0 * 2 * hh, -hd + u1 * 2 * hd),
        toWorld(-hw, hh - v1 * 2 * hh, -hd + u1 * 2 * hd),
        toWorld(-hw, hh - v1 * 2 * hh, -hd + u0 * 2 * hd),
      ],
      uv.right,
      0.82
    );

    // Karakterin Sol yanı (ekranda sağ taraf, x = +hw)
    emitFace(
      (u0, v0, u1, v1) => [
        toWorld(hw, hh - v0 * 2 * hh, hd - u0 * 2 * hd),
        toWorld(hw, hh - v0 * 2 * hh, hd - u1 * 2 * hd),
        toWorld(hw, hh - v1 * 2 * hh, hd - u1 * 2 * hd),
        toWorld(hw, hh - v1 * 2 * hh, hd - u0 * 2 * hd),
      ],
      uv.left,
      0.78
    );

    // Üst yüz (y = +hh)
    emitFace(
      (u0, v0, u1, v1) => [
        toWorld(-hw + u0 * 2 * hw, hh, -hd + v0 * 2 * hd),
        toWorld(-hw + u1 * 2 * hw, hh, -hd + v0 * 2 * hd),
        toWorld(-hw + u1 * 2 * hw, hh, -hd + v1 * 2 * hd),
        toWorld(-hw + u0 * 2 * hw, hh, -hd + v1 * 2 * hd),
      ],
      uv.top,
      1.12
    );

    // Alt yüz (y = -hh)
    emitFace(
      (u0, v0, u1, v1) => [
        toWorld(-hw + u0 * 2 * hw, -hh, hd - v0 * 2 * hd),
        toWorld(-hw + u1 * 2 * hw, -hh, hd - v0 * 2 * hd),
        toWorld(-hw + u1 * 2 * hw, -hh, hd - v1 * 2 * hd),
        toWorld(-hw + u0 * 2 * hw, -hh, hd - v1 * 2 * hd),
      ],
      uv.bottom,
      0.55
    );
  };

  // Karakter toplam yüksekliği: 32 birim (-16 .. +16)
  // Bacaklar: y = -16 .. -4 (merkez cy = -10)
  // Gövde:    y = -4  .. +8 (merkez cy = +2)
  // Kafa:     y = +8  .. +16 (merkez cy = +12)

  // Sağ Bacak (x = -2)
  addCuboid({
    cx: -2.05, cy: -10, cz: 0, w: 4, h: 12, d: 4,
    pivotYOffset: 6, rotX: 0.16, rotZ: -0.02,
    uv: {
      top: [4, 16, 4, 4], bottom: [8, 16, 4, 4],
      right: [0, 20, 4, 12], front: [4, 20, 4, 12], left: [8, 20, 4, 12], back: [12, 20, 4, 12],
    },
  });

  // Sol Bacak (x = +2)
  addCuboid({
    cx: 2.05, cy: -10, cz: 0, w: 4, h: 12, d: 4,
    pivotYOffset: 6, rotX: -0.16, rotZ: 0.02,
    uv: {
      top: [20, 48, 4, 4], bottom: [24, 48, 4, 4],
      right: [16, 52, 4, 12], front: [20, 52, 4, 12], left: [24, 52, 4, 12], back: [28, 52, 4, 12],
    },
  });

  // Gövde
  addCuboid({
    cx: 0, cy: 2, cz: 0, w: 8, h: 12, d: 4,
    uv: {
      top: [20, 16, 8, 4], bottom: [28, 16, 8, 4],
      right: [16, 20, 4, 12], front: [20, 20, 8, 12], left: [28, 20, 4, 12], back: [32, 20, 8, 12],
    },
  });

  // Sağ Kol (x = -6)
  addCuboid({
    cx: -6.1, cy: 2, cz: 0, w: 4, h: 12, d: 4,
    pivotYOffset: 5, rotX: -0.22, rotZ: -0.06,
    uv: {
      top: [44, 16, 4, 4], bottom: [48, 16, 4, 4],
      right: [40, 20, 4, 12], front: [44, 20, 4, 12], left: [48, 20, 4, 12], back: [52, 20, 4, 12],
    },
  });

  // Sol Kol (x = +6)
  addCuboid({
    cx: 6.1, cy: 2, cz: 0, w: 4, h: 12, d: 4,
    pivotYOffset: 5, rotX: 0.22, rotZ: 0.06,
    uv: {
      top: [36, 48, 4, 4], bottom: [40, 48, 4, 4],
      right: [32, 52, 4, 12], front: [36, 52, 4, 12], left: [40, 52, 4, 12], back: [44, 52, 4, 12],
    },
  });

  // Kafa (İç katman)
  addCuboid({
    cx: 0, cy: 12.1, cz: 0, w: 8, h: 8, d: 8,
    pivotYOffset: -4, rotX: 0.04,
    uv: {
      top: [8, 0, 8, 8], bottom: [16, 0, 8, 8],
      right: [0, 8, 8, 8], front: [8, 8, 8, 8], left: [16, 8, 8, 8], back: [24, 8, 8, 8],
    },
  });

  // Kafa Dış Katman (Şapka / Gözlük / 3B Saç)
  addCuboid({
    cx: 0, cy: 12.1, cz: 0, w: 8, h: 8, d: 8,
    inflate: 0.42,
    pivotYOffset: -4, rotX: 0.04,
    uv: {
      top: [40, 0, 8, 8], bottom: [48, 0, 8, 8],
      right: [32, 8, 8, 8], front: [40, 8, 8, 8], left: [48, 8, 8, 8], back: [56, 8, 8, 8],
    },
  });

  // Arkadan öne doğru sırala
  quads.sort((a, b) => a.depth - b.depth);

  for (const q of quads) {
    ctx.fillStyle = q.color;
    ctx.strokeStyle = q.color;
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(q.p0.sx, q.p0.sy);
    ctx.lineTo(q.p1.sx, q.p1.sy);
    ctx.lineTo(q.p2.sx, q.p2.sy);
    ctx.lineTo(q.p3.sx, q.p3.sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  return out;
}

/**
 * skinData nesnesinden doğrudan 768x768 PNG data URL'i üretir.
 * @param {Object} skinData
 * @returns {string} data:image/png;base64,...
 */
export function renderMinecraft3DDataUrl(skinData) {
  const skinCanvas = buildMinecraftSkinCanvas(skinData);
  const renderCanvas = renderMinecraft3DCharacter(skinCanvas, { width: 768, height: 768 });
  return renderCanvas.toDataURL('image/png');
}
