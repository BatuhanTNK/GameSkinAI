/**
 * @fileoverview Paylaşılabilir Public Skin Detay Sayfası (/:lang/skin/:id).
 * Giriş gerektirmeden is_public=true dönüşümleri gösterir.
 * Sosyal paylaşımlar için dinamik OG meta tag'leri günceller.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdAutoAwesome, MdFavorite, MdArrowBack, MdSearchOff, MdPerson } from 'react-icons/md';
import MinecraftSkinPreview from 'components/converter/MinecraftSkinPreview';
import ShareButtons from 'components/converter/ShareButtons';
import CommentSection from 'components/comments/CommentSection';
import { fetchPublicConversionById } from 'hooks/useConversions';
import { parseConversionDescription } from 'lib/skinDataParser';
import { useTranslation } from 'contexts/TranslationContext';

/**
 * Head içindeki bir meta tag'i günceller (yoksa oluşturur).
 * @param {string} attr - 'property' veya 'name'
 * @param {string} key - Meta anahtar değeri (örn. og:title)
 * @param {string} content - Meta içerik değeri
 */
function setMetaTag(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Public skin detay sayfası.
 */
export default function PublicSkinPage() {
  const { id, lang: urlLang } = useParams();
  const { t, lang } = useTranslation();
  const activeLang = urlLang || lang || 'tr';

  const [conversion, setConversion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchPublicConversionById(id);
      if (!cancelled) {
        setConversion(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const parsed = conversion
    ? parseConversionDescription(conversion.result_description || '', conversion.theme_slug)
    : { descriptionText: '', skinData: null, skinImageUrl: null, isMinecraft: false };

  // Dinamik OG meta + sayfa başlığı
  useEffect(() => {
    const prevTitle = document.title;
    if (conversion) {
      const title = t('publicSkin.ogTitle', { theme: conversion.theme_label || '' });
      const desc = (parsed.descriptionText || '').substring(0, 160) || t('publicSkin.ogDescFallback');
      document.title = title;
      setMetaTag('property', 'og:title', title);
      setMetaTag('property', 'og:description', desc);
      setMetaTag('property', 'og:type', 'website');
      setMetaTag('property', 'og:url', window.location.href);
      if (conversion.result_image_url && !conversion.result_image_url.startsWith('data:')) {
        setMetaTag('property', 'og:image', conversion.result_image_url);
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:image', conversion.result_image_url);
      } else {
        setMetaTag('name', 'twitter:card', 'summary');
      }
      setMetaTag('name', 'twitter:title', title);
      setMetaTag('name', 'twitter:description', desc);
      setMetaTag('name', 'description', desc);
    }
    return () => {
      document.title = prevTitle;
    };
  }, [conversion, parsed.descriptionText, t]);

  return (
    <div className="min-h-screen bg-lightPrimary dark:bg-navy-900">
      {/* Üst Bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          to={`/${activeLang}`}
          className="flex items-center gap-2 text-xl font-bold text-navy-700 dark:text-white"
        >
          <MdAutoAwesome className="h-6 w-6 text-brand-500" />
          GameSkinAI
        </Link>
        <Link
          to={`/${activeLang}/auth/sign-up`}
          className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
        >
          {t('publicSkin.ctaButton')}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4">
        {/* Yükleniyor */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-gray-200 dark:border-navy-700" />
              <div className="absolute top-0 left-0 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-brand-500" />
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t('publicSkin.loading')}
            </p>
          </div>
        )}

        {/* Bulunamadı */}
        {!loading && !conversion && (
          <div className="flex flex-col items-center rounded-[20px] bg-white p-10 text-center shadow-3xl dark:bg-navy-800 dark:shadow-none">
            <MdSearchOff className="h-14 w-14 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-navy-700 dark:text-white">
              {t('publicSkin.notFoundTitle')}
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {t('publicSkin.notFoundDesc')}
            </p>
            <Link
              to={`/${activeLang}`}
              className="mt-6 flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600"
            >
              <MdArrowBack className="h-4 w-4" />
              {t('publicSkin.backHome')}
            </Link>
          </div>
        )}

        {/* Skin Detayı */}
        {!loading && conversion && (
          <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:bg-navy-800 dark:shadow-none">
            {/* Başlık */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
              <div>
                <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                  {conversion.theme_label}
                </h1>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('publicSkin.subtitle')} ·{' '}
                  {new Date(conversion.created_at).toLocaleDateString(
                    activeLang === 'en' ? 'en-US' : 'tr-TR'
                  )}
                </span>
                {conversion.user_id && (
                  <Link
                    to={`/${activeLang}/user/${conversion.user_id}`}
                    className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline"
                  >
                    <MdPerson className="h-3.5 w-3.5" />
                    {conversion.user_display_name || t('common.user')}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-500 dark:bg-red-500/10">
                <MdFavorite className="h-4 w-4" />
                <span>{conversion.likes_count || 0}</span>
              </div>
            </div>

            {/* Görsel */}
            {conversion.result_image_url && (
              <div className="mx-auto mb-6 w-full max-w-md overflow-hidden rounded-2xl">
                <img
                  src={conversion.result_image_url}
                  alt={conversion.theme_label}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}

            {/* Minecraft skin önizleme + 64x64 indirme */}
            {parsed.isMinecraft && (
              <div className="mb-6 flex justify-center">
                <MinecraftSkinPreview
                  skinData={parsed.skinData}
                  skinImageUrl={parsed.skinImageUrl}
                />
              </div>
            )}

            {/* Açıklama */}
            {parsed.descriptionText && (
              <div className="mb-6 rounded-xl bg-gray-50 p-4 dark:bg-navy-700">
                <h5 className="mb-2 text-sm font-bold text-navy-700 dark:text-white">
                  {t('result.descTitle')}
                </h5>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy-700 dark:text-gray-300">
                  {parsed.descriptionText}
                </p>
              </div>
            )}

            {/* Paylaşım */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-white/10">
              <ShareButtons
                title={conversion.theme_label}
                text={parsed.descriptionText}
                url={window.location.href}
              />
            </div>

            {/* Yorumlar */}
            <CommentSection conversionId={conversion.id} activeLang={activeLang} />

            {/* CTA */}
            <div className="mt-6 flex flex-col items-center rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 p-6 text-center">
              <h4 className="text-lg font-bold text-white">
                {t('publicSkin.ctaTitle')}
              </h4>
              <p className="mt-1 text-sm text-white/80">
                {t('publicSkin.ctaDesc')}
              </p>
              <Link
                to={`/${activeLang}/auth/sign-up`}
                className="mt-4 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-brand-500 transition-all hover:bg-gray-100"
              >
                {t('publicSkin.ctaButton')}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
