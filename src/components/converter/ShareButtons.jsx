/**
 * @fileoverview Sosyal medya ve yerel cihaz paylaşım bileşeni.
 * Web Share API, Twitter/X, WhatsApp ve bağlantı kopyalama seçenekleri sunar.
 */

import React, { useState } from 'react';
import { FaTwitter, FaWhatsapp, FaShareAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { useToast } from 'contexts/ToastContext';
import { useTranslation } from 'contexts/TranslationContext';

/**
 * Paylaşım butonları bileşeni.
 * @param {Object} props
 * @param {string} props.title - Paylaşılacak başlık/tema
 * @param {string} props.text - Paylaşılacak açıklama metni
 * @param {string} [props.url] - Paylaşılacak özel URL (varsayılan: mevcut sayfa URL'i)
 */
export default function ShareButtons({ title, text, url }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const shareUrl = url || window.location.href;
  const shareText = `GameSkinAI ile oluşturduğum ${title || 'oyun karakteri'} skini: ${text ? text.substring(0, 100) + '...' : ''}`;

  /**
   * Yerel cihaz paylaşım menüsünü açar (Web Share API).
   */
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'GameSkinAI Karakteri',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Paylaşım hatası:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  /**
   * Bağlantıyı panoya kopyalar.
   */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      showToast(t('share.copiedSuccess') || 'Bağlantı kopyalandı!', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  /**
   * Twitter / X üzerinde paylaşır.
   */
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * WhatsApp üzerinden paylaşır.
   */
  const handleWhatsappShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Native Web Share (Mobil cihazlar için) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-600 active:scale-95"
          title="Paylaş"
        >
          <FaShareAlt className="h-3.5 w-3.5" />
          <span>Paylaş</span>
        </button>
      )}

      {/* Twitter / X */}
      <button
        type="button"
        onClick={handleTwitterShare}
        className="flex items-center gap-1.5 rounded-xl bg-[#1DA1F2] px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        title="Twitter/X'te Paylaş"
      >
        <FaTwitter className="h-3.5 w-3.5" />
        <span>Twitter</span>
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsappShare}
        className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        title="WhatsApp'ta Paylaş"
      >
        <FaWhatsapp className="h-3.5 w-3.5" />
        <span>WhatsApp</span>
      </button>

      {/* Bağlantıyı Kopyala */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-navy-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
        title="Bağlantıyı Kopyala"
      >
        {copied ? (
          <>
            <FaCheck className="h-3.5 w-3.5 text-green-500" />
            <span className="text-green-500">Kopyalandı</span>
          </>
        ) : (
          <>
            <FaCopy className="h-3.5 w-3.5" />
            <span>Kopyala</span>
          </>
        )}
      </button>
    </div>
  );
}
