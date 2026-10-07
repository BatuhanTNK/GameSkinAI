/**
 * @fileoverview Kullanıcı istatistikleri Dashboard sayfası.
 * Placeholder Horizon verileri yerine kullanıcının gerçek dönüşüm
 * istatistiklerini (toplam sayı, tema dağılımı, haftalık aktivite) gösterir.
 */

import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAutoAwesome,
  MdBolt,
  MdFavorite,
  MdPublic,
  MdBarChart,
  MdTrendingUp,
} from 'react-icons/md';
import Card from 'components/card';
import Widget from 'components/widget/Widget';
import PieChart from 'components/charts/PieChart';
import LineChart from 'components/charts/LineChart';
import { useConversions } from 'hooks/useConversions';
import { useCredits } from 'hooks/useCredits';
import { useTranslation } from 'contexts/TranslationContext';
import { useToast } from 'contexts/ToastContext';
import { checkLikeMilestones, showLocalNotification } from 'lib/notifications';

/** Tema dağılımı pastası için renk paleti */
const PIE_COLORS = [
  '#4318FF',
  '#6AD2FF',
  '#05CD99',
  '#FFB547',
  '#EE5D50',
  '#7551FF',
  '#39B8FF',
  '#01B574',
];

/**
 * Son 7 günün gün etiketlerini ve o günlere ait dönüşüm sayılarını hesaplar.
 * @param {Array} conversions
 * @param {string} lang
 * @returns {{ labels: string[], counts: number[] }}
 */
function buildWeeklyActivity(conversions, lang) {
  const labels = [];
  const counts = [];
  const locale = lang === 'en' ? 'en-US' : 'tr-TR';

  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    labels.push(
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day)
    );
    counts.push(
      conversions.filter((c) => {
        const created = new Date(c.created_at).getTime();
        return created >= day.getTime() && created < nextDay.getTime();
      }).length
    );
  }

  return { labels, counts };
}

/**
 * Gerçek kullanıcı verileriyle çalışan Dashboard sayfası.
 */
export default function Dashboard() {
  const { conversions, loading } = useConversions();
  const { remaining, limit } = useCredits();
  const { t, lang } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Beğeni kilometre taşı bildirimi: "Skinin X beğeniye ulaştı" (ozellik_onerileri.md #15)
  useEffect(() => {
    if (loading || conversions.length === 0) return;
    const reached = checkLikeMilestones(conversions);
    reached.forEach(({ conversion, milestone }) => {
      const message = t('pwa.notifLikeMilestone', {
        theme: conversion.theme_label || conversion.theme_slug || '',
        count: milestone,
      });
      showToast(message, 'success', 6000);
      showLocalNotification(message, {
        url: window.location.pathname,
        tag: `like-milestone-${conversion.id}`,
      });
    });
  }, [loading, conversions, t, showToast]);

  // Genel istatistikler
  const stats = useMemo(() => {
    const total = conversions.length;
    const publicCount = conversions.filter((c) => c.is_public).length;
    const totalLikes = conversions.reduce(
      (sum, c) => sum + (c.likes_count || 0),
      0
    );
    const uniqueThemes = new Set(conversions.map((c) => c.theme_slug)).size;
    return { total, publicCount, totalLikes, uniqueThemes };
  }, [conversions]);

  // Tema dağılımı (PieChart)
  const themeDistribution = useMemo(() => {
    const map = new Map();
    conversions.forEach((c) => {
      const label = c.theme_label || c.theme_slug || '?';
      map.set(label, (map.get(label) || 0) + 1);
    });
    // En çok kullanılan 8 tema
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      labels: sorted.map(([label]) => label),
      series: sorted.map(([, count]) => count),
    };
  }, [conversions]);

  // Haftalık aktivite (LineChart)
  const weekly = useMemo(
    () => buildWeeklyActivity(conversions, lang),
    [conversions, lang]
  );

  const pieOptions = {
    labels: themeDistribution.labels,
    colors: PIE_COLORS,
    chart: { width: '50px' },
    states: { hover: { filter: { type: 'none' } } },
    legend: { show: true, position: 'bottom', labels: { colors: '#A3AED0' } },
    dataLabels: { enabled: false },
    hover: { mode: null },
    fill: { colors: PIE_COLORS },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: { fontSize: '12px', backgroundColor: '#000000' },
    },
  };

  const lineSeries = [
    {
      name: t('dashboard.chartConversions'),
      data: weekly.counts,
      color: '#4318FF',
    },
  ];

  const lineOptions = {
    legend: { show: false },
    theme: { mode: 'light' },
    chart: { type: 'line', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    tooltip: {
      style: { fontSize: '12px', backgroundColor: '#000000' },
      theme: 'dark',
    },
    grid: { show: false },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#A3AED0', fontSize: '12px', fontWeight: '500' },
      },
      type: 'text',
      categories: weekly.labels,
    },
    yaxis: {
      show: true,
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (val) => Math.round(val),
        style: { colors: '#A3AED0', fontSize: '12px' },
      },
    },
  };

  return (
    <div className="mt-3 flex flex-col gap-5">
      {/* Başlık */}
      <div>
        <h2 className="text-3xl font-bold text-navy-700 dark:text-white">
          {t('dashboard.title')}
        </h2>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Özet Widget'ları */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <Widget
          icon={<MdAutoAwesome className="h-7 w-7" />}
          title={t('dashboard.widgetTotal')}
          subtitle={String(stats.total)}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={t('dashboard.widgetThemes')}
          subtitle={String(stats.uniqueThemes)}
        />
        <Widget
          icon={<MdPublic className="h-6 w-6" />}
          title={t('dashboard.widgetPublic')}
          subtitle={String(stats.publicCount)}
        />
        <Widget
          icon={<MdFavorite className="h-6 w-6" />}
          title={t('dashboard.widgetLikes')}
          subtitle={String(stats.totalLikes)}
        />
        <Widget
          icon={<MdBolt className="h-7 w-7" />}
          title={t('dashboard.widgetCredits')}
          subtitle={`${remaining} / ${limit}`}
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Haftalık Aktivite */}
        <Card extra="!p-[20px]">
          <div className="flex items-center gap-2">
            <MdTrendingUp className="h-6 w-6 text-brand-500" />
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              {t('dashboard.weeklyTitle')}
            </h4>
          </div>
          <div className="h-[300px] w-full">
            {stats.total > 0 ? (
              <LineChart series={lineSeries} options={lineOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.emptyChart')}
              </div>
            )}
          </div>
        </Card>

        {/* Tema Dağılımı */}
        <Card extra="!p-[20px]">
          <div className="flex items-center gap-2">
            <MdBarChart className="h-6 w-6 text-brand-500" />
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              {t('dashboard.themesTitle')}
            </h4>
          </div>
          <div className="flex h-[300px] w-full items-center justify-center">
            {themeDistribution.series.length > 0 ? (
              <PieChart series={themeDistribution.series} options={pieOptions} />
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.emptyChart')}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Boş durum CTA */}
      {!loading && stats.total === 0 && (
        <Card extra="!p-[30px] items-center text-center">
          <span className="text-4xl">🎮</span>
          <h4 className="mt-2 text-lg font-bold text-navy-700 dark:text-white">
            {t('dashboard.emptyTitle')}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.emptyDesc')}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/${lang}/admin/converter`)}
            className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-600"
          >
            <MdAutoAwesome className="h-5 w-5" />
            {t('history.btnStart')}
          </button>
        </Card>
      )}
    </div>
  );
}
