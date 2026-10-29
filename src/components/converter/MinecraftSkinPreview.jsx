/**
 * @fileoverview Minecraft Skin Preview ve İndirme Bileşeni.
 * Gemini 2.5 Flash tarafından fotoğraftan çıkarılan renk/stil/aksesuar
 * verileriyle standart 64x64 Minecraft skin dokusunu ve 3B izometrik voksel
 * karakter önizlemesini oluşturur.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MdDownload, MdVisibility, MdVisibilityOff, MdVideogameAsset } from 'react-icons/md';
import { useTranslation } from 'contexts/TranslationContext';
import { buildMinecraftSkinCanvas } from 'lib/minecraftRenderer';

/**
 * MinecraftSkinPreview bileşeni.
 * @param {Object} props
 * @param {Object} props.skinData - Programmatik skin için renk ve aksesuar verileri
 * @param {string} [props.skinImageUrl] - 3B karakter render görseli URL'i
 */
export default function MinecraftSkinPreview({ skinData, skinImageUrl }) {
  const { t } = useTranslation();
  const previewCanvasRef = useRef(null);
  const [skinDataUrl, setSkinDataUrl] = useState('');
  const [showFlatTexture, setShowFlatTexture] = useState(false);

  // ──────────── PROGRAMMATİK 64x64 SKİN VE ÖN/ARKA GÖRÜNÜM ────────────
  useEffect(() => {
    if (!skinData) return;

    const C = buildMinecraftSkinCanvas(skinData);
    const url = C.toDataURL('image/png');
    setSkinDataUrl(url);

    // 2B ÖN / ARKA GÖRÜNÜM (Kafa iç + dış şapka/gözlük katmanı dahil)
    const pc = previewCanvasRef.current;
    if (!pc) return;
    const p = pc.getContext('2d');
    pc.width = 240;
    pc.height = 190;
    p.clearRect(0, 0, 240, 190);
    p.imageSmoothingEnabled = false;
    const S = 5;
    const draw = (sx, sy, sw, sh, dx, dy) => p.drawImage(C, sx, sy, sw, sh, dx, dy, sw * S, sh * S);

    // Ön görünüm (FX = 34)
    const FX = 34;
    draw(8, 8, 8, 8, FX, 8);
    draw(40, 8, 8, 8, FX, 8);
    draw(20, 20, 8, 12, FX, 48);
    draw(44, 20, 4, 12, FX - 20, 48);
    draw(36, 52, 4, 12, FX + 40, 48);
    draw(4, 20, 4, 12, FX, 108);
    draw(20, 52, 4, 12, FX + 20, 108);

    // Arka görünüm (BX = 154)
    const BX = 154;
    draw(24, 8, 8, 8, BX, 8);
    draw(56, 8, 8, 8, BX, 8);
    draw(32, 20, 8, 12, BX, 48);
    draw(44, 52, 4, 12, BX - 20, 48);
    draw(52, 20, 4, 12, BX + 40, 48);
    draw(28, 52, 4, 12, BX, 108);
    draw(12, 20, 4, 12, BX + 20, 108);
  }, [skinData, skinImageUrl]);

  /** Verilen URL'i png dosyası olarak indirir. */
  const triggerDownload = (url, filename) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** Oyunda kullanılabilir 64x64 skin dosyasını indirir. */
  const handleDownloadSkinFile = () => {
    triggerDownload(skinDataUrl, `minecraft_skin_64x64_${Date.now()}.png`);
  };

  /** 3B render görselini indirir. */
  const handleDownloadAiImage = () => {
    triggerDownload(skinImageUrl, `minecraft_skin_3d_${Date.now()}.png`);
  };

  const hasAiSkin = Boolean(skinImageUrl);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-150 p-4 dark:border-white/10 dark:bg-navy-800">
      <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
        {hasAiSkin ? t('mcskin.titleAi') : t('mcskin.titleOriginal')}
      </span>

      <div className="relative flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl dark:bg-navy-900 w-full min-h-[260px]">
        {!showFlatTexture ? (
          <div className="flex flex-col items-center w-full">
            <canvas
              ref={previewCanvasRef}
              width={240}
              height={190}
              className="max-w-full drop-shadow-md"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-3 px-8 w-[240px] max-w-full">
              <span>{t('mcskin.frontView')}</span>
              <span>{t('mcskin.backView')}</span>
            </div>
          </div>
        ) : (
          /* ─── FLAT TEXTURE HARİTASI (64x64 oyun dosyası) ─── */
          <div className="flex flex-col items-center gap-2">
            {skinDataUrl ? (
              <img
                src={skinDataUrl}
                alt="Flat Texture Map"
                className="h-40 w-40 object-contain border-2 border-dashed border-gray-300 dark:border-navy-700 p-2"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="h-40 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-navy-800" />
            )}
            <span className="text-[10px] text-gray-400">
              {t('mcskin.textureCaption')}
            </span>
          </div>
        )}
      </div>

      <div className="flex w-full flex-wrap gap-2 justify-center">
        {/* Oyunda kullanılabilir 64x64 skin dosyası */}
        <button
          type="button"
          onClick={handleDownloadSkinFile}
          disabled={!skinDataUrl}
          title={t('mcskin.btnDownloadSkinHint')}
          className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-green-600 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MdVideogameAsset className="h-4 w-4" />
          {t('mcskin.btnDownloadSkin')}
        </button>

        {hasAiSkin && (
          <button
            type="button"
            onClick={handleDownloadAiImage}
            className="flex items-center gap-2 rounded-xl border border-green-500 px-4 py-2 text-xs font-bold text-green-600 transition-all duration-200 hover:bg-green-50 dark:text-green-400 dark:hover:bg-white/5"
          >
            <MdDownload className="h-4 w-4" />
            {t('mcskin.btnDownloadAi')}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowFlatTexture(!showFlatTexture)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-navy-700 transition-all duration-200 hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
        >
          {showFlatTexture ? (
            <><MdVisibility className="h-4 w-4" /> {t('mcskin.btnShowCharacter')}</>
          ) : (
            <><MdVisibilityOff className="h-4 w-4" /> {t('mcskin.btnShowTexture')}</>
          )}
        </button>
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
    shirtStyle: PropTypes.string,
    sleeveLength: PropTypes.string,
    pantsColor: PropTypes.string,
    pantsLength: PropTypes.string,
    shoesColor: PropTypes.string,
    hasBeard: PropTypes.bool,
    beardColor: PropTypes.string,
    hasGlasses: PropTypes.bool,
    glassesColor: PropTypes.string,
    hatStyle: PropTypes.string,
    hatColor: PropTypes.string,
    accessory: PropTypes.string,
    accessoryColor: PropTypes.string,
  }).isRequired,
  skinImageUrl: PropTypes.string,
};

MinecraftSkinPreview.defaultProps = {
  skinImageUrl: null,
};
