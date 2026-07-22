/**
 * @fileoverview Minecraft Skin Preview ve İndirme Bileşeni.
 * AI tarafından üretilen skin görseli varsa onu gösterir,
 * yoksa renk verilerinden programmatik skin oluşturur.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MdDownload, MdVisibility, MdVisibilityOff } from 'react-icons/md';

// ──────────── YARDIMCI FONKSİYONLAR ────────────

const hexToRgb = (hex) => {
  if (!hex) return null;
  const clean = hex.replace('#', '').trim();
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

const adjustColor = (hex, factor) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const sanitizeColor = (colorStr, fallback) => {
  if (!colorStr || typeof colorStr !== 'string') return fallback;
  let c = colorStr.trim();
  if (!c || c === '' || c.toLowerCase() === 'none' || c.toLowerCase() === 'null' || c.toLowerCase() === 'transparent' || c.toLowerCase() === 'empty') {
    return fallback;
  }
  
  if (c.startsWith('#')) {
    const clean = c.replace('#', '').trim();
    if (clean.length === 6 || clean.length === 3) {
      return c;
    }
    // Eğer Gemini yanlışlıkla 7 haneli üretirse (örn. #ee29edf), ilk 6 hanesini kurtar
    if (clean.length === 7) {
      return '#' + clean.substring(0, 6);
    }
    return fallback;
  }

  // Eğer # işareti koymayı unuttuysa ama geçerli hex ise ekle
  if (/^[0-9A-Fa-f]{6}$/.test(c)) return '#' + c;
  if (/^[0-9A-Fa-f]{3}$/.test(c)) return '#' + c;

  // İsimli renk eşleşmesi
  const map = { 
    red:'#e53e3e', green:'#38a169', blue:'#3182ce', white:'#ffffff', black:'#1a1a1a',
    yellow:'#d69e2e', orange:'#dd6b20', brown:'#8b4513', purple:'#805ad5', pink:'#d53f8c',
    grey:'#718096', gray:'#718096', darkbrown:'#3b2212', lightbrown:'#c68642' 
  };
  return map[c.toLowerCase().replace(/\s+/g, '')] || fallback;
};

// ──────────── BİLEŞEN ────────────

/**
 * MinecraftSkinPreview bileşeni.
 * @param {Object} props
 * @param {Object} props.skinData - Programmatik skin için renk verileri
 * @param {string} [props.skinImageUrl] - AI tarafından üretilen skin görseli URL'i
 */
export default function MinecraftSkinPreview({ skinData, skinImageUrl }) {
  const previewCanvasRef = useRef(null);
  const [skinDataUrl, setSkinDataUrl] = useState('');
  const [showFlatTexture, setShowFlatTexture] = useState(false);

  // ──────────── PROGRAMMATIK SKİN (Fallback) ────────────
  useEffect(() => {
    // AI görseli varsa programmatik skin oluşturma (sadece fallback durumda)
    if (skinImageUrl || !skinData) return;

    const skin     = sanitizeColor(skinData.skinColor, '#C68642');
    const skinDark = adjustColor(skin, 0.85);
    const hair     = sanitizeColor(skinData.hairColor, '#2d1e18');
    const hairDark = adjustColor(hair, 0.8);
    const eye      = sanitizeColor(skinData.eyeColor, '#333333');
    const shirt    = sanitizeColor(skinData.shirtColor, '#dd6b20');
    const shirtDk  = adjustColor(shirt, 0.82);
    const shirt2   = skinData.shirtColor2 ? sanitizeColor(skinData.shirtColor2, '') : '';
    const shirt2Dk = shirt2 ? adjustColor(shirt2, 0.82) : '';
    const pants    = sanitizeColor(skinData.pantsColor, '#212121');
    const shoes    = sanitizeColor(skinData.shoesColor, '#1a1a1a');
    const beard    = sanitizeColor(skinData.beardColor || skinData.hairColor, '#2d1e18');
    const accColor = sanitizeColor(skinData.accessoryColor, '#e53e3e');

    const C = document.createElement('canvas');
    C.width = 64; C.height = 64;
    const ctx = C.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);

    const fillNoise = (x, y, w, h, hex, noise = 0.06) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return;
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const f = 1 + (Math.random() - 0.5) * noise;
          const r = Math.min(255, Math.max(0, Math.round(rgb.r * f)));
          const g = Math.min(255, Math.max(0, Math.round(rgb.g * f)));
          const b = Math.min(255, Math.max(0, Math.round(rgb.b * f)));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x + dx, y + dy, 1, 1);
        }
      }
    };

    const fillRect = (x, y, w, h, hex) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return;
      ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
      ctx.fillRect(x, y, w, h);
    };

    const px = (x, y, hex) => fillRect(x, y, 1, 1, hex);

    const fillStripes = (x, y, w, h, color1, color2, sw = 2) => {
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const c = Math.floor(dx / sw) % 2 === 0 ? color1 : color2;
          const rgb = hexToRgb(c);
          if (!rgb) continue;
          const f = 1 + (Math.random() - 0.5) * 0.05;
          ctx.fillStyle = `rgb(${Math.min(255,Math.max(0,Math.round(rgb.r*f)))},${Math.min(255,Math.max(0,Math.round(rgb.g*f)))},${Math.min(255,Math.max(0,Math.round(rgb.b*f)))})`;
          ctx.fillRect(x + dx, y + dy, 1, 1);
        }
      }
    };

    const fillShirt = (x, y, w, h) => shirt2 ? fillStripes(x, y, w, h, shirt, shirt2) : fillNoise(x, y, w, h, shirt);
    const fillShirtDk = (x, y, w, h) => shirt2Dk ? fillStripes(x, y, w, h, shirtDk, shirt2Dk) : fillNoise(x, y, w, h, shirtDk);

    // KAFA
    fillNoise(8, 0, 8, 8, hair); fillNoise(16, 0, 8, 8, hairDark);
    fillNoise(0, 8, 8, 3, hair); fillNoise(0, 11, 8, 5, skin);
    fillNoise(8, 8, 8, 8, skin); fillNoise(8, 8, 8, 2, hair);
    px(8, 10, hair); px(15, 10, hair);
    px(9, 12, '#ffffff'); px(10, 12, eye); px(10, 11, '#ffffff');
    px(13, 12, eye); px(14, 12, '#ffffff'); px(13, 11, '#ffffff');
    px(9, 11, hairDark); px(10, 11, hairDark); px(13, 11, hairDark); px(14, 11, hairDark);
    px(11, 13, skinDark); px(12, 13, skinDark);
    px(11, 14, adjustColor(skin, 0.65)); px(12, 14, adjustColor(skin, 0.65));
    fillNoise(16, 8, 8, 3, hair); fillNoise(16, 11, 8, 5, skin);
    fillNoise(24, 8, 8, 8, hair);

    if (skinData.hasBeard) {
      fillNoise(9, 13, 6, 1, beard); fillNoise(8, 14, 8, 2, beard);
      fillNoise(0, 14, 8, 2, beard); fillNoise(16, 14, 8, 2, beard);
    }

    const acc = (skinData.accessory || 'none').toLowerCase();
    if (acc === 'headband') {
      fillNoise(40, 10, 8, 1, accColor, 0.03);
      fillNoise(32, 10, 8, 1, accColor, 0.03);
      fillNoise(48, 10, 8, 1, accColor, 0.03);
      fillNoise(56, 10, 8, 1, accColor, 0.03);
      px(59, 11, accColor); px(60, 11, accColor);
    } else if (acc === 'glasses') {
      fillRect(41, 12, 2, 1, accColor); fillRect(45, 12, 2, 1, accColor);
      fillRect(43, 12, 2, 1, adjustColor(accColor, 0.7));
    } else if (acc === 'hat') {
      fillNoise(40, 0, 8, 8, accColor, 0.04);
      fillNoise(32, 8, 32, 3, accColor, 0.04);
    }

    // GÖVDE
    fillShirt(20, 16, 8, 4); fillShirtDk(28, 16, 8, 4);
    fillShirt(20, 20, 8, 12); px(23, 20, skin); px(24, 20, skin);
    fillShirtDk(16, 20, 4, 12); fillShirtDk(28, 20, 4, 12);
    fillShirt(32, 20, 8, 12);

    // KOLLAR
    const isShort = skinData.sleeveLength === 'short';
    const sleeveH = isShort ? 5 : 10;
    const skinArmH = 12 - sleeveH;
    fillShirt(44, 16, 4, 4); fillNoise(48, 16, 4, 4, skinDark);
    [40, 44, 48, 52].forEach(x => { fillShirt(x, 20, 4, sleeveH); fillNoise(x, 20 + sleeveH, 4, skinArmH, skin); });
    fillShirt(36, 48, 4, 4); fillNoise(40, 48, 4, 4, skinDark);
    [32, 36, 40, 44].forEach(x => { fillShirt(x, 52, 4, sleeveH); fillNoise(x, 52 + sleeveH, 4, skinArmH, skin); });

    // BACAKLAR
    const isShorts = skinData.pantsLength === 'short';
    const pantsH = isShorts ? 5 : 10;
    const skinLegH = 12 - pantsH;

    // Sağ Bacak
    fillNoise(4, 16, 4, 4, pants); fillNoise(8, 16, 4, 4, shoes);
    [0, 4, 8, 12].forEach(x => {
      fillNoise(x, 20, 4, pantsH, pants);               // Şort/Pantolon kısmı
      fillNoise(x, 20 + pantsH, 4, skinLegH, skin);       // Ten kısmı
      fillNoise(x, 30, 4, 2, shoes);                     // Ayakkabı
    });

    // Sol Bacak
    fillNoise(20, 48, 4, 4, pants); fillNoise(24, 48, 4, 4, shoes);
    [16, 20, 24, 28].forEach(x => {
      fillNoise(x, 52, 4, pantsH, pants);
      fillNoise(x, 52 + pantsH, 4, skinLegH, skin);
      fillNoise(x, 62, 4, 2, shoes);
    });

    const url = C.toDataURL('image/png');
    setSkinDataUrl(url);

    // 2D ÖNİZLEME
    const pc = previewCanvasRef.current;
    if (!pc) return;
    const p = pc.getContext('2d');
    pc.width = 220; pc.height = 200;
    p.clearRect(0, 0, 220, 200);
    p.imageSmoothingEnabled = false;
    const S = 5;
    const draw = (sx, sy, sw, sh, dx, dy) => p.drawImage(C, sx, sy, sw, sh, dx, dy, sw * S, sh * S);
    const FX = 30;
    draw(8, 8, 8, 8, FX, 5); draw(40, 8, 8, 8, FX, 5);
    draw(20, 20, 8, 12, FX, 45); draw(44, 20, 4, 12, FX - 20, 45); draw(36, 52, 4, 12, FX + 40, 45);
    draw(4, 20, 4, 12, FX, 105); draw(20, 52, 4, 12, FX + 20, 105);
    const BX = 140;
    draw(24, 8, 8, 8, BX, 5); draw(56, 8, 8, 8, BX, 5);
    draw(32, 20, 8, 12, BX, 45); draw(44, 52, 4, 12, BX - 20, 45); draw(52, 20, 4, 12, BX + 40, 45);
    draw(28, 52, 4, 12, BX, 105); draw(12, 20, 4, 12, BX + 20, 105);
  }, [skinData, skinImageUrl]);

  const handleDownload = () => {
    const url = skinImageUrl || skinDataUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `minecraft_skin_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI skin görseli varsa onu göster, yoksa programmatik canvas
  const hasAiSkin = !!skinImageUrl;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-800">
      <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
        {hasAiSkin ? 'Minecraft Oyuncu Skini (AI Üretim)' : 'Minecraft Oyuncu Skini (Orijinal Format)'}
      </span>

      <div className="relative flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl dark:bg-navy-900 w-full min-h-[280px]">
        {hasAiSkin ? (
          /* ─── AI SKIN GÖRSELİ ─── */
          <div className="flex flex-col items-center gap-2">
            <img
              src={skinImageUrl}
              alt="AI Generated Minecraft Skin"
              className="max-h-[320px] w-auto object-contain rounded-lg drop-shadow-lg"
              style={{ imageRendering: 'auto' }}
            />
            <span className="text-[10px] text-gray-400 mt-1">
              Gemini AI ile üretilmiştir
            </span>
          </div>
                ) : (
          <>
            {/* ─── PROGRAMMATIK 2D ÖNİZLEME ─── */}
            <div className={showFlatTexture ? 'hidden' : 'flex flex-col items-center'}>
              <canvas
                ref={previewCanvasRef}
                width={220}
                height={200}
                className="max-w-full drop-shadow-md"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-6 w-full">
                <span>Ön Görünüm</span>
                <span>Arka Görünüm</span>
              </div>
            </div>

            {/* ─── FLAT TEXTURE HARİTASI ─── */}
            <div className={showFlatTexture ? 'flex flex-col items-center gap-2' : 'hidden'}>
              <img
                src={skinDataUrl}
                alt="Flat Texture Map"
                className="h-40 w-40 object-contain border-2 border-dashed border-gray-300 dark:border-navy-700 p-2"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-[10px] text-gray-400">
                64x64 Pixel Düz Kaplama Haritası
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex w-full gap-2 justify-center">
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-green-600 shadow-md hover:shadow-lg"
        >
          <MdDownload className="h-4 w-4" />
          Skinini İndir (.png)
        </button>

        {!hasAiSkin && (
          <button
            type="button"
            onClick={() => setShowFlatTexture(!showFlatTexture)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-navy-700 transition-all duration-200 hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            {showFlatTexture ? (
              <><MdVisibility className="h-4 w-4" /> Karakteri Göster</>
            ) : (
              <><MdVisibilityOff className="h-4 w-4" /> Dokuyu Göster</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

MinecraftSkinPreview.propTypes = {
  skinData: PropTypes.shape({
    skinColor: PropTypes.string,
    hairColor: PropTypes.string,
    hairStyle: PropTypes.string,
    eyeColor: PropTypes.string,
    shirtColor: PropTypes.string,
    shirtColor2: PropTypes.string,
    sleeveLength: PropTypes.string,
    pantsColor: PropTypes.string,
    pantsLength: PropTypes.string,
    shoesColor: PropTypes.string,
    hasBeard: PropTypes.bool,
    beardColor: PropTypes.string,
    accessory: PropTypes.string,
    accessoryColor: PropTypes.string,
  }).isRequired,
  skinImageUrl: PropTypes.string,
};

MinecraftSkinPreview.defaultProps = {
  skinImageUrl: null,
};
