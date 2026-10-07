/**
 * @fileoverview Prompt Kütüphanesi sayfası (ozellik_onerileri.md #10).
 * Kullanıcının kendi dönüşümlerinden üretilen prompt'ları ve hazır prompt
 * şablonlarını Midjourney / Stable Diffusion formatında kopyalanabilir sunar.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdContentCopy, MdAutoAwesome, MdLibraryBooks, MdCheck } from 'react-icons/md';
import Card from 'components/card';
import { useConversions } from 'hooks/useConversions';
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';
import { getGameLogo } from 'components/converter/GameLogos';
import { FaCube } from 'react-icons/fa';

/** Hazır prompt şablonları (Midjourney / Stable Diffusion uyumlu) */
const PROMPT_TEMPLATES = [
  {
    key: 'minecraft',
    themeSlug: 'minecraft',
    labelKey: 'prompts.tplMinecraft',
    prompt:
      'Stunning official Minecraft game keyart illustration, highly detailed 3D blocky voxel character, dynamic heroic pose, volumetric studio lighting, soft ambient occlusion, vibrant colors, premium game cover render',
  },
  {
    key: 'roblox',
    themeSlug: 'roblox',
    labelKey: 'prompts.tplRoblox',
    prompt:
      'Roblox avatar character, round head and blocky body proportions, cartoonish colorful style, bright color scheme, centered portrait, clean plain studio background, high-quality render',
  },
  {
    key: 'cyberpunk',
    themeSlug: 'cyberpunk',
    labelKey: 'prompts.tplCyberpunk',
    prompt:
      'Cyberpunk 2077 style mercenary character, neon-lit leather jacket, cyber implants, glowing optics, Night City atmosphere, cinematic neon color palette, ultra-detailed render',
  },
  {
    key: 'fortnite',
    themeSlug: 'fortnite',
    labelKey: 'prompts.tplFortnite',
    prompt:
      'Fortnite battle royale character skin, stylized 3D cartoon proportions, tactical vest and armor plating, vibrant saturated colors, dynamic action pose, epic game splash art',
  },
  {
    key: 'pixel',
    themeSlug: 'pixel-rpg',
    labelKey: 'prompts.tplPixel',
    prompt:
      '16-bit JRPG pixel art hero character, detailed pixel armor and magic sword, retro SNES style sprite, vibrant fantasy color palette, epic adventure theme',
  },
  {
    key: 'anime',
    themeSlug: 'genshin',
    labelKey: 'prompts.tplAnime',
    prompt:
      '3D cel-shaded anime game character, Genshin Impact style, glowing elemental vision gem, detailed fantasy outfit, soft anime lighting, vibrant colors, full body portrait',
  },
];

/** Kopyalama formatı seçenekleri */
const FORMAT_OPTIONS = [
  { key: 'plain', label: 'Standart', suffix: '' },
  { key: 'midjourney', label: 'Midjourney', suffix: ' --v 6 --ar 1:1 --q 2' },
  {
    key: 'sd',
    label: 'Stable Diffusion',
    suffix: ', masterpiece, best quality, highly detailed, 8k',
  },
];

/**
 * Tek bir prompt kartı (kopyalama butonlu).
 */
function PromptCard({ title, subtitle, promptText, logo, format }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const finalPrompt = promptText + (format?.suffix || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt).then(() => {
      setCopied(true);
      showToast(t('result.promptCopied'), 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card extra="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-navy-700">
          {logo || <FaCube className="h-4 w-4 text-brand-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold text-navy-700 dark:text-white">{title}</h4>
          {subtitle && (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 ${
            copied ? 'bg-green-500' : 'bg-cyan-500 hover:bg-cyan-600'
          }`}
        >
          {copied ? <MdCheck className="h-3.5 w-3.5" /> : <MdContentCopy className="h-3.5 w-3.5" />}
          {copied ? t('prompts.copied') : t('result.btnCopyPrompt')}
        </button>
      </div>
      <p className="line-clamp-4 whitespace-pre-wrap break-words rounded-lg bg-lightPrimary p-3 text-xs leading-relaxed text-gray-600 dark:bg-navy-900 dark:text-gray-400">
        {finalPrompt}
      </p>
    </Card>
  );
}

PromptCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  promptText: PropTypes.string.isRequired,
  logo: PropTypes.node,
  format: PropTypes.shape({
    key: PropTypes.string,
    suffix: PropTypes.string,
  }),
};

PromptCard.defaultProps = {
  subtitle: null,
  logo: null,
  format: null,
};

/**
 * Prompt Kütüphanesi sayfası.
 */
export default function PromptLibrary() {
  const { t, lang } = useTranslation();
  const { conversions } = useConversions();
  const [formatKey, setFormatKey] = useState('plain');

  const format = FORMAT_OPTIONS.find((f) => f.key === formatKey) || FORMAT_OPTIONS[0];

  // Prompt'u kaydedilmiş kendi dönüşümleri (en yeni önce)
  const myPrompts = conversions.filter((c) => c.prompt);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateLocale = lang === 'en' ? 'en-US' : 'tr-TR';
    return new Intl.DateTimeFormat(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-navy-700 dark:text-white">
            {t('prompts.title')}
          </h2>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            {t('prompts.subtitle')}
          </p>
        </div>

        {/* Format Seçici */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {t('prompts.formatLabel')}
          </span>
          {FORMAT_OPTIONS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFormatKey(f.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                formatKey === f.key
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kendi Prompt'larım */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <MdAutoAwesome className="h-5 w-5 text-brand-500" />
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
            {t('prompts.myPromptsTitle')}
          </h3>
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            {myPrompts.length}
          </span>
        </div>

        {myPrompts.length === 0 ? (
          <Card extra="p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('prompts.emptyMyPrompts')}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {myPrompts.map((conv) => (
              <PromptCard
                key={conv.id}
                title={conv.theme_label}
                subtitle={formatDate(conv.created_at)}
                promptText={conv.prompt}
                logo={getGameLogo(conv.theme_slug, 'h-5 w-5')}
                format={format}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hazır Şablonlar */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <MdLibraryBooks className="h-5 w-5 text-brand-500" />
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
            {t('prompts.templatesTitle')}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PROMPT_TEMPLATES.map((tpl) => (
            <PromptCard
              key={tpl.key}
              title={t(tpl.labelKey)}
              promptText={tpl.prompt}
              logo={getGameLogo(tpl.themeSlug, 'h-5 w-5')}
              format={format}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
