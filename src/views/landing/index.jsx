import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdArrowForward,
  MdArrowOutward,
  MdAutoAwesome,
  MdPlayArrow,
  MdMenu,
  MdClose,
  MdCheck,
  MdUploadFile,
  MdTune,
  MdDownload,
} from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";
import { useDarkMode } from "hooks/useDarkMode";
import Brand from "components/common/Brand";
import ForgeControls from "components/common/ForgeControls";
import BackgroundPaths from "components/ui/BackgroundPaths";
import InteractiveDemoSection from "./components/InteractiveDemoSection";
import cyberpunk from "assets/img/hero/cyberpunk.png";
import fantasy from "assets/img/hero/female_fantasy.png";
import anime from "assets/img/hero/female_anime.png";
import robot from "assets/img/hero/robot_cyberpunk.png";

const universes = [
  { name: "CYBERPUNK", image: cyberpunk, code: "CP—2077", title: "NEON RONIN" },
  {
    name: "DARK FANTASY",
    image: fantasy,
    code: "DF—0042",
    title: "VOID KNIGHT",
  },
  { name: "ANIME", image: anime, code: "AN—0001", title: "ASTRAL MAGE" },
  { name: "SCI-FI", image: robot, code: "SF—3000", title: "MECHA UNIT" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [dark, toggle] = useDarkMode();
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(0);
  const [faq, setFaq] = useState(1);
  const destination = `/${lang}/${user ? "admin/converter" : "auth/sign-up"}`;
  const character = universes[active];
  return (
    <div className={`forge-root forge-landing ${dark ? "" : "forge-light"}`}>
      <a className="forge-skip" href="#main-content">
        {t("studio.skipContent")}
      </a>
      <header className="forge-public-header">
        <div className="forge-wrap forge-public-nav">
          <Link to={`/${lang}`}>
            <Brand />
          </Link>
          <nav aria-label={t("studio.mainNav")}>
            <a href="#universes">{t("forge.universes")}</a>
            <a href="#workflow">{t("landing.menuHowItWorks")}</a>
            <a href="#demo">{t("landing.menuDemo")}</a>
          </nav>
          <div className="forge-header-right">
            <ForgeControls dark={dark} toggle={toggle} />
            <Link
              className="forge-login-link"
              to={`/${lang}/${user ? "admin/dashboard" : "auth/sign-in"}`}
            >
              {t(user ? "forge.workspace" : "auth.signInTitle")}
              <MdArrowOutward />
            </Link>
            <button
              className="forge-icon-btn forge-menu-toggle"
              aria-expanded={menu}
              aria-controls="forge-mobile-nav"
              aria-label={t("studio.toggleMenu")}
              onClick={() => setMenu(!menu)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMenu(false);
              }}
            >
              {menu ? <MdClose /> : <MdMenu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="forge-mobile-nav" className="forge-mobile-nav">
            <a href="#universes" onClick={() => setMenu(false)}>
              {t("forge.universes")}
            </a>
            <a href="#workflow" onClick={() => setMenu(false)}>
              {t("landing.menuHowItWorks")}
            </a>
            <a href="#demo" onClick={() => setMenu(false)}>
              {t("landing.menuDemo")}
            </a>
            <Link to={`/${lang}/${user ? "admin/dashboard" : "auth/sign-in"}`}>
              {t(user ? "forge.workspace" : "auth.signInTitle")}
            </Link>
          </nav>
        )}
      </header>
      <main id="main-content">
        <section className="forge-wrap forge-hero">
          <div className="forge-hero-copy">
            <span className="forge-kicker">
              <span /> {t("forge.heroKicker")}{" "}
              <span className="forge-tag">BETA</span>
            </span>
            <h1>
              {t("forge.heroLine1")}
              <br />
              <span>{t("forge.heroLine2")}</span>
              <br />
              {t("forge.heroLine3")}
              <span className="forge-title-dot">.</span>
            </h1>
            <p>{t("forge.heroDesc")}</p>
            <div className="forge-hero-actions">
              <Link className="forge-btn forge-btn-lime" to={destination}>
                {t("forge.createCharacter")}
                <MdArrowOutward />
              </Link>
              <a className="forge-text-link" href="#demo">
                <span className="forge-play">
                  <MdPlayArrow />
                </span>
                {t("forge.seeItWork")}
              </a>
            </div>
            <div className="forge-hero-footnote">
              <MdCheck />
              {t("studio.noCard")}
              <span /> {t("forge.freeCredits")}
            </div>
          </div>
          <div className="forge-hero-stage">
            <BackgroundPaths
              className="forge-paths"
              count={24}
              speed={0.35}
              interactive={false}
            >
              {null}
            </BackgroundPaths>
            <div className="forge-orbit forge-orbit-one" />
            <div className="forge-orbit forge-orbit-two" />
            <span className="forge-coordinate">
              GS / CHARACTER LAB
              <br />
              41°00′ N — 29°00′ E
            </span>
            <div className="forge-character-frame" key={character.name}>
              <img src={character.image} alt={character.title} />
              <div className="forge-character-overlay" />
              <span className="forge-image-code">
                {character.code}
                <br />
                <b>{t("forge.aiConcept")}</b>
              </span>
              <div className="forge-image-title">
                <small>{t("forge.selectedUniverse")}</small>
                <strong>{character.title}</strong>
              </div>
              <span className="forge-frame-cross">+</span>
            </div>
            <span className="forge-rotated-label">
              IMAGINATION IS YOUR ONLY LIMIT
            </span>
            <div className="forge-floating-chip">
              <MdAutoAwesome />
              <span>
                {t("forge.originalByYou")}
                <strong>{t("forge.builtWithAI")}</strong>
              </span>
              <span className="forge-chip-status" />
            </div>
            <div
              className="forge-hero-tabs"
              role="group"
              aria-label={t("forge.universes")}
            >
              {universes.map((item, i) => (
                <button
                  key={item.name}
                  aria-pressed={active === i}
                  onClick={() => setActive(i)}
                >
                  <span>0{i + 1}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </section>
        <div className="forge-ticker" aria-hidden="true">
          <div>
            CREATE YOUR ALTER EGO <span>✳</span> NO RULES. JUST IMAGINATION.{" "}
            <span>✳</span> CREATE YOUR ALTER EGO <span>✳</span> NO RULES. JUST
            IMAGINATION. <span>✳</span>
          </div>
        </div>
        <section id="universes" className="forge-wrap forge-section">
          <div className="forge-section-header">
            <div>
              <span className="forge-kicker">01 / {t("forge.explore")}</span>
              <h2>
                {t("forge.universeHeading")}
                <br />
                <span>{t("forge.universeHeadingAccent")}</span>
              </h2>
            </div>
            <p>{t("forge.universeDesc")}</p>
          </div>
          <div className="forge-universe-grid">
            {universes.map((item, i) => (
              <Link
                className="forge-universe-card"
                key={item.name}
                to={`${destination}${
                  user
                    ? `?theme=${["cyberpunk", "witcher", "genshin", "apex"][i]}`
                    : ""
                }`}
              >
                <div>
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span className="forge-universe-number">0{i + 1}</span>
                  <span className="forge-universe-plus">
                    <MdArrowOutward />
                  </span>
                </div>
                <footer>
                  <span>{item.name}</span>
                  <small>{item.code}</small>
                </footer>
              </Link>
            ))}
          </div>
          <div className="forge-section-note">
            <span className="forge-mini-line" />
            {t("forge.moreStyles")}
            <Link to={destination}>
              {t("forge.openStudio")}
              <MdArrowForward />
            </Link>
          </div>
        </section>
        <section id="workflow" className="forge-workflow">
          <div className="forge-wrap forge-workflow-layout">
            <div className="forge-workflow-intro">
              <span className="forge-kicker">02 / {t("forge.theProcess")}</span>
              <h2>
                {t("forge.processHeading")}
                <br />
                <span>{t("forge.processAccent")}</span>
              </h2>
              <p>{t("forge.processDesc")}</p>
              <Link className="forge-text-link" to={destination}>
                {t("forge.letsCreate")}
                <MdArrowOutward />
              </Link>
              <span className="forge-huge-star" aria-hidden="true">
                ✳
              </span>
            </div>
            <div className="forge-process-list">
              {[MdUploadFile, MdTune, MdDownload].map((Icon, i) => (
                <article key={i}>
                  <span className="forge-step-no">0{i + 1}</span>
                  <div>
                    <Icon />
                    <h3>{t(`forge.step${i + 1}`)}</h3>
                    <p>{t(`landing.step${i + 1}Desc`)}</p>
                  </div>
                  <span className="forge-step-plus">+</span>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="forge-wrap forge-section forge-demo-section">
          <div className="forge-section-header">
            <div>
              <span className="forge-kicker">03 / {t("forge.playground")}</span>
              <h2>
                {t("forge.demoHeading")}
                <br />
                <span>{t("forge.demoAccent")}</span>
              </h2>
            </div>
            <p>{t("forge.demoDesc")}</p>
          </div>
          <div className="forge-demo">
            <InteractiveDemoSection />
          </div>
        </section>
        <section id="faq" className="forge-wrap forge-section forge-faq">
          <div>
            <span className="forge-kicker">04 / {t("landing.menuFaq")}</span>
            <h2>
              {t("forge.faqHeading")}
              <br />
              <span>{t("forge.faqAccent")}</span>
            </h2>
          </div>
          <div className="forge-faq-list">
            {[1, 2, 3, 4, 5].map((id) => (
              <article key={id}>
                <h3>
                  <button
                    aria-expanded={faq === id}
                    aria-controls={`forge-faq-${id}`}
                    onClick={() => setFaq(faq === id ? null : id)}
                  >
                    {t(`landing.faq${id}Q`)}
                    <span>{faq === id ? "−" : "+"}</span>
                  </button>
                </h3>
                <div id={`forge-faq-${id}`} hidden={faq !== id}>
                  <p>{t(`landing.faq${id}A`)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="forge-final-cta">
          <div className="forge-wrap">
            <span className="forge-kicker">{t("forge.yourMove")}</span>
            <h2>
              {t("forge.ctaLine1")}
              <br />
              {t("forge.ctaLine2")}
              <span>↗</span>
            </h2>
            <Link className="forge-btn forge-btn-ink" to={destination}>
              {t("forge.createCharacter")}
              <MdArrowOutward />
            </Link>
          </div>
        </section>
      </main>
      <footer className="forge-public-footer forge-wrap">
        <Link to={`/${lang}`}>
          <Brand />
        </Link>
        <span>© {new Date().getFullYear()} GameSkinAI</span>
        <nav>
          <a href="#universes">{t("forge.universes")}</a>
          <a href="#faq">{t("landing.menuFaq")}</a>
          <Link to={`/${lang}/auth/sign-in`}>{t("auth.signInTitle")}</Link>
        </nav>
        <small>{t("forge.footerNote")}</small>
      </footer>
    </div>
  );
}
