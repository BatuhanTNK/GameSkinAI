import React from "react";
import { Link, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MdArrowBack, MdArrowOutward, MdAutoAwesome } from "react-icons/md";
import routes from "routes.js";
import { useTranslation } from "contexts/TranslationContext";
import { useDarkMode } from "hooks/useDarkMode";
import Brand from "components/common/Brand";
import ForgeControls from "components/common/ForgeControls";
import BackgroundPaths from "components/ui/BackgroundPaths";
import cyberpunk from "assets/img/hero/female_cyberpunk.png";
import fantasy from "assets/img/hero/female_fantasy.png";
import robot from "assets/img/hero/robot_cyberpunk.png";

// Visual reference: Preet Suthar's Modern & Stunning sign in on 21st.dev.
// Form behavior remains connected to the project's Supabase authentication.
export default function Auth() {
  const { t, lang } = useTranslation();
  const [dark, toggle] = useDarkMode();
  const location = useLocation();
  const isSignup = location.pathname.endsWith("sign-up");
  const showTabs = isSignup || location.pathname.endsWith("sign-in");
  return (
    <div className={`forge-root forge-auth ${dark ? "" : "forge-light"}`}>
      <BackgroundPaths
        className="forge-paths forge-auth-paths"
        count={30}
        speed={0.25}
        interactive={false}
      >
        {null}
      </BackgroundPaths>
      <header className="forge-auth-header">
        <Link to={`/${lang}`}>
          <Brand />
        </Link>
        <ForgeControls dark={dark} toggle={toggle} />
      </header>
      <main className="forge-auth-main">
        <aside className="forge-auth-story">
          <span className="forge-kicker">{t("forge.authKicker")}</span>
          <h1>
            {t("forge.authLine1")}
            <br />
            <span>{t("forge.authLine2")}</span>
            <span className="forge-title-dot">.</span>
          </h1>
          <p>{t("forge.authDesc")}</p>
          <div className="forge-auth-collage" aria-hidden="true">
            <img src={fantasy} alt="" />
            <img src={cyberpunk} alt="" />
            <img src={robot} alt="" />
            <span className="forge-collage-stamp">
              YOUR NEXT
              <br />
              IDENTITY ↗
            </span>
          </div>
          <span className="forge-auth-bottom-note">
            <span className="forge-chip-status" />
            {t("forge.authNote")}
          </span>
        </aside>
        <section className="forge-auth-card">
          <div className="forge-auth-card-top">
            <span className="forge-auth-emblem">
              <MdAutoAwesome />
            </span>
            <span>GS / ACCESS PORTAL</span>
            <MdArrowOutward />
          </div>
          {showTabs && (
            <nav className="forge-auth-tabs" aria-label={t("forge.account")}>
              <Link
                className={!isSignup ? "is-active" : ""}
                aria-current={!isSignup ? "page" : undefined}
                to={`/${lang}/auth/sign-in`}
              >
                {t("auth.signInTitle")}
              </Link>
              <Link
                className={isSignup ? "is-active" : ""}
                aria-current={isSignup ? "page" : undefined}
                to={`/${lang}/auth/sign-up`}
              >
                {t("auth.signUpTitle")}
              </Link>
            </nav>
          )}
          <div className="forge-auth-outlet">
            <Routes>
              {routes
                .filter((route) => route.layout === "/auth")
                .map((route) => (
                  <Route
                    path={`/${route.path}`}
                    element={route.component}
                    key={route.path}
                  />
                ))}
              <Route
                path="/"
                element={<Navigate to={`/${lang}/auth/sign-in`} replace />}
              />
            </Routes>
          </div>
          <Link className="forge-auth-back" to={`/${lang}`}>
            <MdArrowBack />
            {t("forge.backHome")}
          </Link>
        </section>
      </main>
      <footer className="forge-auth-footer">
        <span>© {new Date().getFullYear()} GameSkinAI</span>
        <span>{t("forge.footerNote")}</span>
      </footer>
    </div>
  );
}
