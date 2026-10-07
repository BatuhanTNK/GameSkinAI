/**
 * @fileoverview Haftalık Yarışma (Challenge) Sayfası (ozellik_onerileri.md #14).
 * Haftanın temasını, geri sayımı, liderlik tablosunu ve geçen haftanın
 * kazananını gösterir. Katılım: haftanın temasıyla public skin paylaşmak.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdEmojiEvents,
  MdTimer,
  MdAutoAwesome,
  MdFavorite,
  MdPerson,
  MdArrowForward,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
} from 'react-icons/md';
import { fetchChallenge, fetchChallengeEntries, fetchLastWeekWinner } from 'lib/challenge';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'contexts/TranslationContext';

/** Sıralama madalyaları */
const RANK_ICONS = [
  { icon: MdLooksOne, color: 'text-yellow-500' },
  { icon: MdLooksTwo, color: 'text-gray-400' },
  { icon: MdLooks3, color: 'text-amber-700' },
];

/**
 * Kalan süreyi gün/saat/dakika olarak hesaplar.
 */
function getRemaining(endsAt) {
  const diff = Math.max(0, endsAt.getTime() - Date.now());
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return { days, hours, minutes };
}

/**
 * Haftalık challenge sayfası.
 */
export default function ChallengePage() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [entries, setEntries] = useState([]);
  const [lastWinner, setLastWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    const ch = await fetchChallenge();
    const [entryList, winnerData] = await Promise.all([
      fetchChallengeEntries(ch, 20),
      fetchLastWeekWinner(),
    ]);
    setChallenge(ch);
    setEntries(entryList);
    setLastWinner(winnerData);
    setRemaining(getRemaining(ch.endsAt));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Geri sayımı dakikada bir güncelle
  useEffect(() => {
    if (!challenge) return undefined;
    const timer = setInterval(() => setRemaining(getRemaining(challenge.endsAt)), 60000);
    return () => clearInterval(timer);
  }, [challenge]);

  const handleJoin = () => {
    navigate(`/${lang}/admin/converter?theme=${challenge?.themeSlug || ''}`);
  };

  if (loading || !challenge) {
    return (
      <div className="mt-3 flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-6">
      {/* Challenge Bannerı */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <MdEmojiEvents className="h-4 w-4" />
              <span>{t('challenge.badge')}</span>
            </div>
            <h2 className="text-3xl font-extrabold md:text-4xl">
              {t('challenge.weekTheme', { theme: challenge.themeLabel })}
            </h2>
            <p className="mt-2 text-sm text-white/90 md:text-base">
              {t('challenge.subtitle')}
            </p>

            {/* Geri Sayım */}
            <div className="mt-4 flex items-center gap-2 text-sm font-bold">
              <MdTimer className="h-5 w-5" />
              <span>
                {t('challenge.endsIn', {
                  days: remaining.days,
                  hours: remaining.hours,
                  minutes: remaining.minutes,
                })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-orange-600 shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <MdAutoAwesome className="h-5 w-5" />
            {t('challenge.joinBtn')}
            <MdArrowForward className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Nasıl Katılırım + Geçen Haftanın Kazananı */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Nasıl Katılırım */}
        <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
          <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            {t('challenge.howToTitle')}
          </h4>
          <div className="flex flex-col gap-3">
            {[
              t('challenge.howStep1', { theme: challenge.themeLabel }),
              t('challenge.howStep2'),
              t('challenge.howStep3'),
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-500">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            🏆 {t('challenge.prize')}
          </div>
        </div>

        {/* Geçen Haftanın Kazananı */}
        <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
          <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy-700 dark:text-white">
            <MdEmojiEvents className="h-5 w-5 text-yellow-500" />
            {t('challenge.lastWinnerTitle', {
              theme: lastWinner?.challenge?.themeLabel || '',
            })}
          </h4>

          {lastWinner?.winner ? (
            <Link
              to={`/${lang}/skin/${lastWinner.winner.id}`}
              className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-100/60 p-4 ring-1 ring-amber-300/60 transition-all hover:scale-[1.01] dark:from-amber-500/10 dark:to-yellow-500/5 dark:ring-amber-500/30"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-navy-900">
                {lastWinner.winner.result_image_url && (
                  <img
                    src={lastWinner.winner.result_image_url}
                    alt={lastWinner.winner.theme_label}
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute -top-1 -right-1 text-xl">👑</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  {lastWinner.winner.user_display_name || t('common.user')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lastWinner.winner.theme_label}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-500 dark:bg-red-500/10">
                  <MdFavorite className="h-3.5 w-3.5" />
                  {lastWinner.winner.likes_count || 0}
                </span>
              </div>
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold text-yellow-900">
                🏆 {t('challenge.winnerBadge')}
              </span>
            </Link>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              {t('challenge.noWinner')}
            </p>
          )}
        </div>
      </div>

      {/* Liderlik Tablosu */}
      <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:bg-navy-800 dark:shadow-none">
        <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
          {t('challenge.leaderboardTitle')}
        </h4>

        {entries.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <MdEmojiEvents className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('challenge.noEntries', { theme: challenge.themeLabel })}
            </p>
            <button
              type="button"
              onClick={handleJoin}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-600"
            >
              <MdAutoAwesome className="h-5 w-5" />
              {t('challenge.beFirst')}
            </button>
          </div>
        )}

        {entries.length > 0 && (
          <div className="flex flex-col">
            {entries.map((entry, idx) => {
              const RankIcon = RANK_ICONS[idx]?.icon;
              const isOwn = user && entry.user_id === user.id;
              return (
                <Link
                  key={entry.id}
                  to={`/${lang}/skin/${entry.id}`}
                  className={`flex items-center gap-4 rounded-xl px-3 py-3 transition-all hover:bg-gray-50 dark:hover:bg-navy-700/50 ${
                    isOwn ? 'bg-brand-500/5 ring-1 ring-brand-500/20' : ''
                  }`}
                >
                  {/* Sıra */}
                  <div className="flex w-8 shrink-0 items-center justify-center">
                    {RankIcon ? (
                      <RankIcon className={`h-7 w-7 ${RANK_ICONS[idx].color}`} />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">{idx + 1}</span>
                    )}
                  </div>

                  {/* Görsel */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-navy-900">
                    {entry.result_image_url && (
                      <img
                        src={entry.result_image_url}
                        alt={entry.theme_label}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* Bilgi */}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-bold text-navy-700 dark:text-white">
                      <MdPerson className="h-4 w-4 text-gray-400" />
                      {entry.user_display_name || t('common.user')}
                      {isOwn && (
                        <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-500">
                          {t('challenge.yourEntry')}
                        </span>
                      )}
                      {idx === 0 && <span>👑</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString(
                        lang === 'en' ? 'en-US' : 'tr-TR'
                      )}
                    </p>
                  </div>

                  {/* Beğeni */}
                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500 dark:bg-red-500/10">
                    <MdFavorite className="h-4 w-4" />
                    {entry.likes_count || 0}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
