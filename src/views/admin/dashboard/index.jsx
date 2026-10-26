import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdArrowOutward,
  MdArrowForward,
  MdAutoAwesome,
  MdFavoriteBorder,
  MdGridView,
  MdPublic,
  MdAdd,
  MdHistory,
  MdBolt,
} from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import { useConversions } from "hooks/useConversions";
import { useCredits } from "hooks/useCredits";
import { useTranslation } from "contexts/TranslationContext";
import { useToast } from "contexts/ToastContext";
import { checkLikeMilestones, showLocalNotification } from "lib/notifications";
import cyberpunk from "assets/img/hero/female_cyberpunk.png";
import fantasy from "assets/img/hero/female_fantasy.png";
import anime from "assets/img/hero/female_anime.png";
import robot from "assets/img/hero/robot_cyberpunk.png";

function weeklyActivity(conversions, lang) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + i);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      label: new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
        weekday: "short",
      }).format(date),
      count: conversions.filter((item) => {
        const time = new Date(item.created_at).getTime();
        return time >= date.getTime() && time < next.getTime();
      }).length,
    };
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { conversions, loading } = useConversions();
  const { remaining, limit } = useCredits();
  const { t, lang } = useTranslation();
  const { showToast } = useToast();
  const name =
    user?.user_metadata?.display_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    t("common.user");
  useEffect(() => {
    if (loading || !conversions.length) return;
    checkLikeMilestones(conversions).forEach(({ conversion, milestone }) => {
      const message = t("pwa.notifLikeMilestone", {
        theme: conversion.theme_label || conversion.theme_slug || "",
        count: milestone,
      });
      showToast(message, "success", 6000);
      showLocalNotification(message, {
        url: window.location.pathname,
        tag: `like-milestone-${conversion.id}`,
      });
    });
  }, [loading, conversions, t, showToast]);
  const data = useMemo(
    () => ({
      total: conversions.length,
      publicCount: conversions.filter((c) => c.is_public).length,
      likes: conversions.reduce((n, c) => n + (c.likes_count || 0), 0),
      themes: new Set(conversions.map((c) => c.theme_slug)).size,
      weekly: weeklyActivity(conversions, lang),
      recent: [...conversions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4),
    }),
    [conversions, lang]
  );
  const maximum = Math.max(1, ...data.weekly.map((day) => day.count));
  const weeklyTotal = data.weekly.reduce((n, day) => n + day.count, 0);
  const stats = [
    {
      label: "dashboard.widgetTotal",
      value: data.total,
      icon: MdAutoAwesome,
      note: "forge.allTime",
    },
    {
      label: "dashboard.widgetThemes",
      value: data.themes,
      icon: MdGridView,
      note: "forge.uniqueUniverses",
    },
    {
      label: "dashboard.widgetPublic",
      value: data.publicCount,
      icon: MdPublic,
      note: "forge.sharedWithWorld",
    },
    {
      label: "dashboard.widgetLikes",
      value: data.likes,
      icon: MdFavoriteBorder,
      note: "forge.communityLove",
    },
  ];
  return (
    <div className="forge-dashboard">
      <div className="forge-page-heading">
        <div>
          <span className="forge-kicker">{t("forge.yourCreativeSpace")}</span>
          <h1>
            {t("forge.welcomeBack", { name })}
            <span>✳</span>
          </h1>
          <p>{t("forge.dashboardDesc")}</p>
        </div>
        <Link className="forge-text-link" to={`/${lang}/admin/history`}>
          <MdHistory />
          {t("forge.viewHistory")}
          <MdArrowOutward />
        </Link>
      </div>
      <div className="forge-dashboard-hero">
        <div>
          <span className="forge-tag">{t("forge.readyWhenYouAre")}</span>
          <h2>
            {t("forge.dashboardHeroLine1")}
            <br />
            <span>{t("forge.dashboardHeroLine2")}</span>
          </h2>
          <p>{t("forge.dashboardHeroDesc")}</p>
          <Link
            className="forge-btn forge-btn-lime"
            to={`/${lang}/admin/converter`}
          >
            <MdAdd />
            {t("forge.createCharacter")}
            <MdArrowOutward />
          </Link>
        </div>
        <div className="forge-dashboard-hero-art" aria-hidden="true">
          <span className="forge-dash-art-ring" />
          <img src={robot} alt="" />
          <span className="forge-dash-art-label">
            NEXT IDENTITY
            <br />
            <b>UNKNOWN_</b>
          </span>
        </div>
        <span className="forge-dash-hero-index">GS—01 / CREATE</span>
      </div>
      <div className="forge-stat-grid">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <article className="forge-stat" key={label}>
            <header>
              <span>{t(label)}</span>
              <Icon />
            </header>
            <strong>{loading ? "—" : String(value).padStart(2, "0")}</strong>
            <footer>
              <span className="forge-status-dot" />
              {t(note)}
            </footer>
          </article>
        ))}
      </div>
      <div className="forge-dashboard-middle">
        <section className="forge-activity-panel">
          <div className="forge-panel-heading">
            <div>
              <span className="forge-kicker">ACTIVITY LOG</span>
              <h2>{t("dashboard.weeklyTitle")}</h2>
            </div>
            <span className="forge-period">{t("forge.last7Days")}</span>
          </div>
          <div className="forge-activity-summary">
            <strong>{weeklyTotal}</strong>
            <span>{t("forge.creationsThisWeek")}</span>
            <span className="forge-activity-total">
              {t("forge.allTime")}: {data.total}
            </span>
          </div>
          <div
            className={`forge-activity-chart ${
              weeklyTotal === 0 ? "is-empty" : ""
            }`}
            role="img"
            aria-label={`${t("dashboard.weeklyTitle")}: ${data.weekly
              .map((day) => `${day.label} ${day.count}`)
              .join(", ")}`}
          >
            <div className="forge-chart-grid" />
            {data.weekly.map((day, i) => (
              <div className="forge-chart-column" key={i}>
                <div className="forge-chart-bar-wrap">
                  <div
                    className="forge-chart-bar"
                    style={{
                      height: `${Math.max(
                        weeklyTotal ? 4 : 0,
                        (day.count / maximum) * 100
                      )}%`,
                    }}
                  >
                    <span>{day.count}</span>
                  </div>
                </div>
                <small>{day.label}</small>
              </div>
            ))}
            {weeklyTotal === 0 && (
              <span className="forge-chart-empty">
                {t("forge.noActivityYet")}
              </span>
            )}
          </div>
        </section>
        <aside className="forge-energy-panel">
          <div className="forge-panel-heading">
            <span className="forge-kicker">{t("forge.dailyEnergy")}</span>
            <MdBolt />
          </div>
          <div
            className="forge-energy-ring"
            style={{
              "--energy": `${Math.min(
                100,
                Math.max(0, (remaining / Math.max(1, limit)) * 100)
              )}%`,
            }}
          >
            <div>
              <strong>{remaining}</strong>
              <small>
                / {limit} {t("forge.credits")}
              </small>
            </div>
          </div>
          <h3>{t("forge.fuelYourIdeas")}</h3>
          <p>{t("forge.quotaNote")}</p>
          <Link to={`/${lang}/admin/converter`}>
            {t("forge.useEnergy")}
            <MdArrowOutward />
          </Link>
        </aside>
      </div>
      <section className="forge-recent-section">
        <div className="forge-panel-heading">
          <div>
            <span className="forge-kicker">YOUR COLLECTION</span>
            <h2>{t("forge.recentCreations")}</h2>
          </div>
          <Link className="forge-text-link" to={`/${lang}/admin/history`}>
            {t("forge.viewAll")}
            <MdArrowForward />
          </Link>
        </div>
        {data.recent.length ? (
          <div className="forge-recent-grid">
            {data.recent.map((item) => (
              <Link
                to={`/${lang}/admin/history`}
                className="forge-recent-card"
                key={item.id}
              >
                <div>
                  {item.result_image_url || item.original_image_url ? (
                    <img
                      src={item.result_image_url || item.original_image_url}
                      alt={item.theme_label || item.theme_slug}
                      loading="lazy"
                    />
                  ) : (
                    <MdAutoAwesome />
                  )}
                  <span>
                    <MdArrowOutward />
                  </span>
                </div>
                <h3>{item.theme_label || item.theme_slug}</h3>
                <small>
                  {item.created_at
                    ? new Intl.DateTimeFormat(
                        lang === "tr" ? "tr-TR" : "en-US",
                        { day: "numeric", month: "short" }
                      ).format(new Date(item.created_at))
                    : ""}
                </small>
              </Link>
            ))}
          </div>
        ) : (
          <div className="forge-recent-empty">
            <div className="forge-empty-stack" aria-hidden="true">
              <span />
              <span />
              <span>
                <MdAutoAwesome />
              </span>
            </div>
            <div>
              <h3>{t("forge.collectionStartsHere")}</h3>
              <p>{t("dashboard.emptyDesc")}</p>
            </div>
            <Link
              className="forge-btn forge-btn-outline"
              to={`/${lang}/admin/converter`}
            >
              {t("forge.firstCreation")}
              <MdArrowOutward />
            </Link>
          </div>
        )}
      </section>
      <section className="forge-inspiration">
        <div className="forge-panel-heading">
          <div>
            <span className="forge-kicker">INSPIRATION BOARD</span>
            <h2>{t("forge.chooseUniverse")}</h2>
          </div>
          <span>{t("forge.exampleDesigns")}</span>
        </div>
        <div className="forge-inspiration-grid">
          {[
            { name: "CYBERPUNK", slug: "cyberpunk", image: cyberpunk },
            { name: "DARK FANTASY", slug: "witcher", image: fantasy },
            { name: "ANIME", slug: "genshin", image: anime },
          ].map((item) => (
            <Link
              to={`/${lang}/admin/converter?theme=${item.slug}`}
              key={item.name}
            >
              <img src={item.image} alt={item.name} loading="lazy" />
              <span>
                {item.name}
                <MdArrowOutward />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
