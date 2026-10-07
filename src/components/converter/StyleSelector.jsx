/**
 * @fileoverview AI stil ayarları bileşeni (ozellik_onerileri.md #9).
 * Dönüşüm öncesi isteğe bağlı poz, ton ve renk paleti seçimi sunar.
 * Seçimler görsel üretim prompt'una İngilizce stil ekleri olarak yansıtılır.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MdTune } from 'react-icons/md';
import Card from 'components/card';
import { useTranslation } from 'contexts/TranslationContext';

/**
 * Stil seçenek grupları.
 * `prompt` alanı görsel üretim prompt'una eklenecek İngilizce ifadedir.
 */
export const STYLE_GROUPS = [
  {
    key: 'pose',
    labelKey: 'converter.stylePose',
    options: [
      { value: 'hero', labelKey: 'style.poseHero', icon: '🦸', prompt: 'dynamic heroic pose' },
      { value: 'portrait', labelKey: 'style.posePortrait', icon: '🖼️', prompt: 'centered portrait framing' },
      { value: 'action', labelKey: 'style.poseAction', icon: '⚔️', prompt: 'mid-action dynamic battle pose' },
    ],
  },
  {
    key: 'tone',
    labelKey: 'converter.styleTone',
    options: [
      { value: 'epic', labelKey: 'style.toneEpic', icon: '🔥', prompt: 'epic dramatic cinematic tone' },
      { value: 'cute', labelKey: 'style.toneCute', icon: '🧸', prompt: 'cute adorable friendly tone' },
      { value: 'dark', labelKey: 'style.toneDark', icon: '🌑', prompt: 'dark gritty moody atmosphere' },
    ],
  },
  {
    key: 'palette',
    labelKey: 'converter.stylePalette',
    options: [
      { value: 'vibrant', labelKey: 'style.paletteVibrant', icon: '🌈', prompt: 'vibrant saturated color palette' },
      { value: 'pastel', labelKey: 'style.palettePastel', icon: '🍬', prompt: 'soft pastel color palette' },
      { value: 'neon', labelKey: 'style.paletteNeon', icon: '💡', prompt: 'glowing neon color palette' },
    ],
  },
];

/**
 * Seçili stil ayarlarından prompt son eki üretir.
 * @param {Object} styleSettings - { pose, tone, palette } (değerler null olabilir)
 * @returns {string} Boş string veya ", stil1, stil2" biçiminde ek
 */
export function buildStylePromptSuffix(styleSettings) {
  if (!styleSettings) return '';
  const parts = STYLE_GROUPS.map((group) => {
    const selected = group.options.find((opt) => opt.value === styleSettings[group.key]);
    return selected ? selected.prompt : null;
  }).filter(Boolean);
  return parts.length > 0 ? `, ${parts.join(', ')}` : '';
}

/**
 * Stil ayarları seçim kartı.
 * @param {Object} props
 * @param {Object} props.styleSettings - Seçili değerler { pose, tone, palette }
 * @param {Function} props.onChange - (groupKey, value|null) => void
 * @param {boolean} props.disabled - Seçim devre dışı mı
 */
export default function StyleSelector({ styleSettings, onChange, disabled }) {
  const { t } = useTranslation();

  const handleToggle = (groupKey, value) => {
    // Aynı seçeneğe tekrar tıklanırsa seçim kaldırılır
    onChange(groupKey, styleSettings[groupKey] === value ? null : value);
  };

  return (
    <Card extra="p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-500 dark:bg-brand-500/20">
          <MdTune className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-navy-700 dark:text-white">
            {t('converter.styleTitle')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('converter.styleSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {STYLE_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t(group.labelKey)}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const isSelected = styleSettings[group.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggle(group.key, opt.value)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
                    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <span>{opt.icon}</span>
                    {t(opt.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

StyleSelector.propTypes = {
  styleSettings: PropTypes.shape({
    pose: PropTypes.string,
    tone: PropTypes.string,
    palette: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

StyleSelector.defaultProps = {
  disabled: false,
};
